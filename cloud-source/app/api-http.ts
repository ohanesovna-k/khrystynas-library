export const GITHUB_ORIGIN='https://ohanesovna-k.github.io';
export function githubRequest(request?:Request){return request?.headers.get('Origin')===GITHUB_ORIGIN}
export function validWriteOrigin(request:Request){const origin=request.headers.get('Origin');return origin===new URL(request.url).origin||origin===GITHUB_ORIGIN}
export function corsHeaders(request?:Request){return githubRequest(request)?{'Access-Control-Allow-Origin':GITHUB_ORIGIN,'Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'}:{}}
export function apiJSON(request:Request|undefined,data:unknown,status=200,extra:Record<string,string>={}){return Response.json(data,{status,headers:{'Cache-Control':'no-store, private',Vary:'Origin, Cookie, Authorization',...corsHeaders(request),...extra}})}
export function preflight(request:Request){if(!validWriteOrigin(request))return new Response(null,{status:403});return new Response(null,{status:204,headers:{...corsHeaders(request),Vary:'Origin'}})}
