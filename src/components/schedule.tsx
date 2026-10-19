import { addDays, parseISODate, toISODate } from '@/data/rules';
import type { ISODate, TimeOfDay } from '@/data/types';
import { IconButton } from './controls';
import { FieldControl, LabeledField } from './fields';
import { cx } from './cx';

// "Nestly 行程共用元件": shared by appointments (09-2, 09-S5), profile (10-S3 due date) and settings (11-S2).

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** First day of the month containing `date`. */
export const monthOf = (date: ISODate): ISODate => `${date.slice(0, 7)}-01`;
export const shiftMonth = (month: ISODate, delta: number): ISODate => {
  const d = parseISODate(month);
  return toISODate(new Date(d.getFullYear(), d.getMonth() + delta, 1));
};
export const monthLabel = (month: ISODate) => {
  const d = parseISODate(month);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** Sunday-first weeks covering the month, including the leading/trailing days of the neighbours. */
export function monthGrid(month: ISODate): ISODate[][] {
  const first = parseISODate(month);
  let day = addDays(month, -first.getDay());
  const weeks: ISODate[][] = [];
  do {
    const week: ISODate[] = [];
    for (let i = 0; i < 7; i++, day = addDays(day, 1)) week.push(day);
    weeks.push(week);
  } while (day.slice(0, 7) === month.slice(0, 7));
  return weeks;
}

/**
 * Nestly/ScheduleCalendar + Nestly/CalendarDay: 372-wide surface card (pad 16, radius 16), month nav,
 * weekday row, day cells — Default / Outside (muted) / Event (4px action dot) / Selected (soft fill).
 */
export function MonthCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  events,
  className,
}: {
  /** Any date in the month to show (normalised to the 1st). */
  month: ISODate;
  onMonthChange: (month: ISODate) => void;
  selected?: ISODate;
  onSelect?: (date: ISODate) => void;
  /** Dates that get the event dot. */
  events?: ReadonlySet<ISODate>;
  className?: string;
}) {
  const m = monthOf(month);
  return (
    <div className={cx('flex flex-col gap-2 rounded-16 bg-bg-surface p-4', className)}>
      <div className="flex items-center gap-2">
        <IconButton icon="Back" label="Previous month" className="h-11 w-10" onClick={() => onMonthChange(shiftMonth(m, -1))} />
        <p className="flex-1 text-center type-heading-small text-text-primary">{monthLabel(m)}</p>
        <IconButton icon="ChevronRight" label="Next month" className="h-11 w-10" onClick={() => onMonthChange(shiftMonth(m, 1))} />
      </div>
      <div className="flex gap-1">
        {WEEKDAYS.map((w) => (
          <span key={w} className="flex-1 text-center type-caption-default text-text-secondary">
            {w}
          </span>
        ))}
      </div>
      {monthGrid(m).map((week) => (
        <div key={week[0]} className="flex items-start gap-1">
          {week.map((d) => {
            const outside = d.slice(0, 7) !== m.slice(0, 7);
            const isSelected = d === selected;
            const hasEvent = events?.has(d);
            return (
              <button
                key={d}
                type="button"
                aria-label={d}
                aria-pressed={isSelected}
                onClick={() => onSelect?.(d)}
                disabled={!onSelect}
                className={cx(
                  'flex flex-1 flex-col items-center justify-center gap-1 rounded-10 type-label-default disabled:cursor-default',
                  hasEvent || isSelected ? 'h-7' : 'h-5',
                  isSelected && 'bg-bg-soft',
                  outside ? 'text-text-muted' : 'text-text-primary',
                )}
              >
                {Number(d.slice(8))}
                {hasEvent && <span className="size-1 rounded-full bg-action-default" />}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** "Oct 27, 2026" */
export const formatDateLong = (date: ISODate) => {
  const d = parseISODate(date);
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
};

const clampInt = (raw: string, max: number) => {
  const n = Number.parseInt(raw.replace(/\D/g, '').slice(0, 2), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0;
};
const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * 09-S6 / 11-S2 time entry: two Nestly/ScheduleField boxes ("hours" 0–23, "minutes" 0–59)
 * plus the "Selected: 08:30 (24-hour time)" line. Always 24-hour, independent of the browser locale.
 */
export function TimeFields({ value, onChange, title }: { value: TimeOfDay; onChange: (v: TimeOfDay) => void; title?: string }) {
  const [h, m] = value.split(':').map(Number);
  return (
    <div className="flex flex-col gap-4">
      {title && <h2 className="type-heading-small text-text-primary">{title}</h2>}
      <LabeledField label="hours">
        <FieldControl inputMode="numeric" aria-label="hours" value={pad2(h)} onChange={(e) => onChange(`${pad2(clampInt(e.target.value, 23))}:${pad2(m)}`)} />
      </LabeledField>
      <LabeledField label="minutes">
        <FieldControl inputMode="numeric" aria-label="minutes" value={pad2(m)} onChange={(e) => onChange(`${pad2(h)}:${pad2(clampInt(e.target.value, 59))}`)} />
      </LabeledField>
      <p className="type-body-default text-text-secondary">Selected: {value} (24-hour time)</p>
    </div>
  );
}
