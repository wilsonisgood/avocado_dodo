import { describe, expect, it } from 'vitest';
import { isAncestor } from './nav';

describe('isAncestor (up navigation)', () => {
  it('detail → list → tab, never back down', () => {
    expect(isAncestor('/mood', '/mood/abc')).toBe(true);
    expect(isAncestor('/mood/abc', '/mood/abc/edit')).toBe(true);
    expect(isAncestor('/home', '/mood')).toBe(true);
    // the loop from the video: the list's back must not land on a detail page
    expect(isAncestor('/mood/abc', '/mood')).toBe(false);
    expect(isAncestor('/movement/review/x', '/movement/history')).toBe(false);
    expect(isAncestor('/meals/x', '/records')).toBe(false);
  });
  it('explicit parents', () => {
    expect(isAncestor('/settings/notifications', '/settings/reminders/mood')).toBe(true);
    expect(isAncestor('/profile', '/settings/notifications')).toBe(true);
    expect(isAncestor('/tasks', '/shop/bow')).toBe(true);
    expect(isAncestor('/shop', '/shop/bow')).toBe(true);
  });
});
