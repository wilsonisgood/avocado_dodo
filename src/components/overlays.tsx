import { useEffect, type ReactNode } from 'react';
import { Button } from './Button';
import { Toggle } from './controls';
import { Icon, type IconName } from './Icon';
import { cx } from './cx';

// Overlays use `fixed`; PhoneFrame's screen sets a transform, so they stay inside the phone (app/PhoneFrame).

function Scrim({ onClose, children }: { onClose?: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      {/* Confirmation backdrop: color/bg/scrim at 45% */}
      <div className="absolute inset-0 bg-bg-scrim opacity-45" onClick={onClose} />
      {children}
    </div>
  );
}

/**
 * Confirmation dialog from the *-S screens (discard changes, delete entry…):
 * 372 wide, pad 24, gap 16, Heading/Medium title, Body/Default message, stacked full-width buttons.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  /** Destructive confirm (delete) — the design keeps the brand primary, so this only affects a11y labelling. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <Scrim onClose={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-label={title} className="relative flex w-full flex-col gap-4 rounded-16 bg-bg-surface p-6">
        <h2 className="type-heading-medium text-text-primary">{title}</h2>
        {message && <p className="type-body-default text-text-secondary">{message}</p>}
        <Button block onClick={onConfirm} aria-describedby={danger ? 'destructive' : undefined}>
          {confirmLabel}
        </Button>
        <Button block variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </Scrim>
  );
}

/** Nestly/CompanionDialog: reward / purchase dialogs — title, Metric line, body, strong caption, 1–2 buttons. */
export function CompanionDialog({
  open,
  title,
  metric,
  body,
  footnote,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title: string;
  metric?: ReactNode;
  body?: ReactNode;
  footnote?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  /** Extra visual (e.g. the fruit baby wearing the new accessory). */
  children?: ReactNode;
}) {
  if (!open) return null;
  return (
    <Scrim onClose={onCancel ?? onConfirm}>
      <div role="dialog" aria-modal="true" aria-label={title} className="relative flex w-[340px] max-w-full flex-col gap-2 rounded-16 bg-bg-surface p-6">
        <h2 className="type-heading-medium text-text-primary">{title}</h2>
        {children}
        {metric && <p className="type-metric text-text-brand">{metric}</p>}
        {body && <p className="type-body-default text-text-secondary">{body}</p>}
        {footnote && <p className="type-caption-strong text-text-brand">{footnote}</p>}
        <div className="mt-2 flex flex-col gap-2">
          <Button block onClick={onConfirm}>
            {confirmLabel}
          </Button>
          {cancelLabel && onCancel && (
            <Button block variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
        </div>
      </div>
    </Scrim>
  );
}

/** Bottom sheet for pickers (09-S5 date, 09-S6 time, 11-S2 reminder time…). */
export function Sheet({ open, title, onClose, trailing, children }: { open: boolean; title: string; onClose: () => void; trailing?: ReactNode; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-bg-scrim opacity-45" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative flex flex-col gap-4 rounded-t-24 bg-bg-surface p-6 pb-8">
        <div className="flex items-center gap-2">
          <h2 className="flex-1 type-heading-medium text-text-primary">{title}</h2>
          {trailing}
        </div>
        {children}
      </div>
    </div>
  );
}

/** Nestly/NotificationRow: 20px icon, title / description / schedule, toggle. Disabled = muted title, locked toggle. */
export function NotificationRow({
  icon,
  title,
  description,
  schedule,
  checked,
  disabled,
  onChange,
  onClick,
}: {
  icon: IconName;
  title: string;
  description: string;
  schedule?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  /** Tapping the text opens the reminder's detail screen (11-4…11-8). */
  onClick?: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-16 bg-bg-surface p-3">
      <Icon name={icon} size={20} className="text-icon-default" />
      <button type="button" onClick={onClick} disabled={!onClick} className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <span className={cx('type-label-default', disabled ? 'text-text-muted' : 'text-text-primary')}>{title}</span>
        <span className="type-caption-default text-text-secondary">{description}</span>
        {schedule && <span className="type-caption-default text-text-brand">{schedule}</span>}
      </button>
      <Toggle checked={checked} disabled={disabled} onChange={onChange} label={title} />
    </div>
  );
}
