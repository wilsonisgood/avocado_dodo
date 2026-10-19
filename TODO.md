# TODO — 現在要做什麼（只放前瞻）

狀態：⬜ 未開始 · 🔵 進行中 · ⏸ 等使用者 · ✅/❌ 完成後移到 LEDGER

## 等使用者

| # | 項目 | 狀態 |
|---|---|---|
| U3 | 參考圖：作者匯出 04 頁每個畫面的 PNG（2x）放 `design/ref/<nodeId>.png`（例 `52-1712.png`）。沒有的話只能比 spec 的數值，無法逐像素並排 | ⏸ |
| U4 | 審 LEDGER 的決策清單 | ⏸ |
| U5 | 上線前：作者同意 UI Kit 素材公開；push／部署由使用者做 | ⏸ |

## 已完成（2026-10-18～19）

地基、11 個模組全部合併進 main；`npm run check` 全過（型別、84 項測試、build、全站巡檢、端到端主線）。
細節與實測在 LEDGER。

## 多語系（2026-10-19 使用者要求：繁中／简中／英文）

基礎 ✅（`src/i18n`、共用元件與資料標籤、語言切換元件、METHOD §3c）。各模組翻譯 🔵 sonnet，每個模組一個 worktree
`.claude/worktrees/i18n-<模組>`、分支 `i18n/<模組>`：onboarding、home、records、meals、mood、movement、appointments、
profile、settings、tasks。完成後：合併、`npm run check`、三語截圖抽查、健康文字清單進 LEDGER §翻譯待審。

## 等 i18n/home 合併後（主 session）

- 首頁水果改用共用 `FloatingFruit`：起始位置、動畫節拍、速度每次隨機（使用者 2026-10-19 要求）。

## 細修清單（主 session，不派任務）

- onboarding 雙胞胎圖示的旋轉方向是目測的，有參考圖（U3）時再對。
- 有參考圖（U3）後，全部畫面逐張並排比對一次。
