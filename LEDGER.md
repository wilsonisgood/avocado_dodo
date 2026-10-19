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
| D-header | 首頁圓圈的位置、大小用 header 寬度的比例（container query `cqw`）；header 高度 max(270px, 65.5cqw)；水果放進同尺寸、裁成圓形的容器，置中在圓圈可見部分；有戴飾品時首頁也顯示 | 使用者截圖指定的視覺，要各種寬度一致 | |
| D-fruit-motion | 水果輕微浮動＋±4° 擺動，4 秒一循環，雙胞胎錯開半拍；系統「減少動態效果」時靜止 | 使用者要求；不打擾對動態敏感的人 | |
| D-i18n | 三語（English／繁體中文／简体中文），預設跟隨裝置語言，設定頁與歡迎頁可切換；每個模組自己一份字典，共用字在 `src/i18n/common.ts`；日期一律 Intl | 使用者要求（2026-10-19 回答：跟隨裝置、兩處切換、繁＋簡、健康文字翻譯後列清單審） | ✅ |
| D-i18n-terms | 合併時統一用詞：care team＝醫護團隊、Injection／Blood test＝打針／抽血、health plans＝健康行程、kcal／g＝大卡／公克（千卡／克）；全補進術語表 | 子任務各自翻出不同說法 | |
| D-demo-data | 示範資料（食物名稱、地點、日記）維持英文，不翻 | 那是「使用者輸入的內容」，規則上不翻譯 | |
| D-random-fruit | 首頁水果起始位置、節拍、速度每次隨機（共用 `FloatingFruit`） | 使用者要求 | ✅ |
| D-git | 本機 git，`.fig` 原檔一起 commit（19MB）；`design/spec`、`public/assets` 由工具重產，前者不進 git | `.fig` 是唯一真相來源；spec 可隨時 `npm run fig` 重產 | |

**上線前要使用者確認**：設計素材（水果寶寶插圖、圖示）是作者的 UI Kit，公開放上 GitHub Pages 前需要作者同意授權。push 和部署由使用者自己做。

## 翻譯待審（健康相關文字，2026-10-19）

設計稿原文（英文）由子任務忠實翻譯、不增減，主 session 統一了用詞（醫護團隊、打針、抽血、大卡／公克）。
請使用者或作者審，「審」欄填 ✅ 或改譯。介面一般用語的翻譯不列在這裡（術語表在 METHOD §3c）。

| 模組 | English | 繁體中文 | 简体中文 | 審 |
|---|---|---|---|---|
| 胎動 | Every baby has a different pattern | 每個寶寶的胎動模式都不一樣 | 每个宝宝的胎动模式都不一样 | |
| 胎動 | If movements slow, stop or change, contact your maternity care team immediately. Don't wait to finish this log. | 如果胎動變少、停止或有改變，請立即聯絡你的產科醫護團隊，不要等到記錄完才聯絡。 | 如果胎动变少、停止或有改变，请立即联系你的产科医护团队，不要等到记录完才联系。 | |
| 胎動 | Notice baby's usual pattern | 留意寶寶平常的胎動模式 | 留意宝宝平时的胎动模式 | |
| 胎動 | Tap once for each movement you feel. This log has no daily target. | 每感覺到一次胎動就點一下。這份紀錄沒有每日目標。 | 每感觉到一次胎动就点一下。这份记录没有每日目标。 | |
| 胎動 | Log what you feel overall, even if you can't identify which baby moved. Follow your care team's guidance. | 記錄你整體的感覺就好，即使無法分辨是哪一個寶寶在動。請依照醫護團隊的指示。 | 记录你整体的感觉就好，即使无法分辨是哪一个宝宝在动。请按照医护团队的指示。 | |
| 胎動 | Twins: This is an overall observation, not a separate assessment of each baby. | 雙胞胎：這是整體的觀察，不是對每個寶寶分別評估。 | 双胞胎：这是整体的观察，不是对每个宝宝分别评估。 | |
| 首頁 | Weeks 6–8: First prenatal visit | 第 6–8 週：第一次產檢 | 第 6–8 周：第一次产检 | |
| 首頁 | Location, heartbeat and number of babies. | 確認位置、心跳與寶寶數量。 | 确认位置、心跳和宝宝数量。 | |
| 首頁 | Heartbeat noted | 已記錄心跳 | 已记录心跳 | |
| 首頁 | Weeks 10–12: NIPT screening | 第 10–12 週：NIPT 篩檢 | 第 10–12 周：NIPT 筛查 | |
| 首頁 | Discuss screening options with your care team. | 與你的醫護團隊討論篩檢選項。 | 与你的医护团队讨论筛查选项。 | |
| 首頁 | Weeks 11–13: Nuchal translucency | 第 11–13 週：頸部透明帶 | 第 11–13 周：颈项透明层 | |
| 首頁 | A screening option to discuss with your care team. | 可與你的醫護團隊討論的篩檢選項。 | 可与你的医护团队讨论的筛查选项。 | |
| 首頁 | Try an egg or a glass of soy milk for a little extra protein. | 試試吃一顆蛋或喝一杯豆漿，多補充一點蛋白質。 | 试试吃一个鸡蛋或喝一杯豆浆，多补充一点蛋白质。 | |
| 首頁 | Baby: avocado size | 寶寶：酪梨大小 | 宝宝：牛油果大小 | |
| 飲食 | Energy / Protein / Carbs | 熱量／蛋白質／碳水化合物 | 热量／蛋白质／碳水化合物 | |
| 飲食 | {n} kcal · {n} g | {n} 大卡 · {n} 公克 | {n} 千卡 · {n} 克 | |
| 飲食 | Sample estimates. Check food names and portions. | 範例估算值。請確認食物名稱與份量。 | 示例估算值。请确认食物名称与份量。 | |
| 飲食 | Estimates may vary. Edit portions and estimate again, or save the food log only. | 估算值可能有出入。可以調整份量後重新估算，或只儲存飲食紀錄。 | 估算值可能有出入。可以调整份量后重新估算，或只保存饮食记录。 | |
| 飲食 | Keep this entry and review nutrition later. | 先保留這筆紀錄，之後再檢視營養。 | 先保留这条记录，之后再查看营养。 | |
| 紀錄 | Energy (kcal) | 熱量（kcal） | 热量（kcal） | |
| 紀錄 | Protein (g) | 蛋白質（g） | 蛋白质（g） | |
| 紀錄 | Carbs (g) | 碳水化合物（g） | 碳水化合物（g） | |
| 紀錄 | Today's nutrition | 今日營養 | 今日营养 | |
| 紀錄 | Not estimated | 尚未估算 | 未估算 | |
| 健康行程 | Questions or things to prepare | 想問的問題或要準備的事 | 想问的问题或要准备的事 | |
| 健康行程 | Keep prenatal visits, injections, blood tests and other health plans here. | 產檢、打針、抽血和其他健康行程都可以記在這裡。 | 产检、打针、抽血和其他健康日程都可以记在这里。 | |
| 健康行程 | Marked complete. Take care! | 已標示完成，請多保重！ | 已标记完成，请多保重！ | |
| 健康行程 | Past dates aren't marked complete automatically. Update the status in details. | 過去的日期不會自動標示為完成，請在詳情中更新狀態。 | 过去的日期不会自动标记为完成，请在详情中更新状态。 | |
| 健康行程 | Completed. No more reminders will be sent. | 已完成，不會再發送提醒。 | 已完成，不会再发送提醒。 | |
| 個人資料 | Follow your care team's supplement advice | 請依照醫護團隊的補充品建議 | 请遵循医护团队的补充剂建议 | |
| 個人資料 | DHA reminder | DHA 提醒 | DHA 提醒 | |
| 個人資料 | Today's steps / Goal: 8,000 | 今日步數／目標：8,000 | 今日步数／目标：8,000 | |
| 個人資料 | Weeks based on due date | 孕週依預產期計算 | 孕周按预产期计算 | |
| 個人資料 | Weeks set manually | 孕週為手動設定 | 孕周为手动设置 | |
| 個人資料 | Weeks update daily. Update your due date if your care team changes it, or set your week manually. | 孕週每天自動更新。若醫護團隊更改了預產期，請更新預產期，或改為手動設定孕週。 | 孕周每天自动更新。如果医护团队更改了预产期，请更新预产期，或改为手动设置孕周。 | |
| 個人資料 | As of {date}. Updates daily. Enter 0–6 days. Manual weeks don't change your due date. | 截至 {date}，每天自動更新。天數請輸入 0–6。手動設定的孕週不會改變你的預產期。 | 截至 {date}，每天自动更新。天数请输入 0–6。手动设置的孕周不会改变你的预产期。 | |
| 個人資料 | For your personal records. Enter actual measurements. | 僅供個人紀錄，請輸入實際測量的數值。 | 仅供个人记录，请输入实际测量的数值。 | |
| 個人資料 | Pre-pregnancy weight (kg, optional) | 懷孕前體重（公斤，選填） | 怀孕前体重（公斤，选填） | |
| 心情 | A little space for how you feel | 為你的感受留一點空間 | 为你的感受留一点空间 | |
| 心情 | No perfect words needed. A feeling is enough. | 不需要完美的言語，有感覺就足夠了。 | 不需要完美的言语，有感觉就足够了。 | |
| 心情 | Every feeling deserves care | 每一種感受都值得被呵護 | 每一种感受都值得被呵护 | |
| 心情 | Log as often as you like. Make space for your feelings. | 想記錄就記錄，為你的感受留些空間。 | 想记录就记录，为你的感受留些空间。 | |
| 心情 | Saved. Thank you for caring for yourself. | 已儲存。謝謝你好好照顧自己。 | 已保存。谢谢你好好照顾自己。 | |
| 新手引導 | Not sure how far along? You can set this later. | 不確定懷孕多久了嗎？之後再設定也可以。 | 不确定怀孕多久了吗？之后再设置也可以。 | |
| 新手引導 | Twins share the same pregnancy week and due date. | 雙胞胎共用相同的孕週和預產期。 | 双胞胎共用相同的孕周和预产期。 | |
| 新手引導 | A / B are labels, not birth order. | A / B 只是標記，不代表出生順序。 | A / B 只是标记，不代表出生顺序。 | |
| 新手引導 | Start logging now. Update your pregnancy details in Profile later. | 現在就開始記錄吧。之後可以在個人資料中更新孕期資訊。 | 现在就开始记录吧。之后可以在个人资料中更新孕期信息。 | |
| 設定 | Choose whether you'd like a reminder | 選擇是否需要提醒 | 选择是否需要提醒 | |
| 設定 | Turn on if it suits your needs | 如果適合你的需求，可以開啟 | 如果适合你的需求，可以开启 | |
| 設定 | A logging reminder, with no movement target. | 這是記錄提醒，沒有胎動目標。 | 这是记录提醒，没有胎动目标。 | |
| 設定 | Prenatal visits, injections and blood tests | 產檢、打針與抽血 | 产检、打针与抽血 | |
| 設定 | Prenatal visits and other health plans | 產檢與其他健康行程 | 产检与其他健康日程 | |
| 設定 | Reminds you to view weekly content. Your pregnancy details stay the same. | 提醒你查看每週內容。你的懷孕資料不會改變。 | 提醒你查看每周内容。你的怀孕资料不会改变。 | |
| 設定 | Discover this week's little changes | 看看這週的小小變化 | 看看这周的小小变化 | |
| 任務 | Log as needed. This does not count toward daily tasks. | 需要時再記錄，不計入每日任務。 | 需要时再记录，不计入每日任务。 | |

另外需要確認的自訂譯法（術語表原本沒有）：Baby's note＝寶寶的小語／宝宝的小语、Growing＝成長中、Welcome gift＝迎新禮物／新人礼物、
Equip／Remove＝配戴／取下（佩戴／取下）、Undo last＝復原上一次／撤销上一次、Partner sharing＝與伴侶分享、Log out＝登出／退出登录、
Movement notes＝胎動筆記、points＝點數／积分。

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
