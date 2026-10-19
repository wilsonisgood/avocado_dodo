import { afterEach, describe, expect, it } from 'vitest';
import { buyAccessory, equipAccessory, initialRewards } from '@/data/rules';
import type { Rewards } from '@/data/types';
import { setLocale } from '@/i18n';
import { cardFor, companionWeek, confirmPurchase, detailCopy, equipped, notEnough, purchased, removed, shopCards, taskRows, taskSummary } from './copy';

const day = '2026-10-19';
const demo: Rewards = { ...initialRewards(), balance: 120, lifetimeEarned: 180, claimed: { [day]: ['mood', 'checkIn'] } };
const afterBuy = (buyAccessory(demo, 'bow', `${day}T10:00:00`) as { ok: true; rewards: Rewards }).rewards;

describe('tasks', () => {
  it('rows and summary follow today’s claims (06.Task, 12-1)', () => {
    const rows = taskRows(demo, day);
    expect(rows.map((r) => r.detail)).toEqual(['Log a meal to earn 10 BP', "Today's mood saved · +5 BP", 'Checked in today · +5 BP']);
    expect(rows[0].action).toBe('＋10 BP');
    expect(taskSummary(demo, day)).toEqual({ heading: "Today's tasks · 2/3", caption: '2/3 tasks done today' });
    const all = { ...demo, claimed: { [day]: ['mood', 'checkIn', 'meal'] as const } } as unknown as Rewards;
    expect(taskRows(all, day)[0]).toMatchObject({ detail: "Today's points claimed", done: true });
    expect(taskSummary(all, day).heading).toBe("Today's tasks · 3/3");
    expect(taskSummary(demo, '2026-10-20').heading).toBe("Today's tasks · 0/3");
  });
  it('companion week defaults to 12', () => {
    expect(companionWeek(null)).toBe(12);
    expect(companionWeek({ weeks: 20 })).toBe(20);
  });
});

describe('shop cards', () => {
  it('available tab: unowned, for-sale items with affordability (12-3)', () => {
    expect(shopCards(demo, 'available').map((c) => [c.id, c.price, c.status])).toEqual([
      ['bow', '60 BP', 'Available'],
      ['star', '150 BP', 'Not enough BP'],
    ]);
    expect(shopCards(afterBuy, 'available').map((c) => c.id)).toEqual(['star']);
  });
  it('my accessories: owned / equipped (12-4, 12-5, 12-6, 12-7)', () => {
    expect(shopCards(demo, 'mine').map((c) => [c.id, c.price, c.status])).toEqual([['leaf', 'Welcome gift', 'Owned']]);
    const worn = equipAccessory(afterBuy, 'bow');
    expect(shopCards(worn, 'mine').map((c) => [c.id, c.price, c.status, c.action])).toEqual([
      ['bow', 'Purchased', 'Equipped', 'Remove'],
      ['leaf', 'Welcome gift', 'Owned', 'Equip'],
    ]);
    expect(cardFor(equipAccessory(demo, 'leaf'), 'leaf').status).toBe('Equipped');
  });
});

describe('details and dialogs', () => {
  it('details before purchase / owned (12-8, 12-9)', () => {
    expect(detailCopy(demo, 'bow')).toMatchObject({ preview: 'Try-on preview', price: 'Price: 60 BP', primary: 'Buy · 60 BP' });
    expect(detailCopy(afterBuy, 'bow')).toMatchObject({ preview: 'Preview · Not equipped', price: 'Owned · Free to equip', primary: 'Equip' });
  });
  it('purchase copy reflects balance and growth (12-P1, 12-P2, 12-P3)', () => {
    expect(confirmPurchase(demo, 'bow')).toMatchObject({ title: 'Get the peach bow?', metric: '60 BP', footnote: 'Balance: 120 → 60 BP\nGrowth progress stays at 72%' });
    expect(confirmPurchase({ ...demo, balance: 130 }, 'bow').footnote).toContain('130 → 70 BP');
    expect(purchased(afterBuy, 'bow')).toMatchObject({ metric: 'The bow is yours', footnote: 'Spent 60 BP · Balance 60 BP' });
    expect(notEnough(demo, 'star')).toMatchObject({ metric: '30 BP to go', body: 'Star clip costs 150 BP.\nYour balance is 120 BP.' });
    expect(notEnough({ ...demo, balance: 130 }, 'star').metric).toBe('20 BP to go');
  });
  it('equip / remove copy (12-E1, 12-E2, 12-E3)', () => {
    expect(equipped(afterBuy, 'bow')).toMatchObject({ metric: 'Looking lovely today', footnote: 'Free to equip · Balance 60 BP' });
    expect(equipped(demo, 'leaf')).toMatchObject({ metric: 'Leaf hat equipped', footnote: 'Welcome gift · Free to equip' });
    expect(removed(afterBuy, 'bow')).toMatchObject({ title: 'Bow removed', footnote: 'No refund · Balance 60 BP' });
  });
});

describe('zh-Hant', () => {
  afterEach(() => setLocale('en'));
  it('follows the language for rows, cards and dialogs', () => {
    setLocale('zh-Hant');
    expect(taskRows(demo, day)[0]).toMatchObject({ title: '飲食紀錄', detail: '記錄一餐可獲得 10 BP', action: '＋10 BP' });
    expect(taskSummary(demo, day).heading).toBe('今日任務 · 2/3');
    expect(shopCards(demo, 'available').map((c) => c.status)).toEqual(['可購買', 'BP 不足']);
    expect(confirmPurchase(demo, 'bow').footnote).toBe('餘額：120 → 60 BP\n成長進度維持在 72%');
    expect(notEnough(demo, 'star').metric).toBe('還差 30 BP');
    expect(removed(afterBuy, 'bow').title).toBe('已取下蝴蝶結');
  });
});
