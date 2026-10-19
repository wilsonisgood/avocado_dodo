// Pure rules for the appointment form and details (09-3…09-13, 09-S3/S4). Unit tested in logic.test.ts.
import { reminderLabel, shortDateWithWeekday } from '@/data/labels';
import { toISODate } from '@/data/rules';
import type { Appointment, AppointmentType, ISODate, ISODateTime, Reminder, TimeOfDay } from '@/data/types';

export type Draft = {
  type: AppointmentType;
  name: string;
  date: ISODate | '';
  time: TimeOfDay | '';
  location: string;
  reminder: Reminder;
  notes: string;
};

export const emptyDraft = (date: ISODate | '' = ''): Draft => ({ type: 'prenatal', name: '', date, time: '', location: '', reminder: { kind: 'none' }, notes: '' });
export const draftOf = (a: Appointment): Draft => ({ type: a.type, name: a.name, date: a.date, time: a.time, location: a.location, reminder: a.reminder, notes: a.notes });

/** `?date=` is only honoured when it is a real YYYY-MM-DD. */
export function parseDateParam(v: string | null): ISODate | '' {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return '';
  return toISODate(new Date(`${v}T12:00:00`)) === v ? v : '';
}

const sameReminder = (a: Reminder, b: Reminder) => JSON.stringify(a) === JSON.stringify(b);
export const isDirty = (draft: Draft, initial: Draft) => (Object.keys(initial) as (keyof Draft)[]).some((k) => (k === 'reminder' ? !sameReminder(draft.reminder, initial.reminder) : draft[k] !== initial[k]));
export const canSave = (d: Draft) => d.name.trim() !== '' && d.date !== '' && d.time !== '';
export const toPayload = (d: Draft) => ({ ...d, name: d.name.trim(), location: d.location.trim(), date: d.date as ISODate, time: d.time as TimeOfDay });

// ---- reminders (09-S3) -------------------------------------------------------------------------
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
  if (r.kind !== 'custom') return reminderLabel(r);
  if (r.minutesBefore === 0) return 'At start time';
  const { amount, unit } = splitMinutes(r.minutesBefore);
  return `${plural(amount, unit.slice(0, -1))} before`;
}
/** 09-S4 sentence: "Remind me 2 hours before the appointment." */
export const customSentence = (amount: number, unit: ReminderUnit) => `Remind me ${plural(amount, unit.slice(0, -1))} before the appointment.`;

// ---- details (09-6…09-13) ----------------------------------------------------------------------
const pad = (n: number) => String(n).padStart(2, '0');
const timeOf = (at: ISODateTime) => {
  const d = new Date(at);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const isPast = (a: Pick<Appointment, 'date' | 'time'>, nowDate: ISODate, nowTime: TimeOfDay) => `${a.date}T${a.time}` < `${nowDate}T${nowTime}`;

export type DetailView = {
  status: 'Upcoming' | 'Done' | 'Not marked complete';
  banner?: string;
  /** Last line of the card. */
  cardLine: string;
  /** Detail of the "Reminder" row. */
  rowDetail: string;
  primaryLabel: 'Mark complete' | 'Mark incomplete';
  /** Mark complete (true) / incomplete (false) when the primary button is pressed. */
  primaryDone: boolean;
};

export function detailView(a: Appointment, nowDate: ISODate, nowTime: TimeOfDay): DetailView {
  if (a.completedAt) {
    const day = toISODate(a.completedAt);
    return {
      status: 'Done',
      banner: 'Marked complete. Take care!',
      cardLine: day > a.date ? 'Completed · Added later' : `Completed · ${shortDateWithWeekday(day).replace(/, \w+$/, '')}, ${timeOf(a.completedAt)}`,
      rowDetail: 'Completed. No more reminders will be sent.',
      primaryLabel: 'Mark incomplete',
      primaryDone: false,
    };
  }
  if (isPast(a, nowDate, nowTime)) {
    const t = 'Past date · Update status anytime';
    return { status: 'Not marked complete', cardLine: t, rowDetail: t, primaryLabel: 'Mark complete', primaryDone: true };
  }
  const label = reminderText(a.reminder);
  const multi = a.reminder.kind === 'preset' && a.reminder.preset === '1d+1h';
  return {
    status: 'Upcoming',
    cardLine: a.reminder.kind === 'none' ? 'No reminder' : `${multi ? 'Reminders' : 'Reminder'}: ${label}`,
    rowDetail: label,
    primaryLabel: 'Mark complete',
    primaryDone: true,
  };
}

/** "Oct 22, Thu · 09:00" */
export const whenText = (a: Pick<Appointment, 'date' | 'time'>) => `${shortDateWithWeekday(a.date)} · ${a.time}`;
