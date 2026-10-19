# little library — individual accounts

A cozy bookshelf with nickname/password accounts, private cloud libraries, and a personalized “[nickname]’s library” header and tab title. Each person creates their own account and uses the same nickname and password on every device.

The primary frontend runs at https://ohanesovna-k.github.io/khrystynas-library/ and calls the HTTPS backend at https://little-library.wry-pear-2440.chatgpt.site/. GitHub Pages serves the complete login and library interface; Sites runs authenticated APIs with D1/R2. The original local library remains at legacy.html for backup exports.

## Accounts and privacy

Nicknames contain 3–30 letters, numbers, underscores or hyphens and are unique without regard to case. Passwords require at least 12 characters and at most 72 UTF-8 bytes. Bcrypt hashes use cost 12; plaintext passwords are never stored. Random 256-bit session tokens are hashed in D1; cookies are Secure, HttpOnly, SameSite=Lax and expire after 30 days. GitHub Pages uses opaque bearer sessions, held in sessionStorage by default or localStorage when Keep me logged in is selected. This avoids third-party cookie requirements. CORS permits exactly https://ohanesovna-k.github.io; writes allow that origin or the backend origin. Every library API request checks the session server-side and derives the account ID from it. Client-supplied owner IDs are ignored. Writes reject all other origins. Login/signup/recovery are rate-limited by IP and nickname.

Signup supplies a one-time-displayed recovery code. Recovery rotates that code and revokes all prior sessions. There is no email reset service: losing both password and recovery code loses account access. Save recovery codes in a password manager.

## Persistence

Private R2 snapshots hold each account's collection including uploaded covers. D1 stores per-account revision pointers. Conditional atomic saves reject stale writes from other devices. Idle tabs refresh every 20 seconds; an open editor is never replaced by polling. Saving requires an internet connection. Failed saves keep the editor open. Current limit: 30 MB per snapshot. JSON export/restore remains available.

Import the old browser library in Settings when offered. From GitHub Pages, export JSON there and import it into the cloud app. Import merge keeps incoming entries separately to avoid overwriting notes. No private collection data, credentials or session cookies belong in Git.

## Owner administration

The existing account identified by the server-only LIBRARY_OWNER_ID runtime variable is the sole owner. The nickname alone never grants permissions. Settings → Manage accounts lists only nicknames and registration/last-save dates, never other users’ notes or passwords. Deletion requires the current owner password and exact target nickname. The owner cannot delete itself. A D1 transaction removes accounts, all sessions and library pointers; R2 files are removed afterward. Durable deletion jobs retry cleanup if storage is temporarily unavailable. Library writes also check that the account still exists, preventing an in-flight request from recreating deleted records.

## Source and deployment

Supported Vinext/Sites hosting integration. `app/account-auth.ts` checks opaque sessions; `app/api/account/route.ts` provides register/login/logout/recovery; `app/api/library/route.ts` handles authorized conditional persistence. `public/library` holds the bookshelf. D1 schema/migrations are in `db/schema.ts` and `drizzle`. DB and BUCKET bindings are provisioned through `.openai/hosting.json`. Do not deploy the cloud client as a static site: it requires these same-origin endpoints and hosted bindings.

## Checks

- `node check-accounts.mjs`: real SQLite schema with mocked platform bindings; signup/login, case-insensitive uniqueness, password/recovery hashes, cookie attributes, cross-client save/load, account isolation, optimistic concurrency, logout/recovery/session revocation, rate limits, GitHub CORS and bearer sessions, owner-only administration, deletion confirmations, protected owner account, session/data deletion and retryable file cleanup.
- `node check-cloud.mjs`: alias for the complete SQLite-backed account suite.
- `node check.mjs`: search, filters, ordering, recommendation and JSON backup checks.
- `node --check public/library/app.js`: client syntax.
- Supported Sites production build.

Browser automation is unavailable; visual and interactive browser flows are not verified end-to-end. Hosted HTTP checks are recorded in the delivery conversation.

Run `node scripts/export-pages.mjs` to create the static GitHub Pages client in pages-dist/. Keep legacy.html and legacy-app.js when publishing it, so users can still export their original browser-only collection. The backend and frontend must be deployed together when changing API contracts. Runtime owner configuration is not included in source or static assets.
