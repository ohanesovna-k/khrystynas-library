interface CloudflareEnv { DB: D1Database; BUCKET: R2Bucket; }
declare module 'cloudflare:workers' { const env: CloudflareEnv; }
