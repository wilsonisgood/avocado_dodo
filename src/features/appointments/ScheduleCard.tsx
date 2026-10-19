import { Icon } from '@/components';
import { appointmentTypeLabel } from '@/data/labels';
import type { Appointment } from '@/data/types';

/**
 * Nestly/ScheduleCard (64:447): type + status, name, when, where, footer line.
 * Shared by list/ (09-0…09-2c, tappable) and form/ (09-6…09-13 details, static).
 */
export function ScheduleCard({ appt, status, when, footer, onClick }: { appt: Appointment; status: string; when: string; footer: string; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'section';
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} className="flex w-full flex-col gap-2 rounded-16 bg-bg-surface p-4 text-left">
      <span className="flex w-full items-center gap-2">
        <Icon name="Calendar" size={16} className="text-icon-default" />
        <span className="flex-1 type-caption-strong text-text-brand">{appointmentTypeLabel(appt.type)}</span>
        <span className="type-caption-default text-text-secondary">{status}</span>
      </span>
      <span className="type-heading-small text-text-primary">{appt.name}</span>
      <span className="flex items-center gap-2">
        <Icon name="Clock" size={16} className="text-icon-default" />
        <span className="flex-1 type-body-default text-text-secondary">{when}</span>
      </span>
      {appt.location && (
        <span className="flex items-center gap-2">
          <Icon name="Location" size={16} className="text-icon-default" />
          <span className="flex-1 type-body-default text-text-secondary">{appt.location}</span>
        </span>
      )}
      <span className="type-caption-default text-text-secondary">{footer}</span>
    </Tag>
  );
}
