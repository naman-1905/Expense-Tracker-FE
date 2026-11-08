# Pocket Finance: Current Feature Documentation

## What the app is

Pocket Finance is a personal expense and income notebook built with Next.js and packaged for Android with Ionic Capacitor. It opens directly into a local workspace; there is no login flow in the current frontend.

Financial transactions and the local profile are stored on the device using browser `localStorage` (including the Android WebView’s local storage). The frontend does not send transactions to the FastAPI backend. Browser data and Android app data are separate and do not sync automatically.

## Current features

### Overview

- Shows total income, total expenses, and the current balance derived from locally stored records.
- Displays a financial overview chart, balance, savings-rate and expense-ratio indicators, and recent transactions.
- Offers a refresh action and a recent-activity time filter.

### Income

- Add an income record with a description, amount, date/time, and emoji.
- Review income activity in a chart grouped by day and in source totals grouped by description for a selected month.
- Filter source totals by month and year and export the report as an XLSX spreadsheet.

### Expenses

- Add an expense record with a description, amount, date/time, and emoji.
- Review expense activity in a chart grouped by day and in category/source totals grouped by description for a selected month.
- Filter source totals by month and year and export the report as an XLSX spreadsheet.

### Recent transactions

- Browse locally stored income, expense, and savings records.
- Filter activity to the last 7, 30, 60, or 365 days, or enter a custom date range.
- Delete a record after a confirmation prompt.
- Records are ordered newest first. Amounts use the selected display currency when a rate is available.

### Savings

- Add a savings record with a plan/source name and amount.
- Group contributions by name and show total amount and contribution count for each name.
- Export savings sources to XLSX.
- The current savings target card displays a target and date-range editor, but it is not connected to saved data or linked to contributions yet. Its target uses temporary component state and resets when the view is recreated. Named, persistent savings plans and their progress are planned; see [plan.md](./plan.md).

### Personalization and settings

- Change the local profile display name from the workspace menu.
- Choose a preferred display currency. Records are stored in INR; current conversion rates are requested from a third-party CDN when available. If rates cannot be loaded, amounts display in INR.
- The interface includes desktop navigation, a mobile navigation bar, a local-storage status, and an offline-use indicator.

### Backup and restore

- Export the profile and transactions as a versioned JSON backup file.
- Restore a compatible backup from a JSON file. The app validates the basic transaction structure before replacing its current transaction list.
- Import replaces the existing transaction list; export or preserve a separate backup before restoring if the current records matter.
- The person chooses where to save or share an exported file. The app itself does not upload the backup.

### Reports and downloads

- Income sources, expense categories, and savings sources can be downloaded as XLSX spreadsheets.
- JSON backup is available for moving the full local profile and transaction list between installations.

## Privacy and network behavior

- There is no frontend account service, backend route handler, database connection, cloud sync, or analytics integration in normal transaction flows.
- Transaction, savings, and profile records stay in local app storage unless the person explicitly exports a file and chooses to share it.
- Currency conversion currently makes optional requests to a public CDN for exchange-rate data. These requests do not include transaction or profile records. Removing all runtime network requests is part of the privacy roadmap.
- Local storage is not encrypted by the app. Anyone with access to an unlocked device and its app/browser storage may be able to access the records. App lock and encrypted backups are future improvements.
- Clearing browser or Android app storage can erase local records. Export backups before clearing storage or changing devices.

## Android and web builds

- The web interface runs through Next.js and can be served as a static export.
- The Android wrapper is scaffolded with Capacitor. Run `npm run cap:sync:android` to generate the web export and copy it into the native project.
- Android Studio and an Android SDK are needed to produce and install an APK. See the setup steps in [README.md](./README.md).

## Current limitations

- Savings plans are not yet first-class records: there is no persistent target, contribution-to-plan link, remaining balance, due date, or per-plan history.
- The savings target card is not wired to the savings list and its target is not persistent.
- Individual transaction editing, search, user-defined categories/accounts, budgets, recurring templates, biometric lock, and encrypted database storage are not implemented.
- Currency conversion requires a network connection; INR entry and core finance views remain available locally.
- Backup restore currently replaces the transaction list rather than offering merge/replace choices.
