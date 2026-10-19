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

/** Validators return an error code (the screen translates it); undefined = valid. */
export type FieldError = 'nickname' | 'weeks' | 'days';

export function nicknameError(nickname: string): FieldError | undefined {
  return nickname.trim() ? undefined : 'nickname';
}

/** Whole number within [min, max], or undefined when blank / invalid. */
export function parseIntIn(s: string, min: number, max: number): number | undefined {
  if (!/^\d+$/.test(s.trim())) return undefined;
  const n = Number(s);
  return n >= min && n <= max ? n : undefined;
}

export const weeksError = (s: string): FieldError | undefined => (parseIntIn(s, 1, 42) === undefined ? 'weeks' : undefined);
export const daysError = (s: string): FieldError | undefined => (parseIntIn(s, 0, 6) === undefined ? 'days' : undefined);

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

/** "19900101" or "1990-01-01" -> "1990-01-01"; anything else (or an impossible date) -> undefined. */
export function birthDateFrom(dob: string): string | undefined {
  const m = /^(\d{4})-?(\d{2})-?(\d{2})$/.exec(dob.trim());
  if (!m) return undefined;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  const date = new Date(y, mo - 1, d);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d ? `${m[1]}-${m[2]}-${m[3]}` : undefined;
}

/** Builds the patch for profileService.save. Unconfirmed keeps the entered week as the starting estimate. */
export function toProfilePatch(d: Draft, setOn: string): Pick<Profile, 'nickname' | 'babyCount' | 'babyNames' | 'pregnancy' | 'body' | 'birthDate'> {
  const babyNames = d.babyCount === 'twins' ? [d.names[0].trim(), d.names[1].trim()] : [d.names[0].trim()];
  return {
    nickname: d.nickname.trim(),
    babyCount: d.babyCount,
    babyNames,
    pregnancy: pregnancyFrom(d, setOn),
    birthDate: birthDateFrom(d.dob),
    body: { heightCm: num(d.height), currentWeightKg: num(d.weight), waistCm: num(d.waist), updatedOn: setOn },
  };
}
