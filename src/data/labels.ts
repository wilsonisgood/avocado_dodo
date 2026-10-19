// Display labels shared by several modules (appointments list / details, home). Text is from the design.
import { daysBetween } from './rules';
import type { AppointmentType, ISODate, Reminder } from './types';

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

export function reminderLabel(r: Reminder) {
  if (r.kind === 'none') return 'No reminder';
  if (r.kind === 'custom') return r.minutesBefore % 1440 === 0 ? `${r.minutesBefore / 1440} day(s) before` : `${r.minutesBefore} min before`;
  return { '1h': '1 hour before', '1d': '1 day before', '1d+1h': '1 day & 1 hour before' }[r.preset];
}
