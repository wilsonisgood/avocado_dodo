// Display labels shared by several modules (appointments list / details, home). Text is from the design.
import { daysBetween } from './rules';
import type { AppointmentType, ISODate } from './types';

export const APPOINTMENT_TYPES: { value: AppointmentType; label: string }[] = [
  { value: 'prenatal', label: 'Prenatal' },
  { value: 'injection', label: 'Injection' },
  { value: 'bloodTest', label: 'Blood test' },
  { value: 'other', label: 'Other' },
];
export const appointmentTypeLabel = (t: AppointmentType) => APPOINTMENT_TYPES.find((x) => x.value === t)!.label;

/** "Today", "Tomorrow", "In 4 days", "2 days ago" (Nestly/Home/Appointment shows "In 4 days"). */
export function relativeDay(date: ISODate, today: ISODate) {
  const n = daysBetween(today, date);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  return n > 0 ? `In ${n} days` : `${-n} days ago`;
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Oct 22, Thu" (home appointment card, 09 lists). */
export function shortDateWithWeekday(date: ISODate) {
  const [y, m, d] = date.split('-').map(Number);
  return `${MONTH[m - 1]} ${d}, ${WEEKDAY[new Date(y, m - 1, d).getDay()]}`;
}

/** Kept for existing callers; same text as reminderText. */
export { reminderText as reminderLabel } from './reminders';
