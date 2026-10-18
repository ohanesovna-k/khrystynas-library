import { env } from 'cloudflare:workers';
import bcrypt from 'bcryptjs';
import { accountFromCookie, digest, randomToken, sessionCookie, tokenFromCookie } from '../../account-auth';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200,cookie?:string)=>Response.json(data,{status,headers:{'Cache-Control':'no-store, private','Vary':'Cookie',...(cookie?{'Set-Cookie':cookie}:{})}});
function validPassword(password:unknown):password is string{return typeof password==='string'&&password.length>=12&&!bcrypt.truncates(password)}
async function limited(key:string,windowSeconds:number,max:number){const window=Math.floor(Date.now()/1000/windowSeconds);const r=await env.DB.prepare('INSERT INTO auth_limits (key, window, attempts) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET attempts = CASE WHEN auth_limits.window = excluded.window THEN auth_limits.attempts + 1 ELSE 1 END, window = excluded.window RETURNING attempts').bind(key,window).first<{attempts:number}>();return !r||r.attempts>max}
async function signIn(id:string,nickname:string,extra:Record<string,unknown>={}){const token=randomToken();await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(await digest(token),id,Math.floor(Date.now()/1000)+2592000).run();return json({nickname,...extra},200,sessionCookie(token))}
export async function GET(request:Request){try{const user=await accountFromCookie(request.headers.get('cookie')||'');return user?json({nickname:user.nickname}):json({error:'Please log in.'},401)}catch{return json({error:'Account service unavailable. Please retry.'},503)}}
export async function POST(request:Request){
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Invalid request origin.'},403);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON required.'},415);
 try{
 const text=await request.text();if(text.length>4096)return json({error:'Request too large.'},413);let body;try{body=JSON.parse(text)}catch{return json({error:'Invalid request.'},400)}
 if(body.action==='logout'){const token=tokenFromCookie(request.headers.get('cookie')||'');if(token)await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await digest(token)).run();return json({ok:true},200,sessionCookie('',0))}
 if(!['login','register','recover'].includes(body.action))return json({error:'Unknown action.'},400);
 const nickname=typeof body.nickname==='string'?body.nickname.normalize('NFKC').trim():'';const nicknameKey=nickname.toLowerCase();
 if(!/^[\p{L}\p{N}_-]{3,30}$/u.test(nickname))return json({error:'Use a nickname with 3–30 letters, numbers, underscores or hyphens.'},400);
 const ip=request.headers.get('CF-Connecting-IP');if(!ip)return json({error:'Account service requires a secure hosted connection.'},503);
 const ipHash=await digest(ip);if(await limited('ip:'+ipHash,900,30))return json({error:'Too many attempts. Please wait 15 minutes.'},429);
 if(await limited('name:'+nicknameKey,900,15))return json({error:'Too many attempts for this nickname. Please wait 15 minutes.'},429);
 if(body.action==='register'&&await limited('signup:'+ipHash,3600,5))return json({error:'Too many new accounts. Please try again in an hour.'},429);
 if(!validPassword(body.password))return json({error:'Use a password of at least 12 characters, up to 72 UTF-8 bytes.'},400);
 const account=await env.DB.prepare('SELECT id, nickname, password_hash, recovery_hash FROM accounts WHERE nickname_key = ?').bind(nicknameKey).first<{id:string,nickname:string,password_hash:string,recovery_hash:string}>();
 if(body.action==='register'){
  if(account)return json({error:'That nickname is already taken. Try another one.'},409);
  const id=crypto.randomUUID(),recoveryCode=randomToken(),passwordHash=await bcrypt.hash(body.password,12);
  try{await env.DB.prepare('INSERT INTO accounts (id, nickname, nickname_key, password_hash, recovery_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id,nickname,nicknameKey,passwordHash,await digest(recoveryCode),Math.floor(Date.now()/1000)).run()}catch{return json({error:'Could not create this account. The nickname may have just been taken; please retry.'},409)}
  return signIn(id,nickname,{recoveryCode});
 }
 if(body.action==='recover'){
  if(!account||typeof body.recoveryCode!=='string'||!/^[a-f0-9]{64}$/.test(body.recoveryCode)||await digest(body.recoveryCode)!==account.recovery_hash)return json({error:'Nickname or recovery code is incorrect.'},401);
  const recoveryCode=randomToken(),newHash=await bcrypt.hash(body.password,12);
  const results=await env.DB.batch([env.DB.prepare('UPDATE accounts SET password_hash = ?, recovery_hash = ? WHERE id = ? AND recovery_hash = ?').bind(newHash,await digest(recoveryCode),account.id,account.recovery_hash),env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(account.id)]);
  if(!results[0].meta.changes)return json({error:'This recovery code has already been used.'},409);
  return signIn(account.id,account.nickname,{recoveryCode});
 }
 // A valid dummy hash keeps missing-account and incorrect-password checks comparable.
 const dummy='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6Ttx80Vh5b1zGsMLcWv.WZcLoPT3e';
 const matches=await bcrypt.compare(body.password,account?.password_hash||dummy);
 if(!account||!matches)return json({error:'Nickname or password is incorrect.'},401);
 return signIn(account.id,account.nickname);
 }catch{return json({error:'Account service is temporarily unavailable. Please retry.'},503)}
}
