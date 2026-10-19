import { reminderLabel, shortDateWithWeekday } from '@/data/labels';
import { tr } from '@/i18n';
import { fmtMonthDay, fmtTime } from '@/i18n/format';
import { messages } from '../i18n';
import { toISODate } from '@/data/rules';
import type { Appointment, ISODate, ISODateTime } from '@/data/types';

export type Tab = 'upcoming' | 'past';
export type View = 'list' | 'calendar';
export type ListNotice = { notice: 'deleted' | 'completed'; name: string; type: Appointment['type'] };

/** Past = date before today, or marked complete (09-1, 09-R3). */
export const isPast = (a: Pick<Appointment, 'date' | 'completedAt'>, today: ISODate) => a.date < today || !!a.completedAt;

const key = (a: Appointment) => `${a.date}T${a.time}`;

/** Upcoming ascending, Past newest first (09-R3 lists Oct 22 before Oct 8). */
export function splitAppointments(all: Appointment[], today: ISODate) {
    const upcoming = all.filter((a) => !isPast(a, today)).sort((a, b) => key(a).localeCompare(key(b)));
    const past = all.filter((a) => isPast(a, today)).sort((a, b) => key(b).localeCompare(key(a)));
    return { upcoming, past };
}

export const pluralAppointments = (n: number) => tr(messages).apptCount(n);

/** "October 2026 · 2 appointments": month of the first upcoming appointment, counting those in that month. */
export function upcomingSummary(upcoming: Appointment[], monthName: (d: ISODate) => string) {
    if (upcoming.length === 0) return '';
    const ym = upcoming[0].date.slice(0, 7);
    return `${monthName(upcoming[0].date)} · ${pluralAppointments(upcoming.filter((a) => a.date.startsWith(ym)).length)}`;
}

/** "Completed · Oct 8, 10:45" from a completion timestamp (local time). */
export function completedStamp(at: ISODateTime) {
    return tr(messages).completedAt(fmtMonthDay(toISODate(at)), fmtTime(at));
}

/** Text of a ScheduleCard: status + footer line (09-0 / 09-1). */
export function cardTexts(a: Appointment, today: ISODate) {
    const t = tr(messages);
    const when = `${shortDateWithWeekday(a.date)} · ${a.time}`;
    if (a.completedAt) return { status: t.statusDone, when, footer: completedStamp(a.completedAt) };
    if (a.date < today) return { status: t.statusNotMarked, when, footer: t.pastUpdate };
    const r = a.reminder.kind === 'none' ? t.noReminder : t.remindersLine(reminderLabel(a.reminder), true);
    return { status: t.statusUpcoming, when, footer: r };
}

/** Dates (of the given tab) that get a dot on the calendar. */
export const eventDates = (list: Appointment[]) => new Set(list.map((a) => a.date));

/** Day shown when the calendar opens: the next upcoming day, or the latest past day. */
export const defaultDay = (list: Appointment[], today: ISODate): ISODate => list[0]?.date ?? today;

/** "Oct 22 · 1 appointment", or "Oct 23" for an empty day (09-2 / 09-2c). */
export function dayHeading(date: ISODate, count: number) {
    const base = fmtMonthDay(date);
    return count === 0 ? base : `${base} · ${pluralAppointments(count)}`;
}
