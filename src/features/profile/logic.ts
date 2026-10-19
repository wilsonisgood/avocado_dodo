import { dueDateFromAge, pregnancyAge } from '@/data/rules';
import type { BabyCount, ISODate, Profile } from '@/data/types';

export const NICKNAME_MAX = 20;
export const MAX_WEEKS = 42;

export type WeekSource = 'dueDate' | 'manual';
/** Editable form value for 10-2 / 10-3 (weeks and days stay strings while typing). */
export type PregnancyForm = { babyCount: BabyCount; source: WeekSource; dueDate: ISODate | ''; weeks: string; days: string };

/** Nickname rule of 10-1 / 10-S2: 1–20 characters after trimming. */
export const nicknameError = (v: string) => {
  const n = v.trim().length;
  return n >= 1 && n <= NICKNAME_MAX ? undefined : 'Enter a nickname with 1–20 characters';
};

/** Profile → form. A manual basis shows the due date it implies today (it is not stored). */
export function pregnancyToForm(p: Pick<Profile, 'babyCount' | 'pregnancy'>, today: ISODate): PregnancyForm {
  const age = pregnancyAge(p.pregnancy, today);
  const source: WeekSource = p.pregnancy?.kind === 'manual' ? 'manual' : 'dueDate';
  const dueDate = p.pregnancy?.kind === 'dueDate' ? p.pregnancy.dueDate : age ? dueDateFromAge(age.weeks, age.days, today) : '';
  return { babyCount: p.babyCount, source, dueDate, weeks: age ? String(age.weeks) : '', days: age ? String(age.days) : '' };
}

const toInt = (s: string) => (/^\d{1,2}$/.test(s.trim()) ? Number.parseInt(s, 10) : NaN);

export function pregnancyErrors(f: PregnancyForm): { dueDate?: string; weeks?: string; days?: string } {
  if (f.source === 'dueDate') return f.dueDate ? {} : { dueDate: 'Choose a due date' };
  const w = toInt(f.weeks);
  const d = toInt(f.days);
  return {
    weeks: w >= 0 && w <= MAX_WEEKS ? undefined : `Enter 0–${MAX_WEEKS}`,
    days: d >= 0 && d <= 6 ? undefined : 'Enter 0–6',
  };
}
export const pregnancyValid = (f: PregnancyForm) => Object.values(pregnancyErrors(f)).every((e) => !e);

/** Names follow the baby count (two for twins, one otherwise); existing names are kept. */
export const namesFor = (count: BabyCount, names: string[]) => (count === 'twins' ? [names[0] ?? '', names[1] ?? ''] : [names[0] ?? '']);

/** Form → Profile patch. Manual weeks are anchored on `today`. */
export function pregnancyToPatch(f: PregnancyForm, names: string[], today: ISODate): Pick<Profile, 'babyCount' | 'babyNames' | 'pregnancy'> {
  return {
    babyCount: f.babyCount,
    babyNames: namesFor(f.babyCount, names),
    pregnancy:
      f.source === 'dueDate'
        ? { kind: 'dueDate', dueDate: f.dueDate as ISODate }
        : { kind: 'manual', weeks: toInt(f.weeks), days: toInt(f.days), setOn: today },
  };
}

export const isSamePregnancy = (a: PregnancyForm, b: PregnancyForm) =>
  a.babyCount === b.babyCount &&
  a.source === b.source &&
  (a.source === 'dueDate' ? a.dueDate === b.dueDate : a.weeks === b.weeks && a.days === b.days);

// ---- body ---------------------------------------------------------------------------------------
export type BodyForm = { height: string; pre: string; current: string; waist: string };
const str = (n?: number) => (n === undefined ? '' : String(n));
export const bodyToForm = (b: Profile['body']): BodyForm => ({ height: str(b.heightCm), pre: str(b.prePregnancyWeightKg), current: str(b.currentWeightKg), waist: str(b.waistCm) });

const num = (s: string) => {
  const t = s.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? n : NaN;
};
/** Height and current weight are required; pre-pregnancy weight and waist are optional. */
export function bodyErrors(f: BodyForm): Partial<Record<keyof BodyForm, string>> {
  const bad = (v: string, required: boolean) => {
    const n = num(v);
    return Number.isNaN(n) || (required && n === undefined) ? 'Enter a number' : undefined;
  };
  return { height: bad(f.height, true), pre: bad(f.pre, false), current: bad(f.current, true), waist: bad(f.waist, false) };
}
export const bodyValid = (f: BodyForm) => Object.values(bodyErrors(f)).every((e) => !e);
export const bodyToPatch = (f: BodyForm, today: ISODate): Profile['body'] => ({
  heightCm: num(f.height),
  prePregnancyWeightKg: num(f.pre),
  currentWeightKg: num(f.current),
  waistCm: num(f.waist),
  updatedOn: today,
});
export const isSameBody = (a: BodyForm, b: BodyForm) => a.height === b.height && a.pre === b.pre && a.current === b.current && a.waist === b.waist;

// ---- display ------------------------------------------------------------------------------------
export const babyLabel = (c: BabyCount) => (c === 'twins' ? 'Twins' : c === 'one' ? 'One baby' : 'Not sure yet');
export const ageLabel = (age: { weeks: number; days: number } | null) => (age ? `${age.weeks} weeks ${age.days} days` : '—');
/** 2027/06/27 as on the 07.Personal summary. */
export const slashDate = (d: ISODate) => d.replaceAll('-', '/');
export const profileDue = (p: Pick<Profile, 'pregnancy'>, today: ISODate): ISODate | undefined => {
  const age = pregnancyAge(p.pregnancy, today);
  return p.pregnancy?.kind === 'dueDate' ? p.pregnancy.dueDate : age ? dueDateFromAge(age.weeks, age.days, today) : undefined;
};
export const cm = (n?: number) => (n === undefined ? '—' : `${n} cm`);
export const kg = (n?: number) => (n === undefined ? '—' : `${n} kg`);

