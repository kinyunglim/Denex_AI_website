# CLAUDE.md — agency-site (built from client-starter)

Template for client websites + CRM, derived from the VTCS course template (`C:\VTCS-Starter-Template-Project\vctsserver`). Each client gets a copy of this repo (see the `/new-client` skill). Explain changes to the user in numbered steps, separating **what changed** from **what was done**; the user reads Cantonese (Traditional Chinese).

Stack: Next.js 16 (App Router) + MongoDB (Atlas) + Zod 4 + next-intl 4 + Tailwind 4. Package manager: **yarn 4 via corepack** (`corepack yarn …`).

## Commands
- `yarn dev:memory` — full app on an in-memory MongoDB with demo data (admin login `admin` / `admin`)
- `yarn dev:preview [--theme bold]` — preview/showcase mode, no database
- `yarn dev` — against `MONGODB_URI` in `.env.local`
- `yarn test` — Jest (real in-memory MongoDB via `src/test/global-setup.mjs`); `yarn test src/modules/booking` for one module
- `yarn test:e2e` — Playwright smoke tests (uses installed Edge on Windows)
- `yarn verify [--template]` — lint → typecheck → tests → client:check → build (run before every delivery)
- `yarn client:init --answers answers.json` · `yarn client:check` · `yarn admin:create --email … --name …` · `yarn seed:demo --theme warm`

## The one file to edit per client
`client.config.ts` — business details, `locales` (first = default), `theme` (corporate | warm | product | bold), `modules`, home `sections`, `notify.email`, timezone, currency. Validated by `src/lib/config.ts` (bad config fails the build). Website copy lives in `content/<locale>.json`; UI strings in `messages/<locale>.json`.

## Architecture (keep the VTCS layering)
- `src/modules/<name>/` — `*.model.ts` (Zod + types) → `*.dao.ts` (DB only) → `*.service.ts` (rules) → tests in `__tests__/`
- `app/api/**/route.ts` — thin: `handle(async () => Service.x(await readJson(request)))`; errors are `AppError` subclasses from `src/lib/errors.ts`, mapped by `src/lib/api.ts`
- `app/admin/(app)/actions.ts` — all admin server actions; each starts with `requireAdmin()` / `requireAdmin('owner')`
- `app/[locale]/…` — public site; `app/admin/…` — back office (not localised; strings in `src/lib/admin-i18n.ts`)
- Modules: core = crm, contact-form, import-export; optional = booking, payments, stripe (needs payments), gcal (needs booking), catalog, mobile. Guard with `requireModule()` (API/services) or `requireModulePage()` (pages).

## Rules
- Strict TypeScript, never `any`. Collection names carry the module prefix (`crm_`, `booking_`, `pay_`, …).
- Modules talk to each other **only through services** (e.g. `CrmService.findOrCreateContact`), never another module's DAO.
- Components use theme tokens only (`bg-primary`, `text-ink`, `rounded-card`, `.btn-primary`, `.field`, `.card`) — never hex colours. Tokens come from `themes/*.ts` → `src/lib/theme.ts`.
- Admin auth is an httpOnly cookie (`src/lib/admin-session.ts`); never trust client-side checks. Staff cannot see payments, exports or team.
- Preview mode (`PREVIEW_MODE=1`) must never write to the DB or send email; public routes use `PreviewService` there.
- Secrets only in env (`.env.local` / Vercel). `.env.example` lists every key.
- Mobile (`mobile/`, Flutter) only matters when `modules.mobile` is on. Any change to an `/api/auth/*` route must be mirrored in `mobile/lib/API/api_endpoints.dart`, `lib/model/` and the provider.

## Agency additions
- `agency.config.ts` — packages, add-ons, prices, deposit rate. `src/modules/orders/` — pricing (pure), orders service (Stripe manual-capture deposit via `payment-gateway.ts`), notifications, production worker (`production.ts`, `scripts/order-worker.ts`). Admin: `app/admin/(app)/orders`. Public: `app/[locale]/templates|pricing|order`.
- Keep `src/` in sync with client-starter where possible (merge `template/main`); agency-only code lives in the paths above plus `SiteHeader.tsx` links.
