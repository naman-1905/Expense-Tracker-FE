# Pocket Finance: Product Improvement Plan (Revision 2)

## Product goal

Pocket Finance is a personal finance notebook that lives on one person’s device. It should help people record money in and out, give savings a personal purpose, and understand progress without an account, a server, or a network connection. The supplied visual references guide the visual direction: calm layouts, soft violet accents, generous spacing, personal goal cards, and clear mobile navigation.

## Non-negotiable principles

- Transactions, savings plans, profile details, preferences, and analytics stay on the device. The app does not send them to a server, API, analytics service, or crash reporter.
- No login, cloud sync, remote database, or advertising tracker.
- Core flows work offline. Fonts, icons, charts, and database assets ship with the app.
- An export leaves the app only when the person explicitly saves or shares the generated file.
- Confirm destructive actions and make backup/restore choices explicit.
- Be honest that local storage is not encrypted by this app. Web storage and Android private-app storage have different platform protections.

## Architecture and storage

The Next.js frontend is the product app; the separate backend is not used by the normal frontend experience. Android is packaged with Capacitor. The frontend uses `@capacitor-community/sqlite` on Android and its `jeep-sqlite` / SQL.js web implementation backed by IndexedDB in browsers. The same SQL schema and repository functions are used on both platforms. Web data and Android app data remain separate unless a person exports and restores a backup.

The schema is versioned and currently at version 1. It includes `schema_migrations`, `app_meta`, `profiles`, `accounts`, `categories`, `transactions`, `savings_plans`, `contributions`, `budgets`, `reminders`, `recurring_rules`, and `backup_metadata`. Indexes cover transaction date/account and plan contribution history. Migrations are forward-only; any future destructive change needs a reviewed migration and a backup path.

The old `expense_tracker_transactions_v1` and profile localStorage keys are read once during database initialization. Records are validated and inserted inside a transaction, duplicate IDs or invalid rows stop the migration, and read/written counts are recorded. The old keys remain untouched until a person confirms the migration review in the app. No normal reads or writes use localStorage after migration.

Currency conversion has no network path. The current app records and displays INR only. If additional currencies are added, the entered currency/amount must remain the source of truth; conversion should use an explicitly entered manual rate with an as-of date or show the original currency. Never fetch exchange rates at runtime.

## Current implementation status

### Delivered in this work

- **On-device SQLite foundation:** one local database implementation for Android and web, schema v1, change notifications, atomic batches, and legacy-data import with a retained rollback copy until confirmation.
- **Local-only runtime:** transaction and profile features use the local database. The frontend has no runtime `fetch`/Axios calls. Android removes the Internet permission, disables cleartext traffic, and disables Android backup/device-transfer copying. The app CSP only permits same-origin connections.
- **Named savings plans:** create a named target such as “Save for a plane ticket,” optional description and target date, edit the name/target, archive with confirmation, show saved/remaining/progress, and add a dated contribution or withdrawal with an optional personal note. Activity history is attached to its plan and updates from the saved ledger.
- **Savings overview:** personal starter ideas, target progress, recent plan history, and an unallocated savings entry/report card.
- **Versioned JSON backup:** exports profile, records, plans, contributions and supporting local data. Restore validates its structure before writing and asks the person to merge or replace. Restore operations use an atomic database batch.
- **Responsive presentation:** refreshed workspace navigation, dashboard cards, mobile navigation, on-device status, and savings cards inspired by the supplied reference images.
- **Capacitor Android workflow:** static Next.js export is packaged and synced into the Android project. SQL.js WASM is copied into the bundle before builds.

### Still to build

- Search is currently limited to descriptions/notes/type in the loaded recent/date-filtered records. Transaction editing covers description and amount; date, category/account and type filters, full history search, and richer edit fields remain.
- User-created categories/accounts, transaction category assignment, and undo-delete beyond the current session are still needed.
- Contribution edit and split/allocate actions for unallocated savings; current plan activity supports add, withdrawal, and delete.
- User-defined categories and accounts, budgets, and recurring templates with explicit confirmation before creating entries.
- Manual exchange-rate support and additional original-currency entry.
- Encrypted backups, optional database encryption, app lock, privacy/erase screen, and storage-quota guidance.
- Local reminders, complete accessibility audit, large-text/TalkBack checks, and device testing on a low/mid-range Android phone.

## Delivery roadmap

### Phase 1 — Storage foundation and migration (implemented; device failure testing remains)

- Ship SQLite schema and the shared web/Android query layer.
- Migrate previous browser records atomically, verify counts, and keep the old copy until confirmation.
- Show a retryable startup error if the local database cannot initialize.
- **Done when:** fresh install and upgrade data are validated on web and Android, and forced quota/corrupt-database failures have an exercised recovery path.

### Phase 2 — Named savings plans and ledger (core delivered; allocation/edit gaps remain)

- Persist plans, targets, target dates, status, and contribution/withdrawal history.
- Keep unallocated savings available; make contributions linked or explicitly unallocated.
- Add contribution editing and split allocation from unallocated savings.
- **Done when:** create/edit/archive, add/edit/delete, split, and history totals agree after restart and across restore.

### Phase 3 — Notebook capture

- Add a unified quick-entry flow for income, expenses, contributions, and transfers.
- Support local categories/accounts and assignment; extend current activity search, basic edit, duplicate, and short-lived undo to full date/category/account/type filters and durable history navigation.
- Add recurring templates that require a local reminder or the person’s confirmation before a transaction is created.
- **Done when:** any record across the full local history can be found and corrected locally, and no recurring template creates an entry silently.

### Phase 4 — Views and budgets

- Expand overview/monthly summaries and category totals; add optional category budgets.
- Label how transfers and savings affect each total to prevent double counting.
- Paginate or virtualize long activity lists.
- **Done when:** every total shown has a documented and consistent definition.

### Phase 5 — Offline completeness

- Keep all runtime assets bundled and keep the network request surface closed.
- Add manual-rate/original-currency support if multi-currency is introduced.
- **Done when:** an airplane-mode walkthrough covers launch, capture, plans, history, charts, export, and restore with zero external requests.

### Phase 6 — Privacy and recovery

- Offer plain JSON and passphrase-encrypted versioned backups; state that a lost passphrase makes that encrypted file unrecoverable.
- Consider Android SQLCipher with keys protected by Android Keystore and optional biometric/device-credential app lock with a device credential fallback.
- Add a privacy page explaining local storage, backup behavior, export, restore, and erase-all-data.
- **Done when:** recovery tradeoffs are shown before enabling protection and restore never overwrites without explicit choice.

### Phase 7 — Accessibility and device polish

- Verify keyboard/focus, labels, contrast, reduced motion, TalkBack, 200% text scaling, safe areas, and Android keyboard behavior.
- Test low/mid-range devices and large histories; establish measured cold-start and scrolling baselines.
- **Done when:** every primary flow is usable at large text scale with screen reader navigation and no dead ends.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Migration drops or duplicates rows | One transaction, strict ID/data validation, read/write count, keep old data until explicit confirmation. |
| Browser storage is cleared or evicted | Encourage periodic explicit export; add quota/storage guidance in the privacy phase. |
| Plain local database is accessed on an unlocked device | State current limits plainly; evaluate SQLCipher/app-lock protection before making stronger claims. |
| Lost encrypted-backup passphrase | Explain unrecoverability before encryption is enabled; do not imply a reset exists. |
| Biometric lockout traps the owner | Always offer device PIN/pattern fallback. |
| A dependency adds a network call | Keep CSP and Android permissions restrictive; audit dependencies and verify with a packet capture. |
| Large activity lists become slow | Date/account indexes already exist; add pagination/virtualization and device benchmarks. |

## Verification checklist

- Check for runtime network APIs and remote asset URLs in frontend source and built assets.
- Walk through airplane-mode launch, income/expense creation, savings plan creation and contributions, charts, export, merge, and replace restore.
- Migrate a synthetic old localStorage set, including invalid rows and duplicate IDs; verify failure preserves both old keys and current DB contents.
- Round-trip JSON backup in merge and replace modes; corrupt input must not alter existing data.
- Check Android manifest permissions, network policy, backup exclusion, and the packaged SQLite WASM asset.
- On device, exercise storage-full/corrupt-database handling, TalkBack, 200% scaling, and large-history scrolling.

## Acceptance criteria

- A person can use core finance flows with the network disabled and without any backend dependency.
- No transaction, plan, profile, preference, or diagnostic data leaves the device during ordinary use.
- Each plan shows saved amount, remaining amount, progress, and a contribution/withdrawal history from its own records.
- Legacy records survive migration, with a visible imported count and original data retained until confirmation.
- Backup restore validates data and presents explicit merge/replace choices before changing local records.
- Documentation clearly states where data is stored, what export does, and the limits of local encryption, device transfer, and app clearing.
