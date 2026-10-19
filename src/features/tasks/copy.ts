// Pure copy/state helpers for 06.Task and 12-* (tasks & baby shop). Unit tested in copy.test.ts.
import { ACCESSORIES, DAILY_TASKS, TASK_POINTS, accessory, growthPercent, tasksDone } from '@/data/rules';
import type { AccessoryId, ISODate, Rewards, TaskKey } from '@/data/types';

export const bp = (n: number) => `${n} BP`;

// ---- 06.Task: daily task rows -------------------------------------------------------------------
const TASK_TITLE: Record<TaskKey, string> = { meal: 'Meal log', mood: 'Mood journal', checkIn: 'Daily check-in' };
const TASK_DONE: Record<TaskKey, string> = {
  meal: "Today's points claimed",
  mood: "Today's mood saved · +5 BP",
  checkIn: 'Checked in today · +5 BP',
};
const TASK_TODO: Record<TaskKey, string> = {
  meal: 'Log a meal to earn 10 BP',
  // Not in the design (only the done state is drawn); same pattern as the meal row.
  mood: 'Log your mood to earn 5 BP',
  checkIn: 'Open the app to earn 5 BP',
};
export const TASK_LINK: Partial<Record<TaskKey, string>> = { meal: '/meals/new', mood: '/mood/new' };

export type TaskRow = { key: TaskKey; title: string; detail: string; done: boolean; action: string };
export function taskRows(r: Rewards, day: ISODate): TaskRow[] {
  const done = tasksDone(r, day);
  return DAILY_TASKS.map((key) => {
    const d = done.includes(key);
    return { key, title: TASK_TITLE[key], detail: d ? TASK_DONE[key] : TASK_TODO[key], done: d, action: d ? 'Claimed' : `＋${TASK_POINTS[key]} BP` };
  });
}
export function taskSummary(r: Rewards, day: ISODate) {
  const n = DAILY_TASKS.filter((k) => tasksDone(r, day).includes(k)).length;
  return { heading: `Today's tasks · ${n}/${DAILY_TASKS.length}`, caption: `${n}/${DAILY_TASKS.length} tasks done today` };
}

// ---- 12-3 / 12-4: shop cards --------------------------------------------------------------------
export type ShopTab = 'available' | 'mine';
export type CardState = 'available' | 'short' | 'owned' | 'equipped';
export type Card = { id: AccessoryId; title: string; price: string; status: string; state: CardState; action: string };

const priceOf = (id: AccessoryId) => accessory(id).price;
export function cardFor(r: Rewards, id: AccessoryId): Card {
  const item = accessory(id);
  const p = item.price;
  if (r.owned.includes(id)) {
    const equipped = r.equipped === id;
    return { id, title: item.title, price: p === 'gift' ? 'Welcome gift' : 'Purchased', status: equipped ? 'Equipped' : 'Owned', state: equipped ? 'equipped' : 'owned', action: equipped ? 'Remove' : 'Equip' };
  }
  const short = typeof p === 'number' && r.balance < p;
  return { id, title: item.title, price: p === 'gift' ? 'Welcome gift' : bp(p), status: short ? 'Not enough BP' : 'Available', state: short ? 'short' : 'available', action: 'View details' };
}
export const shopCards = (r: Rewards, tab: ShopTab) =>
  ACCESSORIES.filter((a) => (tab === 'mine' ? r.owned.includes(a.id) : !r.owned.includes(a.id) && a.price !== 'gift')).map((a) => cardFor(r, a.id));

// ---- 12-8 / 12-9: accessory details -------------------------------------------------------------
const DESCRIPTION: Partial<Record<AccessoryId, string>> = { bow: "Soft peach-pink for your fruit baby's everyday adventures." };
export function detailCopy(r: Rewards, id: AccessoryId) {
  const item = accessory(id);
  const p = item.price;
  const owned = r.owned.includes(id);
  const equipped = r.equipped === id;
  return {
    title: item.title,
    description: DESCRIPTION[id] ?? '[Placeholder] Accessory description',
    preview: !owned ? 'Try-on preview' : equipped ? 'Preview · Equipped' : 'Preview · Not equipped',
    price: !owned ? `Price: ${typeof p === 'number' ? bp(p) : 'Welcome gift'}` : equipped ? 'Owned · Equipped' : 'Owned · Free to equip',
    primary: !owned ? `Buy · ${typeof p === 'number' ? bp(p) : ''}` : equipped ? 'Remove' : 'Equip',
    owned,
    equipped,
  };
}

// ---- dialogs (12-P*, 12-E*) ---------------------------------------------------------------------
export type DialogCopy = { title: string; metric: string; body: string; footnote: string };
const SHORT: Record<AccessoryId, string> = { bow: 'bow', leaf: 'leaf hat', star: 'star clip' };
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/** 12-P1: "Balance: 120 → 60 BP / Growth progress stays at 72%". */
export function confirmPurchase(r: Rewards, id: AccessoryId): DialogCopy {
  const p = priceOf(id) as number;
  return {
    title: `Get the ${accessory(id).title.toLowerCase()}?`,
    metric: bp(p),
    body: "It will be added to My accessories. Equip it when you're ready.",
    footnote: `Balance: ${r.balance} → ${bp(r.balance - p)}\nGrowth progress stays at ${growthPercent(r)}%`,
  };
}
/** 12-P2 (r = rewards after the purchase). */
export const purchased = (r: Rewards, id: AccessoryId): DialogCopy => ({
  title: 'Purchase complete!',
  metric: `The ${SHORT[id]} is yours`,
  body: `${accessory(id).title} added to My accessories.\nTry it on and equip it anytime.`,
  footnote: `Spent ${bp(priceOf(id) as number)} · Balance ${bp(r.balance)}`,
});
/** 12-P3. */
export const notEnough = (r: Rewards, id: AccessoryId): DialogCopy => {
  const p = priceOf(id) as number;
  return {
    title: 'A few more points to go',
    metric: `${bp(p - r.balance)} to go`,
    body: `${accessory(id).title} costs ${bp(p)}.\nYour balance is ${bp(r.balance)}.`,
    footnote: 'Complete tasks to earn points, or try an accessory you own.',
  };
};
/** 12-E1 (bought item) / 12-E3 (welcome gift). */
export const equipped = (r: Rewards, id: AccessoryId): DialogCopy =>
  priceOf(id) === 'gift'
    ? { title: 'Look updated!', metric: `${accessory(id).title} equipped`, body: 'Your previous head accessory is removed.\nAll items stay in My accessories.', footnote: 'Welcome gift · Free to equip' }
    : { title: 'Look updated!', metric: 'Looking lovely today', body: `${accessory(id).title} equipped.\nSee the new look on your Tasks page.`, footnote: `Free to equip · Balance ${bp(r.balance)}` };
/** 12-E2. */
export const removed = (r: Rewards, id: AccessoryId): DialogCopy => ({
  title: `${cap(SHORT[id])} removed`,
  metric: 'Your accessory is safe',
  body: `The ${SHORT[id]} stays in My accessories. Equip it again anytime.`,
  footnote: priceOf(id) === 'gift' ? 'Welcome gift · Free to equip' : `No refund · Balance ${bp(r.balance)}`,
});

/** Fruit baby week for the companion: profile's gestational age, 12 when unknown. */
export const companionWeek = (age: { weeks: number } | null | undefined) => age?.weeks ?? 12;
