# khrystyna's library

A cozy personal bookshelf for recommendations, TBRs, and reading notes.

## Publish with GitHub Pages

Go to repository Settings → Pages. Under Build and deployment, select Deploy from a branch, then main and / (root), and Save.

The website will be available at https://ohanesovna-k.github.io/khrystynas-library/ after deployment completes.

## Start using it

Open the website and choose Add book. Search Open Library or add manually. All books, notes, recommendations and uploaded covers stay in IndexedDB in your current browser. No account or backend is needed. Other visitors get their own empty collections.

If moving from the original app address, export a JSON backup there, then import it in Settings on the GitHub Pages website. Data does not transfer automatically between addresses. Keep regular backups: clearing browser data can erase your collection. Do not commit personal backup JSON files to this public repository.

## Features

Cover and spine bookshelf, recommendations and notes, custom fields, collections, Unicode search, filters and sorting, drag/drop and keyboard move controls, TBR picker, full JSON backup/restore, safe duplicate-aware merge and separate temporary demo mode.

## Run locally

Serve this folder with any static server, for example `python3 -m http.server 8000`, and open http://localhost:8000. No build or installation is required.

Book metadata and remote covers require internet access. Unknown metadata stays editable. No book contents are stored. External fonts have local fallbacks.

## Verification

Core-model checks covered Unicode and long-note search, filters, recommendations, ordering, backup validation and non-overwriting merge. JavaScript syntax checks passed and a live Open Library search succeeded. Browser end-to-end testing was unavailable in the build environment.
