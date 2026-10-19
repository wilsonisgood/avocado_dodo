// Pure domain rules (no storage, no clock) — unit tested in rules.test.ts.
import { tr } from '@/i18n';
import { common } from '@/i18n/common';
import type { Accessory, AccessoryId, ISODate, ISODateTime, PregnancyBasis, Rewards, TaskKey } from './types';

// ---- dates -------------------------------------------------------------------------------------
const pad = (n: number) => String(n).padStart(2, '0');
/** Local calendar date of a Date / ISO timestamp. */
export const toISODate = (d: Date | ISODateTime): ISODate => {
  const x = typeof d === 'string' ? new Date(d) : d;
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};
export const parseISODate = (s: ISODate) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const daysBetween = (from: ISODate, to: ISODate) => Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / 86_400_000);
export const addDays = (d: ISODate, n: number) => {
  const x = parseISODate(d);
  x.setDate(x.getDate() + n);
  return toISODate(x);
};

// ---- pregnancy ---------------------------------------------------------------------------------
/** Gestational age on `today`. Due date = 40w0d. Manual entry advances from the day it was set. */
export function pregnancyAge(basis: PregnancyBasis | null, today: ISODate): { weeks: number; days: number } | null {
  if (!basis) return null;
  const total =
    basis.kind === 'dueDate'
      ? 280 - daysBetween(today, basis.dueDate)
      : basis.weeks * 7 + basis.days + daysBetween(basis.setOn, today);
  const t = Math.max(0, Math.min(total, 42 * 7));
  return { weeks: Math.floor(t / 7), days: t % 7 };
}
export const dueDateFromAge = (weeks: number, days: number, today: ISODate) => addDays(today, 280 - (weeks * 7 + days));

// ---- points, tasks and shop (06 · Task, 12-*) ----------------------------------------------------
export const TASK_POINTS: Record<TaskKey, number> = { meal: 10, mood: 5, checkIn: 5 };
export const DAILY_TASKS: TaskKey[] = ['meal', 'mood', 'checkIn'];

const ACC_KEY = { bow: 'accBow', leaf: 'accLeaf', star: 'accStar' } as const;
const acc = (id: AccessoryId, price: Accessory['price']): Accessory => ({
  id,
  price,
  get title() {
    return tr(common)[ACC_KEY[id]]; // follows the active language
  },
});
export const ACCESSORIES: Accessory[] = [acc('bow', 60), acc('leaf', 'gift'), acc('star', 150)];
export const accessory = (id: AccessoryId) => ACCESSORIES.find((a) => a.id === id)!;

/** Growth progress never drops when spending; 250 lifetime BP = 100% (LEDGER D-growth). */
export const GROWTH_FULL_AT = 250;
export const growthPercent = (r: Rewards) => Math.min(100, Math.round((r.lifetimeEarned / GROWTH_FULL_AT) * 100));

export const initialRewards = (): Rewards => ({
  balance: 0,
  lifetimeEarned: 0,
  claimed: {},
  owned: ['leaf'], // "Welcome gift"
  equipped: null,
  history: [],
});

export const tasksDone = (r: Rewards, day: ISODate) => r.claimed[day] ?? [];

/** Award a daily task once per day; repeat logs and edits earn nothing ("Editing a log gives no extra points"). */
export function claimTask(r: Rewards, task: TaskKey, now: ISODateTime): { rewards: Rewards; awarded: number } {
  const day = toISODate(now);
  if (tasksDone(r, day).includes(task)) return { rewards: r, awarded: 0 };
  const awarded = TASK_POINTS[task];
  return {
    awarded,
    rewards: {
      ...r,
      balance: r.balance + awarded,
      lifetimeEarned: r.lifetimeEarned + awarded,
      claimed: { ...r.claimed, [day]: [...tasksDone(r, day), task] },
      history: [...r.history, { at: now, delta: awarded, reason: `task:${task}` }],
    },
  };
}

export type BuyResult = { ok: true; rewards: Rewards } | { ok: false; reason: 'owned' | 'notEnough' | 'notForSale'; shortBy?: number };
export function buyAccessory(r: Rewards, id: AccessoryId, now: ISODateTime): BuyResult {
  const item = accessory(id);
  if (r.owned.includes(id)) return { ok: false, reason: 'owned' };
  if (item.price === 'gift') return { ok: false, reason: 'notForSale' };
  if (r.balance < item.price) return { ok: false, reason: 'notEnough', shortBy: item.price - r.balance };
  return {
    ok: true,
    rewards: { ...r, balance: r.balance - item.price, owned: [...r.owned, id], history: [...r.history, { at: now, delta: -item.price, reason: `buy:${id}` }] },
  };
}

/** One head accessory at a time; equipping replaces, `null` removes. */
export function equipAccessory(r: Rewards, id: AccessoryId | null): Rewards {
  if (id && !r.owned.includes(id)) throw new Error(`cannot equip ${id}: not owned`);
  return { ...r, equipped: id };
}
