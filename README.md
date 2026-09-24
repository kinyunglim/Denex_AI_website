# client-starter

「網站 + CRM」範本。每接一個新客，就複製一份、改 `client.config.ts`，幾日內交貨。

以 VTCS 課程範本為底（Next.js 16 + MongoDB + Zod），加入 OnMove 的 CRM／預約／收款，以及 OceanLink 的三語同產品目錄。

## 快速開始

```bash
corepack yarn install
corepack yarn dev:memory          # 用記憶體資料庫 + 示範資料，唔使裝 MongoDB
```

- 網站：http://localhost:3000
- 後台：http://localhost:3000/admin（開發模式登入：`admin` / `admin`）
- 睇四款風格：`corepack yarn dev:preview`，然後喺頂部揀風格

## 包括乜嘢

| 類別 | 功能 |
|---|---|
| 網站 | Hero、服務、案例、關於、聯絡表單、WhatsApp 按鈕、PWA、SEO（sitemap/robots） |
| 風格 | 4 款：corporate（企業）、warm（溫暖）、product（產品）、bold（大膽），改一個字就轉 |
| 語言 | 繁中／簡中／英文，揀邊幾種都得 |
| CRM（核心） | 客戶、標籤、狀態、備註、時間線、網站查詢收件箱、Excel/CSV 匯入（自動對欄位、去重）、Excel 匯出 |
| 預約（模組） | 網上預約、服務、員工工作時間、休假、防重複預約、後台週曆、確認電郵 |
| 收款（模組） | 收款記錄、自動收據編號、可列印中英收據、月結 |
| Stripe（模組） | 付款連結、webhook 自動入賬（不會重複記錄） |
| Google Calendar（模組） | 預約自動同步 |
| 產品目錄（模組） | 產品、規格、分類、查詢報價 → 入 CRM |
| 手機 App（模組） | `mobile/` Flutter 範本（VTCS） |
| 後台 | 擁有人／員工兩級權限、電郵 OTP 雙重驗證、中英切換 |

## 為新客開站

用 Claude Code 嘅 `/new-client` skill，或者手動：

```bash
corepack yarn client:init --answers answers.json   # 產生 config、內容、.env.local
corepack yarn client:check                         # 檢查設定同環境變數
corepack yarn verify                               # lint + 型別 + 測試 + build
corepack yarn admin:create --email owner@client.com --name "Owner"
```

詳細部署步驟：[docs/SETUP.md](docs/SETUP.md)。交畀客人嘅使用說明範本：[docs/HANDOVER.md](docs/HANDOVER.md)。

## 開發守則

見 [CLAUDE.md](CLAUDE.md)。重點：跟 VTCS 分層（model → DAO → service → route）、模組之間只經 service 溝通、只用 theme token、密碼放 env。
