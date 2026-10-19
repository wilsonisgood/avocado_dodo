import { describe, expect, it } from 'vitest';
import { birthDateFrom, emptyDraft, nicknameError, parseIntIn, toProfilePatch, daysError, weeksError } from './logic';

describe('onboarding logic', () => {
  it('rejects blank nickname', () => {
    expect(nicknameError('   ')).toBeTruthy();
    expect(nicknameError(' Amy ')).toBeUndefined();
  });
  it('validates weeks and days', () => {
    expect(parseIntIn('7', 0, 6)).toBeUndefined();
    expect(parseIntIn('abc', 0, 6)).toBeUndefined();
    expect(weeksError('0')).toBeTruthy();
    expect(weeksError('16')).toBeUndefined();
    expect(daysError('6')).toBeUndefined();
  });
  it('builds a one-baby patch', () => {
    const d = { ...emptyDraft(), nickname: ' Amy ', names: [' Bean ', 'x'] as [string, string], weeks: '20', days: '3', height: '160' };
    const p = toProfilePatch(d, '2026-10-19');
    expect(p.nickname).toBe('Amy');
    expect(p.babyNames).toEqual(['Bean']);
    expect(p.pregnancy).toEqual({ kind: 'manual', weeks: 20, days: 3, setOn: '2026-10-19' });
    expect(p.body.heightCm).toBe(160);
    expect(p.body.waistCm).toBeUndefined();
  });
  it('builds a twins patch and null pregnancy for invalid input', () => {
    const d = { ...emptyDraft(), babyCount: 'twins' as const, names: ['A', ''] as [string, string], weeks: '' };
    const p = toProfilePatch(d, '2026-10-19');
    expect(p.babyNames).toEqual(['A', '']);
    expect(p.pregnancy).toBeNull();
  });
});

describe('birthDateFrom', () => {
  it('accepts compact and dashed dates, rejects impossible ones', () => {
    expect(birthDateFrom('19900101')).toBe('1990-01-01');
    expect(birthDateFrom('1990-01-31')).toBe('1990-01-31');
    expect(birthDateFrom('19900231')).toBeUndefined();
    expect(birthDateFrom('')).toBeUndefined();
  });
});
