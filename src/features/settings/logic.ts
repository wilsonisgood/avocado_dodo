import type { NotificationSettings, ReminderKey, TimeOfDay } from '@/data/types';
import { tr } from '@/i18n';
import { weekdayNames } from '@/i18n/format';
import { messages } from './i18n';

export const REMINDER_KEYS: ReminderKey[] = ['mood', 'movement', 'meals', 'weekly', 'appointments'];
export const isReminderKey = (k: string | undefined): k is ReminderKey => REMINDER_KEYS.includes(k as ReminderKey);

/** Subtitle of a reminder row on 11-1: schedule when on, "Off · Time saved as …" when off. */
export function scheduleText(n: NotificationSettings, key: ReminderKey): string {
  const t = tr(messages);
  switch (key) {
    case 'mood':
      return n.mood.on ? t.dailyAt(n.mood.time) : t.offTimeSaved(n.mood.time);
    case 'movement':
      return n.movement.on ? t.dailyAt(n.movement.time) : t.offTimeSaved(n.movement.time);
    case 'meals': {
      // Only the meals switched on in 11-6 (all three when none are, so the saved times stay visible).
      const mt = n.meals.times;
      const on = (['breakfast', 'lunch', 'dinner'] as const).filter((m) => n.meals.enabled[m]);
      const times = (on.length ? on : (['breakfast', 'lunch', 'dinner'] as const)).map((m) => mt[m]).join('／');
      return n.meals.on && on.length ? times : t.offTimesSaved(times);
    }
    case 'weekly':
      return n.weekly.on ? t.weeklyAt(weekdayNames('long')[n.weekly.weekday] ?? weekdayNames('long')[0], n.weekly.time) : t.offTimeSaved(n.weekly.time);
    case 'appointments':
      return n.appointments.on ? t.atEachAppointment : t.off;
  }
}

/** The master row's subtitle (11-1 / 11-2). */
export const masterText = (all: boolean) => (all ? tr(messages).on : tr(messages).offKept);

/** Row state for a reminder's own toggle: "on" requires the master switch to be on too. */
export const isOn = (n: NotificationSettings, key: ReminderKey) => (key === 'meals' ? n.meals.on : n[key].on);

export function setOn(n: NotificationSettings, key: ReminderKey, on: boolean): NotificationSettings {
  return { ...n, [key]: { ...n[key], on } } as NotificationSettings;
}

/** Device line under the master row (11-S1 is reached through it). */
export const permissionLine = (p: NotificationSettings['devicePermission']) => (p === 'granted' ? tr(messages).permAllowed : tr(messages).permOff);

/** 11-3 / 11-3b: the confirmation shown after saving, depending on what changed. */
export function savedNotice(prev: NotificationSettings, next: NotificationSettings): string {
  if (prev.all && !next.all) return tr(messages).savedAllOff;
  return tr(messages).savedGeneric;
}

export const isDirty = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);

/** 11-S2 summary pieces. */
export const pad2 = (n: number) => String(n).padStart(2, '0');
export const isTime = (t: TimeOfDay) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

