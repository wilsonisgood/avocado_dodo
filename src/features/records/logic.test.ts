import { describe, expect, it } from 'vitest';
import type { Meal, MoodEntry, MovementSession } from '@/data/types';
import { dateLabel, mealDetail, mealTitle, missingMainMeals, moodsOn, movementCountOn, progressPct, resolveDate, sortMeals, sumConfirmed } from './logic';

const meal = (o: Partial<Meal>): Meal =>
  ({ id: 'm', createdAt: '', updatedAt: '', date: '2026-03-11', time: '08:30', type: 'breakfast', loggedFor: '', photoIds: [], foods: [{ id: 'f', name: 'toast', portion: '' }, { id: 'g', name: 'soy milk', portion: '' }], ...o }) as Meal;

describe('records logic', () => {
  it('sums only confirmed nutrition', () => {
    const t = sumConfirmed([
      meal({ nutrition: { kcal: 350, proteinG: 10, carbsG: 50, confirmed: true } }),
      meal({ nutrition: { kcal: 500, proteinG: 20, carbsG: 60, confirmed: false } }),
      meal({}),
    ]);
    expect(t).toEqual({ kcal: 350, proteinG: 10, carbsG: 50 });
  });
  it('clamps progress', () => {
    expect(progressPct(1250, 2200)).toBe(57);
    expect(progressPct(3000, 2200)).toBe(100);
    expect(progressPct(-1, 10)).toBe(0);
  });
  it('resolves the date param', () => {
    expect(resolveDate(null, '2026-03-11')).toBe('2026-03-11');
    expect(resolveDate('2026-03-10', '2026-03-11')).toBe('2026-03-10');
    expect(resolveDate('2026-03-12', '2026-03-11')).toBe('2026-03-11');
    expect(resolveDate('2026-02-30', '2026-03-11')).toBe('2026-03-11');
    expect(resolveDate('abc', '2026-03-11')).toBe('2026-03-11');
  });
  it('formats meals', () => {
    expect(mealTitle(meal({}))).toBe('Breakfast (toast + soy milk)');
    expect(mealDetail(meal({ nutrition: { kcal: 350, proteinG: 1, carbsG: 1, confirmed: true } }))).toBe('08:30 | 350 kcal');
    expect(mealDetail(meal({ time: '12:15' }))).toBe('12:15 | Not estimated');
  });
  it('finds missing main meals and sorts by time', () => {
    expect(missingMainMeals([meal({ type: 'lunch' })])).toEqual(['breakfast', 'dinner']);
    expect(sortMeals([meal({ time: '12:00' }), meal({ time: '08:00' })]).map((m) => m.time)).toEqual(['08:00', '12:00']);
  });
  it('counts movements on a local day', () => {
    const at = (h: number, d = 11) => new Date(2026, 2, d, h).toISOString();
    const s = (movements: string[]) => ({ movements }) as MovementSession;
    expect(movementCountOn('2026-03-11', [s([at(9), at(10), at(9, 10)])], s([at(11)]))).toBe(3);
  });
  it('filters moods by day', () => {
    const e = (id: string, at: string) => ({ id, at, mood: 'happy', note: '' }) as MoodEntry;
    const r = moodsOn('2026-03-11', [e('b', new Date(2026, 2, 11, 14).toISOString()), e('a', new Date(2026, 2, 11, 9).toISOString()), e('c', new Date(2026, 2, 10, 9).toISOString())]);
    expect(r.map((x) => x.id)).toEqual(['a', 'b']);
  });
  it('labels dates', () => expect(dateLabel('2026-03-11')).toBe('Mar 11, 2026'));
});
