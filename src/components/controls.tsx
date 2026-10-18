import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from './cx';

/** Nestly/IconButton: 44×44 surface tile, radius 16, 24px icon. */
export function IconButton({
  icon,
  label,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx('flex size-11 shrink-0 items-center justify-center rounded-16 bg-bg-surface text-icon-default', className)}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}

/** Nestly/Chip: 32px pill; Selected = soft fill + focus border. */
export function Chip({
  selected,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        'inline-flex h-9 items-center justify-center gap-2 rounded-999 border px-4 py-2 whitespace-nowrap type-caption-default',
        selected ? 'border-border-focus bg-bg-soft text-text-primary' : 'border-border-default bg-bg-surface text-text-secondary',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Nestly/Toggle: 48×28 track, 20px thumb. Off = disabled fill, On = success fill. */
export function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  label: string;
}) {
  return (
    // 48×44 hit area around the 28px track, as in Nestly/NotificationRow.
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className="flex h-11 w-12 shrink-0 items-center justify-center disabled:cursor-not-allowed"
    >
      <span
        className={cx(
          'flex h-7 w-12 items-center rounded-999 p-1 transition-colors',
          disabled ? 'border border-border-default bg-bg-canvas' : checked ? 'justify-end bg-bg-success' : 'bg-bg-disabled',
        )}
      >
        <span className={cx('size-5 rounded-full', disabled ? 'bg-bg-disabled' : 'bg-bg-surface')} />
      </span>
    </button>
  );
}

/** Nestly/ScheduleTabs: two segments in a 44px surface track; selected = soft fill. */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cx('flex h-11 gap-1 rounded-14 bg-bg-surface p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={cx('flex flex-1 items-center justify-center rounded-10 type-label-default text-text-primary', o.value === value && 'bg-bg-soft')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
