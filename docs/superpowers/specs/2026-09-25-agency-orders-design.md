# Agency site + order automation (sub-projects C + D)

- Date: 2026-09-25 · Status: built directly (user asked to "complete everything till the end"; decisions below were made without a separate review round and are listed so they can be revisited).

## Goal
A prospect browses live template previews, picks a package + add-ons, submits an order (optionally paying a deposit). The owner gets notified, reviews the order in the admin, clicks **Approve** (captures the deposit) and production starts automatically: a configured, verified client repo is generated from client-starter.

## Decisions
1. **The agency site is itself a client-starter instance** (`Desktop/agency-site`, theme corporate, zh-Hant + en, modules booking/payments/stripe). CRM, booking (free consultation), receipts and Stripe come for free; only an `orders` module is added.
2. **Live previews** are iframes of one preview deployment of client-starter (`PREVIEW_MODE=1`, no DB) using `?theme=`. Local: `http://localhost:3100`.
3. **Pricing** lives in `agency.config.ts` (packages, add-ons, deposit %, currency). All prices are suggestions for the owner to edit.
4. **Payment = authorise now, capture on approval.** When Stripe is configured the order form opens Stripe Checkout for the deposit with `capture_method: manual`. The hold appears on the customer's card; **Approve** captures it, **Reject** releases it (Stripe holds last about 7 days, so the admin shows the age). Without Stripe, orders arrive as "submitted" and are approved without payment.
5. **Notifications**: email to `notify.email` + optional `ORDER_WEBHOOK_URL` (JSON POST — works with Slack/Discord/Make/Zapier) on new, authorised, approved, delivered and failed orders.
6. **Production runs on the owner's machine**, not on Vercel (serverless cannot run git/yarn). `yarn order:worker` polls MongoDB for approved orders, builds `answers.json`, runs `client-starter/scripts/new-client.mjs`, stores the log and marks the order *delivered* or *failed*. Hosting (Atlas project, Vercel project, domain) stays a per-order checklist shown in the admin — provisioning APIs need account tokens and are a later add-on.

## Order lifecycle
`awaiting_payment → authorized → approved → in_production → delivered`
plus `submitted` (no-Stripe path), `rejected`, `failed` (retry puts it back to `approved`), `expired` (checkout abandoned).

## Data
`agency_orders`: ref (`ORD-2026-0001`), package, addOns[], theme, locales, business {names, phone, whatsapp, email, address, domain}, customer {name, email, phone}, notes, contactId (CRM), price snapshot {oneOff, monthly, deposit, currency, lines[]}, status, stripe {sessionId, paymentIntentId}, production {startedAt, finishedAt, dest, log, error}, history[] {at, status, by}.

## Modules derived from the order
Package gives a base module set; add-ons add modules (`booking`, `payments`, `stripe`, `gcal`, `catalog`, `mobile`) or are services only (copywriting, photos, logo…). Module dependencies (stripe→payments, gcal→booking) are added automatically.
