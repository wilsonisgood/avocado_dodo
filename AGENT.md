# AGENT.md — subagent 調度規則

給這個專案的主 session 讀；subagent 不用讀，照派工 prompt 做。
原則沿用 `obsidian-vocab-tracker`（2026-10-06）和 `pixi_playground` 的 AGENT.md，這份改寫成「照 Figma 做 App 原型」的版本。

> **成本模型**：成本 ≈ **輪數 × 上下文大小**（2026-10-06 實測：88% 花在 subagent 每輪重讀約 20 萬 token 的快取）。
> 省額度要靠**少跑幾輪、上下文保持小**，換便宜的 model 是其次。
>
> **這個專案有三個會讓成本失控的坑**，本檔的規則大多是為了堵這三個：
> 1. **設計資料很肥**：Figma MCP 的 `get_design_context` 一般畫面約 8k token，首頁超過 25k 還會被截斷；
>    整份 `.fig` 解出來是 27MB 的 JSON。讓 subagent 自己去讀，上下文一開始就爆。
> 2. **Figma MCP 有額度**：使用者是 View seat，**每月 20 次**（LEDGER §Figma 額度）。subagent 不知道剩幾次。
> 3. **像素對齊迴圈**：「改一下 → 截圖 → 跟設計稿比 → 再改」沒有自然的終點。
>
> 不花 token 但很花時間的事（`npm install`、`npm run build`、跑抽取腳本），一律由主 session 用
> `run_in_background` 跑。⛔ 不要派 subagent 去等它，也不要輪詢。

## 1. 什麼時候派、什麼時候自己做

| 情況 | 做法 |
|---|---|
| 預估 ≤ 5 次工具呼叫：改一個色票、調一個元件的 padding、裝套件、改 METHOD 一節 | **主 session 自己做**。開一個 subagent 光讀規則和檔案就要 3–5 萬 token |
| 做完一個模組（例：胎動紀錄 08-0～08-7）的所有畫面與狀態 | 派 subagent（§3 怎麼切） |
| **設計資料**：解 `.fig`、抽某個畫面的規格、匯出素材 | 主 session 跑 `tools/` 的腳本**一次抽完**，產出 `design/spec/<畫面>.json`。⛔ subagent 不解 `.fig`、不讀 `doc.json` |
| **Figma MCP** | **只有主 session 能用**，用之前查 LEDGER 剩幾次、用完記帳。⛔ 任何 subagent prompt 都不准叫它呼叫 Figma MCP |
| `npm install`、build、抽取腳本 | 主 session `run_in_background`，完成時會自動通知 |
| **畫面像不像設計稿、流程順不順** | 主 session 看「實作截圖＋參考圖」判斷，或問使用者。⛔ 不讓 subagent 自己無限調整 |
| 剛回報的 subagent 有小地方要修 | `SendMessage` 叫原本那個修；它已經超過 60 輪就改開新的，prompt 只寫要修的點 |
| 驗證 subagent 的成果 | **相信截圖工具的輸出和截圖**。只抽查它自己點名的風險和資料層（憲法 2），不要整份 diff 重讀 |

## 2. 選 model

| model | 用在 | 例子 |
|---|---|---|
| `haiku` | 純機械工作，**不需要判斷** | 照清單把 `design/images/` 的圖複製改名進 `public/`；照固定格式產畫面清單；跑一支寫好的腳本並回報輸出 |
| `sonnet`（**預設**） | 一個模組的畫面與狀態、一個共用元件組、一支抽取腳本 | 飲食紀錄模組、產檢預約模組、Button/Card/Dialog 元件組、`tools/fig/spec.py` |
| `opus` | sonnet 已經失敗一次，或跨模組的難題 | 任務／點數／商店／配戴的連動狀態；`.fig` 的 instance 覆寫與 text style 解析；資料層合約設計 |

主 session（Opus）自己留著「需要判斷」的事：資料層介面、模組邊界、驗收門檻、判斷畫面像不像、範圍取捨、Figma MCP 要花在哪。

> 2026-10-06 的教訓：要對照規格取捨的工作交給 haiku，結果漏了一半。**要對照設計稿判斷的，交給 sonnet 或主 session。**

## 3. 怎麼切任務（重點）

### 3a. 輪數預算：每個 prompt 都要寫

- **目標 15–40 輪**。估計超過 60 輪就要拆；少於 8 輪就主 session 自己做，或併進別的任務。
  （2026-10-19 第一批實測：一個 8～10 畫面的模組用 14～22 輪，約預算的 30%，見 LEDGER。）
- 預算寫在 prompt 裡（`預算：45 輪`）。**用到預算就交回**，回報做到哪、還剩什麼，⛔ 不准自己延長。
- 用下表估輪數（參數，依 LEDGER 的實測調整）：

| 動作 | 約幾輪 |
|---|---|
| 讀 prompt 指定的檔（spec JSON、要沿用的元件，一次一起發） | 2–4 |
| 新寫一個畫面元件（照 spec，用既有共用元件） | 4–6 |
| 一個畫面的狀態邏輯＋service 呼叫（空白／已填／編輯／刪除確認） | 4–8 |
| 一次「改 → 截圖 → 和參考圖比」迴圈 | 4–6 |
| 修一個 build／型別錯誤 | 2–4 |
| 收尾（commit、寫回報） | 3–5 |

  例：「胎動紀錄模組（08-0～08-7）」原本估 55 輪，實際 18 輪——subagent 一次寫好幾個檔、一次截好幾張圖。
  ⇒ 之後**表上加總再打 4 折**當預算，並保留「用完就交回」。

### 3b. 照「模組」切，不是照 frame 切

- 一個任務 = **一個模組的完整流程**，能用一組截圖證明。04 頁的 145 個 frame 大多是同一畫面的不同狀態
  （空白／已填／已存／刪除確認／不同點數），**用狀態邏輯產生，不是一個 frame 一個元件**。
  ✅「胎動紀錄：開始 → 記錄 → 暫停 → 結束回顧 → 歷史 → 詳情，資料重新整理後還在」
  ❌「做 08-2 這個 frame」 ❌「把 src/features 寫完」
- **一個模組 ≤ 8 個不同畫面**；超過就拆（例：產檢預約 09 有 20+ 個 frame，拆成「列表／月曆」和「新增／編輯／詳情」兩個任務）。
- **視覺迴圈最多 3 次**。3 次還不對就交回並附上截圖，由主 session 判斷或問使用者。
- 像素等級的微調（差 1–2px、陰影深淺）不派任務；主 session 收集起來一次修。

### 3c. 順序與平行

- **地基先做，全部由主 session 或一個 sonnet 任務完成，模組任務才開始**：
  1. 專案骨架（Vite + 路由 + 420 寬的手機外框）
  2. 色票：`.fig` 變數 → CSS 變數（lightMode／darkMode）
  3. 共用元件：Button、FieldControl、RecordHeader、RecordMetric、RecordNotice、Card、BottomNavigation、Dialog
  4. 資料層：型別、service 介面、localStorage adapter、**跨模組事件介面**（例：`rewards.award('meal_logged')`）
  5. 素材：圖片和圖示放進 `public/`，產出清單
  6. 每個畫面的 `design/spec/*.json` 和參考圖
- **先抽共用再派工**：把這批每個模組的 spec 掃一遍（`outline.mjs … | grep '<Nestly/'`），
  ≥ 2 個模組會用到的元件、格式化函式、標籤文字，主 session 先做進 `src/components`／`src/data`，寫進 playground，再派。
  同一模組要拆給兩個任務時，先拆成子資料夾（例：`appointments/list/`、`appointments/form/`），各自擁有，
  **而且這兩個任務之間共用的東西也要先抽**（2026-10-19：Nestly/ScheduleCard 被兩邊各做一份，事後才合併）。
- **檔案不重疊**：每個模組任務只擁有 `src/features/<模組>/`。共用檔（`src/components/`、`src/data/` 的介面、
  路由註冊、`App.tsx`、`package.json`、色票）走整合事項。
- **跨模組的連動**（任務 ↔ 飲食／心情／胎動 ↔ 點數 ↔ 商店 ↔ 首頁）：模組只呼叫地基定好的介面，
  ⛔ 直接 import 別的模組的內部檔案。連動本身（12 任務／商店）放到最後，由 opus 或主 session 做。
- 平行不會多花錢，花錢的是**總輪數**。

### 3d. 拆法示範（假設方案 A；實際以 TODO 為準）

| 任務 | 誰做 | 擁有 | 驗收截圖 | 預算 |
|---|---|---|---|---|
| F-0 地基：骨架、色票、共用元件、資料層介面 | 主 session ＋ sonnet | `src/app/`、`src/components/`、`src/data/`、`src/styles/` | 元件總覽頁和 03 · Components 對得上 | 60 |
| M-1 Onboarding（01、02、03-1～03-3） | sonnet，F-0 之後 | `src/features/onboarding/` | 填完暱稱和孕期後進到首頁；重新整理資料還在 | 45 |
| M-2 飲食紀錄（05-0～05-5、05-S*） | sonnet，跟 M-1 平行 | `src/features/meals/` | 新增一餐 → 詳情 → 編輯 → 刪除確認 | 55 |
| M-3 胎動紀錄（08-0～08-7） | sonnet，跟 M-1 平行 | `src/features/movement/` | 記 3 次 → 暫停 → 回顧 → 歷史有這筆 | 55 |
| M-9 任務／點數／商店（06、12-*） | opus，其他模組都整合後 | `src/features/tasks/`、`src/features/shop/` | 記一餐拿到點數 → 買蝴蝶結 → 配戴後首頁和任務頁都換裝 | 70 |

## 4. 主 session 寫 prompt 的規則

**目標是讓 subagent 不必自己探索。** 探索就是輪數，輪數就是上下文。

1. **設計只給抽好的 spec**：`design/spec/screens/<id>.json` 的確切路徑（叫它用 `node tools/fig/outline.mjs <檔案>` 讀）＋參考圖路徑。⛔ 叫它讀 `.fig`、`design/.cache/` 或呼叫 Figma MCP。
2. **規格只貼相關的條號原文**（例：METHOD §2 資料層），不要叫它讀整份 METHOD／TODO。
3. **給精確位置**：要用的共用元件（檔案路徑＋props）、service 介面、素材在 `public/` 的路徑。
4. **介面約定寫死**：這個模組要實作的 service 函式簽名、資料型別、對外的路由路徑、要呼叫的跨模組事件。
5. **狀態清單寫出來**：這個模組有哪些 frame、各對應什麼狀態（例：`08-1 = 記錄中且 0 次`）。
6. **完成條件可以機械驗證**：截圖工具要印出什麼、截圖上應該看到什麼（一句話）、哪些測試要過。
7. **寫明輪數預算**和「視覺迴圈最多 3 次」，並叫它先讀本檔 §5、§6。

### prompt 骨架

```
你是 Nestly 原型任務 X（<一句話結果>）。用繁體中文回報。預算：<N> 輪，用完就交回。
工作目錄：/Users/will/work_space/doris_chin/avocado（或 worktree 路徑；分支 <branch>）
開工先讀：/Users/will/work_space/doris_chin/avocado/AGENT.md 的 §5、§6（只讀這兩節）

## 規格（原文）
<只貼相關的 METHOD 條號＋原文>

## 畫面與狀態
| frame | 狀態 | spec | 參考圖 |
| 08-0 · Movement log／Start | 沒有進行中的紀錄 | design/spec/screens/52-1653.json | design/ref/52-1653.png |

## 擁有（只能改這些）
src/features/<模組>/

## 已知的位置
- 共用元件：src/components/<...>（props 見檔頭註解）
- 資料層：src/data/<...>.ts 的 <介面名>；跨模組事件：<...>
- 素材：public/<...>
- 已知的坑：<PITFALLS 相關條目>

## 介面約定
<service 函式簽名／型別／路由路徑>

## 完成條件
- node tools/shot.mjs [--demo] <路由…>：最後一行 console: 0 errors；截圖上看得到 <描述>
- npm run build 過；<測試> 過
- 視覺迴圈最多 3 次；不對就附截圖交回
```

## 5. subagent 必守規則（每個 prompt 都要帶）

### 5a. 省 token

1. **能一起發的工具呼叫就一次發**：一次讀好幾個檔、一次跑好幾個 grep。
2. **不要讀大檔和二進位檔**：⛔ `design/*.fig`、`design/.cache/`、`public/assets/`、`src/components/icons/iconData.ts`、
   `package-lock.json`、`node_modules` 整包、`dist/`。設計只讀 prompt 給的 `design/spec/*.json`。
   設計規格一律用 `node tools/fig/outline.mjs` 讀，不要直接讀 spec JSON。讀過的檔不要再讀，改完也不用重讀確認。
3. **⛔ 不准呼叫任何 Figma MCP 工具**（`get_design_context`、`get_screenshot`、`get_metadata`…）。有額度限制，而且輸出很肥。
   spec 不夠用就寫進回報的「不確定」，由主 session 補。
4. **截圖只在迴圈結束時看**：一次看「實作截圖＋參考圖」兩張，一個任務最多 3 次。
5. **把長輸出截短**：`npm run build 2>&1 | tail -30`；用 `git diff --stat`，不要看整份 diff。
6. 開發過程只跑相關的測試（`npx vitest run <路徑>`）；完整檢查只在**最後跑一次**，沒過就修，修完再跑一次。
7. **不要探索 prompt 沒提到的地方**。不清楚就照最合理的理解做，寫進回報的「不確定」。
8. **同一個錯誤修了兩次還沒好就停**，把現象和猜測寫進回報，交回主 session。
9. **用到輪數預算就交回**（沒寫預算就以 60 輪為上限）：寫清楚做到哪、還剩什麼。
10. **dev server 和超過 2 分鐘的指令用 `run_in_background`**。不要前景等，不要用 sleep 輪詢。

### 5b. 專案規則

1. **憲法**：「做完」= 瀏覽器 420×896 截圖有畫面＋console 0 error＋build 過＋和參考圖比過；
   **UI 不直接碰 `localStorage`／IndexedDB／`fetch`**，一律經過 service；設計原檔唯讀、程式裡不留 Figma 暫時網址；
   不自己編醫療內容，設計沒有的文字用明顯的 placeholder。
2. **只改自己「擁有」的檔案。** 共用檔不要自己改，寫進整合事項並附上可以直接貼上的片段。共用檔包括：
   根目錄所有 `*.md`、`tools/`、`design/`、`src/components/`、`src/data/` 的介面與 adapter、`src/styles/`（色票）、
   路由註冊、`App.tsx`、`package.json`（prompt 指定擁有時例外）。
3. **共用元件先用，不夠才提**：畫面裡有 Button、卡片、標題列這些，一律用 `src/components/` 既有的。
   不夠表達設計時，⛔ 在模組裡另寫一份相似的，寫進整合事項（要加什麼 prop、為什麼）。
4. **色票只用 CSS 變數**（`--nestly-color-*` 等）；⛔ 寫死色碼。設計 spec 裡有色碼沒有變數名時，寫進「不確定」。
5. **不要自己加依賴**：需要新套件就寫進整合事項（名稱＋版本＋理由）。prompt 明確允許時例外。
6. 狀態邏輯（點數計算、紀錄的新增／編輯／刪除、日期判斷）抽成可以單獨測的函式，用 vitest 測；畫面用截圖驗。⛔ 測試不連網。
7. git（git init 之後才適用）：`node_modules` 絕不能 commit，一律逐檔 `git add <檔案>`。
   message 格式照 `git log`（例：`feat(movement): M-3 胎動紀錄`），結尾空一行加
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`。
8. **不要** push、merge、動 `main`、`git switch`，也不要 cd 到別的 worktree 改東西。不要部署。
9. Python 只用 `python3 -I`，裝套件用 `pip3 install`（⛔ 沒有 `python`／`pip`）。
   **所有檔案、快取、暫存都留在專案資料夾內**（CLAUDE.md §7）；⛔ 寫到 `/tmp`、家目錄或 Claude 的暫存區。
   臨時驗證腳本放**自己 checkout 的** `.tmp/`（不進 git）。⛔ 放 `.cache/`：worktree 的 `.cache` 是指向主專案的 symlink，
   腳本裡的 `import.meta.dirname` 會解析到主專案，等於在驗主專案而不是自己的分支（PITFALLS §app 5）。⛔ 用 `npx <套件>` 執行專案沒安裝的套件（會觸發下載；需要就寫進整合事項）。
   設計稿的向量一律用 `public/assets/vectors/<id>.svg`（大綱的 `svg:` 欄位），⛔ 用相近的 Icon 代替。
10. 程式風格照周圍的程式碼；英文註解引用條號時寫成 `(METHOD §2)`。

## 6. 回報格式（最後一則訊息，**50 行以內**）

回報會一直留在主 session 的上下文裡，主 session 之後每一輪都會再讀一次，所以要短。

```
## 結果
commit <hash> · 用了 <N>/<預算> 輪 · 驗收 過／沒過（原因）· 截圖 <路徑>

## 做了什麼
- <一行一項>

## 和設計稿的差異（主 session 判斷要不要修）
- <畫面>：<差在哪>

## 整合事項
- <共用檔>：<要怎麼改，附可直接貼上的片段>

## 不確定／沒做
- …
```

不要貼大段程式碼、不要重述規格、不要逐一列測試名稱。截圖給路徑就好，不要描述截圖的每個細節。

## 7. 整合

- 整合 = 主 session merge 各任務的分支、照整合事項改共用檔（共用元件、路由註冊、資料層），
  並把發現寫回 METHOD／LEDGER／PITFALLS。
  一次只整合一個分支或最多 5 條整合事項；條目多就派一個 sonnet 做整合（預算 30 輪），做完一批再派下一批。
  一行就改得完的事項，主 session 自己做，一起 commit。
- **改共用元件之後要回頭看用到它的模組**：截一次各模組的主畫面確認沒壞，再派下一批。
- **每做完一步就 commit**，message 寫明是哪一項，被額度切斷時看 `git log` 就知道做到哪。

## 8. 額度與中斷保護

- **兩種額度分開管**：
  - **Claude 額度**：派出費時的任務之前，先在 TODO.md 把該項改成 🔵，寫下派了誰、預算幾輪、輸出在哪、怎麼判斷做到哪。
    預估一個 5 小時額度 ≈ 依 API 牌價換算 50–55 美元；sonnet 任務 60–80 輪約 5–8%。主 session 調度一整批約 10%。
    開工前把這批任務的**預算輪數加總**，換算後不夠就分兩批。
  - **Figma MCP 額度**：每月 20 次，記在 LEDGER §Figma 額度。剩 ≤ 3 次就停下來問使用者（CLAUDE.md §3）。
    `whoami` 不算額度，可以隨時用來查帳號和 seat。
- 給使用者的進度更新要短，不要把 subagent 的回報整份轉述；跑的時候不要輪詢，完成會自動通知。
- 回報的實際輪數和預算差超過 50%，就把原因寫進 LEDGER，下次照著調 §3a 的估算表。

## 9. 分支與 worktree

- **git init 之前**：一次只派一個會寫檔的任務。
- **git init 之後**：模組任務要平行就每個任務開一個 worktree：
  `git worktree add .claude/worktrees/<wt> -b feat/<模組> <base-commit>`，再
  `ln -s /Users/will/work_space/doris_chin/avocado/node_modules .claude/worktrees/<wt>/node_modules`。
  沒進 git 的 `design/spec/`、`design/ref/`、`.cache/`（截圖用的 Chromium）也要照同樣方式 symlink 進 worktree。
  ⛔ 不用 Agent 工具的 `isolation: "worktree"`；subagent 直接在指定的路徑工作。
- 確認不再需要就立刻 `git worktree remove`（分支保留）。
