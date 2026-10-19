import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
export const COOKIE='__Host-library_session';
export async function digest(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('')}
export function randomToken(){const bytes=crypto.getRandomValues(new Uint8Array(32));return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}
export function sessionCookie(token:string,age=2592000){return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${age}`}
export function tokenFromCookie(cookie:string){return cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||''}
export async function accountFromCookie(cookie:string){return accountFromToken(tokenFromCookie(cookie))}
export async function accountFromToken(token:string){if(!/^[a-f0-9]{64}$/.test(token))return null;return env.DB.prepare('SELECT accounts.id AS userId, accounts.nickname AS nickname FROM sessions JOIN accounts ON accounts.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?').bind(await digest(token),Math.floor(Date.now()/1000)).first<{userId:string,nickname:string}>()}
export function tokenFromRequest(request:Request){const auth=request.headers.get('Authorization');return auth?.startsWith('Bearer ')?auth.slice(7):tokenFromCookie(request.headers.get('cookie')||'')}
export async function getAccount(request?:Request){if(request)return accountFromToken(tokenFromRequest(request));const h=await headers();return accountFromCookie(h.get('cookie')||'')}
export function isOwner(user:{userId:string}|null){return !!user&&!!env.LIBRARY_OWNER_ID&&user.userId===env.LIBRARY_OWNER_ID}
