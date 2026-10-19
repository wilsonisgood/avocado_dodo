// Reminder options and labels — one source for appointments (09-S3 / 09-S4) and settings (11-8 defaults).
// The data model stores a single Reminder: "1 hour" + "1 day" combine into the 1d+1h preset, the rest are exclusive.
import { tr } from '@/i18n';
import { common } from '@/i18n/common';
import type { Reminder } from './types';

const PRESET_KEY = { '1h': 'hourBefore', '1d': 'dayBefore', '1d+1h': 'dayAndHourBefore' } as const;

export type ReminderOptionKey = 'none' | 'start' | 'hour' | 'day' | 'custom';
const OPTION_KEY = { none: 'noReminder', start: 'atStartTime', hour: 'hourBefore', day: 'dayBefore', custom: 'customReminder' } as const;
/** `label` is a getter: it follows the active language. */
export const REMINDER_OPTIONS: { key: ReminderOptionKey; readonly label: string }[] = (Object.keys(OPTION_KEY) as ReminderOptionKey[]).map((key) => ({
  key,
  get label() {
    return tr(common)[OPTION_KEY[key]];
  },
}));

export function isOptionSelected(r: Reminder, o: ReminderOptionKey): boolean {
  switch (o) {
    case 'none': return r.kind === 'none';
    case 'start': return r.kind === 'custom' && r.minutesBefore === 0;
    case 'hour': return (r.kind === 'preset' && r.preset !== '1d') || (r.kind === 'custom' && r.minutesBefore === 60);
    case 'day': return (r.kind === 'preset' && r.preset !== '1h') || (r.kind === 'custom' && r.minutesBefore === 1440);
    case 'custom': return r.kind === 'custom' && ![0, 60, 1440].includes(r.minutesBefore);
  }
}

/** The data model keeps one reminder: 1 hour + 1 day combine into a preset, everything else is exclusive. */
export function toggleReminder(r: Reminder, o: ReminderOptionKey): Reminder {
  if (o === 'none') return { kind: 'none' };
  if (o === 'start') return { kind: 'custom', minutesBefore: 0 };
  if (o === 'custom') return r;
  const hour = o === 'hour' ? !isOptionSelected(r, 'hour') : isOptionSelected(r, 'hour');
  const day = o === 'day' ? !isOptionSelected(r, 'day') : isOptionSelected(r, 'day');
  if (hour && day) return { kind: 'preset', preset: '1d+1h' };
  if (hour) return { kind: 'preset', preset: '1h' };
  if (day) return { kind: 'preset', preset: '1d' };
  return { kind: 'none' };
}

export type ReminderUnit = 'minutes' | 'hours' | 'days';
export const UNIT_MINUTES: Record<ReminderUnit, number> = { minutes: 1, hours: 60, days: 1440 };
export const customMinutes = (amount: number, unit: ReminderUnit) => amount * UNIT_MINUTES[unit];
/** Largest unit that divides evenly, for showing a stored custom value. */
export function splitMinutes(total: number): { amount: number; unit: ReminderUnit } {
  if (total > 0 && total % 1440 === 0) return { amount: total / 1440, unit: 'days' };
  if (total > 0 && total % 60 === 0) return { amount: total / 60, unit: 'hours' };
  return { amount: total, unit: 'minutes' };
}
/** "2 hours before" / "At start time" / preset labels, in the active language. */
export function reminderText(r: Reminder): string {
  const t = tr(common);
  if (r.kind === 'none') return t.noReminder;
  if (r.kind === 'preset') return t[PRESET_KEY[r.preset]];
  if (r.minutesBefore === 0) return t.atStartTime;
  const { amount, unit } = splitMinutes(r.minutesBefore);
  return { minutes: t.minutesBefore, hours: t.hoursBefore, days: t.daysBefore }[unit](amount);
}
/** 09-S4 sentence: "Remind me 2 hours before the appointment." */
export const customSentence = (amount: number, unit: ReminderUnit) => tr(common).remindMe(amount, unit);
/** Unit chip labels for the custom reminder (Minutes / Hours / Days). */
export const unitLabel = (unit: ReminderUnit) => tr(common)[({ minutes: 'unitMinutes', hours: 'unitHours', days: 'unitDays' } as const)[unit]];

