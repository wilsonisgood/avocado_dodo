import { useId, type ComponentProps, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cx } from './cx';

/**
 * Nestly/Input (Empty / Filled / Error): label (Label/Default) + 48px canvas field (radius 10)
 * + helper or error line (Caption/Default). Used by onboarding and meal metadata.
 */
export function Input({
  label,
  helper,
  error,
  className,
  trailing,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string; error?: string; trailing?: ReactNode }) {
  const id = useId();
  return (
    <div className={cx('flex flex-col justify-center gap-2', className)}>
      <label htmlFor={id} className="type-label-default text-text-primary">
        {label}
      </label>
      <div
        className={cx(
          'flex h-12 items-center gap-3 rounded-10 border bg-bg-canvas px-4 py-3',
          error ? 'border-border-error' : 'border-border-default focus-within:border-border-focus',
        )}
      >
        <input
          id={id}
          aria-invalid={!!error || undefined}
          className="min-w-0 flex-1 bg-transparent type-body-default text-text-primary outline-none placeholder:text-text-secondary"
          {...rest}
        />
        {trailing}
      </div>
      {(error || helper) && <p className={cx('type-caption-default', error ? 'text-text-brand' : 'text-text-secondary')}>{error ?? helper}</p>}
    </div>
  );
}

/** Nestly/FieldControl: 44px surface field, radius 16, Body/Default. Bare control (no label). */
export function FieldControl({ className, ...rest }: ComponentProps<'input'>) {
  return (
    <input
      className={cx(
        'h-11 w-full rounded-16 border border-border-default bg-bg-surface px-4 py-2.5 type-body-default text-text-primary outline-none placeholder:text-text-secondary focus:border-border-focus',
        className,
      )}
      {...rest}
    />
  );
}

/** Nestly/TextArea: 148px surface box, radius 16, pad 16. */
export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        'min-h-37 w-full resize-none rounded-16 border border-border-default bg-bg-surface p-4 type-body-default text-text-primary outline-none placeholder:text-text-secondary focus:border-border-focus',
        className,
      )}
      {...rest}
    />
  );
}

/** Nestly/ScheduleField: Caption/Strong label above any control (FieldControl, picker button…). */
export function LabeledField({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <span className="type-caption-strong text-text-primary">{label}</span>
      {children}
    </div>
  );
}

/** A FieldControl-looking button that opens a picker (date, time, reminder…). */
export function PickerField({ value, placeholder, onClick }: { value?: string; placeholder?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center rounded-16 border border-border-default bg-bg-surface px-4 text-left type-body-default"
    >
      <span className={value ? 'text-text-primary' : 'text-text-secondary'}>{value || placeholder}</span>
    </button>
  );
}
