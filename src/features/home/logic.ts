// Pure aggregation for the home screen (METHOD §2: the page only reads data).
import { DAILY_TASKS, toISODate } from '@/data/rules';
import type { Appointment, ISODate, Mood, MoodEntry, MovementSession, Rewards } from '@/data/types';

/** Total "Movement +1" taps on `day`, across finished sessions and the one being recorded. */
export function movementsOn(day: ISODate, sessions: MovementSession[], active?: MovementSession | null): number {
  const all = active && !sessions.some((s) => s.id === active.id) ? [...sessions, active] : sessions;
  return all.filter((s) => toISODate(s.startedAt) === day).reduce((n, s) => n + s.movements.length, 0);
}

/** "2/3 tasks done today" numbers. */
export function taskProgress(rewards: Rewards | undefined, day: ISODate) {
  const done = rewards ? DAILY_TASKS.filter((t) => (rewards.claimed[day] ?? []).includes(t)).length : 0;
  return { done, total: DAILY_TASKS.length };
}

/** First not-completed appointment dated today or later (earliest date, then time). */
export function nextAppointment(list: Appointment[] | undefined, day: ISODate): Appointment | null {
  const upcoming = (list ?? [])
    .filter((a) => !a.completedAt && a.date >= day)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return upcoming[0] ?? null;
}

/** Mood of the latest entry made on `day`, if any. */
export function moodOn(day: ISODate, entries: MoodEntry[] | undefined): Mood | null {
  const latest = (entries ?? []).filter((e) => toISODate(e.at) === day).sort((a, b) => b.at.localeCompare(a.at))[0];
  return latest?.mood ?? null;
}
