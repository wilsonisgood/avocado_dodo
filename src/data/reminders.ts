// Reminder options and labels — one source for appointments (09-S3 / 09-S4) and settings (11-8 defaults).
// The data model stores a single Reminder: "1 hour" + "1 day" combine into the 1d+1h preset, the rest are exclusive.
import type { Reminder } from './types';

const PRESET_LABEL = { '1h': '1 hour before', '1d': '1 day before', '1d+1h': '1 day & 1 hour before' } as const;

export type ReminderOptionKey = 'none' | 'start' | 'hour' | 'day' | 'custom';
export const REMINDER_OPTIONS: { key: ReminderOptionKey; label: string }[] = [
  { key: 'none', label: 'No reminder' },
  { key: 'start', label: 'At start time' },
  { key: 'hour', label: '1 hour before' },
  { key: 'day', label: '1 day before' },
  { key: 'custom', label: 'Custom reminder' },
];

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
const plural = (n: number, unit: string) => `${n} ${n === 1 ? unit : `${unit}s`}`;
/** "2 hours before" / "At start time" / preset labels. */
export function reminderText(r: Reminder): string {
  if (r.kind === 'none') return 'No reminder';
  if (r.kind === 'preset') return PRESET_LABEL[r.preset];
  if (r.minutesBefore === 0) return 'At start time';
  const { amount, unit } = splitMinutes(r.minutesBefore);
  return `${plural(amount, unit.slice(0, -1))} before`;
}
/** 09-S4 sentence: "Remind me 2 hours before the appointment." */
export const customSentence = (amount: number, unit: ReminderUnit) => `Remind me ${plural(amount, unit.slice(0, -1))} before the appointment.`;

