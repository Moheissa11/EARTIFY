# EARTIFY — pre-release review report

## Work completed in this handoff

- Reviewed the supplied project structure and retained the existing front-end, planet explorer, Cero interface, account/library UI, research UI, and supplied assets.
- Added a Docker deployment image based on Node 22 Debian slim.
- Added Poppler, Tesseract with English and Arabic language packs, Python 3, and `gosu` to the deployment image so PDF/OCR/DOCX extraction has its required runtime tools.
- Updated `render.yaml` for a single Render Docker web service with a 1 GB persistent disk mounted at `/var/data`.
- Added a startup entrypoint that gives the persistent data directory to the unprivileged Node process before starting the server.
- Added `MAX_ACCOUNTS` configuration (default 100) rather than the previous hard-coded 20-account limit.
- Added seven-day server-side session expiry, migrated old string-form sessions, and made logout cookie attributes consistent with login.
- Added response headers for frame protection, MIME sniffing protection, stricter referrer handling, and disabled unused camera/microphone/geolocation permissions.
- Hardened static-file path resolution and malformed encoded path handling.
- Bounded password length and request-body accumulation.
- Added a repeatable HTTP smoke test covering health, account creation, session check, logout, login, homepage response, and path traversal protection.
- Added deployment instructions, `.dockerignore`, expanded `.gitignore`, and a lockfile.

## Local verification performed for this handoff

- `npm test`: **14 passed, 0 failed** (including the new HTTP smoke test).
- `npm run validate:datasets`: **26 unique JSONL records** (16 train, 5 validation, 5 test).
- `node --check server.js`: passed.
- `node --check public/app.js`: passed.
- HTTP smoke test: homepage returned HTTP 200; `/api/health` returned `ok: true`; account creation, session lookup, logout, and login worked; encoded path traversal was rejected.

## Important things not verified here

- A full Docker image build was not run because Docker is not available in this execution environment.
- A Render deployment was not created. It requires access to the user's GitHub and Render accounts, which I cannot operate from this chat.
- Live NASA NTRS, Crossref, arXiv, Wikimedia, and NASA image API responses were not verified from the deployed service. External providers can rate-limit requests or change behavior.
- OpenAI chat and embedding requests were not tested because no API key was supplied. Add `OPENAI_API_KEY` privately in Render Environment to enable full AI features; this can incur API usage charges.

## Current architecture and limitations

- Accounts, sessions, documents, and history are stored in a JSON file on the persistent disk. This is a single-instance beta architecture. Do not scale the Render service horizontally or run multiple instances until the data layer is migrated to a managed database such as PostgreSQL.
- Rate limits are process-local and reset when the server restarts. There is no email verification, password reset, admin moderation, or self-service account deletion flow.
- Do not ask friends to upload sensitive documents or reuse important passwords. The app is a student beta, not an independently security-audited production service.
- The destination lookup currently uses Wikimedia/Wikipedia summaries, with offline NASA topic fallbacks for recognized Solar System objects. It does **not** call Google Search. Google Fonts are only used for typography; system fonts remain as fallback if Google Fonts cannot load.
- Research results are discovery leads, not verified scientific conclusions. Users should open original records and confirm their context.
- EARTIFY is an educational student concept, not an official NASA product. Its visualizations and mission concepts are not validated engineering data.
