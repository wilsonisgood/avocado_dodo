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

## §3c 多語系（English／繁體中文／简体中文）

1. 語言：`Settings.language` = 'system' | 'en' | 'zh-Hant' | 'zh-Hans'；'system' 跟隨裝置（zh-TW/HK → 繁中，其他 zh → 简中，其餘英文）。
   切換：設定頁（`LanguagePicker`）、歡迎頁右上（`LanguageButton`），都在 `@/app/LanguagePicker`。換語言整個 App 重新掛載。
2. **每個模組一份字典** `src/features/<模組>/i18n.ts`：
   ```ts
   import { defineMessages } from '@/i18n';
   export const messages = defineMessages({
     en: { title: 'Mood journal', saved: (n: number) => `${n} saved` },
     'zh-Hant': { title: '心情日記', saved: (n: number) => `已儲存 ${n} 筆` },
     'zh-Hans': { title: '心情日记', saved: (n: number) => `已保存 ${n} 条` },
   });
   ```
   畫面裡 `const t = useT(messages)`，用 `t.title`、`t.saved(3)`。key 由英文決定，中文缺 key 或型別不同會編譯失敗。
   兩個以上模組共用的字放 `src/i18n/common.ts`（主 session 擁有）。英文 = 設計稿原文，⛔ 改英文。
3. **日期／數字一律用 `@/i18n/format`**：`fmtDate`（Oct 19, 2026／2026年10月19日）、`fmtDateWeekday`、`fmtMonthDay`、
   `fmtMonthYear`、`fmtDateNumeric`（2026/10/19，三語相同）、`fmtTime`、`fmtNumber`、`weekdayNames`。⛔ 自己拼月份名稱。
4. 資料層的標籤已經跟著語言：`appointmentTypeLabel`、`relativeDay`、`reminderText`、`REMINDER_OPTIONS[].label`、
   `ACCESSORIES[].title`、`moodMeta[].label`。⛔ 使用者輸入的內容（暱稱、備註、食物名稱）不翻譯。
5. **健康相關文字**（安全提示、孕期時間軸、檢查名稱、營養說明）照原文忠實翻譯、不增減內容，並列進回報的「健康文字」，
   由使用者審（LEDGER §翻譯待審）。
6. 術語表（三語一致，翻譯一律照這張）：

| English | 繁體中文 | 简体中文 |
|---|---|---|
| Fruit baby | 水果寶寶 | 水果宝宝 |
| BP / points | BP／點數 | BP／积分 |
| Growth progress | 成長進度 | 成长进度 |
| Daily tasks / Daily check-in | 每日任務／每日簽到 | 每日任务／每日签到 |
| Baby shop / Accessories | 寶寶商店／飾品 | 宝宝商店／饰品 |
| Records | 紀錄 | 记录 |
| Meal log / Food diary | 飲食紀錄／飲食日記 | 饮食记录／饮食日记 |
| Breakfast / Lunch / Dinner / Snack | 早餐／午餐／晚餐／點心 | 早餐／午餐／晚餐／点心 |
| Nutrition / Estimate | 營養／估算 | 营养／估算 |
| kcal / g（單位） | 大卡／公克 | 千卡／克 |
| Mood journal | 心情日記 | 心情日记 |
| Movement log / Baby movements / Session | 胎動紀錄／寶寶胎動／這次紀錄 | 胎动记录／宝宝胎动／本次记录 |
| Health appointments / Appointment | 健康行程／行程 | 健康日程／日程 |
| Prenatal visit | 產檢 | 产检 |
| Injection / Blood test / Other health plans | 打針／抽血／其他健康行程 | 打针／抽血／其他健康日程 |
| Due date / Pregnancy week | 預產期／孕週 | 预产期／孕周 |
| Twins / One baby / Not sure yet | 雙胞胎／一個寶寶／還不確定 | 双胞胎／一个宝宝／还不确定 |
| Profile / Nickname | 個人資料／暱稱 | 个人资料／昵称 |
| Settings / Notifications / Reminder | 設定／通知／提醒 | 设置／通知／提醒 |
| Care team / Maternity care team | 醫護團隊／產科醫護團隊 | 医护团队／产科医护团队 |
| Save / Cancel / Edit / Delete / Done | 儲存／取消／編輯／刪除／完成 | 保存／取消／编辑／删除／完成 |
| Discard changes / Keep editing | 捨棄變更／繼續編輯 | 放弃更改／继续编辑 |

## §4 「做完」怎麼驗（憲法 1 的細節）

- `node tools/shot.mjs [--demo] [--dark] [--full] [--click "按鈕文字"] home meals/new …`（路由不加開頭斜線）
  → `shots/<路由>.png`，最後一行印 `console: 0 errors` 才算過。`--demo` 先載入示範資料。
- viewport 420×896（設計稿的 frame 寬度）；長頁面加 `--full`。
- 每個模組至少截：主畫面、一個「已填」狀態、一個對話框或確認狀態。實作截圖和參考圖放一起比。
- console 0 error、`npm run build` 過、狀態邏輯的 vitest 過。
- 資料要在**重新整理後還在**（證明真的有存）。
