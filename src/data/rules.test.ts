import { describe, expect, it } from 'vitest';
import { buyAccessory, claimTask, dueDateFromAge, equipAccessory, growthPercent, initialRewards, pregnancyAge } from './rules';

const at = (d: string) => `${d}T10:00:00`;

describe('daily tasks', () => {
  it('awards each task once per day', () => {
    let r = { ...initialRewards(), balance: 120 };
    const first = claimTask(r, 'meal', at('2026-10-18'));
    expect(first.awarded).toBe(10);
    r = first.rewards;
    expect(r.balance).toBe(130);
    expect(claimTask(r, 'meal', at('2026-10-18')).awarded).toBe(0); // 12-F1/F2: edit or second meal
    expect(claimTask(r, 'meal', at('2026-10-19')).awarded).toBe(10);
  });
});

describe('shop', () => {
  const r = { ...initialRewards(), balance: 120, lifetimeEarned: 180 };
  it('buys the peach bow for 60 BP without lowering growth', () => {
    const res = buyAccessory(r, 'bow', at('2026-10-18'));
    expect(res.ok && res.rewards.balance).toBe(60);
    expect(res.ok && growthPercent(res.rewards)).toBe(growthPercent(r));
  });
  it('refuses the star clip when short', () => {
    expect(buyAccessory(r, 'star', at('2026-10-18'))).toEqual({ ok: false, reason: 'notEnough', shortBy: 30 });
  });
  it('leaf hat is a gift, owned from the start, and equips', () => {
    expect(buyAccessory(r, 'leaf', at('2026-10-18')).ok).toBe(false);
    expect(equipAccessory(r, 'leaf').equipped).toBe('leaf');
    expect(() => equipAccessory(r, 'bow')).toThrow();
  });
});

describe('pregnancy age', () => {
  it('derives weeks from the due date', () => {
    expect(pregnancyAge({ kind: 'dueDate', dueDate: '2027-06-27' }, '2026-10-18')).toEqual({ weeks: 4, days: 0 }); // matches 07.Personal: due 2027/06/27 = 4 weeks 0 days
  });
  it('manual entry advances with time', () => {
    expect(pregnancyAge({ kind: 'manual', weeks: 16, days: 0, setOn: '2026-10-11' }, '2026-10-18')).toEqual({ weeks: 17, days: 0 });
  });
  it('round-trips with dueDateFromAge', () => {
    const due = dueDateFromAge(16, 2, '2026-10-18');
    expect(pregnancyAge({ kind: 'dueDate', dueDate: due }, '2026-10-18')).toEqual({ weeks: 16, days: 2 });
  });
});
