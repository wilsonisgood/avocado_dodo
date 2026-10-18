// Screenshot acceptance tool (CLAUDE.md 憲法 1, METHOD §4).
//   node tools/shot.mjs [--demo] [--dark] [--full] [--click "Text"]... <route> [<route>...]
//   e.g. node tools/shot.mjs --demo --full home tasks meals/new
// Routes are app hash routes (#/home), written without a leading slash; "playground" is the in-app dev menu.
// Starts its own Vite dev server, opens each route at 420×896 in Playwright's Chromium kept inside the
// project (.cache/ms-playwright; first time: PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright npx playwright-core install chromium),
// saves shots/<route>.png and prints console errors and failed requests. Nothing is written outside the project.
// Exit code 1 if any page logged an error.
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '..');
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(root, '.cache/ms-playwright');
const { chromium } = await import('playwright-core');
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const clicks = [];
const routes = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--click') clicks.push(args[++i]);
  else if (!args[i].startsWith('--')) routes.push(args[i].replace(/^\/+/, ''));
}
if (!routes.length) routes.push('');

// Per-checkout Vite cache and per-run browser profile, so several worktrees can shoot at the same time.
const tag = path.basename(root);
const server = await createServer({ root, logLevel: 'error', cacheDir: path.join(root, '.cache/vite', tag), server: { port: 0 } });
await server.listen();
const base = server.resolvedUrls.local[0];
const profile = path.join(root, '.cache/shot-profile', `${tag}-${process.pid}`);
const browser = await chromium.launchPersistentContext(profile, {
  viewport: { width: 420, height: 896 },
  deviceScaleFactor: 2,
  colorScheme: flag('--dark') ? 'dark' : 'light',
});
const page = browser.pages()[0] ?? (await browser.newPage());
await page.evaluate(() => localStorage.clear()).catch(() => {});
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(`[console] ${m.text()}`));
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
page.on('requestfailed', (r) => errors.push(`[requestfailed] ${r.url()}`));
page.on('response', (r) => r.status() >= 400 && errors.push(`[http ${r.status()}] ${r.url()}`));

await page.goto(`${base}#/playground`);
await page.evaluate(() => localStorage.clear()); // every run starts from a fresh install
if (flag('--demo')) {
  await page.getByRole('button', { name: 'Load demo data' }).click();
  await page.waitForURL(/#\/home/);
}

fs.mkdirSync(path.join(root, 'shots'), { recursive: true });
for (const route of routes) {
  await page.setViewportSize({ width: 420, height: 896 });
  await page.goto(`${base}#/${route}`);
  await page.waitForLoadState('networkidle');
  for (const text of clicks) await page.getByText(text, { exact: true }).first().click();
  await page.waitForTimeout(300);
  if (flag('--full')) {
    // The app scrolls inside the phone screen; grow the viewport to the content instead of using fullPage.
    const extra = await page.evaluate(() => {
      const s = document.querySelector('#phone-screen .overflow-y-auto');
      return s ? s.scrollHeight - s.clientHeight : 0;
    });
    if (extra > 0) await page.setViewportSize({ width: 420, height: 896 + extra });
    await page.waitForTimeout(200);
  }
  const name = (route.replace(/[/?=&]+/g, '_') || 'root') + (flag('--dark') ? '.dark' : '') + '.png';
  const file = path.join(root, 'shots', name);
  await page.screenshot({ path: file });
  const text = (await page.locator('#phone-screen').innerText()).replace(/\s+/g, ' ').slice(0, 160);
  console.log(`#/${route} -> shots/${name} | ${text}`);
}

await browser.close();
await server.close();
fs.rmSync(profile, { recursive: true, force: true });
if (errors.length) {
  console.log(`\n${errors.length} error(s):\n${[...new Set(errors)].join('\n')}`);
  process.exit(1);
}
console.log('\nconsole: 0 errors');
