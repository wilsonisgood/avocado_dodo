import { describe, expect, it } from 'vitest';
import { countLabel, elapsedMs, formatElapsed } from './time';

const t = (s: number) => new Date(Date.UTC(2026, 2, 11, 14, 0, s)).toISOString();
const base = { startedAt: t(0), pausedMs: 0 };

describe('elapsedMs', () => {
  it('running: now - start', () => expect(elapsedMs(base, Date.parse(t(45)))).toBe(45_000));
  it('subtracts total paused time', () => expect(elapsedMs({ ...base, pausedMs: 10_000 }, Date.parse(t(45)))).toBe(35_000));
  it('paused now: the clock is frozen at pausedAt', () => {
    const s = { ...base, pausedAt: t(30) };
    expect(elapsedMs(s, Date.parse(t(30)))).toBe(30_000);
    expect(elapsedMs(s, Date.parse(t(300)))).toBe(30_000);
  });
  it('finished: uses endedAt, ignores now', () => expect(elapsedMs({ ...base, endedAt: t(45) }, Date.parse(t(9999)))).toBe(45_000));
  it('never negative', () => expect(elapsedMs(base, Date.parse(t(0)) - 5000)).toBe(0));
});

describe('format', () => {
  it('mm:ss', () => {
    expect(formatElapsed(45_000)).toBe('00:45');
    expect(formatElapsed(130_000)).toBe('02:10');
  });
  it('h:mm:ss', () => expect(formatElapsed(3_723_000)).toBe('1:02:03'));
  it('count label', () => {
    expect(countLabel(1)).toBe('1 movement');
    expect(countLabel(3)).toBe('3 movements');
  });
});
