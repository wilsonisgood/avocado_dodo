import { describe, expect, it } from 'vitest';
import { firstLine, formatDateTime, formatDay, formatTime, isDirty, parseMoodParam, rowDetail } from './format';

const iso = new Date(2026, 2, 11, 14, 0).toISOString();

describe('mood format', () => {
  it('formats time and date-time like the design', () => {
    expect(formatTime(iso)).toBe('14:00');
    expect(formatDateTime(iso)).toBe('2026/03/11 · 14:00');
    expect(formatDay(new Date(2026, 2, 11))).toBe('Mar 11, 2026');
  });
  it('parses the mood param', () => {
    expect(parseMoodParam('calm')).toBe('calm');
    expect(parseMoodParam('angry')).toBeUndefined();
    expect(parseMoodParam(null)).toBeUndefined();
  });
  it('builds row detail', () => {
    expect(firstLine('\n  hi there\nsecond')).toBe('hi there');
    expect(rowDetail({ at: iso, note: 'A walk.\nMore' })).toBe('14:00 · A walk.');
    expect(rowDetail({ at: iso, note: '' })).toBe('14:00');
  });
  it('detects unsaved changes', () => {
    expect(isDirty({ note: '' })).toBe(false);
    expect(isDirty({ mood: 'sad', note: '' })).toBe(true);
    expect(isDirty({ note: ' x' })).toBe(true);
    expect(isDirty({ mood: 'sad', note: 'a' }, { mood: 'sad', note: 'a' })).toBe(false);
    expect(isDirty({ mood: 'calm', note: 'a' }, { mood: 'sad', note: 'a' })).toBe(true);
  });
});
