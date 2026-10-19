import { Button, Chip, ConfirmDialog, FieldControl, LabeledField, MonthCalendar, PickerField, RecordHeader, RecordPage, ReminderOption, TextArea, TimeFields, formatDateLong, monthOf } from '@/components';
import { APPOINTMENT_TYPES } from '@/data/labels';
import { keys, useAction, useAppointment, useSettings } from '@/data/queries';
import { unitLabel } from '@/data/reminders';
import { appointmentService, today } from '@/data/services';
import type { ISODate, Reminder } from '@/data/types';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { MissingAppointment } from './Details';
import { type Draft, REMINDER_OPTIONS, type ReminderUnit, canSave, customMinutes, customSentence, draftOf, emptyDraft, isDirty, isOptionSelected, parseDateParam, reminderText, splitMinutes, toPayload, toggleReminder } from './logic';
import { tr } from '@/i18n';
import { messages } from '../i18n';
import { useLeave } from './useLeave';

type View = 'form' | 'date' | 'time' | 'reminders' | 'custom';

/** 09-3/09-4 New appointment (`?date=` prefill). */
export function AppointmentNew() {
  const [params] = useSearchParams();
  const { data: settings, isPending } = useSettings();
  if (isPending) return null;
  // New appointments start with the default chosen in Settings 11-8 (existing ones keep theirs).
  const initial = { ...emptyDraft(parseDateParam(params.get('date'))), reminder: settings?.notifications.appointments.defaultReminder ?? { kind: 'none' as const } };
  return <AppointmentForm initial={initial} />;
}

/** 09-5/09-9 Edit appointment. */
export function AppointmentEdit() {
  const t = tr(messages);
  const { id } = useParams();
  const { data: appt, isLoading } = useAppointment(id);
  if (isLoading) return <RecordPage><RecordHeader title={t.editAppt} /></RecordPage>;
  if (!appt) return <MissingAppointment />;
  return <AppointmentForm id={appt.id} initial={draftOf(appt)} />;
}

function AppointmentForm({ id, initial }: { id?: string; initial: Draft }) {
  const m = tr(messages);
  const navigate = useNavigate();
  const leave = useLeave('/appointments');
  const [draft, setDraft] = useState(initial);
  const [view, setView] = useState<View>('form');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const create = useAction(appointmentService.create, [keys.appointments]);
  const update = useAction(appointmentService.update, [keys.appointments]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const dirty = isDirty(draft, initial);
  const requestLeave = () => (dirty ? setConfirmOpen(true) : leave());
  const ready = canSave(draft) && (!id || dirty);

  const save = async () => {
    if (!canSave(draft)) return;
    if (id) {
      await update.mutateAsync([id, toPayload(draft)]);
      navigate(`/appointments/${id}`, { replace: true });
    } else {
      const created = await create.mutateAsync([toPayload(draft)]);
      navigate(`/appointments/${created.id}`, { replace: true });
    }
  };

  const back = () => setView('form');
  if (view === 'date') return <DatePage value={draft.date} onBack={back} onConfirm={(v) => { set('date', v); back(); }} />;
  if (view === 'time') return <TimePage value={draft.time || '09:00'} onBack={back} onConfirm={(v) => { set('time', v); back(); }} />;
  if (view === 'reminders')
    return <RemindersPage value={draft.reminder} onBack={back} onCustom={() => setView('custom')} onDone={(r) => { set('reminder', r); back(); }} />;
  if (view === 'custom')
    return <CustomReminderPage value={draft.reminder} onBack={() => setView('reminders')} onAdd={(r) => { set('reminder', r); back(); }} />;

  return (
    <RecordPage className="gap-3">
      <RecordHeader title={id ? m.editAppt : m.newAppt} onBack={requestLeave} />
      <div className="flex flex-col gap-3">
        <span className="type-caption-strong text-text-primary">{m.apptType}</span>
        <div className="flex gap-3">
          {APPOINTMENT_TYPES.map((t) => (
            <Chip key={t.value} className="min-w-0 flex-1 px-2" selected={draft.type === t.value} onClick={() => set('type', t.value)}>
              {t.label}
            </Chip>
          ))}
        </div>
      </div>
      <LabeledField label={m.apptNameReq}>
        <FieldControl value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder={m.apptName} aria-label={m.apptName} />
      </LabeledField>
      <div className="flex gap-3">
        <LabeledField label={m.dateReq} className="min-w-0 flex-1">
          <PickerField value={draft.date ? formatDateLong(draft.date) : ''} placeholder={m.selectDate} onClick={() => setView('date')} />
        </LabeledField>
        <LabeledField label={m.timeReq} className="min-w-0 flex-1">
          <PickerField value={draft.time} placeholder={m.selectTime} onClick={() => setView('time')} />
        </LabeledField>
      </div>
      <LabeledField label={m.locationOpt}>
        <FieldControl value={draft.location} onChange={(e) => set('location', e.target.value)} placeholder={m.locationPh} aria-label={m.location} />
      </LabeledField>
      <LabeledField label={m.reminder}>
        <PickerField value={reminderText(draft.reminder)} onClick={() => setView('reminders')} />
      </LabeledField>
      <div className="flex flex-col gap-3">
        <span className="type-caption-strong text-text-primary">{m.notesOpt}</span>
        <TextArea value={draft.notes} onChange={(e) => set('notes', e.target.value)} placeholder={m.notesPh} aria-label={m.notes} />
      </div>
      <Button block disabled={!ready || create.isPending || update.isPending} onClick={save}>
        {id ? m.saveChanges : m.saveAppt}
      </Button>
      <Button block variant="outline" onClick={requestLeave}>{m.cancel}</Button>
      <ConfirmDialog
        open={confirmOpen}
        title={m.leaveTitle}
        message={m.leaveBody}
        confirmLabel={m.keepWriting}
        cancelLabel={m.discardLeave}
        onConfirm={() => setConfirmOpen(false)}
        onCancel={() => {
          setConfirmOpen(false);
          leave();
        }}
      />
    </RecordPage>
  );
}

/** 09-S5 */
function DatePage({ value, onBack, onConfirm }: { value: ISODate | ''; onBack: () => void; onConfirm: (d: ISODate) => void }) {
  const m = tr(messages);
  const [selected, setSelected] = useState<ISODate>(value || today());
  const [month, setMonth] = useState<ISODate>(monthOf(selected));
  return (
    <RecordPage className="gap-4">
      <RecordHeader title={m.chooseDate} onBack={onBack} />
      <MonthCalendar month={month} onMonthChange={setMonth} selected={selected} onSelect={setSelected} />
      <p className="type-caption-strong text-text-secondary">{m.selected(formatDateLong(selected))}</p>
      <Button block onClick={() => onConfirm(selected)}>{m.confirmDate}</Button>
    </RecordPage>
  );
}

/** 09-S6 */
function TimePage({ value, onBack, onConfirm }: { value: string; onBack: () => void; onConfirm: (t: string) => void }) {
  const m = tr(messages);
  const [time, setTime] = useState(value);
  return (
    <RecordPage className="gap-4">
      <RecordHeader title={m.chooseTime} onBack={onBack} />
      <TimeFields title={m.apptTime} value={time} onChange={setTime} />
      <Button block onClick={() => onConfirm(time)}>{m.confirmTime}</Button>
      <Button block variant="outline" onClick={onBack}>{m.cancel}</Button>
    </RecordPage>
  );
}

/** 09-S3 */
function RemindersPage({ value, onBack, onCustom, onDone }: { value: Reminder; onBack: () => void; onCustom: () => void; onDone: (r: Reminder) => void }) {
  const m = tr(messages);
  const [reminder, setReminder] = useState(value);
  return (
    <RecordPage className="gap-4">
      <RecordHeader title={m.remindersTitle} onBack={onBack} />
      <div className="flex flex-col gap-1">
        <h2 className="type-heading-small text-text-primary">{m.remindQ}</h2>
        <p className="type-caption-default text-text-secondary">{m.remindHelp}</p>
      </div>
      {REMINDER_OPTIONS.map((o) => {
        const selected = isOptionSelected(reminder, o.key);
        return (
          <ReminderOption key={o.key} selected={selected} onClick={() => (o.key === 'custom' ? onCustom() : setReminder(toggleReminder(reminder, o.key)))}>
            {selected ? '✓ ' : ''}
            {o.key === 'custom' && selected ? reminderText(reminder) : o.label}
          </ReminderOption>
        );
      })}
      <p className="type-caption-default text-text-secondary">{m.remindAllow}</p>
      <Button block onClick={() => onDone(reminder)}>{m.done}</Button>
      <Button block variant="outline" onClick={onBack}>{m.cancel}</Button>
    </RecordPage>
  );
}

/** 09-S4. Time before + unit; the sentence below previews the result. */
function CustomReminderPage({ value, onBack, onAdd }: { value: Reminder; onBack: () => void; onAdd: (r: Reminder) => void }) {
  const m = tr(messages);
  const init = value.kind === 'custom' && value.minutesBefore > 0 ? splitMinutes(value.minutesBefore) : { amount: 2, unit: 'hours' as ReminderUnit };
  const [raw, setRaw] = useState(String(init.amount));
  const [unit, setUnit] = useState<ReminderUnit>(init.unit);
  const amount = Number.parseInt(raw, 10);
  const valid = Number.isFinite(amount) && amount > 0;
  return (
    <RecordPage className="gap-4">
      <RecordHeader title={m.customTitle} onBack={onBack} />
      <h2 className="type-heading-small text-text-primary">{m.howLong}</h2>
      <LabeledField label={m.timeBefore}>
        <FieldControl inputMode="numeric" aria-label={m.timeBefore} value={raw} onChange={(e) => setRaw(e.target.value.replace(/\D/g, '').slice(0, 3))} />
      </LabeledField>
      <LabeledField label={m.unit}>
        <div className="flex gap-3">
          {(['minutes', 'hours', 'days'] as const).map((u) => (
            <Chip key={u} className="min-w-0 flex-1 px-2" selected={unit === u} onClick={() => setUnit(u)}>
              {unitLabel(u)}
            </Chip>
          ))}
        </div>
      </LabeledField>
      {valid && <p className="type-body-default text-text-secondary">{customSentence(amount, unit)}</p>}
      <Button block disabled={!valid} onClick={() => onAdd({ kind: 'custom', minutesBefore: customMinutes(amount, unit) })}>{m.addReminder}</Button>
      <Button block variant="outline" onClick={onBack}>{m.cancel}</Button>
    </RecordPage>
  );
}
