# little library

## Use the synced version

Create a nickname/password account at https://little-library.wry-pear-2440.chatgpt.site/ . Each account gets a private library, available across devices, and a header named after its nickname. Save the recovery code shown at signup.

## Original browser-local version

https://ohanesovna-k.github.io/khrystynas-library/ retains the original local library so existing books remain accessible. To move books, export JSON in Settings there, then import it in Settings on the cloud app. Browser data does not move automatically.

## Source

The full account-based application source is in `cloud-source/`, including server authentication, cloud persistence, migrations, bookshelf UI and checks. Its DB/R2 bindings and runtime hosting are required; GitHub Pages cannot run those backend routes. The root files continue to run as a static, browser-only app.

## Validation

Core-model and SQLite-backed account tests passed. Hosted HTTP checks verified registration, login from two sessions, authorized cloud reads and writes, stale-revision rejection, shared saved revisions and logout. Interactive browser testing was unavailable.
