import { useUp } from '@/app/nav';
import { Button, Chip, FieldControl, Input, LabeledField, MonthCalendar, PickerField, RecordEmpty, RecordHeader, RecordPage, RecordRow, SegmentedTabs, SettingRow, formatDateLong } from '@/components';
import { keys, useAction, useProfile } from '@/data/queries';
import { pregnancyAge } from '@/data/rules';
import { profileService, today } from '@/data/services';
import { useT } from '@/i18n';
import { messages } from './i18n';
import type { BabyCount, ISODate, Profile } from '@/data/types';
import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import {
  ageLabel, babyLabel, bodyErrors, bodyToForm, bodyToPatch, bodyValid, cm, isSameBody, isSamePregnancy, kg, nicknameError, pregnancyErrors,
  pregnancyToForm, pregnancyToPatch, pregnancyValid, profileDue, type BodyForm, type PregnancyForm, type WeekSource,
} from './logic';

/** Up navigation shared app-wide (src/app/nav.tsx). */
const useLeave = useUp;

/** Wait for the profile; edit pages never render without one. */
function WithProfile({ title, children }: { title: string; children: (p: Profile) => ReactNode }) {
  const { data: profile, isLoading } = useProfile();
  const t = useT(messages);
  const leave = useLeave('/profile');
  if (profile) return <>{children(profile)}</>;
  return (
    <RecordPage>
      <RecordHeader title={title} onBack={leave} />
      {!isLoading && <p className="type-body-default text-text-secondary">{t.setUpFirst}</p>}
    </RecordPage>
  );
}

/** Shared page frame: header, unsaved-change guard (10-S1), Save / Cancel. */
function EditFrame({ title, dirty, canSave, onSave, saving, children, gap = 'gap-3' }: {
  title: string; dirty: boolean; canSave: boolean; onSave: () => void; saving?: boolean; children: ReactNode; gap?: string;
}) {
  const t = useT(messages);
  const leave = useLeave('/profile/edit');
  const [asking, setAsking] = useState(false);
  const requestLeave = () => (dirty ? setAsking(true) : leave());
  if (asking) {
    return (
      <RecordPage className="gap-4">
        <RecordHeader title={t.unsavedTitle} onBack={() => setAsking(false)} />
        <RecordEmpty title={t.leaveQuestion}>{t.notSaved}</RecordEmpty>
        <Button block onClick={() => setAsking(false)}>{t.keepEditing}</Button>
        <Button block variant="outline" onClick={leave}>{t.discard}</Button>
      </RecordPage>
    );
  }
  return (
    <RecordPage className={gap}>
      <RecordHeader title={title} onBack={requestLeave} />
      {children}
      <Button block disabled={!canSave || saving} onClick={onSave}>{t.saveChanges}</Button>
      <Button block variant="outline" onClick={requestLeave}>{t.cancel}</Button>
    </RecordPage>
  );
}

const caption = 'type-caption-default text-text-secondary';

/** 10-0 */
export function EditOverview() {
  const t = useT(messages);
  return <WithProfile title={t.profilePregnancy}>{(p) => <Overview p={p} />}</WithProfile>;
}
function Overview({ p }: { p: Profile }) {
  const t = useT(messages);
  const navigate = useNavigate();
  const now = today();
  return (
    <RecordPage className="gap-4">
      <RecordHeader title={t.profilePregnancy} fallback="/profile" />
      <RecordRow title={p.nickname} detail={`${babyLabel(p.babyCount)} · ${ageLabel(pregnancyAge(p.pregnancy, now))}`} />
      <SettingRow icon="Profile" title={t.personalDetails} detail={t.personalDetail} onClick={() => navigate('/profile/personal')} />
      <SettingRow icon="Calendar" title={t.pregnancyDetails} detail={t.pregnancyDetail} onClick={() => navigate('/profile/pregnancy')} />
      <SettingRow icon="Record" title={t.bodyDetails} detail={t.bodyDetail} onClick={() => navigate('/profile/body')} />
      <p className={caption}>{t.updateAnytime}</p>
      <Button block onClick={() => navigate('/profile')}>{t.done}</Button>
    </RecordPage>
  );
}

function useSave() {
  const save = useAction(profileService.save, [keys.profile]);
  return { save: (patch: Partial<Profile>) => save.mutateAsync([patch]), pending: save.isPending };
}

/** 10-1, 10-S2 */
export function PersonalEdit() {
  const t = useT(messages);
  return <WithProfile title={t.personalDetails}>{(p) => <PersonalForm p={p} />}</WithProfile>;
}
function PersonalForm({ p }: { p: Profile }) {
  const t = useT(messages);
  const navigate = useNavigate();
  const { save, pending } = useSave();
  const [name, setName] = useState(p.nickname);
  const [touched, setTouched] = useState(false);
  const error = nicknameError(name);
  const submit = async () => {
    await save({ nickname: name.trim() });
    navigate('/profile/saved', { replace: true });
  };
  return (
    <EditFrame title={t.personalDetails} dirty={name !== p.nickname} canSave={!error} saving={pending} onSave={submit} gap="gap-4">
      <p className="type-heading-small text-text-primary">{t.whatCall}</p>
      {touched && error ? (
        <Input label={t.nicknameLabel} value={name} error={error} placeholder={t.nicknamePlaceholder} onChange={(e) => setName(e.target.value)} />
      ) : (
        <LabeledField label={t.nicknameLabel}>
          <FieldControl value={name} placeholder={t.nicknamePlaceholder} aria-label={t.nicknameAria} onChange={(e) => { setName(e.target.value); setTouched(true); }} />
        </LabeledField>
      )}
      <p className={caption}>{t.nicknameHint}</p>
    </EditFrame>
  );
}

/** 10-2 / 10-3 families and 10-S3 (`?pick=due`). */
export function PregnancyEdit() {
  const t = useT(messages);
  return <WithProfile title={t.pregnancyDetails}>{(p) => <PregnancyForm p={p} />}</WithProfile>;
}
const COUNT_VALUES: BabyCount[] = ['one', 'twins', 'unconfirmed'];

function PregnancyForm({ p }: { p: Profile }) {
  const m = useT(messages);
  const navigate = useNavigate();
  const t = today();
  const { save, pending } = useSave();
  const [params, setParams] = useSearchParams();
  const initial = pregnancyToForm(p, t);
  const [f, setF] = useState<PregnancyForm>(initial);
  const picking = params.get('pick') === 'due';
  const closePicker = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else setParams({}, { replace: true });
  };
  const errors = pregnancyErrors(f);

  if (picking) return <DuePicker value={f.dueDate} onConfirm={(d) => { setF({ ...f, dueDate: d }); closePicker(); }} onCancel={closePicker} />;

  const setSource = (source: WeekSource) => {
    if (source === 'manual' && f.source === 'dueDate' && f.dueDate) {
      const age = pregnancyAge({ kind: 'dueDate', dueDate: f.dueDate }, t);
      setF({ ...f, source, weeks: String(age?.weeks ?? ''), days: String(age?.days ?? '') });
    } else setF({ ...f, source });
  };
  const dueAge = f.dueDate ? pregnancyAge({ kind: 'dueDate', dueDate: f.dueDate }, t) : null;
  const submit = async () => {
    await save(pregnancyToPatch(f, p.babyNames, t));
    navigate('/profile/saved', { replace: true, state: { from: 'pregnancy' } });
  };
  const manual = f.source === 'manual';
  return (
    <EditFrame title={m.pregnancyDetails} dirty={!isSamePregnancy(f, initial)} canSave={pregnancyValid(f)} saving={pending} onSave={submit}>
      <p className="type-caption-strong text-text-primary">{m.pregnancyType}</p>
      <div className="flex gap-3">
        {COUNT_VALUES.map((c) => (
          <Chip key={c} selected={f.babyCount === c} className="flex-1" onClick={() => setF({ ...f, babyCount: c })}>{babyLabel(c)}</Chip>
        ))}
      </div>
      <LabeledField label={m.dueDateLabel}>
        {/* Manual weeks don't change the due date, so the field only displays it then. */}
        {manual ? (
          <PickerField value={f.dueDate ? formatDateLong(f.dueDate) : ''} placeholder={m.chooseDue} />
        ) : (
          <PickerField value={f.dueDate ? formatDateLong(f.dueDate) : ''} placeholder={m.chooseDue} onClick={() => setParams({ pick: 'due' })} />
        )}
        {errors.dueDate && <span className="type-caption-default text-text-brand">{errors.dueDate}</span>}
      </LabeledField>
      <p className="type-caption-strong text-text-primary">{m.weekSource}</p>
      <SegmentedTabs
        options={[{ value: 'dueDate', label: m.fromDue }, { value: 'manual', label: m.setManually }]}
        value={f.source}
        onChange={setSource}
      />
      {manual ? (
        <>
          <div className="flex gap-3">
            <LabeledField label={m.weeksLabel} className="flex-1">
              <FieldControl inputMode="numeric" value={f.weeks} aria-label={m.weeksAria} onChange={(e) => setF({ ...f, weeks: e.target.value.replace(/\D/g, '').slice(0, 2) })} />
              {errors.weeks && <span className="type-caption-default text-text-brand">{errors.weeks}</span>}
            </LabeledField>
            <LabeledField label={m.daysLabel} className="flex-1">
              <FieldControl inputMode="numeric" value={f.days} aria-label={m.daysAria} onChange={(e) => setF({ ...f, days: e.target.value.replace(/\D/g, '').slice(0, 1) })} />
              {errors.days && <span className="type-caption-default text-text-brand">{errors.days}</span>}
            </LabeledField>
          </div>
          <p className={caption}>{m.manualHint(formatDateLong(t))}</p>
        </>
      ) : (
        <>
          <RecordRow title={m.currentWeek(ageLabel(dueAge))} detail={m.fromDueAsOf(formatDateLong(t))} />
          <p className={caption}>{m.autoHint}</p>
        </>
      )}
    </EditFrame>
  );
}

/** 10-S3 */
function DuePicker({ value, onConfirm, onCancel }: { value: ISODate | ''; onConfirm: (d: ISODate) => void; onCancel: () => void }) {
  const m = useT(messages);
  const t = today();
  const [sel, setSel] = useState<ISODate>(value || t);
  const [month, setMonth] = useState<ISODate>(value || t);
  return (
    <RecordPage className="gap-3">
      <RecordHeader title={m.dueTitle} onBack={onCancel} />
      <MonthCalendar month={month} onMonthChange={setMonth} selected={sel} onSelect={setSel} />
      <p className="type-label-default text-text-primary">{m.selected(formatDateLong(sel))}</p>
      <Button block onClick={() => onConfirm(sel)}>{m.confirmDue}</Button>
      <Button block variant="outline" onClick={onCancel}>{m.cancel}</Button>
    </RecordPage>
  );
}

/** 10-4 */
export function BodyEdit() {
  const t = useT(messages);
  return <WithProfile title={t.bodyDetails}>{(p) => <BodyFormView p={p} />}</WithProfile>;
}
function BodyFormView({ p }: { p: Profile }) {
  const t = useT(messages);
  const navigate = useNavigate();
  const { save, pending } = useSave();
  const initial = bodyToForm(p.body);
  const [f, setF] = useState<BodyForm>(initial);
  const errors = bodyErrors(f);
  const field = (key: keyof BodyForm, label: string) => (
    <LabeledField label={label}>
      <FieldControl inputMode="decimal" value={f[key]} aria-label={label} onChange={(e) => setF({ ...f, [key]: e.target.value })} />
      {errors[key] && f[key] !== initial[key] && <span className="type-caption-default text-text-brand">{errors[key]}</span>}
    </LabeledField>
  );
  const submit = async () => {
    await save({ body: bodyToPatch(f, today()) });
    navigate('/profile/saved', { replace: true });
  };
  return (
    <EditFrame title={t.bodyDetails} dirty={!isSameBody(f, initial)} canSave={bodyValid(f)} saving={pending} onSave={submit}>
      {field('height', t.heightField)}
      {field('pre', t.preField)}
      {field('current', t.currentField)}
      {field('waist', t.waistField)}
      <p className={caption}>
        {t.updatedOn(formatDateLong(p.body.updatedOn ?? today()))}
        <br />
        {t.forRecords}
      </p>
    </EditFrame>
  );
}

/** 10-5 (personal / body / one baby) and 10-5b (twins pregnancy). */
export function Saved() {
  const t = useT(messages);
  return <WithProfile title={t.profileUpdated}>{(p) => <SavedView p={p} />}</WithProfile>;
}
function SavedView({ p }: { p: Profile }) {
  const m = useT(messages);
  const navigate = useNavigate();
  const fromPregnancy = (useLocation().state as { from?: string } | null)?.from === 'pregnancy';
  const t = today();
  const due = profileDue(p, t);
  const dueText = due ? m.dueOn(formatDateLong(due)) : m.dueNotSet;
  const age = ageLabel(pregnancyAge(p.pregnancy, t));
  const twins = fromPregnancy && p.babyCount === 'twins';
  const source = p.pregnancy?.kind === 'manual' ? m.weeksManual : age;
  return (
    <RecordPage className="gap-4">
      <RecordHeader title={twins ? m.pregnancyUpdated : m.profileUpdated} fallback="/profile/edit" />
      <p className="type-label-default text-text-brand">{m.changesSaved}</p>
      {twins ? (
        <RecordRow title={`${m.twins} · ${age}`} detail={`${dueText} · ${source}`} />
      ) : (
        <>
          <RecordRow title={p.nickname} detail={`${dueText} · ${age}`} />
          <RecordRow title={m.bodyDetails} detail={m.bodySummary(cm(p.body.heightCm), kg(p.body.currentWeightKg), cm(p.body.waistCm))} />
        </>
      )}
      <Button block onClick={() => navigate('/profile', { replace: true })}>{m.backToProfile}</Button>
      <Button block variant="outline" onClick={() => navigate(twins ? '/profile/pregnancy' : '/profile/edit', { replace: true })}>{m.keepEditing}</Button>
    </RecordPage>
  );
}
