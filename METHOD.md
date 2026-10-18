# METHOD — 合約與規則（⛔ 不放實測數字，實測進 LEDGER）

## §1 資料夾結構

```
avocado/
  design/            設計原檔（唯讀）＋ tools 產生的 spec/、ref/
  tools/fig/         .fig 解碼與畫面規格抽取
  public/assets/     從 .fig 匯出的圖片與圖示（檔名 ASCII）
  src/
    app/             路由、手機外框、版面
    styles/          色票（CSS 變數，light／dark）
    components/      共用元件（對應 03 · Components 的 Nestly/*）
    data/            型別、service 介面、adapter、跨模組事件
    features/<模組>/  每個模組自己的頁面、狀態邏輯、service 實作
```

模組對應 04 · App Screens 的編號：01–03 onboarding、04 home、05 meals、06/12 tasks＋shop、07 mood、
08 movement、09 appointments、10 profile、11 settings。

## §2 資料層合約（憲法 2 的細節）

1. 頁面與元件只能透過 `src/data/` 的 **service 介面**存取資料。每個 service 的函式都回傳 `Promise`，
   用法和打 API 一樣（例：`mealService.list(date)`、`create(input)`、`update(id, patch)`、`remove(id)`）。
2. 介面背後是 **adapter**：現在是 `local`（localStorage；照片等大檔放 IndexedDB），之後加 `http` adapter，
   用 `VITE_DATA_SOURCE=local|api` 切換。**換 adapter 不能改到任何頁面。**
3. 資料型別用 TypeScript 定義在 `src/data/types.ts`，之後直接當 API 格式的規格。
   每筆紀錄都有 `id`、`createdAt`、`updatedAt`。
4. 跨模組的連動（記一餐 → 任務完成 → 點數 → 商店）走 `src/data/` 定好的事件／service，
   ⛔ 模組之間直接 import 對方的內部檔案。
5. 第一次開啟是空的、走 onboarding；`#/playground` 有「Load demo data／Fresh install」，方便 demo。
6. 頁面讀資料用 `src/data/queries.ts` 的 hook（`useMeals()`…），寫資料用 `useAction(service.fn, [keys.xxx])`；
   純規則（點數、週數、日期）放 `src/data/rules.ts` 並寫 vitest。

## §3 設計資料怎麼取（優先順序）

1. **`.fig` 原檔**（不限次數）：`npm run fig` 依序跑 `tools/fig/` 的 decode → spec → tokens → assets：
   - `design/spec/index.json`：畫面清單（id、名稱、模組）與元件清單
   - `design/spec/screens/<id>.json`、`design/spec/components/<id>.json`：排版規格（text style、instance 覆寫已解析）
   - `src/styles/tokens.css`、`src/styles/theme.css`、`src/components/icons/iconData.ts`、`src/data/fruitImages.ts`
   - `public/assets/`（圖片、飾品、裝飾向量）
   讀規格用 `node tools/fig/outline.mjs design/spec/screens/<id>.json`（或 `--component "Nestly/Button"`）。
   ⛔ 手改上面這些產出檔；要改就改工具再重跑。
2. **參考圖** `design/ref/<id>.png`：從作者匯出的 PNG（TODO U3）。
3. **Figma MCP**：只在上兩者都拿不到時用，只有主 session 能用，用一次記一筆（LEDGER §Figma 額度）。

## §3b 樣式怎麼寫

- 顏色只用 Figma 變數產生的 Tailwind class：`bg-bg-surface`、`text-text-primary`、`border-border-default`、`text-icon-default`。
  spec 裡的 `$text-primary` = `var(--nestly-color-text-primary)` = class `text-text-primary`。
- 文字樣式用 `type-*`（`type-heading-medium`、`type-label-default`、`type-caption-strong`…），⛔ 自己拼 font-size／weight。
- 圓角 `rounded-10/14/16/24/999`、陰影 `shadow-card`／`shadow-floating`；間距用 Tailwind 4px 刻度（`p-4` = 16px）。
- 圖示 `<Icon name="Calendar" />`；素材網址用 `asset('assets/...')`（PITFALLS §app 3）。

## §4 「做完」怎麼驗（憲法 1 的細節）

- `node tools/shot.mjs [--demo] [--dark] [--full] [--click "按鈕文字"] home meals/new …`（路由不加開頭斜線）
  → `shots/<路由>.png`，最後一行印 `console: 0 errors` 才算過。`--demo` 先載入示範資料。
- viewport 420×896（設計稿的 frame 寬度）；長頁面加 `--full`。
- 每個模組至少截：主畫面、一個「已填」狀態、一個對話框或確認狀態。實作截圖和參考圖放一起比。
- console 0 error、`npm run build` 過、狀態邏輯的 vitest 過。
- 資料要在**重新整理後還在**（證明真的有存）。
