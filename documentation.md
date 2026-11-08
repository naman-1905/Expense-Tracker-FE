# Pocket Finance: Current Feature Documentation

## Overview

Pocket Finance is a personal finance notebook built with Next.js and packaged for Android with Ionic Capacitor. It opens into a local workspace without an account or login. The frontend is self-contained for normal app use and does not depend on the FastAPI backend.

The UI uses a quiet, light workspace with violet highlights, desktop sidebar and compact mobile navigation. The savings section is designed around personal goals such as a plane ticket, emergency fund, or laptop.

## Data storage and privacy

- Android stores finance records in a SQLite database in the app’s private storage. The Capacitor SQLite plugin provides the native implementation.
- Browser use stores the same SQLite schema through `jeep-sqlite` / SQL.js in IndexedDB. Browser and Android records are separate and do not sync automatically.
- The schema currently covers profiles, cash accounts, categories, transactions, savings plans, contributions, budgets, reminder and recurring-rule placeholders, and backup metadata.
- The app has no normal transaction API, account service, analytics integration, or runtime network fetch. The web Content Security Policy allows same-origin connections only. Android removes the Internet permission, blocks cleartext traffic, and disables Android backup/device-transfer inclusion for app data.
- Older installations may have browser localStorage records. The app imports those once into SQLite, reports read/written counts, and leaves the original keys in place until the person confirms the migration notice. After confirmation, the old copies are removed.
- Local database contents are **not encrypted by this app**. Android’s app-private sandbox and browser IndexedDB have platform protections, but this is not the same as database encryption. App lock and SQLCipher are not implemented.
- Clearing browser site data or Android app data can erase records. Android cloud/device transfer backup is disabled in this build. Export a backup before clearing data, changing devices, or uninstalling.

## Overview screen

- Shows local income, expense, and balance summaries.
- Displays chart-based overview and recent activity from records stored on the device.
- Provides the responsive dashboard workspace and local-mode status.
- Savings contributions are tracked separately from income and expenses so they are not counted twice in the cash balance.

## Income

- Add income with a title, amount, date/time, and emoji.
- View locally calculated income charts and source totals by date range.
- Export income source reports as XLSX.
- Values are currently entered and displayed in INR.

## Expenses

- Add an expense with a title, amount, date/time, and emoji.
- View local expense charts and source totals by date range.
- Export expense source reports as XLSX.
- Values are currently entered and displayed in INR.

## Recent activity

- Browse local income, expense, and savings contribution records.
- Use the available recent-activity date filters and custom ranges, and search loaded records by description, note, or type.
- Edit the description and amount, duplicate a record, or delete it after a confirmation prompt. A short-lived undo action can restore the latest deletion during the current app session.
- Records are ordered newest first. Search covers the loaded date range (up to 100 records); full-history search, date/category/account/type filters, richer edits, and durable undo are not implemented.

## Savings plans

- Create a personal goal with a name, target amount, optional date, optional note, and icon. Examples include “Save for a plane ticket,” “Emergency fund,” or “New laptop.”
- The savings view shows saved amount, remaining amount, percentage progress, and target date.
- Add dated contributions to a plan and attach a note such as “from this week’s pay.” A withdrawal can also be recorded with its own note.
- Recent plan activity remains attached to the plan and updates its total when a contribution is added or deleted.
- Edit a plan’s name or target amount. Archive with confirmation; past contributions become unallocated savings instead of being discarded.
- The empty state offers example goals that prefill a new plan form; these suggestions are not saved as real records unless the person creates the plan.
- The unallocated savings card can capture savings that do not yet have a plan and export a source report. Splitting or assigning an unallocated amount to a plan is planned but not yet available.
- Editing a contribution, reminders, and recurring savings actions are not yet implemented.

## Profile and currency

- Set a display name for the local profile.
- The app currently records and displays all values in INR. Currency conversion is disabled and no exchange-rate request is made.
- Multi-currency entry and manual conversion rates are future work; saved values should remain in their original currency if introduced.

## Backup and restore

- Export creates a versioned JSON file locally with the profile, transactions, savings plans, contributions, accounts, categories, and budgets.
- The app does not upload this backup. The person chooses where to save or share it; the generated JSON is plain text and may contain sensitive financial records.
- Restore validates the backup sections before changing data and asks the person to **merge** with current records or **replace** local transactions, savings plans, budgets, accounts, and categories.
- Merge keeps existing records and skips transaction IDs already present. Replace is destructive; the choice is presented before it begins. Database changes are applied as one transaction.
- Encrypted backup files, scheduled backups, and a dedicated privacy/erase page are not available yet.

## Android and web development

- Next.js is configured to statically export the frontend. SQLite’s SQL.js WASM file is copied into `public/assets` before build.
- Run `npm run dev` for local development.
- Run `npm run build:mobile` to make the static production build.
- Run `npm run cap:sync:android` to build and copy the app into the Android project.
- Run `npm run android` to sync and open the project in Android Studio. Android Studio and an Android SDK are required to produce/install an APK.

## Known limitations

- Full-history search, category/account/date/type filters, richer transaction editing, and durable undo are not implemented.
- Savings contribution editing and split allocation from unallocated funds are not implemented.
- User-defined categories/accounts, category budgets, recurring entries, local reminders, app lock, SQLCipher encryption, and encrypted backups are not implemented.
- Currency is INR only and there is no conversion.
- Android runtime behavior, storage failure recovery, large histories, TalkBack, and 200% text scaling still need device verification.

See [plan.md](./plan.md) for the delivery roadmap and acceptance checklist.
