# Expense Tracker Improvement Plan

## Backend migration — complete

- Consolidate authentication, transactions, and history into one FastAPI service.
- Preserve existing route families and use the existing public PostgreSQL schema.
- Remove Express and Flask services, update Docker/Jenkins/docs, and rename `fastapi-crud/` to `fastapi/`.
- Commit and push each backend file change independently.

## Frontend local-first experience — complete

- Replace calls to auth, CRUD, and history APIs with a local persistence layer.
- Launch directly into the app and provide a lightweight local profile instead of requiring server login.
- Keep transaction creation, listing, date filters, summaries, charts, savings, and export usable offline.
- Add portable JSON backup and restore so device-local data can be moved safely.
- Refresh responsive layout, navigation, typography, and empty states for desktop and mobile.

### Delivered

- Local persistence, local profile, backup/restore, savings entry, and responsive visual refresh are implemented.
- Backend route handlers, login screens, and middleware have been removed from the static frontend.

## Android app — complete

- Configure Next.js for a static web export suitable for Capacitor.
- Install Ionic Capacitor core, CLI, and Android platform packages.
- Add Capacitor configuration and scripts for syncing/building the Android project.
- Document Android Studio and SDK requirements and the build workflow.

### Delivered

- Capacitor 8 packages and Android platform scaffolding are installed and committed. `npm run cap:sync:android` generated the static app and synced it into the native project.

## Completion checks

- No default frontend flow calls the backend or requires backend environment variables.
- Backend route handlers and middleware are removed; static export succeeds.
- Package scripts, Capacitor configuration, responsive UI, Android build instructions, and backup/restore are in place.
