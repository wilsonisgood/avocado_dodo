// Whole-app smoke test: load demo data, visit every route (including each record's detail / edit page),
// fail on console errors, failed requests, or leftover "Not built yet" placeholders.
//   node tools/smoke.mjs            (exit 1 on any problem)
import path from 'node:path';
import fs from 'node:fs';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '..');
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(root, '.cache/ms-playwright');
const { chromium } = await import('playwright-core');

const STATIC = [
  'home', 'records', 'tasks', 'profile',
  'meals/new', 'mood', 'mood/new', 'movement', 'movement/history',
  'appointments', 'appointments?tab=past', 'appointments?view=calendar', 'appointments/new',
  'shop', 'shop?tab=mine', 'shop/bow', 'shop/leaf', 'shop/star',
  'profile/edit', 'profile/personal', 'profile/pregnancy', 'profile/body',
  'settings', 'settings/notifications',
  ...['mood', 'movement', 'meals', 'weekly', 'appointments'].map((k) => `settings/reminders/${k}`),
  'playground',
];
// Per-record pages, filled from the demo data in localStorage.
const PER_RECORD = {
  meals: (id) => [`meals/${id}`, `meals/${id}/edit`, `meals/${id}/estimate`],
  moods: (id) => [`mood/${id}`, `mood/${id}/edit`],
  movements: (id) => [`movement/${id}`, `movement/review/${id}`],
  appointments: (id) => [`appointments/${id}`, `appointments/${id}/edit`],
};

const tag = path.basename(root);
const server = await createServer({ root, logLevel: 'error', cacheDir: path.join(root, '.cache/vite', tag), server: { port: 0 } });
await server.listen();
const base = server.resolvedUrls.local[0];
const profile = path.join(root, '.cache/shot-profile', `${tag}-smoke-${process.pid}`);
const browser = await chromium.launchPersistentContext(profile, { viewport: { width: 420, height: 896 } });
const page = browser.pages()[0] ?? (await browser.newPage());

let current = '';
const problems = [];
page.on('console', (m) => m.type() === 'error' && problems.push(`#/${current}: [console] ${m.text().split('\n')[0]}`));
page.on('pageerror', (e) => problems.push(`#/${current}: [pageerror] ${e.message}`));
page.on('response', (r) => r.status() >= 400 && problems.push(`#/${current}: [http ${r.status()}] ${r.url()}`));

await page.goto(`${base}#/playground`);
await page.evaluate(() => localStorage.clear());
await page.getByRole('button', { name: 'Load demo data' }).click();
await page.waitForURL(/#\/home/);

const ids = await page.evaluate(() =>
  Object.fromEntries(['meals', 'moods', 'movements', 'appointments'].map((k) => [k, JSON.parse(localStorage.getItem(`nestly:v1:${k}`) ?? '[]').map((x) => x.id)])),
);
const routes = [...STATIC, ...Object.entries(PER_RECORD).flatMap(([k, f]) => ids[k].flatMap(f))];

for (const route of routes) {
  current = route;
  await page.goto(`${base}#/${route}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
  const text = await page.locator('#phone-screen').innerText();
  if (text.includes('Not built yet')) problems.push(`#/${route}: placeholder still shown`);
  if (!text.trim()) problems.push(`#/${route}: blank screen`);
  const landed = page.url().split('#/')[1] ?? '';
  if (landed.split('?')[0] !== route.split('?')[0]) problems.push(`#/${route}: redirected to #/${landed}`);
}

await browser.close();
await server.close();
fs.rmSync(profile, { recursive: true, force: true });
console.log(`smoke: ${routes.length} routes visited`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n${[...new Set(problems)].join('\n')}`);
  process.exit(1);
}
console.log('smoke: 0 problems');
