import { describe, expect, it } from 'vitest';
import type { Appointment, MoodEntry, MovementSession, Rewards } from '@/data/types';
import { moodOn, movementsOn, nextAppointment, taskProgress } from './logic';

const base = { id: 'x', createdAt: '', updatedAt: '' };
const sess = (id: string, startedAt: string, n: number): MovementSession => ({ ...base, id, startedAt, movements: Array(n).fill(startedAt), pausedMs: 0, notes: '' });
const appt = (id: string, date: string, time: string, completedAt?: string): Appointment =>
  ({ ...base, id, type: 'prenatal', name: id, date, time, location: '', reminder: { kind: 'none' }, notes: '', completedAt });

describe('movementsOn', () => {
  it('sums today only and includes the active session once', () => {
    const a = sess('a', '2026-10-19T08:00:00', 2);
    const old = sess('b', '2026-10-18T08:00:00', 5);
    const act = sess('c', '2026-10-19T10:00:00', 3);
    expect(movementsOn('2026-10-19', [a, old], act)).toBe(5);
    expect(movementsOn('2026-10-19', [a, act], act)).toBe(5);
    expect(movementsOn('2026-10-19', [], null)).toBe(0);
  });
});

describe('taskProgress', () => {
  it('counts claimed daily tasks', () => {
    const r = { claimed: { '2026-10-19': ['meal', 'checkIn'], '2026-10-18': ['mood'] } } as unknown as Rewards;
    expect(taskProgress(r, '2026-10-19')).toEqual({ done: 2, total: 3 });
    expect(taskProgress(undefined, '2026-10-19')).toEqual({ done: 0, total: 3 });
  });
});

describe('nextAppointment', () => {
  it('skips completed and past, picks earliest', () => {
    const list = [appt('past', '2026-10-18', '09:00'), appt('done', '2026-10-20', '09:00', 'x'), appt('late', '2026-10-25', '09:00'), appt('soon', '2026-10-22', '15:00'), appt('soon-am', '2026-10-22', '09:00')];
    expect(nextAppointment(list, '2026-10-19')?.id).toBe('soon-am');
    expect(nextAppointment(list.slice(0, 2), '2026-10-19')).toBeNull();
    expect(nextAppointment(undefined, '2026-10-19')).toBeNull();
  });
  it('includes today', () => expect(nextAppointment([appt('t', '2026-10-19', '09:00')], '2026-10-19')?.id).toBe('t'));
});

describe('moodOn', () => {
  it('returns the latest of the day', () => {
    const e = (at: string, mood: MoodEntry['mood']): MoodEntry => ({ ...base, at, mood, note: '' });
    expect(moodOn('2026-10-19', [e('2026-10-19T08:00:00', 'happy'), e('2026-10-19T12:00:00', 'sad'), e('2026-10-18T20:00:00', 'calm')])).toBe('sad');
    expect(moodOn('2026-10-19', [])).toBeNull();
  });
});
