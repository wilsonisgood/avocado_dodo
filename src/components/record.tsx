import type { ReactNode } from 'react';
import { useUp } from '@/app/nav';
import { tr } from '@/i18n';
import { common } from '@/i18n/common';
import { Icon, type IconName } from './Icon';
import { cx } from './cx';

// "Nestly 紀錄流程共用元件": the building blocks of the record / settings / appointment flows.

/** Nestly/RecordHeader: 60px surface bar, back icon + Heading/Medium title. `onBack` defaults to shared up-navigation (src/app/nav.tsx). */
export function RecordHeader({ title, onBack, fallback, trailing }: { title: string; onBack?: () => void; fallback?: string; trailing?: ReactNode }) {
  const up = useUp(fallback);
  return (
    <header className="flex h-15 shrink-0 items-center gap-2 rounded-16 bg-bg-surface p-4">
      <button type="button" aria-label={tr(common).back} onClick={onBack ?? up} className="-m-1 p-1 text-icon-default">
        <Icon name="Back" />
      </button>
      <h1 className="min-w-0 flex-1 truncate type-heading-medium text-text-primary">{title}</h1>
      {trailing}
    </header>
  );
}

/** Nestly/RecordMetric: label · big Metric value · detail. */
export function RecordMetric({ label, value, detail }: { label: string; value: ReactNode; detail?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-16 bg-bg-surface p-4">
      <p className="type-caption-default text-text-secondary">{label}</p>
      <p className="type-metric text-text-brand">{value}</p>
      {detail && <p className="type-caption-default text-text-secondary">{detail}</p>}
    </div>
  );
}

/** Nestly/RecordNotice: soft card with a strong caption title. */
export function RecordNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-16 bg-bg-soft p-4 text-text-primary">
      <p className="type-caption-strong">{title}</p>
      <p className="type-caption-default">{children}</p>
    </div>
  );
}

/** Nestly/RecordRow: tappable entry with Heading/Small title and caption detail. */
export function RecordRow({ title, detail, onClick, leading }: { title: ReactNode; detail?: ReactNode; onClick?: () => void; leading?: ReactNode }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} className="flex w-full items-center gap-3 rounded-16 bg-bg-surface p-4 text-left">
      {leading}
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="type-heading-small text-text-primary">{title}</span>
        {detail && <span className="type-caption-default text-text-secondary">{detail}</span>}
      </span>
    </Tag>
  );
}

/** Nestly/RecordEmpty: empty-state card. */
export function RecordEmpty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-16 bg-bg-surface p-4">
      <p className="type-heading-small text-text-primary">{title}</p>
      {children && <p className="type-body-default text-text-secondary">{children}</p>}
    </div>
  );
}

/** Nestly/SectionHeader: Heading/Small with 4px vertical padding. */
export function SectionHeader({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <h2 className="flex-1 type-heading-small text-text-primary">{children}</h2>
      {trailing}
    </div>
  );
}

/** Nestly/SettingRow: 20px icon, title + caption, chevron. */
export function SettingRow({ icon, title, detail, onClick }: { icon: IconName; title: string; detail?: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-16 bg-bg-surface p-4 text-left">
      <Icon name={icon} size={20} className="text-icon-default" />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="type-label-default text-text-primary">{title}</span>
        {detail && <span className="type-caption-default text-text-secondary">{detail}</span>}
      </span>
      <Icon name="ChevronRight" size={16} className="text-icon-secondary" />
    </button>
  );
}

/** Nestly/ReminderOption: 44px surface option; selected adds the focus border + soft fill. */
export function ReminderOption({ children, selected, onClick }: { children: ReactNode; selected?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx('flex h-11 w-full items-center rounded-16 border p-3 text-left type-label-default text-text-primary', selected ? 'border-border-focus bg-bg-soft' : 'border-transparent bg-bg-surface')}
    >
      {children}
    </button>
  );
}

/** Page column used by the record-style screens: canvas, 24px padding, 20px gap. */
export function RecordPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('flex min-h-full flex-col gap-5 bg-bg-canvas p-6', className)}>{children}</div>;
}
