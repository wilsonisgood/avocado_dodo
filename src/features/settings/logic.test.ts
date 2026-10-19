import { describe, expect, it } from 'vitest';
import { defaultNotifications } from '@/data/services';
import { isDirty, masterText, permissionLine, savedNotice, scheduleText, setOn } from './logic';

const base = defaultNotifications();

describe('scheduleText', () => {
  it('shows schedules when on and saved time when off', () => {
    expect(scheduleText(base, 'mood')).toBe('Daily at 20:30');
    expect(scheduleText(base, 'movement')).toMatch(/^Off · Time saved as /);
    expect(scheduleText(base, 'meals')).toBe('08:00／12:00／18:00');
    expect(scheduleText({ ...base, weekly: { on: true, weekday: 0, time: '09:00' } }, 'weekly')).toBe('Sundays at 09:00');
    expect(scheduleText(setOn(base, 'mood', false), 'mood')).toBe('Off · Time saved as 20:30');
  });
});

describe('savedNotice', () => {
  it('names the all-off case', () => {
    expect(savedNotice(base, { ...base, all: false })).toBe('Saved: All reminders off');
  });
  it('is generic otherwise', () => {
    expect(savedNotice(base, setOn(base, 'mood', false))).toBe('Notification settings saved');
    expect(savedNotice(base, setOn(base, 'movement', true))).toBe('Notification settings saved');
    expect(savedNotice({ ...base, all: false }, base)).toBe('Notification settings saved');
  });
});

describe('misc', () => {
  it('master / permission / dirty', () => {
    expect(masterText(true)).toBe('On');
    expect(masterText(false)).toBe('Off · Your saved times are kept');
    expect(permissionLine('granted')).toBe('Device notifications allowed · View permissions');
    expect(permissionLine('denied')).toContain('off');
    expect(isDirty(base, { ...base })).toBe(false);
    expect(isDirty(base, setOn(base, 'mood', false))).toBe(true);
  });
});
