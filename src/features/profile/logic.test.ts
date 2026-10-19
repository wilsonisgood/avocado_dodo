import { describe, expect, it } from 'vitest';
import {
  bodyErrors, bodyToForm, bodyToPatch, bodyValid, nicknameError, pregnancyErrors, pregnancyToForm, pregnancyToPatch, profileDue, slashDate,
} from './logic';

const today = '2026-10-18';

describe('nickname', () => {
  it('accepts 1–20 characters', () => {
    expect(nicknameError('a')).toBeUndefined();
    expect(nicknameError('a'.repeat(20))).toBeUndefined();
  });
  it('rejects empty, blank and too long', () => {
    expect(nicknameError('')).toBeTruthy();
    expect(nicknameError('   ')).toBeTruthy();
    expect(nicknameError('a'.repeat(21))).toBeTruthy();
  });
});

describe('pregnancy ↔ form', () => {
  it('due date basis round-trips', () => {
    const f = pregnancyToForm({ babyCount: 'one', pregnancy: { kind: 'dueDate', dueDate: '2027-06-27' } }, today);
    expect(f).toMatchObject({ source: 'dueDate', dueDate: '2027-06-27', weeks: '4', days: '0' });
    expect(pregnancyToPatch(f, ['Bean'], today).pregnancy).toEqual({ kind: 'dueDate', dueDate: '2027-06-27' });
  });
  it('manual basis shows the implied due date and anchors on today', () => {
    const f = pregnancyToForm({ babyCount: 'twins', pregnancy: { kind: 'manual', weeks: 4, days: 0, setOn: today } }, today);
    expect(f).toMatchObject({ source: 'manual', dueDate: '2027-06-27', weeks: '4', days: '0' });
    expect(pregnancyToPatch({ ...f, weeks: '10', days: '3' }, [], today).pregnancy).toEqual({ kind: 'manual', weeks: 10, days: 3, setOn: today });
  });
  it('null pregnancy gives an empty form', () => {
    expect(pregnancyToForm({ babyCount: 'one', pregnancy: null }, today)).toMatchObject({ dueDate: '', weeks: '', days: '' });
  });
  it('baby names follow the count', () => {
    const f = pregnancyToForm({ babyCount: 'one', pregnancy: null }, today);
    expect(pregnancyToPatch({ ...f, babyCount: 'twins' }, ['A'], today).babyNames).toEqual(['A', '']);
    expect(pregnancyToPatch({ ...f, babyCount: 'one' }, ['A', 'B'], today).babyNames).toEqual(['A']);
  });
  it('validates days 0–6 and weeks 0–42', () => {
    const base = { babyCount: 'one' as const, source: 'manual' as const, dueDate: '' as const };
    expect(pregnancyErrors({ ...base, weeks: '12', days: '6' })).toEqual({ weeks: undefined, days: undefined });
    expect(pregnancyErrors({ ...base, weeks: '43', days: '7' }).days).toBeTruthy();
    expect(pregnancyErrors({ ...base, weeks: '43', days: '0' }).weeks).toBeTruthy();
    expect(pregnancyErrors({ ...base, weeks: '', days: '0' }).weeks).toBeTruthy();
    expect(pregnancyErrors({ ...base, source: 'dueDate', weeks: '', days: '' }).dueDate).toBeTruthy();
  });
  it('profileDue derives from manual', () => {
    expect(profileDue({ pregnancy: { kind: 'manual', weeks: 4, days: 0, setOn: today } }, today)).toBe('2027-06-27');
    expect(slashDate('2027-06-27')).toBe('2027/06/27');
  });
});

describe('body', () => {
  it('requires height and current weight, optional others', () => {
    expect(bodyValid({ height: '168', pre: '', current: '55', waist: '' })).toBe(true);
    expect(bodyErrors({ height: '', pre: '', current: '55', waist: '' }).height).toBeTruthy();
    expect(bodyErrors({ height: '168', pre: 'x', current: '55', waist: '' }).pre).toBeTruthy();
  });
  it('converts both ways and stamps the date', () => {
    const f = bodyToForm({ heightCm: 168, currentWeightKg: 55.5 });
    expect(f).toEqual({ height: '168', pre: '', current: '55.5', waist: '' });
    expect(bodyToPatch(f, today)).toEqual({ heightCm: 168, prePregnancyWeightKg: undefined, currentWeightKg: 55.5, waistCm: undefined, updatedOn: today });
  });
});
