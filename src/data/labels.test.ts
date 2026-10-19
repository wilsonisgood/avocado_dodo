import { describe, expect, it } from 'vitest';
import { relativeDay, shortDateWithWeekday } from './labels';

describe('labels', () => {
  it('relative days', () => {
    expect(relativeDay('2026-10-22', '2026-10-18')).toBe('In 4 days');
    expect(relativeDay('2026-10-18', '2026-10-18')).toBe('Today');
    expect(relativeDay('2026-10-16', '2026-10-18')).toBe('2 days ago');
  });
  it('matches the home card format', () => expect(shortDateWithWeekday('2026-10-22')).toBe('Oct 22, Thu'));
});
