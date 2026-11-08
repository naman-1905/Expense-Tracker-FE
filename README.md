# Pocket Finance

A local-first expense and income tracker built with Next.js. It needs no login, API server, database, or environment file: records are stored in the browser or the Android app’s local WebView storage. The same UI runs on desktop, mobile web, and Android through Ionic Capacitor.

## Run the web app

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Transaction amounts are stored in INR. Currency display conversion is optional and requires an internet connection; when rates are unavailable, amounts display in INR. The app’s records and core screens work offline.

## Back up or move your data

Use **Export backup** in the left navigation to download a JSON file. Use **Restore backup** on another browser or device to import it. Browser and Android storage are separate; backups are the way to move records between them. Keep backup files somewhere safe because clearing app storage removes the local copy.

## Build the Android app

Requirements: Node.js 22 or newer, Android Studio, and an Android SDK installation. Capacitor Android uses the SDK installed through Android Studio.

```sh
npm ci
npm run cap:add:android     # already scaffolded in this repository
npm run cap:sync:android    # static Next.js build, then copy it into Android
npm run android             # sync and open the native project in Android Studio
```

To create an APK, open the `android/` project in Android Studio and use **Build > Build Bundle(s) / APK(s) > Build APK(s)**. The web bundle is generated in `out/`; Capacitor uses that directory as its app content.

## Optional FastAPI service

The separate `Expense-Tracker-BE/fastapi` service supports server accounts and shared database records for future integrations. The default frontend does not call it and does not require it. Data stored locally is not automatically synced to the API.

## Stack

- Next.js static export and React
- Ionic Capacitor 8 with the Android platform
- Browser localStorage for offline records and profile settings
- Chart.js for summaries and trends
- XLSX export for income, expense, and savings reports
