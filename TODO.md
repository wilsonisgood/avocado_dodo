# TODO — 現在要做什麼（只放前瞻）

狀態：⬜ 未開始 · 🔵 進行中 · ⏸ 等使用者 · ✅/❌ 完成後移到 LEDGER

## 等使用者

| # | 項目 | 狀態 |
|---|---|---|
| U3 | 參考圖：作者匯出 04 頁每個畫面的 PNG（2x）放 `design/ref/<nodeId>.png`（例 `52-1712.png`）。沒有的話只能比 spec 的數值，無法逐像素並排 | ⏸ |
| U4 | 審 LEDGER 的決策清單 | ⏸ |
| U5 | 上線前：作者同意 UI Kit 素材公開；push／部署由使用者做 | ⏸ |

## 地基 ✅（2026-10-18）

git、`tools/fig`（decode／spec／tokens／assets／outline）、`tools/shot.mjs`、骨架與路由、色票＋Tailwind 主題、
共用元件（`src/components`）、資料層（`src/data`：types、source、services、queries、rules＋測試、demo）。

## 模組（方案 A）— 依 AGENT §3 派工，每個任務只擁有 `src/features/<模組>/`

| # | 模組 | frame | 建議 model／預算 | 依賴 | 狀態 |
|---|---|---|---|---|---|
| M-1 | onboarding | 01、02、03-1～03-3 | sonnet 45 | — | ✅ 2026-10-19 合併（22/45 輪，含一次修正）|
| M-2 | meals | 05-0～05-5、05-2a/2b、05-S1/S2、12-R1、12-F1/F2 | sonnet 60 | — | ✅ 2026-10-19 合併（14/60 輪）|
| M-3 | movement | 08-0～08-7 | sonnet 55 | — | ✅ 2026-10-19 合併（18/55 輪）|
| M-4 | mood | 07-0～07-5、07-S1/S2 | sonnet 50 | — | ✅ 2026-10-19 合併（14/50 輪）|
| M-5a | appointments 列表／月曆 | 09-0～09-2c、09-E0、09-R* | sonnet 55 | — | ✅ 2026-10-19 合併（9/22 輪）|
| M-5b | appointments 新增／編輯／詳情 | 09-3～09-13、09-S* | sonnet 60 | —（拆成 list/ 與 form/ 後可平行） | ✅ 2026-10-19 合併（14/26輪）|
| M-6 | records（05.Health Record 彙整頁） | 05.Health Record | sonnet 40 | M-2、M-3、M-4 | ✅ 2026-10-19 合併（11/18 輪）|
| M-7 | profile | 07.Personal、10-* | sonnet 60 | — | ✅ 2026-10-19 合併（21/26 輪）|
| M-8 | settings | 11-* | sonnet 55 | — | ✅ 2026-10-19 合併（27/24 輪，含一次補強）|
| M-9 | tasks／shop | 06.Task、12-*（51 個 frame，多數是點數狀態） | opus 70 | M-2、M-4 | ✅ 2026-10-19 合併（24/30 輪，opus）|
| M-10 | home | 04.Main Page | sonnet 45 | —（只透過資料層與路由約定） | ✅ 2026-10-19 合併（16/22輪）|

每日簽到：每天第一次打開分頁時自動 +5（`app/layouts.tsx`，LEDGER D-checkin）。

## 整合時要接的線（主 session）

（目前沒有）


## 細修清單（不派任務，主 session 收集起來一次修，AGENT §3b）

- 從 `.fig` 匯出的 SVG 顏色是寫死的淺色值，深色模式下 onboarding 插圖、裝飾向量不會跟著變。要的話改成 inline SVG＋`currentColor`。
- onboarding 雙胞胎圖示的旋轉方向是子任務目測的，有參考圖（U3）時再對一次。
