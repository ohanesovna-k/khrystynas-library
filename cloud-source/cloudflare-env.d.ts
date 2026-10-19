interface CloudflareEnv { DB: D1Database; BUCKET: R2Bucket; LIBRARY_OWNER_ID?: string; }
declare module 'cloudflare:workers' { const env: CloudflareEnv; }
