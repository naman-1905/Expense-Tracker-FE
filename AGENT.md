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
