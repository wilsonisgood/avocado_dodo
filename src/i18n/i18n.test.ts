import { afterEach, describe, expect, it } from 'vitest';
import { detectLocale, setLocale } from './index';
import { common } from './common';
import { fmtDate, fmtDateWeekday, fmtMonthYear, weekdayNames } from './format';
import { relativeDay } from '@/data/labels';
import { reminderText } from '@/data/reminders';

afterEach(() => setLocale('en'));

describe('detectLocale', () => {
  it('maps device languages', () => {
    expect(detectLocale(['zh-TW'])).toBe('zh-Hant');
    expect(detectLocale(['zh-HK', 'en'])).toBe('zh-Hant');
    expect(detectLocale(['zh-Hant-TW'])).toBe('zh-Hant');
    expect(detectLocale(['zh-CN'])).toBe('zh-Hans');
    expect(detectLocale(['zh'])).toBe('zh-Hans');
    expect(detectLocale(['ja', 'en-GB'])).toBe('en');
    expect(detectLocale(['fr'])).toBe('en');
  });
});

describe('formatters', () => {
  it('English keeps the design formats', () => {
    expect(fmtDate('2026-10-22')).toBe('Oct 22, 2026');
    expect(fmtDateWeekday('2026-10-22')).toBe('Oct 22, Thu');
    expect(fmtMonthYear('2026-10-01')).toBe('October 2026');
    expect(weekdayNames()[0]).toBe('Sun');
  });
  it('Chinese uses 年月日 and 週／周', () => {
    setLocale('zh-Hant');
    expect(fmtDate('2026-10-22')).toBe('2026年10月22日');
    expect(fmtDateWeekday('2026-10-22')).toBe('10月22日（週四）');
    expect(fmtMonthYear('2026-10-01')).toBe('2026年10月');
    expect(weekdayNames()[0]).toBe('日');
    setLocale('zh-Hans');
    expect(fmtDateWeekday('2026-10-22')).toBe('10月22日（周四）');
  });
  it('shared labels follow the language', () => {
    setLocale('zh-Hant');
    expect(relativeDay('2026-10-22', '2026-10-18')).toBe('4 天後');
    expect(reminderText({ kind: 'preset', preset: '1d+1h' })).toBe('1 天前和 1 小時前');
    setLocale('zh-Hans');
    expect(reminderText({ kind: 'custom', minutesBefore: 120 })).toBe('2 小时前');
  });
});

describe('dictionaries', () => {
  it('Chinese dictionaries have exactly the English keys and call shapes', () => {
    for (const l of ['zh-Hant', 'zh-Hans'] as const) {
      expect(Object.keys(common[l]).sort()).toEqual(Object.keys(common.en).sort());
      for (const k of Object.keys(common.en) as (keyof typeof common.en)[]) expect(typeof common[l][k]).toBe(typeof common.en[k]);
    }
  });
});
