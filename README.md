# Agency site（你的接單網站）

以 client-starter 生成，再加咗「訂單」模組。客人可以：

1. **範本**（`/templates`）：即場試玩 4 款風格（iframe 嵌入 client-starter 的示範部署）
2. **價錢**（`/pricing`）：3 個方案 + 17 項加購服務
3. **落單**（`/order`）：揀方案、風格、語言、加購，即時計價，提交訂單（可選 Stripe 訂金預授權）
4. **訂單狀態**（`/order/ORD-…`）

你（擁有人）喺 `/admin/orders`：

- 收到通知（電郵 + 可選 Slack/Discord webhook）
- 按 **批准並開始製作**：收取訂金（Stripe 預授權轉扣款），訂單進入製作隊列
- 或者 **拒絕**：自動取消預授權，並通知客人
- 你部電腦行緊 `corepack yarn order:worker` 嘅話，會自動用 client-starter 生成客人嘅網站 repo（複製 → 設定 → 測試 → commit），完成後標記「已交付」，並列出上線清單

## 快速開始（本機）

```bash
corepack yarn dev:memory --theme corporate           # 接單網站 http://localhost:3000，後台 admin/admin
cd ../client-starter && corepack yarn dev:preview --port 3100   # 範本預覽（另一個終端機）
```

## 設定

| 檔案 | 內容 |
|---|---|
| `agency.config.ts` | 方案、加購、價錢、訂金比例（預設 50%）、範本說明 |
| `client.config.ts` | 你公司名稱、聯絡資料、**`notify.email`（收訂單通知，記得填）** |
| `content/*.json` | 主頁文案 |

公司名稱「啟點網站工作室 / Launchpad Web Studio」只係暫定名，請喺 `client.config.ts` 改成你的公司名。

## 環境變數（除 client-starter 的 `.env.example` 外）

| 變數 | 用途 |
|---|---|
| `NEXT_PUBLIC_PREVIEW_BASE_URL` | client-starter 示範部署網址（Vercel project，`PREVIEW_MODE=1`） |
| `STRIPE_SECRET_KEY` | 有設定先會收訂金；冇設定時訂單直接進入「等待確認」 |
| `ORDER_STRIPE_WEBHOOK_SECRET` | Stripe webhook `https://你的網址/api/orders/stripe-webhook`，事件：`checkout.session.completed`、`checkout.session.expired` |
| `MINIMAX_API_KEY` | AI 聊天助手用 MiniMax（優先）；`MINIMAX_MODEL` 預設 `MiniMax-M3` |
| `ANTHROPIC_API_KEY` | 冇 MiniMax key 時改用 Claude。兩樣都冇，聊天視窗會顯示「落單 / 聯絡我們」連結 |
| `ORDER_WEBHOOK_URL` | 可選：Slack / Discord / Make / Zapier 的 incoming webhook，新訂單即時通知 |
| `CLIENT_STARTER_DIR` | worker 用，預設 `../client-starter` |
| `CLIENTS_DIR` | worker 生成客人 repo 的位置，預設 `../clients` |

## Worker（自動製作）

```bash
corepack yarn order:worker          # 每 30 秒檢查一次已批准訂單
corepack yarn order:worker --once   # 只處理一張
```

- Worker 要連同一個 MongoDB（讀 `.env.local` 的 `MONGODB_URI` / `MONGODB_DB`），所以正式使用時要指向 Atlas。
- 失敗會記錄完整 log，訂單頁可以按「重試製作」。
- 生成後嘅上線步驟（Atlas、Vercel、網域、客人帳號）見訂單頁的「上線清單」同 client-starter 的 `docs/SETUP.md`。

## 範本截圖

範本頁同主頁用嘅係真網站截圖（`public/templates/`）。改咗 client-starter 嘅風格或示範內容之後，重新影：

```bash
cd ../client-starter && corepack yarn dev:preview --port 3100   # 另一個終端機
corepack yarn templates:capture
```

## 注意
- Stripe 預授權大約 7 日後自動失效，後台會喺第 4 日起提醒。
- 首頁「客戶例子」係你之前做過的項目類型，冇寫任何數字；有真實成效數據先好加。
