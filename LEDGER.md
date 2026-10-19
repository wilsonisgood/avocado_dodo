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
| D-mood-caption | 心情列表標題：設計稿只給「Happy · Feeling good today」「Tired · Didn't sleep well」兩種副標，其他心情只顯示名稱 | 不自己編另外三種的文案（憲法 4）；要補請給文案 | |
| D-dialogs | 設計稿的 *-S 整頁 frame（刪除、離開確認）實作成浮在畫面上的對話框 | 設計稿畫的就是「原畫面＋遮罩＋對話框」，用整頁會失去背景脈絡 | |
| D-unconfirmed | onboarding 選「Not sure yet」仍存使用者填的孕週（設計稿 03-3 有這兩欄），之後在 Profile 可改 | 照 03-3 畫面；首頁才有週數可顯示 | |
| D-birth | 生日存進 `Profile.birthDate`，年齡不存（由生日算） | 02 有這兩欄；存年齡會過期 | |
| D-glyph | records 餐點縮圖只用色塊，拿掉上面那層字 | 設計稿那層是把「&#26089;」「&#21320;」（被 HTML 跳脫的「早」「午」）轉成外框的向量，是匯入錯誤；介面是英文，晚餐／點心也沒有定義 | |
| D-checkin | 每日簽到 +5：每天第一次打開分頁時自動領（`app/layouts.tsx`），任務頁只顯示 | 設計稿只寫「Checked in today」，沒有簽到按鈕 | |
| D-reminders | 提醒在資料裡只存一個值：「1 小時前」＋「1 天前」合成 1d+1h，「At start time」= 自訂 0 分鐘，其他互斥；產檢與設定 11-8 共用 `@/data/reminders` | 設計稿畫成可多選，但兩個選項以上的組合只有這一種 | |
| D-default-reminder | 新增產檢時，提醒預設值讀設定 11-8 的「Default for new appointments」（預設 1 天＋1 小時前） | 11-8 寫明「Applies to new appointments only」 | |
| D-time24 | 所有時間輸入都用共用 `TimeFields`（24 小時制）：產檢用直排（09-S6），設定與飲食用並排（11-S2） | 瀏覽器原生時間欄位在英文環境會顯示 AM/PM，設計稿全是 24 小時制 | |
| D-10S1 | 個人頁的「放棄變更」做成整頁，其他模組是浮動對話框 | 設計稿 10-S1 本身就是獨立整頁（有標題列、沒有遮罩） | |
| D-home | 首頁：Baby's note 連到任務頁；孕期時間軸只用設計稿的 Weeks 0–13 三項並標註週數範圍；水果名稱只在第 4 週顯示「avocado size」；星座標籤不做 | 設計稿沒有對應畫面或資料來源，⛔ 自己編醫療／內容 | |
| D-copy | 子任務自擬的介面短句（按鈕：Claimed、Buy now／Not now、Earn points；未完成任務說明「Log your mood to earn 5 BP」；產檢欄位 placeholder）| 設計稿只畫了已完成狀態、沒給按鈕字；都是操作說明，不涉及醫療內容。要改請直接說 | |
| D-placeholder | 樹葉帽、星星夾的介紹，以及個人頁的寶寶名字建議，設計稿沒有內容 → 顯示 `[Placeholder]` 或不動作 | 不自己編文案 | |
| D-a11y | 共用 `LabeledField` 改成 `<label>` 包住欄位 | 原本標籤跟欄位沒關聯，讀螢幕軟體讀不到；e2e 測試抓到的 | |
| D-pages-ci | 準備好 GitHub Actions 部署設定（`.github/workflows/deploy.yml`），build 後發布 `dist/` | 使用者要放 GitHub Pages；push 與開啟 Pages 由使用者做 | |
| D-dark-svg | 設計稿向量另產深色版（`vectors-dark/`、`accessories-dark/`），`asset()` 依主題換路徑，切換主題時重新掛載畫面 | `<img>` 載入的 SVG 讀不到 CSS 變數；這樣不用改任何模組 | |
| D-up | 返回鍵改成「回到最近的上一層」（分頁、路徑上層、或指定的上層），全 App 共用 `src/app/nav.tsx`；原本 6 份複製的「上一頁」邏輯和 9 處寫死的返回都換掉 | 使用者錄影：胎動、飲食、心情在列表和詳情間死循環；e2e 加了三條回歸測試 | |
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
| 2026-10-19 | 第一批 4 個模組（sonnet，平行 worktree） | 實際／預算：onboarding 22/45（含一次修正）、飲食 14/60、胎動 18/55、心情 14/50 ⇒ 平均約 30% |
| 2026-10-19 | 合併後 main | 30 項測試全過、build 過、各模組截圖 console 0 error、重新整理後資料都還在 |
| 2026-10-19 | 第二批 7 個模組（6 sonnet＋1 opus，平行） | 實際／預算：產檢列表 9/22、產檢表單 14/26、records 11/18、個人頁 21/26、設定 27/24（含一次補強）、任務商店 24/30（opus）、首頁 16/22 ⇒ 平均約 70%，估算表打 4 折後準了 |
| 2026-10-19 | 全部合併後 | 84 項單元測試、全站巡檢 48 條路由 0 問題、端到端主線 6 步全過、GitHub Pages 子路徑模擬 0 個 404 |

## Figma 額度

帳號 honshengwen@gmail.com：Starter 方案、**View seat → 每月 20 次**（讀取類工具才算；`whoami` 不算）。
作者有在幫忙加付費 seat，2026-10-18 查時還沒生效。改用 `.fig` 之後已經不需要 MCP。

| 日期 | 用了 | 累計（本月） | 用在 |
|---|---|---|---|
| 2026-10-18 | 8 | 8 / 20 | get_metadata ×4（頁面結構）、get_screenshot ×2、get_design_context ×2（08-2、04 首頁） |
