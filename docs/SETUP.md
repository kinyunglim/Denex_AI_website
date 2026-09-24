# 上線步驟（Vercel + MongoDB Atlas）

每個客一個 Atlas project、一個 Vercel project。整個流程大約 30 分鐘。

## 1. MongoDB Atlas
1. 登入 https://cloud.mongodb.com → **New Project**，名稱用客人 slug（例如 `harmony-move`）。
2. **Create cluster**：細客用 M0（免費），有預約／收款嘅用 M10。Region 揀 **Hong Kong (ap-east-1)** 或 Singapore。
3. **Database Access** → 新增用戶（Read and write to any database），密碼用產生器。
4. **Network Access** → `0.0.0.0/0`（Vercel 冇固定 IP）。
5. **Connect → Drivers** → 複製 connection string，填入 `MONGODB_URI`。`MONGODB_DB` 用 slug（`-` 轉 `_`）。
6. M10 以上：開 **Backup**（每日快照）。

## 2. Vercel
1. 將客人 repo push 上 GitHub（私人 repo）。
2. https://vercel.com/new → Import 該 repo。Framework 自動係 Next.js。
3. **Environment Variables**：把 `.env.local` 的值逐個加入（`DEFAULT_ADMIN` 唔好加）。
4. Deploy。完成後喺 **Domains** 加客人的網域，照指示改 DNS（A / CNAME）。
5. 將 `NEXT_PUBLIC_SITE_URL` 改做正式網址，再 redeploy。

## 3. 第一次設定
```bash
# 連去正式資料庫（臨時把 .env.local 指向 Atlas）
corepack yarn admin:create --email owner@client.com --name "店主"
```
然後登入 `/admin`（要收電郵驗證碼，所以 SMTP 必須設定好）。

## 4. 電郵（SMTP）
- 推薦：Resend、Brevo、Gmail（Google Workspace 的「應用程式密碼」）。
- 填 `SMTP_HOST / PORT / USER / PASS / FROM`。冇 SMTP 時，後台登入碼只會印喺 server log。

## 5. 選配模組
| 模組 | 設定 |
|---|---|
| stripe | Stripe Dashboard → Developers → API keys → `STRIPE_SECRET_KEY`；Webhooks → 加 endpoint `https://網址/api/stripe/webhook`，事件揀 `checkout.session.completed` → 複製 signing secret 做 `STRIPE_WEBHOOK_SECRET` |
| gcal | Google Cloud → 建 service account → 下載 JSON，壓成一行放入 `GOOGLE_SERVICE_ACCOUNT_JSON`；喺 Google Calendar 將日曆分享畀 service account 的 `client_email`（可修改活動），日曆 ID 填 `GOOGLE_CALENDAR_ID` |
| mobile | 見 `mobile/README.md`；將 `mobile/lib/API/api_endpoints.dart` 的 `baseUrl` 改做正式網址 |

## 6. 交付前檢查
```bash
corepack yarn verify          # 全部要綠色
corepack yarn client:check --strict
```
- 用手機開一次網站、試一次聯絡表單、試一次預約。
- 後台 → 團隊：幫客人開自己的帳號，然後停用 / 刪除你的測試帳號。
- 把 `docs/HANDOVER.md` 填好交畀客人。

## Preview（示範）部署
Agency 網站用一個獨立 Vercel project 做示範：環境變數只需 `PREVIEW_MODE=1`（可加 `PREVIEW_THEME`、`NEXT_PUBLIC_AGENCY_ORDER_URL`），**唔使資料庫**。訪客用 `?theme=bold` 等切換風格，所有表單都唔會儲存。
