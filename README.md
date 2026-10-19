# Nestly prototype

可互動的孕期／育兒 App 原型，照「Nestly — Pregnancy & Baby Companion UI Kit」的 Figma 設計稿實作。
React + Vite + TypeScript + Tailwind；資料存在瀏覽器（localStorage／IndexedDB），之後可以換成 API（見 METHOD.md §2）。

## 在本機跑

```bash
npm install
npm run dev
```

打開終端機印出的網址。第一次開啟會走新使用者引導；想直接看完整畫面，到 `#/playground` 按「Load demo data」。

## 檢查

```bash
npm run check
```

依序跑：型別檢查、單元測試、production build、全站巡檢（`tools/smoke.mjs`，走過每一條路由）、
端到端主線（`tools/e2e.mjs`，從全新安裝到買飾品）。截圖都在 `shots/`。
第一次跑之前要先下載截圖用的 Chromium（放在專案內的 `.cache/`）：

```bash
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright npx playwright-core install chromium
```

## 部署到 GitHub Pages

1. 在 GitHub 建一個 repo，把這個專案 push 上去（`main` 分支）。
2. repo 的 Settings → Pages → Build and deployment → Source 選「GitHub Actions」。
3. 之後每次 push 到 `main`，`.github/workflows/deploy.yml` 會自動 build 並發布到 `https://<帳號>.github.io/<repo>/`。

⚠️ 公開之前：設計素材（水果寶寶插圖、圖示）來自作者的 UI Kit，請先取得作者同意。

## 從設計稿更新

設計原檔在 `design/*.fig`。換了新版 `.fig` 之後：

```bash
npm run fig
```

會重新產生畫面規格（`design/spec/`）、色票（`src/styles/`）、圖示與素材（`src/components/icons/`、`public/assets/`）。

## 文件

給協作者（含 Claude）看的規則在 [CLAUDE.md](CLAUDE.md)，決策與實測紀錄在 [LEDGER.md](LEDGER.md)，待辦在 [TODO.md](TODO.md)。
