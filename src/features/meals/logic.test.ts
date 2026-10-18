import { describe, expect, it } from 'vitest';
import { estimateNutrition, formatDate, isDirty, parseMealType, portionFactor, validateFood, validateMeal } from './logic';

const food = (name: string, portion = '') => ({ id: name, name, portion });
const draft = { date: '2026-03-11', time: '18:30', type: 'dinner' as const, loggedFor: 'Me', photoIds: [], foods: [food('Rice', '1 bowl')] };

describe('estimate', () => {
  it('uses the table and portion multiplier', () => {
    expect(estimateNutrition([food('Rice', '1 bowl')])).toEqual({ kcal: 200, proteinG: 4, carbsG: 44 });
    expect(estimateNutrition([food('Rice', '2 bowl')]).kcal).toBe(400);
  });
  it('falls back to defaults and is deterministic', () => {
    const a = estimateNutrition([food('Mystery')]);
    expect(a).toEqual({ kcal: 100, proteinG: 3, carbsG: 14 });
    expect(estimateNutrition([food('Mystery')])).toEqual(a);
  });
  it('treats g/ml against 150 and clamps', () => {
    expect(portionFactor('150 g')).toBe(1);
    expect(portionFactor('9000 g')).toBe(3);
    expect(portionFactor('1 handful')).toBe(1);
  });
});
describe('validation', () => {
  it('requires foods and a valid time', () => {
    expect(validateMeal(draft).ok).toBe(true);
    expect(validateMeal({ ...draft, foods: [] }).errors.foods).toBeTruthy();
    expect(validateMeal({ ...draft, time: '25:00' }).errors.time).toBeTruthy();
  });
  it('requires a food name', () => {
    expect(validateFood('  ')).toBeTruthy();
    expect(validateFood('Rice')).toBeUndefined();
  });
});
describe('helpers', () => {
  it('formats dates, dirty, type', () => {
    expect(formatDate('2026-03-11')).toBe('Mar 11, 2026');
    expect(isDirty(draft, { ...draft })).toBe(false);
    expect(isDirty(draft, { ...draft, time: '12:00' })).toBe(true);
    expect(parseMealType('lunch')).toBe('lunch');
    expect(parseMealType('x')).toBeUndefined();
  });
});
