# Nestly prototype（avocado）— 照 Figma UI Kit 做一個可互動的孕期／育兒 App 原型

- **主 session**：開工前先讀 [AGENT.md](AGENT.md)（subagent 調度：何時派工、選 model、怎麼切任務、輪數預算）。
- **subagent**：不用讀 AGENT.md，照派工 prompt 做就好。

**狀態**：active，地基完成（2026-10-18），接著做各模組。設計來源是 `design/` 裡的 `.fig` 原檔（Nestly — Pregnancy & Baby Companion UI Kit）。
技術棧：React + Vite + TypeScript + Tailwind；範圍方案 A（全模組可互動）；最後放 GitHub Pages（使用者自己部署）。資料先存在瀏覽器，但**一定要留好之後接 API 的路**（METHOD §2）。

## 1. 開工先讀（≤ 3 份，每份 ≤ 200 行）

| 順序 | 檔 | 為什麼 |
|---|---|---|
| 1 | 本檔 | 規則在哪、寫回去哪 |
| 2 | [TODO.md](TODO.md) | 現在在哪、卡在哪、還在等使用者決定什麼 |
| 3 | [METHOD.md](METHOD.md) | 專案結構、資料層合約、「做完」怎麼驗 |

## 2. 文件地圖（固定檔名；沒有的不列，⛔ 不另創名字）

| 檔 | 放什麼 | 何時讀 | 何時改 |
|---|---|---|---|
| [METHOD.md](METHOD.md) | 合約與規則：資料夾結構、資料層、色票、驗收（⛔ 不放實測） | 派工前、驗收前 | 規則改寫時 |
| [LEDGER.md](LEDGER.md) | 已經知道什麼：決策、實測數字、**Figma MCP 額度帳** | 做決定前、要呼叫 Figma MCP 前 | 每次結案；每次用 Figma MCP |
| [TODO.md](TODO.md) | 現在要做什麼（只放前瞻） | 每 session | 狀態一變就改 |
| [PITFALLS.md](PITFALLS.md) | 踩過的坑（`.fig` 解碼、Figma MCP） | 碰設計資料前 | 踩到新坑時 |
| [AGENT.md](AGENT.md) | subagent 調度規則 | 主 session 開工時 | 調度規則變動時 |
| `tools/` | `fig/`：`.fig` 解碼、畫面規格、色票、素材、大綱（`npm run fig`）；`shot.mjs`：截圖驗收 | 抽設計資料、驗收時 | 工具有坑時 |
| `design/*.fig`（**唯讀**） | 設計原檔，作者提供 | 只透過 `tools/` 讀 | ⛔ 不改 |
| `design/spec/`、`design/ref/` | 每個畫面的規格 JSON（tools 產生）／參考圖（作者匯出） | 做某個畫面時 | 只由 tools 產生 |
| `src/` | `app/`（路由、手機框、`#/playground` 開發選單）、`components/`、`data/`、`features/<模組>/` | 寫程式時 | METHOD §1 |

## 3. 必停點（其餘自主執行到完成）

1. 要花錢／要對外：Figma seat 異動、push、建 remote、部署到公開網址
2. 要改事前寫死的線：憲法、METHOD §2 資料層合約、技術棧；**範圍（方案 A 全模組／B 主流程）改變**
3. 額度或時間盒用完：**Figma MCP 本月剩餘次數 ≤ 3**（LEDGER §Figma 額度）、Claude 額度不夠跑完這批
4. 前提被推翻：`.fig` 解不出某類資料（例：向量圖示、變數模式）、設計和使用者說的流程對不上

## 4. 憲法 vs 參數

判別法：**這條放寬誰受益？**「宣告成功變容易」= 憲法（只有人能改）；只是工作變快／慢／貴 = 參數（依證據可調）。

憲法（≤ 7 條，⛔ 自評不准增刪）：
1. **「做完」= 在真的瀏覽器跑過**：手機尺寸（420×896）截到有內容的畫面、console 0 error、build 過，
   並和該畫面的參考圖並排比對過。只有 build 過或沒跑過都不算。
2. **UI 不直接碰儲存**：元件／頁面 ⛔ 直接呼叫 `localStorage`／IndexedDB／`fetch`，一律經過 service 介面（METHOD §2）。
   這條讓之後換成 API 不用改畫面。
3. **設計原檔唯讀，程式裡不留 Figma 暫時網址**（`figma.com/api/mcp/asset/...` 七天就失效）；素材一律下載進 `public/`。
4. **不自己編醫療內容**：畫面上的孕期／健康說明文字照設計稿；設計沒有的地方用明顯的 placeholder，⛔ 自己寫建議。

## 5. 收工寫回哪裡

| 時點 | 必做 | 寫到哪 |
|---|---|---|
| 開工 | TODO 該項改 🔵；要用 Figma MCP 先查 LEDGER 剩幾次 | TODO · LEDGER |
| 過程 | 狀態一變就改；卡住寫明缺什麼；每用一次 Figma MCP 記一筆 | TODO · LEDGER |
| 結案 | LEDGER 加判決列（截圖路徑、和參考圖的差異）；TODO 改 ✅/❌；新坑進 PITFALLS | LEDGER · TODO · PITFALLS |

## 6. 這個 repo 的人是誰、相信什麼（≤ 15 行）

一律用繁體中文跟使用者溝通；App 介面文字照設計稿（英文）。
這是**原型**：目標是讓人點得到、流程走得通、長得像設計稿；不追求正式上線品質，但資料層要乾淨，之後能接 API。
設計資料優先從 `.fig` 解出來（不限次數）；Figma MCP 是**付費稀缺資源**（使用者是 View seat，每月 20 次），只在 `.fig` 解不出來時由主 session 用。
套件管理用 `npm`。目前**還不是 git repo**；`git init`（只在本機）是 TODO 的一項。⛔ push、建 remote、部署都由使用者自己做。
Python 只用 `python3 -I`／`pip3`（這台沒有 `python`／`pip`）。

## 7. 沉澱區（只放「以後每次都這樣」；議題級結論進 LEDGER）

- 2026-10-18 **所有工作只在本資料夾內**：檔案、快取、瀏覽器設定檔、暫存都放專案裡（`.cache/`），⛔ 用 Claude 的暫存區或家目錄；
  執行期也不連外部服務（字型打包進專案）。憑什麼：使用者明確要求，且兩度追問為什麼碰到外部。
- 2026-10-18 **資料夾內的事自己決定、不問**：決定和理由寫進 LEDGER「決策清單」，使用者看成果時一起審。憑什麼：使用者授權。
