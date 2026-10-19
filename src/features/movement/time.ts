import { getLocale } from '@/i18n';
import { fmtDate } from '@/i18n/format';
import type { MovementSession } from '@/data/types';
import { messages } from './i18n';

/** Elapsed session time in ms: (endedAt ?? now) - startedAt - pausedMs - (currently paused ? now - pausedAt : 0). */
export function elapsedMs(s: Pick<MovementSession, 'startedAt' | 'endedAt' | 'pausedMs' | 'pausedAt'>, now: number): number {
  const end = s.endedAt ? new Date(s.endedAt).getTime() : now;
  const live = !s.endedAt && s.pausedAt ? Math.max(0, now - new Date(s.pausedAt).getTime()) : 0;
  return Math.max(0, end - new Date(s.startedAt).getTime() - s.pausedMs - live);
}

const p2 = (n: number) => String(n).padStart(2, '0');

/** 00:45 · 02:10 · 1:02:03 */
export function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return h > 0 ? `${h}:${p2(m)}:${p2(sec)}` : `${p2(m)}:${p2(sec)}`;
}

export const countLabel = (n: number) => messages[getLocale()].count(n);
export const hm = (d: Date) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;
export const hms = (d: Date) => `${hm(d)}:${p2(d.getSeconds())}`;
export const dateLong = (d: Date) => fmtDate(dateSlash(d).replaceAll('/', '-'));
export const dateSlash = (d: Date) => `${d.getFullYear()}/${p2(d.getMonth() + 1)}/${p2(d.getDate())}`;
