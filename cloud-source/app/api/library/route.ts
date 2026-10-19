import { env } from 'cloudflare:workers';
import { getAccount, isOwner } from '../../account-auth';
import { empty, validateBackup } from '../../../public/library/core.js';
import { apiJSON, preflight, validWriteOrigin } from '../../api-http';
export const dynamic = 'force-dynamic';
export const OPTIONS=preflight;
export async function GET(request?:Request) {
 const response=(data:unknown,status=200)=>apiJSON(request,data,status);
 const user=await getAccount(request);
 if(!user)return response({error:'Please sign in to access your library.'},401);
 try {
  const record=await env.DB.prepare('SELECT revision, blob_key, updated_at FROM libraries WHERE user_id = ?').bind(user.userId).first<{revision:number,blob_key:string,updated_at:string}>();
  let library=empty();
  if(record){const obj=await env.BUCKET.get(record.blob_key);if(!obj)return response({error:'Your saved library is temporarily unavailable. Please retry.'},503);library=await obj.json();}
  return response({state:library,revision:record?.revision||0,updatedAt:record?.updated_at||null,user:{nickname:user.nickname,isOwner:isOwner(user)}});
 }catch{return response({error:'Could not load your library. Please try again.'},503)}
}
export async function PUT(request:Request) {
 const response=(data:unknown,status=200)=>apiJSON(request,data,status);
 const user=await getAccount(request);
 if(!user)return response({error:'Your session expired. Log in again before saving.'},401);
 if(!validWriteOrigin(request))return response({error:'Invalid request origin.'},403);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return response({error:'JSON required.'},415);
 let payload:any;
 try{const text=await request.text();if(new TextEncoder().encode(text).length>30*1024*1024)return response({error:'This library exceeds the current 30 MB limit. Export a backup and use smaller cover uploads.'},413);payload=JSON.parse(text);validateBackup(payload.state);if(!Number.isSafeInteger(payload.revision)||payload.revision<0)throw Error('Invalid revision');}catch{return response({error:'Invalid library data. Nothing has been changed.'},400)}
 const key=`libraries/${encodeURIComponent(user.userId)}/${crypto.randomUUID()}.json`;
 try{
  await env.BUCKET.put(key,JSON.stringify(payload.state),{httpMetadata:{contentType:'application/json'}});
  const now=new Date().toISOString();
  const previous=await env.DB.prepare('SELECT blob_key FROM libraries WHERE user_id = ? AND revision = ?').bind(user.userId,payload.revision).first<{blob_key:string}>();
  const result=payload.revision===0
   ?await env.DB.prepare('INSERT INTO libraries (user_id, revision, blob_key, updated_at) SELECT ?, 1, ?, ? WHERE EXISTS (SELECT 1 FROM accounts WHERE id = ?) ON CONFLICT(user_id) DO NOTHING').bind(user.userId,key,now,user.userId).run()
   :await env.DB.prepare('UPDATE libraries SET revision = revision + 1, blob_key = ?, updated_at = ? WHERE user_id = ? AND revision = ? AND EXISTS (SELECT 1 FROM accounts WHERE id = ?)').bind(key,now,user.userId,payload.revision,user.userId).run();
  if(!result.meta.changes){await env.BUCKET.delete(key);return response({error:'Your library changed on another device. Export your current view as a backup, then reload and try again. Your unsaved edits remain open.'},409)}
  // Only the winning revision can remove its previous immutable snapshot.
  // Cleanup failure must never turn a successful save into a failed save.
  if(previous?.blob_key)env.BUCKET.delete(previous.blob_key).catch(()=>{});
  return response({revision:payload.revision+1,updatedAt:now});
 }catch{return response({error:'Could not save online. Your edits remain open. Please retry.'},503)}
}
