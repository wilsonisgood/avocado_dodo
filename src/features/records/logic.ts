import { toISODate } from '@/data/rules';
import type { ISODate, Meal, MealType, MoodEntry, MovementSession } from '@/data/types';

// Pure helpers for the Records summary page (05.Health Record).

/** Demo daily targets taken as fixed from the 05.Health Record design (not medical guidance). */
export const NUTRITION_TARGETS = { kcal: 2200, proteinG: 75, carbsG: 250 } as const;

export type NutritionTotals = { kcal: number; proteinG: number; carbsG: number };

/** Sums only meals whose estimate the user confirmed. */
export function sumConfirmed(meals: Meal[]): NutritionTotals {
  return meals.reduce<NutritionTotals>(
    (t, m) => (m.nutrition?.confirmed ? { kcal: t.kcal + m.nutrition.kcal, proteinG: t.proteinG + m.nutrition.proteinG, carbsG: t.carbsG + m.nutrition.carbsG } : t),
    { kcal: 0, proteinG: 0, carbsG: 0 },
  );
}

/** Progress toward a target, 0..100 (rounded). */
export const progressPct = (value: number, target: number) => (target > 0 ? Math.max(0, Math.min(100, Math.round((value / target) * 100))) : 0);

/** `?date=` → a valid ISO date that is not in the future; anything else gives today. */
export function resolveDate(param: string | null | undefined, today: ISODate): ISODate {
  if (!param || !/^\d{4}-\d{2}-\d{2}$/.test(param)) return today;
  const ok = toISODate(new Date(Number(param.slice(0, 4)), Number(param.slice(5, 7)) - 1, Number(param.slice(8, 10)))) === param;
  return ok && param <= today ? param : today;
}

const LABELS: Record<MealType, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
export const mealTypeLabel = (t: MealType) => LABELS[t];

/** "Breakfast (toast + soy milk)" */
export function mealTitle(m: Meal): string {
  const foods = m.foods.map((f) => f.name).join(' + ');
  return foods ? `${LABELS[m.type]} (${foods})` : LABELS[m.type];
}

/** "08:30 | 350 kcal" or "12:15 | Not estimated" */
export const mealDetail = (m: Meal): string => `${m.time} | ${m.nutrition?.confirmed ? `${Math.round(m.nutrition.kcal)} kcal` : 'Not estimated'}`;

export const MAIN_MEALS: MealType[] = ['breakfast', 'lunch', 'dinner'];

/** Main meals (breakfast/lunch/dinner) with nothing logged yet. */
export const missingMainMeals = (meals: Meal[]): MealType[] => MAIN_MEALS.filter((t) => !meals.some((m) => m.type === t));

/** Meals ordered by time, then by logging order. */
export const sortMeals = (meals: Meal[]): Meal[] => [...meals].sort((a, b) => a.time.localeCompare(b.time));

/** Total movement taps on a local day, across finished sessions plus the active one. */
export function movementCountOn(date: ISODate, sessions: MovementSession[], active?: MovementSession | null): number {
  const all = active ? [...sessions, active] : sessions;
  return all.reduce((n, s) => n + s.movements.filter((t) => toISODate(t) === date).length, 0);
}

/** Mood entries of a local day, oldest first. */
export const moodsOn = (date: ISODate, moods: MoodEntry[]): MoodEntry[] => moods.filter((m) => toISODate(m.at) === date).sort((a, b) => a.at.localeCompare(b.at));

/** "09:30" (local) */
export function clockTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2026-03-11" → "Mar 11, 2026" */
export function dateLabel(iso: ISODate): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
