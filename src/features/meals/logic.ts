import type { FoodItem, Meal, MealType, Nutrition } from '@/data/types';

export const MEAL_TYPES: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Breakfast' },
  { type: 'lunch', label: 'Lunch' },
  { type: 'dinner', label: 'Dinner' },
  { type: 'snack', label: 'Snack' },
];
export const typeLabel = (t: MealType) => MEAL_TYPES.find((m) => m.type === t)!.label;
export const parseMealType = (s: string | null): MealType | undefined => MEAL_TYPES.find((m) => m.type === s)?.type;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** '2026-03-11' → 'Mar 11, 2026' */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export type MealDraft = Pick<Meal, 'date' | 'time' | 'type' | 'loggedFor' | 'photoIds' | 'foods'>;

/** A meal can be saved once it has a valid time and at least one food. */
export function validateMeal(d: MealDraft): { ok: boolean; errors: { time?: string; foods?: string } } {
  const errors: { time?: string; foods?: string } = {};
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.time)) errors.time = 'Enter a time like 18:30';
  if (d.foods.length === 0) errors.foods = 'Add a food to save this meal.';
  return { ok: Object.keys(errors).length === 0, errors };
}

/** A food needs a name; the portion is optional. */
export function validateFood(name: string): string | undefined {
  return name.trim() ? undefined : 'A name is required.';
}

export const isDirty = (a: MealDraft, b: MealDraft) => JSON.stringify(a) !== JSON.stringify(b);

// ---- sample nutrition estimate (demo values only, no external API) ------------------------------------
const TABLE: { match: RegExp; per: Nutrition }[] = [
  { match: /rice|飯/i, per: { kcal: 200, proteinG: 4, carbsG: 44 } },
  { match: /soup|湯/i, per: { kcal: 60, proteinG: 3, carbsG: 8 } },
  { match: /broccoli|vegetable|salad|菜|花椰/i, per: { kcal: 50, proteinG: 4, carbsG: 8 } },
  { match: /egg|蛋/i, per: { kcal: 90, proteinG: 7, carbsG: 1 } },
  { match: /chicken|fish|beef|pork|meat|雞|魚|肉/i, per: { kcal: 180, proteinG: 22, carbsG: 2 } },
  { match: /bread|toast|noodle|pasta|麵|包/i, per: { kcal: 220, proteinG: 7, carbsG: 40 } },
  { match: /fruit|apple|banana|orange|果|蕉/i, per: { kcal: 80, proteinG: 1, carbsG: 20 } },
];
const DEFAULT_PER: Nutrition = { kcal: 100, proteinG: 3, carbsG: 14 };

/** Portion text → multiplier: a leading number scales it (150 g ≈ 1x per 150, otherwise the count); none = 1. */
export function portionFactor(portion: string): number {
  const m = portion.match(/(\d+(?:\.\d+)?)\s*(g|ml|公克|毫升)?/i);
  if (!m) return 1;
  const n = parseFloat(m[1]);
  if (!(n > 0)) return 1;
  const f = m[2] ? n / 150 : n;
  return Math.min(3, Math.max(0.25, f));
}

/** Sample estimate: name lookup × portion factor, summed and rounded. */
export function estimateNutrition(foods: FoodItem[]): Nutrition {
  const sum = foods.reduce(
    (acc, f) => {
      const per = TABLE.find((t) => t.match.test(f.name))?.per ?? DEFAULT_PER;
      const k = portionFactor(f.portion);
      return { kcal: acc.kcal + per.kcal * k, proteinG: acc.proteinG + per.proteinG * k, carbsG: acc.carbsG + per.carbsG * k };
    },
    { kcal: 0, proteinG: 0, carbsG: 0 },
  );
  return { kcal: Math.round(sum.kcal), proteinG: Math.round(sum.proteinG), carbsG: Math.round(sum.carbsG) };
}
