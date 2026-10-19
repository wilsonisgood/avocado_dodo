import { Button, Icon, RecordEmpty, RecordHeader, RecordPage, RecordRow, TextArea } from '@/components';
import { appointmentTypeLabel } from '@/data/labels';
import { keys, useAction, useAppointment } from '@/data/queries';
import { appointmentService, clock, today } from '@/data/services';
import type { Appointment } from '@/data/types';
import { useNavigate, useParams } from 'react-router';
import { detailView, whenText } from './logic';
import { useLeave } from './useLeave';

export function MissingAppointment() {
  const leave = useLeave('/appointments');
  return (
    <RecordPage>
      <RecordHeader title="Appointment details" onBack={leave} />
      <p className="type-body-default text-text-secondary">This appointment is no longer here.</p>
    </RecordPage>
  );
}

const nowParts = () => {
  const n = clock.now();
  return [today(), `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`] as const;
};

/** Nestly/ScheduleCard (not in @/components yet): type + status, name, when, where, reminder line. */
function ScheduleCard({ appt, status, line }: { appt: Appointment; status: string; line: string }) {
  return (
    <section className="flex flex-col gap-2 rounded-16 bg-bg-surface p-4">
      <div className="flex items-center gap-2">
        <Icon name="Calendar" size={16} />
        <span className="flex-1 type-caption-strong text-text-brand">{appointmentTypeLabel(appt.type)}</span>
        <span className="type-caption-default text-text-secondary">{status}</span>
      </div>
      <h2 className="type-heading-small text-text-primary">{appt.name}</h2>
      <div className="flex items-center gap-2 text-text-secondary">
        <Icon name="Clock" size={16} />
        <span className="type-body-default">{whenText(appt)}</span>
      </div>
      {appt.location && (
        <div className="flex items-center gap-2 text-text-secondary">
          <Icon name="Location" size={16} />
          <span className="type-body-default">{appt.location}</span>
        </div>
      )}
      <p className="type-caption-default text-text-secondary">{line}</p>
    </section>
  );
}

/** 09-6…09-13 Appointment details. */
export function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const leave = useLeave('/appointments');
  const { data: appt, isLoading } = useAppointment(id);
  const complete = useAction(appointmentService.complete, [keys.appointments]);
  if (isLoading) return <RecordPage><RecordHeader title="Appointment details" /></RecordPage>;
  if (!appt) return <MissingAppointment />;

  const view = detailView(appt, ...nowParts());
  return (
    <RecordPage className="gap-4">
      <RecordHeader title="Appointment details" onBack={leave} />
      {view.banner && <p className="type-label-default text-text-brand">{view.banner}</p>}
      <ScheduleCard appt={appt} status={view.status} line={view.cardLine} />
      <RecordRow title="Reminder" detail={view.rowDetail} />
      {appt.notes.trim() && <TextArea value={`Notes\n${appt.notes}`} readOnly aria-label="Notes" />}
      <Button block disabled={complete.isPending} onClick={() => complete.mutate([appt.id, view.primaryDone])}>{view.primaryLabel}</Button>
      <Button block variant="outline" onClick={() => navigate(`/appointments/${appt.id}/edit`)}>Edit appointment</Button>
      <Button block variant="outline" onClick={() => navigate(`/appointments/${appt.id}/delete`)}>Delete appointment</Button>
    </RecordPage>
  );
}

/** 09-S1 / 09-S1b Delete appointment. */
export function AppointmentDelete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const leave = useLeave(`/appointments/${id}`);
  const { data: appt, isLoading } = useAppointment(id);
  const remove = useAction(appointmentService.remove, [keys.appointments]);
  if (isLoading) return <RecordPage><RecordHeader title="Delete appointment" /></RecordPage>;
  if (!appt) return <MissingAppointment />;

  const onDelete = async () => {
    await remove.mutateAsync([appt.id]);
    navigate('/appointments', { replace: true, state: { notice: 'deleted', name: appt.name, type: appt.type } });
  };
  return (
    <RecordPage className="gap-4">
      <RecordHeader title="Delete appointment" onBack={leave} />
      <RecordEmpty title="Delete this appointment?">This cannot be undone. Its reminders will also be removed.</RecordEmpty>
      <RecordRow title={appt.name} detail={[whenText(appt), appt.location].filter(Boolean).join(' · ')} />
      <Button block disabled={remove.isPending} onClick={onDelete}>Delete</Button>
      <Button block variant="outline" onClick={leave}>Keep appointment</Button>
    </RecordPage>
  );
}
