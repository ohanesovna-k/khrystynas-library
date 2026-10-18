import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
export const COOKIE='__Host-library_session';
export async function digest(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('')}
export function randomToken(){const bytes=crypto.getRandomValues(new Uint8Array(32));return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}
export function sessionCookie(token:string,age=2592000){return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${age}`}
export function tokenFromCookie(cookie:string){return cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||''}
export async function accountFromCookie(cookie:string){const token=tokenFromCookie(cookie);if(!/^[a-f0-9]{64}$/.test(token))return null;return env.DB.prepare('SELECT accounts.id AS userId, accounts.nickname AS nickname FROM sessions JOIN accounts ON accounts.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?').bind(await digest(token),Math.floor(Date.now()/1000)).first<{userId:string,nickname:string}>()}
export async function getAccount(){const h=await headers();return accountFromCookie(h.get('cookie')||'')}
