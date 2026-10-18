// Pure form logic for onboarding (METHOD §2: testable without UI).
import type { BabyCount, PregnancyBasis, Profile } from '@/data/types';

export type Draft = {
  nickname: string;
  dob: string;
  age: string;
  height: string;
  weight: string;
  waist: string;
  babyCount: BabyCount;
  names: [string, string];
  weeks: string;
  days: string;
};

export const emptyDraft = (): Draft => ({
  nickname: '',
  dob: '',
  age: '',
  height: '',
  weight: '',
  waist: '',
  babyCount: 'one',
  names: ['', ''],
  weeks: '16',
  days: '0',
});

export const NICKNAME_ERROR = 'Please enter a nickname';

export function nicknameError(nickname: string): string | undefined {
  return nickname.trim() ? undefined : NICKNAME_ERROR;
}

/** Whole number within [min, max], or undefined when blank / invalid. */
export function parseIntIn(s: string, min: number, max: number): number | undefined {
  if (!/^\d+$/.test(s.trim())) return undefined;
  const n = Number(s);
  return n >= min && n <= max ? n : undefined;
}

export const weeksError = (s: string) => (parseIntIn(s, 1, 42) === undefined ? 'Enter 1–42' : undefined);
export const daysError = (s: string) => (parseIntIn(s, 0, 6) === undefined ? 'Enter 0–6' : undefined);

export function pregnancyFrom(d: Draft, setOn: string): PregnancyBasis | null {
  const weeks = parseIntIn(d.weeks, 1, 42);
  const days = parseIntIn(d.days, 0, 6);
  if (weeks === undefined || days === undefined) return null;
  return { kind: 'manual', weeks, days, setOn };
}

const num = (s: string) => {
  const n = Number(s);
  return s.trim() && Number.isFinite(n) && n > 0 ? n : undefined;
};

/** Builds the patch for profileService.save. Unconfirmed keeps the entered week as the starting estimate. */
export function toProfilePatch(d: Draft, setOn: string): Pick<Profile, 'nickname' | 'babyCount' | 'babyNames' | 'pregnancy' | 'body'> {
  const babyNames = d.babyCount === 'twins' ? [d.names[0].trim(), d.names[1].trim()] : [d.names[0].trim()];
  return {
    nickname: d.nickname.trim(),
    babyCount: d.babyCount,
    babyNames,
    pregnancy: pregnancyFrom(d, setOn),
    body: { heightCm: num(d.height), currentWeightKg: num(d.weight), waistCm: num(d.waist), updatedOn: setOn },
  };
}
