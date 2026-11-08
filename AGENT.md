# Frontend Work Log

## 2026-11-08

- Started the frontend phase after migrating the backend to one FastAPI service and renaming its folder to `fastapi`.
- Goal: make the Next.js experience local first, with transactions and preferences stored on the device so the app remains usable without an API or network connection.
- Planned work: replace backend-dependent data helpers with local persistence; make app entry and profile setup independent of server auth; refresh the responsive dashboard styling; configure Next.js static export and Ionic Capacitor Android scaffolding; update the README and `plan.md`.
- Keep any optional server integration separate from the default local experience. Existing server data is not automatically copied into browser storage; users will need an import/export path for portability.

## Progress

- Frontend changes have not yet been applied; this log is committed first as requested.
