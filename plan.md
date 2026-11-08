# Pocket Finance: Product Improvement Plan

## Product goal

Make Pocket Finance feel like a personal finance notebook that lives on one person’s phone. People should be able to record money in and out, create named savings plans, and understand progress without making an account or connecting to a service.

## Non-negotiable privacy rules

- Financial records, savings plans, profile details, preferences, and app analytics stay on the person’s device. Never send them to a server, API, analytics SDK, crash reporter, or third party.
- Do not add accounts, cloud sync, remote databases, or advertising trackers.
- Make every core flow work in airplane mode. Avoid network requirements for charts, search, exports, currency display, app startup, and onboarding.
- Store data in the Android app’s private local database. For the web version, use browser-local storage with equivalent behavior. Keep web and phone data separate unless the person explicitly exports and imports a backup.
- Backups are generated on the device. Explain that a file leaves the app only when the person chooses where to save or share it.
- Treat OS backups and device transfers as platform-controlled behavior; document how to keep or exclude app data where Android supports it.

## Current foundation

The app already has a local-first Next.js interface, Capacitor Android scaffolding, income and expense records, local summaries, charts, filters, spreadsheet export, a basic savings entry, and JSON backup/restore. Today, records use `localStorage`; this is a useful prototype but has browser storage limits and is not encrypted by the app. The currency-rate feature still requests rates from a CDN. The savings target card is not wired to saved state or savings records yet.

## Product principles

1. **Write it down quickly:** logging a purchase or contribution should take a few taps.
2. **Make plans personal:** use the person’s own goal names, dates, target amounts, and notes rather than fixed categories.
3. **Show the story:** balance, monthly totals, upcoming plans, and recent activity should be easy to understand at a glance.
4. **Private by default:** local storage is the only normal data path; sharing or exporting is always a deliberate user action.
5. **Clear, forgiving records:** support edits, undo, and clear confirmation before destructive actions.

## Roadmap

### 1. Make phone storage dependable

- Replace `localStorage` as the primary Android store with a local database such as SQLite through a Capacitor plugin. Keep the database inside the app’s private sandbox.
- Define a versioned data model and migrations for profiles, accounts, transactions, savings plans, contributions, preferences, and backup metadata.
- Add a web storage adapter for browser use. Both adapters implement the same local repository interface; neither can make network requests.
- Import the existing `expense_tracker_transactions_v1` and profile keys into the new schema once, verify the imported count, and retain a rollback backup until the person confirms completion.
- Handle storage-full, corrupt-backup, upgrade, and restore failures with clear messages and no silent data loss.

### 2. Add named savings plans

Let a person create a plan such as **“Save for a plane ticket”**, **“New laptop”**, **“Emergency fund”**, or **“Weekend in Jaipur.”** A plan can include:

- Name and optional description or personal note.
- Target amount and the currency in which the target is expressed.
- Optional target date, start date, priority, and color/icon.
- Starting amount, if the person has already saved toward it.
- Optional reminder schedule, stored on-device and delivered through local notifications only.
- Status: active, paused, completed, or archived.

The plan screen shows amount saved, amount remaining, percentage complete, deadline progress, and a simple history of contributions and withdrawals. Allow edits, pause/resume, mark complete, archive, and delete with confirmation. Never count ordinary income as a savings contribution automatically.

### 3. Make saving a first-class transaction

- Add **Add to a plan** as a quick action. The person chooses a plan, enters an amount and date, and can add a note such as “tax refund” or “cash from this week.”
- Save each contribution as its own dated record linked to one plan. It appears in the plan history and in general activity without being mistaken for an expense.
- Allow withdrawals or corrections as separate, auditable records. Editing or deleting a contribution updates the plan total immediately.
- Support unallocated savings for money set aside before the person chooses a plan; let them assign or split it later.
- Make quick actions configurable, for example “Add my weekly ₹500 to the plane ticket plan.”

### 4. Improve everyday notebook capture

- Add a single quick-entry sheet for expense, income, savings contribution, and transfer between personal accounts.
- Make date, amount, description, category, account, and optional note easy to edit. Preserve the person’s chosen date and amount exactly.
- Add user-created categories and accounts; suggest recent values locally without uploading them.
- Add search and filters by text, date, category, account, type, and savings plan.
- Add edit, duplicate, undo-delete, and recurring transaction templates. Recurring entries are local rules; only create entries after an on-device reminder or the person’s chosen confirmation policy.

### 5. Personal finance views

- Overview: current balance, income, spending, savings contributions, active plan progress, and recent activity.
- Monthly notebook: income versus expenses, category totals, and comparison to prior months.
- Savings view: plan cards sorted by priority or deadline, recently funded goals, and upcoming milestones.
- Optional budgets: user-defined monthly category limits with on-device progress indicators.
- Custom date ranges, accessible charts, and an activity list that works with large histories.
- Keep summaries transparent: explain whether transfers and savings contributions affect each total to avoid double counting.

### 6. Fully offline presentation

- Remove runtime currency-rate requests. Offer a chosen base currency per account and optional manually entered conversion rates with an “as of” date, or show original transaction currency without conversion.
- Bundle fonts, icons, and illustrations required by the interface; do not load remote assets or scripts at runtime.
- Ensure opening the app, recording, editing, search, charts, and exports work in airplane mode.

### 7. Privacy, protection, and recovery

- Offer optional app lock using Android biometrics/device credentials where available; don’t create a remote password account.
- Consider local database encryption using a key protected by Android Keystore. Explain recovery tradeoffs before enabling it.
- Add encrypted, versioned backups with a passphrase option, plus a clearly labeled plain JSON export for interoperability.
- Add an on-device privacy page with storage location, backup status, export, restore, and **Erase all data** controls.
- Before destructive changes, show what will be removed and provide an export option. Make erasure local and verifiable.
- Use no analytics or crash reporting that transmits finance data. If diagnostics are ever proposed, require explicit opt-in and strip all personal and transaction content.

### 8. Accessibility and polish

- Support larger text, screen readers, strong focus states, contrast, and reduced motion.
- Improve empty states with useful examples while keeping sample data separate from real records.
- Add clear validation, save confirmation, undo, and offline indicators.
- Test responsive layouts on small phones, tablets, and desktop browsers, including safe areas and Android keyboard behavior.

## Suggested delivery order

1. Define privacy/data-flow rules and the versioned local schema.
2. Build SQLite and browser storage adapters plus one-time migration from current localStorage.
3. Deliver named savings plans and linked contribution history.
4. Improve quick entry, editing, search, and undo.
5. Add notebook summaries, categories, accounts, and optional budgets.
6. Remove runtime network calls and improve local backup, app lock, and recovery.
7. Finish accessibility, Android device checks, and user-facing privacy documentation.

## Acceptance criteria

- With network access disabled, a person can launch the app, create/edit/delete an expense, income record, plan, and contribution, view totals and history, and create a backup.
- Inspecting app network traffic during normal use shows no transaction, plan, profile, preference, or diagnostic data leaving the device; ideally the app makes no runtime requests at all.
- A contribution is linked to exactly one savings plan (or explicitly unallocated), appears in its history, and changes its progress and remaining amount correctly.
- Upgrading from the existing localStorage version preserves existing income and expense records and reports the imported count.
- Backup/restore is versioned, validated, and never silently overwrites data; merge versus replace is an explicit choice.
- The app clearly explains local storage, export behavior, and what happens when app data is cleared or the phone is replaced.
