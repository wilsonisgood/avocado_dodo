import { describe, expect, it } from 'vitest';
import { formatDateLong, monthGrid, shiftMonth } from './schedule';

describe('monthGrid', () => {
  it('October 2026 starts on Thursday with Sep 27–30 leading, as in Nestly/ScheduleCalendar', () => {
    const g = monthGrid('2026-10-01');
    expect(g[0]).toEqual(['2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03']);
    expect(g.at(-1)!.at(-1)).toBe('2026-10-31'); // Oct 31 is a Saturday: no trailing November days
    expect(g).toHaveLength(5);
  });
  it('shifts months across years', () => {
    expect(shiftMonth('2026-12-01', 1)).toBe('2027-01-01');
    expect(formatDateLong('2026-10-27')).toBe('Oct 27, 2026');
  });
});
