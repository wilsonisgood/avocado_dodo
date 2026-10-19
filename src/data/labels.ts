// Display labels shared by several modules (appointments list / details, home). English text is from the
// design; translations in src/i18n/common.ts. `label` is a getter so it follows the active language.
import { common } from '@/i18n/common';
import { fmtDateWeekday } from '@/i18n/format';
import { tr } from '@/i18n';
import { daysBetween } from './rules';
import type { AppointmentType, ISODate } from './types';

const TYPE_KEY = { prenatal: 'typePrenatal', injection: 'typeInjection', bloodTest: 'typeBloodTest', other: 'typeOther' } as const;
export const APPOINTMENT_TYPES: { value: AppointmentType; readonly label: string }[] = (Object.keys(TYPE_KEY) as AppointmentType[]).map((value) => ({
  value,
  get label() {
    return tr(common)[TYPE_KEY[value]];
  },
}));
export const appointmentTypeLabel = (t: AppointmentType) => tr(common)[TYPE_KEY[t]];

/** "Today", "Tomorrow", "In 4 days", "2 days ago" (Nestly/Home/Appointment shows "In 4 days"). */
export function relativeDay(date: ISODate, today: ISODate) {
  const t = tr(common);
  const n = daysBetween(today, date);
  if (n === 0) return t.today;
  if (n === 1) return t.tomorrow;
  if (n === -1) return t.yesterday;
  return n > 0 ? t.inDays(n) : t.daysAgo(-n);
}

/** "Oct 22, Thu" · "10月22日（週四）" (home appointment card, 09 lists). */
export const shortDateWithWeekday = (date: ISODate) => fmtDateWeekday(date);

/** Kept for existing callers; same text as reminderText. */
export { reminderText as reminderLabel } from './reminders';
