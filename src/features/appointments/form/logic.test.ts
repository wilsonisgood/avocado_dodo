import { describe, expect, it } from 'vitest';
import type { Appointment } from '@/data/types';
import { canSave, customSentence, detailView, emptyDraft, isDirty, isOptionSelected, parseDateParam, reminderText, splitMinutes, toggleReminder } from './logic';

const appt = (p: Partial<Appointment>): Appointment => ({ id: '1', createdAt: '', updatedAt: '', type: 'prenatal', name: 'Prenatal visit', date: '2026-10-22', time: '09:00', location: '', reminder: { kind: 'preset', preset: '1d+1h' }, notes: '', ...p }) as Appointment;

describe('form rules', () => {
  it('needs name, date and time', () => {
    const d = emptyDraft();
    expect(canSave(d)).toBe(false);
    expect(canSave({ ...d, name: ' x ', date: '2026-10-27', time: '08:30' })).toBe(true);
    expect(canSave({ ...d, name: '  ', date: '2026-10-27', time: '08:30' })).toBe(false);
  });
  it('dirty is relative to the initial draft (prefilled date is not a change)', () => {
    const init = emptyDraft('2026-10-27');
    expect(isDirty(init, init)).toBe(false);
    expect(isDirty({ ...init, notes: 'a' }, init)).toBe(true);
    expect(isDirty({ ...init, reminder: { kind: 'custom', minutesBefore: 0 } }, init)).toBe(true);
  });
  it('parses ?date=', () => {
    expect(parseDateParam('2026-10-27')).toBe('2026-10-27');
    expect(parseDateParam('2026-13-40')).toBe('');
    expect(parseDateParam('x')).toBe('');
  });
});

describe('reminders', () => {
  it('combines 1 hour and 1 day, exclusive otherwise', () => {
    let r = toggleReminder({ kind: 'none' }, 'hour');
    expect(r).toEqual({ kind: 'preset', preset: '1h' });
    r = toggleReminder(r, 'day');
    expect(r).toEqual({ kind: 'preset', preset: '1d+1h' });
    r = toggleReminder(r, 'hour');
    expect(r).toEqual({ kind: 'preset', preset: '1d' });
    expect(toggleReminder(r, 'day')).toEqual({ kind: 'none' });
    expect(toggleReminder(r, 'start')).toEqual({ kind: 'custom', minutesBefore: 0 });
    expect(toggleReminder({ kind: 'custom', minutesBefore: 0 }, 'day')).toEqual({ kind: 'preset', preset: '1d' });
    expect(toggleReminder(r, 'none')).toEqual({ kind: 'none' });
  });
  it('marks selected options', () => {
    expect(isOptionSelected({ kind: 'preset', preset: '1d+1h' }, 'hour')).toBe(true);
    expect(isOptionSelected({ kind: 'preset', preset: '1d' }, 'hour')).toBe(false);
    expect(isOptionSelected({ kind: 'custom', minutesBefore: 120 }, 'custom')).toBe(true);
  });
  it('words custom reminders', () => {
    expect(splitMinutes(120)).toEqual({ amount: 2, unit: 'hours' });
    expect(reminderText({ kind: 'custom', minutesBefore: 120 })).toBe('2 hours before');
    expect(reminderText({ kind: 'custom', minutesBefore: 45 })).toBe('45 minutes before');
    expect(reminderText({ kind: 'custom', minutesBefore: 0 })).toBe('At start time');
    expect(customSentence(2, 'hours')).toBe('Remind me 2 hours before the appointment.');
  });
});

describe('details view', () => {
  const now = ['2026-10-19', '12:00'] as const;
  it('09-6 upcoming prenatal', () => {
    const v = detailView(appt({}), ...now);
    expect(v).toMatchObject({ status: 'Upcoming', cardLine: 'Reminders: 1 day & 1 hour before', rowDetail: '1 day & 1 hour before', primaryLabel: 'Mark complete', primaryDone: true });
    expect(v.banner).toBeUndefined();
  });
  it('09-8 single reminder is singular', () => {
    expect(detailView(appt({ reminder: { kind: 'preset', preset: '1d' } }), ...now).cardLine).toBe('Reminder: 1 day before');
  });
  it('09-7 completed on the day', () => {
    const at = new Date(2026, 9, 22, 10, 15).toISOString();
    const v = detailView(appt({ completedAt: at }), '2026-10-22', '11:00');
    expect(v).toMatchObject({ status: 'Done', banner: 'Marked complete. Take care!', cardLine: 'Completed · Oct 22, 10:15', primaryLabel: 'Mark incomplete', primaryDone: false });
  });
  it('09-12 past and incomplete, 09-13 completed later', () => {
    const a = appt({ date: '2026-10-12', time: '14:00' });
    expect(detailView(a, ...now)).toMatchObject({ status: 'Not marked complete', cardLine: 'Past date · Update status anytime', rowDetail: 'Past date · Update status anytime' });
    const later = detailView({ ...a, completedAt: new Date(2026, 9, 19, 9, 0).toISOString() }, ...now);
    expect(later.cardLine).toBe('Completed · Added later');
  });
});
