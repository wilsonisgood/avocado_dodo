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
| M-1 | onboarding | 01、02、03-1～03-3 | sonnet 45 | — | 🔵 sonnet／45 輪，worktree `.claude/worktrees/onboarding`、分支 `feat/onboarding`；看 `git log` 和回報 |
| M-2 | meals | 05-0～05-5、05-2a/2b、05-S1/S2、12-R1、12-F1/F2 | sonnet 60 | — | 🔵 sonnet／60 輪，worktree `.claude/worktrees/meals`、分支 `feat/meals`；看 `git log` 和回報 |
| M-3 | movement | 08-0～08-7 | sonnet 55 | — | 🔵 sonnet／55 輪，worktree `.claude/worktrees/movement`、分支 `feat/movement`；看 `git log` 和回報 |
| M-4 | mood | 07-0～07-5、07-S1/S2 | sonnet 50 | — | 🔵 sonnet／50 輪，worktree `.claude/worktrees/mood`、分支 `feat/mood`；看 `git log` 和回報 |
| M-5a | appointments 列表／月曆 | 09-0～09-2c、09-E0、09-R* | sonnet 55 | — | ⬜ |
| M-5b | appointments 新增／編輯／詳情 | 09-3～09-13、09-S* | sonnet 60 | M-5a | ⬜ |
| M-6 | records（05.Health Record 彙整頁） | 05.Health Record | sonnet 40 | M-2、M-3、M-4 | ⬜ |
| M-7 | profile | 07.Personal、10-* | sonnet 60 | — | ⬜ |
| M-8 | settings | 11-* | sonnet 55 | — | ⬜ |
| M-9 | tasks／shop | 06.Task、12-*（51 個 frame，多數是點數狀態） | opus 70 | M-2、M-4 | ⬜ |
| M-10 | home | 04.Main Page | sonnet 45 | 全部（彙整各模組資料） | ⬜ |

待決（模組任務自己決定並寫進回報）：每日簽到（+5）在什麼時候觸發——預設「每天第一次打開 App」。
