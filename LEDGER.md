# LEDGER — 已經知道什麼

## 決策清單（使用者審閱用）

使用者授權：資料夾內的事自行決定，記在這裡，看成果時一起審（2026-10-18）。「審」欄空白 = 還沒看過。

| # | 決策 | 理由 | 審 |
|---|---|---|---|
| D-stack | React + Vite + TypeScript + Tailwind；範圍方案 A（全模組可互動） | 使用者指定 | ✅ |
| D-fig | 設計資料從 `.fig` 原檔解（`tools/fig/`，用 `kiwi-schema` 解碼），Figma MCP 只當備援 | 不受每月 20 次的限制；7 頁都讀得到（MCP 只看得到 2 頁） | |
| D-spec | 每個畫面一份 `design/spec/screens/<id>.json`；元件 instance 只寫「用哪個元件＋文字／屬性」，元件本體另存 `components/` | 總量 660KB，約是 MCP 輸出的 1/4；模組任務直接對應共用元件 | |
| D-outline | `tools/fig/outline.mjs` 把規格印成一行一個節點 | 比讀 JSON 省 token，給 subagent 用 | |
| D-icons | 30 個 `Nestly/Icon/*` 轉成 TS 路徑資料、inline 繪製；單色用 `currentColor`，雙色可依圖層換色 | 導覽列圖示在選取／未選取時兩個圖層顏色不同 | |
| D-imgsize | 只匯出有用到的 13 張圖，長邊縮到 480px（25MB → 2.6MB） | 插圖最大只顯示約 180px；GitHub Pages 載入要快 | |
| D-tw | Tailwind 主題由 Figma 變數產生：`bg-bg-surface`、`text-text-primary`、`rounded-14`、`shadow-card`；文字樣式變成 `type-heading-large` 等 | class 名稱和 Figma 變數一一對應，換深色模式不用改畫面 | |
| D-dark | 深色模式用 Figma 的 darkMode 色票，預設跟隨系統，可在設定切換 | 設計稿本身就有兩種模式 | |
| D-source | 資料層：`DataSource` 介面 → localStorage adapter（照片放 IndexedDB），另備 HTTP adapter，用 `VITE_DATA_SOURCE` 切換 | 使用者要求之後能接 API；換 adapter 不用改畫面 | |
| D-query | 用 TanStack Query 管資料讀寫與快取 | 之後接 API 時，快取／重新抓取／錯誤處理都現成 | |
| D-pages | 用 hash 路由（`#/home`）＋ Vite `base: './'` | 最後放 GitHub Pages：沒有 SPA 路徑回退，子路徑 `/<repo>/` 也要能跑 | |
| D-fonts | 字型用 `@fontsource` 打包進專案，不連 Google Fonts | 不依賴外部服務；使用者要求不碰外部 | |
| D-local | npm 快取（`.npmrc`）、截圖用的 Chromium 和瀏覽器設定檔都放在專案的 `.cache/` | 使用者要求所有東西留在資料夾內 | |
| D-points | 起始 120 BP（見面禮）；每日任務：記一餐 +10、心情 +5、每日簽到 +5，每項每天一次；編輯紀錄不加分；胎動不算任務 | 數字與規則照 06.Task、12-* 的文字；起始點數讓商店馬上能試 | |
| D-shop | 蝴蝶結 60 BP、葉子帽為見面禮（一開始就有）、星星夾 150 BP；一次只能戴一個 | 照 12-3 商店畫面 | |
| D-growth | 成長進度 = 累計賺到的 BP ÷ 250（上限 100%），花點數不會降 | 設計只寫「購買不扣成長進度」、示範值 72%；250 讓示範資料（累計 180）剛好是 72% | |
| D-demo | 第一次開啟 → 走 onboarding；`#/playground` 可「載入示範資料」（設計稿上的內容，日期相對今天） | 給看 demo 的人兩種入口：從頭體驗或直接看完整畫面 | |
| D-modules | 每個模組自己的 `features/<模組>/routes.tsx`；05.Health Record 獨立成 `records` 模組（它彙整飲食、胎動、心情） | 派工時模組之間不會改到同一個檔 | |
| D-playground | 開發選單頁叫 `#/playground`（原本叫 dev） | 避免和系統的 `/dev` 資料夾混淆 | |
| D-git | 本機 git，`.fig` 原檔一起 commit（19MB）；`design/spec`、`public/assets` 由工具重產，前者不進 git | `.fig` 是唯一真相來源；spec 可隨時 `npm run fig` 重產 | |

**上線前要使用者確認**：設計素材（水果寶寶插圖、圖示）是作者的 UI Kit，公開放上 GitHub Pages 前需要作者同意授權。push 和部署由使用者自己做。

## 設計檔盤點（`.fig`，2026-10-18 匯出）

- 7 頁：00 Start Here、01 Brand、02 Foundations、03 Components、04 App Screens、05 Examples、Internal Only Canvas。
- 4889 個節點；04 頁 143 個畫面；180 個元件（SYMBOL）；變數 4 組（UI 一組只有 Light，Primitives 有 lightMode／darkMode）。
- 畫面尺寸：420×896 為主；首頁 420×1702、任務頁 420×1008、個人頁 420×1154。
- 模組分布：tasks-shop 51、appointments 27、profile 16、settings 16、meals 11、mood 8、movement 8、onboarding 5、home 1。

## 實測數字

| 日期 | 項目 | 數字 |
|---|---|---|
| 2026-10-18 | Figma MCP `get_design_context` 一般畫面（08-2）／首頁 | 約 8k token／> 25k 被截斷 |
| 2026-10-18 | `.fig` 解碼 → JSON | 27MB，數秒內完成 |
| 2026-10-18 | spec 每個畫面 | 1.2–19.8KB，總共 660KB |
| 2026-10-18 | production build | JS 453KB（gzip 143KB）、CSS 31KB；圖片 2.6MB |
| 2026-10-18 | 規則單元測試 | 7 項全過 |

## Figma 額度

帳號 honshengwen@gmail.com：Starter 方案、**View seat → 每月 20 次**（讀取類工具才算；`whoami` 不算）。
作者有在幫忙加付費 seat，2026-10-18 查時還沒生效。改用 `.fig` 之後已經不需要 MCP。

| 日期 | 用了 | 累計（本月） | 用在 |
|---|---|---|---|
| 2026-10-18 | 8 | 8 / 20 | get_metadata ×4（頁面結構）、get_screenshot ×2、get_design_context ×2（08-2、04 首頁） |
