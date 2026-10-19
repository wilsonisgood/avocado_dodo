// Pure copy/state helpers for 06.Task and 12-* (tasks & baby shop). Unit tested in copy.test.ts.
// Strings come from ./i18n and are looked up at call time, so they follow the current language.
import { ACCESSORIES, DAILY_TASKS, TASK_POINTS, accessory, growthPercent, tasksDone } from '@/data/rules';
import type { AccessoryId, ISODate, Rewards, TaskKey } from '@/data/types';
import { tr } from '@/i18n';
import { common } from '@/i18n/common';
import { messages } from './i18n';

export const bp = (n: number) => tr(messages).bp(n);

// ---- 06.Task: daily task rows -------------------------------------------------------------------
export const TASK_LINK: Partial<Record<TaskKey, string>> = { meal: '/meals/new', mood: '/mood/new' };

export type TaskRow = { key: TaskKey; title: string; detail: string; done: boolean; action: string };
export function taskRows(r: Rewards, day: ISODate): TaskRow[] {
  const t = tr(messages);
  const title: Record<TaskKey, string> = { meal: t.taskMeal, mood: t.taskMood, checkIn: t.taskCheckIn };
  const doneText: Record<TaskKey, string> = { meal: t.doneMeal, mood: t.doneMood, checkIn: t.doneCheckIn };
  // Mood / check-in "to do" rows are not in the design (only the done state is drawn); same pattern as the meal row.
  const todoText: Record<TaskKey, string> = { meal: t.todoMeal, mood: t.todoMood, checkIn: t.todoCheckIn };
  const done = tasksDone(r, day);
  return DAILY_TASKS.map((key) => {
    const d = done.includes(key);
    return { key, title: title[key], detail: d ? doneText[key] : todoText[key], done: d, action: d ? t.claimed : `＋${bp(TASK_POINTS[key])}` };
  });
}
export function taskSummary(r: Rewards, day: ISODate) {
  const n = DAILY_TASKS.filter((k) => tasksDone(r, day).includes(k)).length;
  return { heading: tr(messages).taskHeading(n, DAILY_TASKS.length), caption: tr(common).tasksDoneToday(n, DAILY_TASKS.length) };
}

// ---- 12-3 / 12-4: shop cards --------------------------------------------------------------------
export type ShopTab = 'available' | 'mine';
export type CardState = 'available' | 'short' | 'owned' | 'equipped';
export type Card = { id: AccessoryId; title: string; price: string; status: string; state: CardState; action: string };

const priceOf = (id: AccessoryId) => accessory(id).price;
export function cardFor(r: Rewards, id: AccessoryId): Card {
  const t = tr(messages);
  const item = accessory(id);
  const p = item.price;
  if (r.owned.includes(id)) {
    const equipped = r.equipped === id;
    return { id, title: item.title, price: p === 'gift' ? t.welcomeGift : t.purchased, status: equipped ? t.equippedStatus : t.owned, state: equipped ? 'equipped' : 'owned', action: equipped ? t.remove : t.equip };
  }
  const short = typeof p === 'number' && r.balance < p;
  return { id, title: item.title, price: p === 'gift' ? t.welcomeGift : bp(p), status: short ? t.notEnoughBp : t.available, state: short ? 'short' : 'available', action: t.viewDetails };
}
export const shopCards = (r: Rewards, tab: ShopTab) =>
  ACCESSORIES.filter((a) => (tab === 'mine' ? r.owned.includes(a.id) : !r.owned.includes(a.id) && a.price !== 'gift')).map((a) => cardFor(r, a.id));

// ---- 12-8 / 12-9: accessory details -------------------------------------------------------------
export function detailCopy(r: Rewards, id: AccessoryId) {
  const t = tr(messages);
  const item = accessory(id);
  const p = item.price;
  const owned = r.owned.includes(id);
  const equipped = r.equipped === id;
  return {
    title: item.title,
    description: id === 'bow' ? t.descBow : t.descPlaceholder,
    preview: !owned ? t.tryOn : equipped ? t.previewEquipped : t.previewNotEquipped,
    price: !owned ? t.priceOf(typeof p === 'number' ? bp(p) : t.welcomeGift) : equipped ? t.ownedEquipped : t.ownedFree,
    primary: !owned ? t.buy(typeof p === 'number' ? bp(p) : '') : equipped ? t.remove : t.equip,
    owned,
    equipped,
  };
}

// ---- dialogs (12-P*, 12-E*) ---------------------------------------------------------------------
export type DialogCopy = { title: string; metric: string; body: string; footnote: string };
const shortName = (id: AccessoryId) => {
  const t = tr(messages);
  return { bow: t.shortBow, leaf: t.shortLeaf, star: t.shortStar }[id];
};

/** 12-P1: "Balance: 120 → 60 BP / Growth progress stays at 72%". */
export function confirmPurchase(r: Rewards, id: AccessoryId): DialogCopy {
  const t = tr(messages);
  const p = priceOf(id) as number;
  return {
    title: t.confirmTitle(accessory(id).title),
    metric: bp(p),
    body: t.confirmBody,
    footnote: t.confirmFoot(r.balance, bp(r.balance - p), growthPercent(r)),
  };
}
/** 12-P2 (r = rewards after the purchase). */
export const purchased = (r: Rewards, id: AccessoryId): DialogCopy => {
  const t = tr(messages);
  return {
    title: t.purchaseDone,
    metric: t.isYours(shortName(id)),
    body: t.addedBody(accessory(id).title),
    footnote: t.spentFoot(bp(priceOf(id) as number), bp(r.balance)),
  };
};
/** 12-P3. */
export const notEnough = (r: Rewards, id: AccessoryId): DialogCopy => {
  const t = tr(messages);
  const p = priceOf(id) as number;
  return {
    title: t.fewMore,
    metric: t.toGo(bp(p - r.balance)),
    body: t.costsBody(accessory(id).title, bp(p), bp(r.balance)),
    footnote: t.earnFoot,
  };
};
/** 12-E1 (bought item) / 12-E3 (welcome gift). */
export const equipped = (r: Rewards, id: AccessoryId): DialogCopy => {
  const t = tr(messages);
  const name = accessory(id).title;
  return priceOf(id) === 'gift'
    ? { title: t.lookUpdated, metric: t.equippedMetric(name), body: t.giftBody, footnote: t.giftFoot }
    : { title: t.lookUpdated, metric: t.lovely, body: t.equippedBody(name), footnote: t.freeFoot(bp(r.balance)) };
};
/** 12-E2. */
export const removed = (r: Rewards, id: AccessoryId): DialogCopy => {
  const t = tr(messages);
  return {
    title: t.removedTitle(shortName(id)),
    metric: t.safe,
    body: t.removedBody(shortName(id)),
    footnote: priceOf(id) === 'gift' ? t.giftFoot : t.noRefund(bp(r.balance)),
  };
};

/** Fruit baby week for the companion: profile's gestational age, 12 when unknown. */
export const companionWeek = (age: { weeks: number } | null | undefined) => age?.weeks ?? 12;
