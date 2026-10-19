export const ON_GITHUB=location.hostname==='ohanesovna-k.github.io';
export const BACKEND=ON_GITHUB?'https://little-library.wry-pear-2440.chatgpt.site':'';
export const HOME=ON_GITHUB?'./index.html':'/';
const KEY='little-library-session-v1';
export function savedToken(){try{return sessionStorage.getItem(KEY)||localStorage.getItem(KEY)||''}catch{return ''}}
export function saveToken(token,remember=false){sessionStorage.removeItem(KEY);localStorage.removeItem(KEY);(remember?localStorage:sessionStorage).setItem(KEY,token)}
export function clearToken(){try{sessionStorage.removeItem(KEY);localStorage.removeItem(KEY)}catch{}}
export function apiFetch(path,options={}){const headers=new Headers(options.headers);const token=ON_GITHUB?savedToken():'';if(token)headers.set('Authorization','Bearer '+token);return fetch(BACKEND+path,{...options,headers,credentials:ON_GITHUB?'omit':'same-origin',cache:'no-store'})}
