# CLAUDE.md — vctsmobile

Guidance for Claude Code in this app. Course teaching template: explain in numbered steps + bullets, separating **what changed** from **what was done**. In client-starter this folder is part of the client repo (the optional mobile module); the backend is the parent Next.js app — see ../CLAUDE.md.

Stack: Flutter / Dart, package name `vctsmobile`. State management: `provider`. HTTP: `dio`.

## Commands
- `flutter run` — launch app
- `flutter test` — run tests
- `flutter analyze` — lint (flutter_lints)
- `flutter pub get` — install deps after editing `pubspec.yaml`
- `flutter gen-l10n` — regenerate localizations into `lib/l10n/generated/` after editing `.arb` files in `lib/l10n/` (config: `l10n.yaml`, template `app_en.arb`)

## Architecture (API layer isolated)
- `lib/API/api_client.dart` — `APIClient` wraps Dio (headers, auth, timeouts); `api_endpoints.dart` holds path constants + `baseUrl`
- `lib/service/*_provider.dart` — ChangeNotifier providers. **Treat provider methods as the mobile API client** — pages/widgets call providers, never raw Dio
- `lib/model/` — request/response types with `fromJson`/`toJson` (no ad-hoc `Map`/`dynamic`)
- `lib/page/` — screens; `lib/component/` — reusable widgets; `lib/theme/`, `lib/utils/`
- `lib/main.dart` — `MultiProvider` wiring (`AuthStorage`, `APIClient`, providers); `page/session_gate.dart` routes by auth state

## Conventions
- Strong Dart typing; structured models over `dynamic`
- Auth token persisted via `utils/auth_storage.dart` (`shared_preferences`); JWT decoded with `jwt_decoder`
- **Server↔mobile sync:** when a consumed `app/api/**` route in `vctsserver` changes, update the matching endpoint constant, model, and provider method here in the same or immediately following change
