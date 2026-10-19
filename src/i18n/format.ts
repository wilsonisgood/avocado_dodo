// Locale-aware dates and numbers (Intl). Every screen formats through these, never hand-built strings.
import type { ISODate, ISODateTime, TimeOfDay } from '@/data/types';
import { INTL_TAG, getLocale } from './index';

const parse = (d: ISODate) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
};
const tag = () => INTL_TAG[getLocale()];
const zh = () => getLocale() !== 'en';
const pad = (n: number) => String(n).padStart(2, '0');

/** "Oct 19, 2026" · "2026年10月19日" */
export const fmtDate = (d: ISODate) => new Intl.DateTimeFormat(tag(), { year: 'numeric', month: zh() ? 'long' : 'short', day: 'numeric' }).format(parse(d));

/** "Oct 22, Thu" · "10月22日（週四）" / "10月22日（周四）" */
export function fmtDateWeekday(d: ISODate) {
  const date = parse(d);
  if (!zh()) return `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)}, ${new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)}`;
  return `${date.getMonth() + 1}月${date.getDate()}日（${new Intl.DateTimeFormat(tag(), { weekday: 'short' }).format(date)}）`;
}

/** "Mar 11" · "3月11日" */
export const fmtMonthDay = (d: ISODate) => new Intl.DateTimeFormat(tag(), { month: zh() ? 'long' : 'short', day: 'numeric' }).format(parse(d));

/** "October 2026" · "2026年10月" */
export const fmtMonthYear = (d: ISODate) => new Intl.DateTimeFormat(tag(), { year: 'numeric', month: 'long' }).format(parse(d));

/** "2026/10/19" — same in every language (the design's numeric style). */
export const fmtDateNumeric = (d: ISODate) => d.replaceAll('-', '/');

/** Weekday names, Sunday first: Sun…Sat · 日…六 */
export function weekdayNames(style: 'short' | 'long' = 'short') {
  const sunday = new Date(2026, 9, 18); // a Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i);
    return new Intl.DateTimeFormat(tag(), { weekday: zh() && style === 'short' ? 'narrow' : style }).format(day);
  });
}

/** 24-hour "14:05" from an ISO timestamp (all languages). */
export const fmtTime = (at: ISODateTime) => {
  const d = new Date(at);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}` as TimeOfDay;
};

/** "1,250" · "1,250" */
export const fmtNumber = (n: number) => new Intl.NumberFormat(tag()).format(n);
