# PITFALLS — 踩過的坑

## §fig `.fig` 原檔

1. **`.fig` 是 zip**，裡面的 `canvas.fig` 開頭是 `fig-kiwi`＋版本號（這份是 106），接著兩個 chunk：
   chunk 0 是 raw deflate 的 kiwi schema，chunk 1 是 **zstd**（開頭 `28b52ffd`）壓縮的資料。
   node 24 內建 `zlib.zstdDecompressSync`，不用另外裝 zstd。
2. **文字節點上的 `fontSize`／`fontName` 是過時的值**：例如 08-2 的日期文字寫 12 Regular，
   實際套用 `styleIdForText` → `Nestly/Label/Default`（14 Medium）。⇒ 有 `styleIdForText` 就以 style 節點為準。
3. **INSTANCE 不能只看自己**：文字和 variant 在 `componentPropAssignments`（defID → 值），
   其他覆寫在 `symbolData.symbolOverrides`（`guidPath` 指到元件裡的子節點）。
4. 顏色同時有 `color`（解析後的值）和 `colorVar`（變數別名）；**要用變數名**，才能支援 light／dark。
   別名有兩種：本地的 `guid`，和指向元件庫的 `assetRef.key`（用變數節點的 `key` 對回名字）。
5. **向量路徑 blob**：`[指令 u8][float32 LE…]`，0=Z、1=M(2)、2=L(2)、3=Q(4)、4=C(6)。
   描邊已經展開成 `strokeGeometry`，用填色畫就好。只有 `vectorNetworkBlob` 沒有 geometry 的節點（不在畫面上用到）沒處理。
6. **元件屬性名稱會撞名**：連到元件庫的屬性沒有本地名稱，退而用圖層名（如 `Label.text`），同一個元件可能有三個。
   spec 會加上 `#2`、`#3`；Input 的順序是「標籤、值、說明文字」。
7. 元件庫的變數副本（變數集 id 是 `assetRef` 的那兩組）是過時的，**以本地變數集為準**（`tools/fig/lib.mjs` `localVariables`）。
8. **instance 沒覆寫的屬性沿用元件預設值**（`componentPropDefs[].initialValue`，放在元件或它的 component set 上）；
   只讀 `componentPropAssignments` 會漏掉預設文字（例：08-2 的胎動安全提示）。spec 已合併預設值（2026-10-19 修）。

## §mcp Figma MCP

1. 使用者給的連結 `node-id` 可能指到別的頁面；`get_metadata` 不帶 nodeId 只列出部分頁面（這份只列 2/7 頁）。
   ⇒ 頁面要用實際的頁面 id（04 App Screens = `0:1`）。
2. `get_metadata` 對整頁會超過輸出上限並存成檔案；用 jq／python 從檔案抽，不要整份讀。
3. 額度看的是**授權帳號自己的 seat**，不是檔案作者有沒有付費。

## §app 前端

1. **`useEffect(() => el.scrollTo(...))` 會壞**：新版 Chrome 的 `scrollTo` 回傳 Promise，React 當成 cleanup 呼叫，
   報 `destroy is not a function`。⇒ effect 一律用大括號，不要用箭頭函式直接回傳。
2. 對話框／底部選單用 `fixed`，靠 `#phone-screen` 的 `transform` 把它們限制在手機框裡；
   ⛔ 用 portal 掛到 `document.body`，桌面版會蓋滿整個視窗。
3. 素材網址一律用 `asset('assets/...')`（`@/components`），⛔ 寫 `/assets/...` 絕對路徑——放到 GitHub Pages 子路徑會 404。
4. 不能讓任何東西寫到專案外：npm 快取靠 `.npmrc`；Playwright 要設 `PLAYWRIGHT_BROWSERS_PATH`、用 `launchPersistentContext` 指定專案內的設定檔。
5. **worktree 的 `.cache`、`node_modules`、`design/spec` 是 symlink**：放在裡面的腳本用 `import.meta.dirname` 算路徑，
   會解析到主專案（真實路徑），結果截圖和 Vite 都跑在主專案上。臨時腳本放 worktree 自己的 `.tmp/`。
