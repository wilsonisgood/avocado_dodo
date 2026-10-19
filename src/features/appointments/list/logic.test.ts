import { describe, expect, it } from 'vitest';
import type { Appointment } from '@/data/types';
import { cardTexts, dayHeading, defaultDay, isPast, splitAppointments, upcomingSummary } from './logic';

const ap = (id: string, date: string, extra: Partial<Appointment> = {}): Appointment =>
    ({ id, type: 'prenatal', name: 'Prenatal visit', date, time: '09:00', location: 'City Hospital', reminder: { kind: 'preset', preset: '1d+1h' }, notes: '', ...extra }) as Appointment;
const TODAY = '2026-10-18';

describe('appointments list logic', () => {
    it('isPast: earlier date or completed', () => {
        expect(isPast(ap('a', '2026-10-17'), TODAY)).toBe(true);
        expect(isPast(ap('a', '2026-10-18'), TODAY)).toBe(false);
        expect(isPast(ap('a', '2026-10-25', { completedAt: '2026-10-18T09:00:00' }), TODAY)).toBe(true);
    });
    it('splits and orders', () => {
        const { upcoming, past } = splitAppointments([ap('c', '2026-10-27'), ap('p1', '2026-10-08'), ap('b', '2026-10-22'), ap('p2', '2026-10-12')], TODAY);
        expect(upcoming.map((a) => a.id)).toEqual(['b', 'c']);
        expect(past.map((a) => a.id)).toEqual(['p2', 'p1']);
    });
    it('summary and headings', () => {
        expect(upcomingSummary([ap('a', '2026-10-22'), ap('b', '2026-10-27'), ap('c', '2026-11-02')], () => 'October 2026')).toBe('October 2026 · 2 appointments');
        expect(upcomingSummary([], () => 'x')).toBe('');
        expect(dayHeading('2026-10-22', 1)).toBe('Oct 22 · 1 appointment');
        expect(dayHeading('2026-10-23', 0)).toBe('Oct 23');
    });
    it('card texts', () => {
        expect(cardTexts(ap('a', '2026-10-22'), TODAY)).toEqual({ status: 'Upcoming', when: 'Oct 22, Thu · 09:00', footer: 'Reminders: 1 day & 1 hour before' });
        expect(cardTexts(ap('a', '2026-10-12'), TODAY).status).toBe('Not marked complete');
        expect(cardTexts(ap('a', '2026-10-08', { completedAt: '2026-10-08T10:45:00' }), TODAY)).toMatchObject({ status: 'Done', footer: 'Completed · Oct 8, 10:45' });
    });
    it('defaultDay', () => {
        expect(defaultDay([], TODAY)).toBe(TODAY);
        expect(defaultDay([ap('a', '2026-10-22')], TODAY)).toBe('2026-10-22');
    });
});
