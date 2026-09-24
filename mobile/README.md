> **client-starter note:** this is the optional mobile module (`modules.mobile`). It lives inside the client repo (not a separate repo) and talks to this same Next.js app. Before building for a client: set `baseUrl` in `lib/API/api_endpoints.dart` to the client domain, change the app name/bundle id, and replace icons in `assets/`.

# vctsmobile

Flutter mobile client for the VCTS stack. Talks to the `vctsserver` backend
(Next.js API) for auth and data. State is managed with `provider`; HTTP goes
through a single `APIClient` (Dio).

## Prerequisites

- Flutter SDK (see `environment.sdk` in `pubspec.yaml`)
- A running `vctsserver` instance (default `http://localhost:3000`)

## Getting started

```bash
flutter pub get        # install dependencies
flutter run            # launch on a connected device / emulator
```

### Point the app at your backend

Set `baseUrl` in `lib/API/api_endpoints.dart`.

- Android emulator reaches your host machine at `http://10.0.2.2:3000`
- iOS simulator can use `http://localhost:3000`
- A physical device needs your machine's LAN IP, e.g. `http://192.168.x.x:3000`

## Common commands

```bash
flutter run            # run the app
flutter test           # run tests
flutter analyze        # lint (flutter_lints)
flutter gen-l10n       # regenerate localizations after editing lib/l10n/*.arb
```

## Project layout

- `lib/API/` — `APIClient` (Dio wrapper) and `api_endpoints.dart` (paths + `baseUrl`)
- `lib/service/` — `provider` ChangeNotifiers; **call these from pages, never raw Dio**
- `lib/model/` — request/response types with `fromJson` / `toJson`
- `lib/page/` — screens; `lib/component/` — reusable widgets
- `lib/l10n/` — localization (`en`, `zh`, `zh_HK`)

## Firebase (optional)

Analytics uses Firebase. The app runs without it, but to enable analytics add
the platform config files and they'll be picked up automatically:

- Android: `android/app/google-services.json`
- iOS: `ios/Runner/GoogleService-Info.plist`
