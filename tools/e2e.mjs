// End-to-end storyline across modules, from a fresh install (CLAUDE.md 憲法 1).
//   node tools/e2e.mjs        → shots/e2e-<step>.png, exit 1 on any failed check or console error
// onboarding → daily check-in (+5) → log a meal (+10, reward dialog) → buy & equip the peach bow
// → home / tasks reflect it → reload keeps everything.
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '..');
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(root, '.cache/ms-playwright');
const { chromium } = await import('playwright-core');

const tag = path.basename(root);
const server = await createServer({ root, logLevel: 'error', cacheDir: path.join(root, '.cache/vite', tag), server: { port: 0 } });
await server.listen();
const base = server.resolvedUrls.local[0];
const profileDir = path.join(root, '.cache/shot-profile', `${tag}-e2e-${process.pid}`);
const browser = await chromium.launchPersistentContext(profileDir, { viewport: { width: 420, height: 896 }, deviceScaleFactor: 2 });
const page = browser.pages()[0] ?? (await browser.newPage());
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text().split('\n')[0]));
page.on('pageerror', (e) => errors.push(e.message));
fs.mkdirSync(path.join(root, 'shots'), { recursive: true });

let failed = 0;
const screen = () => page.locator('#phone-screen');
async function step(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`✗ ${name}: ${e.message.split('\n')[0]}`);
  }
  await page.screenshot({ path: path.join(root, 'shots', `e2e-${name.replace(/\W+/g, '-').toLowerCase()}.png`) });
}
const expectText = async (text) => {
  await screen().getByText(text, { exact: false }).first().waitFor({ timeout: 4000 });
};
const click = (text) => page.getByRole('button', { name: text, exact: true }).or(page.getByRole('link', { name: text, exact: true })).first().click();
const go = async (route) => {
  await page.goto(`${base}#/${route}`);
  await page.waitForLoadState('networkidle');
};

await page.goto(`${base}#/`);
await page.evaluate(() => localStorage.clear());
await page.reload();

await step('fresh install opens onboarding', async () => {
  await page.waitForURL(/#\/welcome/);
  await page.getByLabel('Your nickname').fill('Doris');
  await click('Continue');
  await page.waitForURL(/welcome\/profile/);
  await page.getByLabel('Height (cm)').fill('162');
  await click('Continue');
  await page.waitForURL(/welcome\/baby/);
  await click('Get started');
  await page.waitForURL(/#\/home/);
  await expectText('Week 16');
});

await step('daily check-in gives +5 on top of the 120 welcome balance', async () => {
  await go('tasks');
  await expectText('125 BP');
  await expectText('Checked in today');
});

await step('logging a meal earns +10 with the reward dialog', async () => {
  await go('meals/new?type=lunch');
  await click('＋ Add food');
  await page.getByLabel('Food name').fill('Rice');
  await page.getByLabel('Portion').fill('1 bowl');
  await click('Add to meal');
  await click('Save meal');
  await expectText('Meal logged!');
  await expectText('125 → 135 BP');
  await click('Done');
  await page.waitForURL(/#\/meals\/[\w-]+$/);
});

await step('a second meal the same day earns nothing', async () => {
  await go('meals/new?type=dinner');
  await click('＋ Add food');
  await page.getByLabel('Food name').fill('Soup');
  await click('Add to meal');
  await click('Save meal');
  await page.waitForURL(/#\/meals\/[\w-]+$/);
  await go('tasks');
  await expectText('135 BP');
});

await step('buy and equip the peach bow', async () => {
  await go('shop');
  await page.getByText('Peach bow', { exact: true }).first().click();
  await click('Buy · 60 BP');
  await click('Buy now');
  await click('Equip now');
  await go('tasks');
  await expectText('75 BP');
});

await step('reload keeps profile, points, meals and the bow', async () => {
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expectText('75 BP');
  await go('records');
  await expectText('Rice');
  await go('profile');
  await expectText('Doris');
});

await browser.close();
await server.close();
fs.rmSync(profileDir, { recursive: true, force: true });
if (errors.length) console.log(`\nconsole errors:\n${[...new Set(errors)].join('\n')}`);
console.log(failed || errors.length ? `\ne2e: ${failed} failed step(s)` : '\ne2e: all steps passed, console 0 errors');
process.exit(failed || errors.length ? 1 : 0);
