# Frontend Work Log

## 2026-11-08

- Started the frontend phase after migrating the backend to one FastAPI service and renaming its folder to `fastapi`.
- Goal: make the Next.js experience local first, with transactions and preferences stored on the device so the app remains usable without an API or network connection.
- Planned work: replace backend-dependent data helpers with local persistence; make app entry and profile setup independent of server auth; refresh the responsive dashboard styling; configure Next.js static export and Ionic Capacitor Android scaffolding; update the README and `plan.md`.
- Keep any optional server integration separate from the default local experience. Existing server data is not automatically copied into browser storage; users will need an import/export path for portability.

## Progress

- Replaced auth, transaction, and history network helpers with browser-local profile and transaction storage; summaries and charts now calculate from those local records.
- Added JSON backup export and restore, including validation of imported transactions.
- Added a local savings entry flow and removed sample-only savings records.
- Refreshed the app shell with a dark sidebar, violet balance treatment, mobile bottom navigation, local storage status, and safer mobile spacing inspired by the supplied references.
- Configured Next.js static export, installed Capacitor 8 core/CLI/Android, and generated the Android project.
- Updated the frontend container to serve the static export and removed its backend environment requirement.
- Removed the unused password login/signup pages and all Next.js backend proxy routes; the app opens directly into its local workspace.
- Updated README, Docker, and Jenkins for a static frontend with no `.env` or API service requirement.
- Added the Android Studio / SDK workflow and data portability notes.
- Ran `npm run cap:sync:android`: Next.js static export completed, then Capacitor copied the web app and synced Android successfully with no lint warnings.
- Backend repo is pushed on `main`; the frontend work log and implementation are being pushed on `main` in this change.

## 2026-11-08 documentation update

- Replaced the migration checklist in `plan.md` with a product roadmap for a private, phone-first personal finance notebook.
- Added `documentation.md` describing current screens, records, filters, reports, local storage, backup/restore, network behavior, and known limitations.
- The roadmap prioritizes durable on-device storage, named savings plans (for example, a plane ticket), linked contributions, offline completeness, and privacy protections.

## 2026-11-08 — Revision 2 implementation

- Adopted the supplied Revision 2 storage proposal: Capacitor SQLite on Android and the plugin’s `jeep-sqlite`/SQL.js IndexedDB store on web, using one schema and one local query layer.
- Added version 1 schema and database initialization, atomic write batches, browser persistence, and a one-time migration from the previous transaction/profile localStorage keys. Migration data is checked and the old copy remains until a person confirms the review notice.
- Removed currency CDN usage and remote transaction dependencies. INR is the only supported transaction/display currency at this stage. CSP, Android Internet permission removal, cleartext restrictions, and Android backup exclusion reinforce the local-only product direction.
- Added versioned local JSON backup, validation, and explicit merge/replace restore choices. Restore operations are atomic.
- Replaced the temporary savings target with persisted named savings plans, targets, progress, target dates, contribution/withdrawal history, archive, and starter goal ideas. Unallocated savings remain available; split allocation and contribution editing remain roadmap items.
- Replaced `plan.md` with the Revision 2 product roadmap and updated `documentation.md` to describe actual current behavior and known gaps.
- Aligned SQL.js to 1.11.0, the version documented by `jeep-sqlite` 2.8.0, after browser startup exposed a WebAssembly mismatch with 1.15.2.
- Added local recent-activity search, description/amount editing, duplicate action, and a short-lived undo for the latest deletion. Updated the plan and current-feature documentation to distinguish those capabilities from remaining full-history/category/account filters and richer editing.
- Verification passed: `npm run lint`, `npm run build:mobile`, `npm run cap:sync:android`, and `git diff --check`. The frontend source scan found no runtime fetch/Axios or remote URLs; the only localStorage access is the explicit legacy migration/review flow.
- Browser verification initially caught and then confirmed resolution of the SQL.js WASM startup issue. Pocket Finance opened and completed local database initialization. A physical Android handset walkthrough and packet-capture verification remain necessary for full device-level acceptance.
