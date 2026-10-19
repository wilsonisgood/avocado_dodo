import type { NotificationSettings, ReminderKey, TimeOfDay } from '@/data/types';

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const REMINDER_KEYS: ReminderKey[] = ['mood', 'movement', 'meals', 'weekly', 'appointments'];
export const isReminderKey = (k: string | undefined): k is ReminderKey => REMINDER_KEYS.includes(k as ReminderKey);

/** Subtitle of a reminder row on 11-1: schedule when on, "Off · Time saved as …" when off. */
export function scheduleText(n: NotificationSettings, key: ReminderKey): string {
  switch (key) {
    case 'mood':
      return n.mood.on ? `Daily at ${n.mood.time}` : `Off · Time saved as ${n.mood.time}`;
    case 'movement':
      return n.movement.on ? `Daily at ${n.movement.time}` : `Off · Time saved as ${n.movement.time}`;
    case 'meals': {
      // Only the meals switched on in 11-6 (all three when none are, so the saved times stay visible).
      const t = n.meals.times;
      const on = (['breakfast', 'lunch', 'dinner'] as const).filter((m) => n.meals.enabled[m]);
      const times = (on.length ? on : (['breakfast', 'lunch', 'dinner'] as const)).map((m) => t[m]).join('／');
      return n.meals.on && on.length ? times : `Off · Times saved as ${times}`;
    }
    case 'weekly':
      return n.weekly.on ? `${WEEKDAYS_LONG[n.weekly.weekday] ?? 'Sundays'} at ${n.weekly.time}` : `Off · Time saved as ${n.weekly.time}`;
    case 'appointments':
      return n.appointments.on ? "At each appointment's set time" : 'Off';
  }
}
const WEEKDAYS_LONG = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

/** The master row's subtitle (11-1 / 11-2). */
export const masterText = (all: boolean) => (all ? 'On' : 'Off · Your saved times are kept');

/** Row state for a reminder's own toggle: "on" requires the master switch to be on too. */
export const isOn = (n: NotificationSettings, key: ReminderKey) => (key === 'meals' ? n.meals.on : n[key].on);

export function setOn(n: NotificationSettings, key: ReminderKey, on: boolean): NotificationSettings {
  return { ...n, [key]: { ...n[key], on } } as NotificationSettings;
}

/** Device line under the master row (11-S1 is reached through it). */
export const permissionLine = (p: NotificationSettings['devicePermission']) =>
  `${p === 'granted' ? 'Device notifications allowed' : 'Device notifications off'} · View permissions`;

/** 11-3 / 11-3b: the confirmation shown after saving, depending on what changed. */
export function savedNotice(prev: NotificationSettings, next: NotificationSettings): string {
  if (prev.all && !next.all) return 'Saved: All reminders off';
  return 'Notification settings saved';
}

export const isDirty = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);

/** 11-S2 summary pieces. */
export const pad2 = (n: number) => String(n).padStart(2, '0');
export const isTime = (t: TimeOfDay) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

