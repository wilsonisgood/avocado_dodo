import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useNavigationType } from 'react-router';

// "Up" navigation shared by every screen (LEDGER D-up).
// Plain history-back looped: detail → "Back to mood journal" pushes the list, and the list's back arrow
// returned to the detail, forever. Instead, Back goes to the nearest earlier page that is an *ancestor*
// of the current one (a tab, a path prefix, or an explicit parent), skipping everything in between.

const TABS = ['/home', '/records', '/tasks', '/profile'];
/** Parents that are not path prefixes. */
const PARENTS: [RegExp, string][] = [
  [/^\/profile\/(personal|pregnancy|body|saved)$/, '/profile/edit'], // 10-1…10-5 back to 10-0
  [/^\/settings\/reminders\//, '/settings/notifications'],
  [/^\/settings(\/|$)/, '/profile'],
  [/^\/shop(\/|$)/, '/tasks'],
];

const KEY = 'nestly:nav-stack';
const read = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
};
const idxNow = () => (window.history.state as { idx?: number } | null)?.idx ?? 0;

export function isAncestor(candidate: string, current: string): boolean {
  if (candidate === current) return false;
  if (TABS.includes(candidate)) return true;
  if (current.startsWith(`${candidate}/`)) return true;
  return PARENTS.some(([re, parent]) => re.test(current) && (parent === candidate || isAncestor(candidate, parent)));
}

/** Records which pathname sits at each history index (kept in sessionStorage so reloads keep it). */
export function NavRoot() {
  const { pathname } = useLocation();
  const type = useNavigationType();
  useEffect(() => {
    // A hand-typed / external hash change has no router state: start a fresh trail from here.
    const fresh = (window.history.state as { idx?: number } | null)?.idx == null;
    const stack = fresh ? [] : read();
    const idx = idxNow();
    stack[idx] = pathname;
    if (type !== 'POP') stack.length = idx + 1; // a push/replace drops the forward entries
    sessionStorage.setItem(KEY, JSON.stringify(stack));
  }, [pathname, type]);
  return <Outlet />;
}

/**
 * Back/up: jump to the nearest earlier ancestor of the current page in this session's history,
 * or replace with `fallback` (default /home) when there is none — e.g. a page opened from a link.
 */
export function useUp(fallback = '/home') {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return () => {
    const stack = read();
    const idx = idxNow();
    for (let i = idx - 1; i >= 0; i--) {
      if (stack[i] && isAncestor(stack[i], pathname)) {
        navigate(i - idx);
        return;
      }
    }
    navigate(fallback, { replace: true });
  };
}
