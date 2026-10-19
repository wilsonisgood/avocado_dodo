// Pure rules for the appointment form and details (09-3…09-13, 09-S3/S4). Unit tested in logic.test.ts.
import { shortDateWithWeekday } from '@/data/labels';
import { reminderText } from '@/data/reminders';
import { toISODate } from '@/data/rules';
import { tr } from '@/i18n';
import { fmtMonthDay, fmtTime } from '@/i18n/format';
import { messages } from '../i18n';
import type { Appointment, AppointmentType, ISODate, Reminder, TimeOfDay } from '@/data/types';

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

// ---- reminders (09-S3) — shared with settings 11-8, lives in @/data/reminders -----------------------
export {
  REMINDER_OPTIONS,
  isOptionSelected,
  toggleReminder,
  UNIT_MINUTES,
  customMinutes,
  splitMinutes,
  reminderText,
  customSentence,
  type ReminderOptionKey,
  type ReminderUnit,
} from '@/data/reminders';

// ---- details (09-6…09-13) ----------------------------------------------------------------------
export const isPast = (a: Pick<Appointment, 'date' | 'time'>, nowDate: ISODate, nowTime: TimeOfDay) => `${a.date}T${a.time}` < `${nowDate}T${nowTime}`;

export type DetailView = {
  status: string;
  banner?: string;
  /** Last line of the card. */
  cardLine: string;
  /** Detail of the "Reminder" row. */
  rowDetail: string;
  primaryLabel: string;
  /** Mark complete (true) / incomplete (false) when the primary button is pressed. */
  primaryDone: boolean;
};

export function detailView(a: Appointment, nowDate: ISODate, nowTime: TimeOfDay): DetailView {
  const t = tr(messages);
  if (a.completedAt) {
    const day = toISODate(a.completedAt);
    return {
      status: t.statusDone,
      banner: t.markedComplete,
      cardLine: day > a.date ? t.completedLater : t.completedAt(fmtMonthDay(day), fmtTime(a.completedAt)),
      rowDetail: t.completedRow,
      primaryLabel: t.markIncomplete,
      primaryDone: false,
    };
  }
  if (isPast(a, nowDate, nowTime)) {
    return { status: t.statusNotMarked, cardLine: t.pastUpdate, rowDetail: t.pastUpdate, primaryLabel: t.markComplete, primaryDone: true };
  }
  const label = reminderText(a.reminder);
  const multi = a.reminder.kind === 'preset' && a.reminder.preset === '1d+1h';
  return {
    status: t.statusUpcoming,
    cardLine: a.reminder.kind === 'none' ? t.noReminder : t.remindersLine(label, multi),
    rowDetail: label,
    primaryLabel: t.markComplete,
    primaryDone: true,
  };
}

/** "Oct 22, Thu · 09:00" */
export const whenText = (a: Pick<Appointment, 'date' | 'time'>) => `${shortDateWithWeekday(a.date)} · ${a.time}`;
