import { Button, RecordEmpty, RecordHeader, RecordPage, RecordRow, TextArea } from '@/components';
import { keys, useAction, useAppointment } from '@/data/queries';
import { appointmentService, clock, today } from '@/data/services';
import { useNavigate, useParams } from 'react-router';
import { tr } from '@/i18n';
import { ScheduleCard } from '../ScheduleCard';
import { messages } from '../i18n';
import { detailView, whenText } from './logic';
import { useLeave } from './useLeave';

export function MissingAppointment() {
  const t = tr(messages);
  const leave = useLeave('/appointments');
  return (
    <RecordPage>
      <RecordHeader title={t.detailsTitle} onBack={leave} />
      <p className="type-body-default text-text-secondary">{t.missing}</p>
    </RecordPage>
  );
}

const nowParts = () => {
  const n = clock.now();
  return [today(), `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`] as const;
};

/** 09-6…09-13 Appointment details. */
export function AppointmentDetails() {
  const t = tr(messages);
  const { id } = useParams();
  const navigate = useNavigate();
  const leave = useLeave('/appointments');
  const { data: appt, isLoading } = useAppointment(id);
  const complete = useAction(appointmentService.complete, [keys.appointments]);
  if (isLoading) return <RecordPage><RecordHeader title={t.detailsTitle} /></RecordPage>;
  if (!appt) return <MissingAppointment />;

  const view = detailView(appt, ...nowParts());
  return (
    <RecordPage className="gap-4">
      <RecordHeader title={t.detailsTitle} onBack={leave} />
      {view.banner && <p className="type-label-default text-text-brand">{view.banner}</p>}
      <ScheduleCard appt={appt} status={view.status} when={whenText(appt)} footer={view.cardLine} />
      <RecordRow title={t.reminderRow} detail={view.rowDetail} />
      {appt.notes.trim() && <TextArea value={`${t.notes}\n${appt.notes}`} readOnly aria-label={t.notes} />}
      <Button block disabled={complete.isPending} onClick={() => complete.mutate([appt.id, view.primaryDone])}>{view.primaryLabel}</Button>
      <Button block variant="outline" onClick={() => navigate(`/appointments/${appt.id}/edit`)}>{t.editAppt}</Button>
      <Button block variant="outline" onClick={() => navigate(`/appointments/${appt.id}/delete`)}>{t.deleteAppt}</Button>
    </RecordPage>
  );
}

/** 09-S1 / 09-S1b Delete appointment. */
export function AppointmentDelete() {
  const t = tr(messages);
  const { id } = useParams();
  const navigate = useNavigate();
  const leave = useLeave(`/appointments/${id}`);
  const { data: appt, isLoading } = useAppointment(id);
  const remove = useAction(appointmentService.remove, [keys.appointments]);
  if (isLoading) return <RecordPage><RecordHeader title={t.deleteAppt} /></RecordPage>;
  if (!appt) return <MissingAppointment />;

  const onDelete = async () => {
    await remove.mutateAsync([appt.id]);
    navigate('/appointments', { replace: true, state: { notice: 'deleted', name: appt.name, type: appt.type } });
  };
  return (
    <RecordPage className="gap-4">
      <RecordHeader title={t.deleteAppt} onBack={leave} />
      <RecordEmpty title={t.deleteQ}>{t.deleteBody}</RecordEmpty>
      <RecordRow title={appt.name} detail={[whenText(appt), appt.location].filter(Boolean).join(' · ')} />
      <Button block disabled={remove.isPending} onClick={onDelete}>{t.delete}</Button>
      <Button block variant="outline" onClick={leave}>{t.keepAppt}</Button>
    </RecordPage>
  );
}
