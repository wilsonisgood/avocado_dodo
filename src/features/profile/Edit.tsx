import { Button, Chip, FieldControl, Input, LabeledField, MonthCalendar, PickerField, RecordEmpty, RecordHeader, RecordPage, RecordRow, SegmentedTabs, SettingRow, formatDateLong } from '@/components';
import { keys, useAction, useProfile } from '@/data/queries';
import { pregnancyAge } from '@/data/rules';
import { profileService, today } from '@/data/services';
import type { BabyCount, ISODate, Profile } from '@/data/types';
import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import {
  ageLabel, babyLabel, bodyErrors, bodyToForm, bodyToPatch, bodyValid, cm, isSameBody, isSamePregnancy, kg, nicknameError, pregnancyErrors,
  pregnancyToForm, pregnancyToPatch, pregnancyValid, profileDue, type BodyForm, type PregnancyForm, type WeekSource,
} from './logic';

/** Back: previous page when the router has one, otherwise `fallback` (METHOD: no previous page → /profile). */
function useLeave(fallback: string) {
  const navigate = useNavigate();
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  };
}

/** Wait for the profile; edit pages never render without one. */
function WithProfile({ title, children }: { title: string; children: (p: Profile) => ReactNode }) {
  const { data: profile, isLoading } = useProfile();
  const leave = useLeave('/profile');
  if (profile) return <>{children(profile)}</>;
  return (
    <RecordPage>
      <RecordHeader title={title} onBack={leave} />
      {!isLoading && <p className="type-body-default text-text-secondary">Set up your profile first.</p>}
    </RecordPage>
  );
}

/** Shared page frame: header, unsaved-change guard (10-S1), Save / Cancel. */
function EditFrame({ title, dirty, canSave, onSave, saving, children, gap = 'gap-3' }: {
  title: string; dirty: boolean; canSave: boolean; onSave: () => void; saving?: boolean; children: ReactNode; gap?: string;
}) {
  const leave = useLeave('/profile/edit');
  const [asking, setAsking] = useState(false);
  const requestLeave = () => (dirty ? setAsking(true) : leave());
  if (asking) {
    return (
      <RecordPage className="gap-4">
        <RecordHeader title="Unsaved changes" onBack={() => setAsking(false)} />
        <RecordEmpty title="Leave without saving?">Your changes haven't been saved.</RecordEmpty>
        <Button block onClick={() => setAsking(false)}>Keep editing</Button>
        <Button block variant="outline" onClick={leave}>Discard changes</Button>
      </RecordPage>
    );
  }
  return (
    <RecordPage className={gap}>
      <RecordHeader title={title} onBack={requestLeave} />
      {children}
      <Button block disabled={!canSave || saving} onClick={onSave}>Save changes</Button>
      <Button block variant="outline" onClick={requestLeave}>Cancel</Button>
    </RecordPage>
  );
}

const caption = 'type-caption-default text-text-secondary';

/** 10-0 */
export function EditOverview() {
  return <WithProfile title="Profile & pregnancy">{(p) => <Overview p={p} />}</WithProfile>;
}
function Overview({ p }: { p: Profile }) {
  const navigate = useNavigate();
  const t = today();
  return (
    <RecordPage className="gap-4">
      <RecordHeader title="Profile & pregnancy" onBack={() => navigate('/profile')} />
      <RecordRow title={p.nickname} detail={`${babyLabel(p.babyCount)} · ${ageLabel(pregnancyAge(p.pregnancy, t))}`} />
      <SettingRow icon="Profile" title="Personal details" detail="Nickname and preferred name" onClick={() => navigate('/profile/personal')} />
      <SettingRow icon="Calendar" title="Pregnancy details" detail="Due date, week and pregnancy type" onClick={() => navigate('/profile/pregnancy')} />
      <SettingRow icon="Record" title="Body details" detail="Height, weight and waist size" onClick={() => navigate('/profile/body')} />
      <p className={caption}>Update your details anytime. Records use your latest settings.</p>
      <Button block onClick={() => navigate('/profile')}>Done</Button>
    </RecordPage>
  );
}

function useSave() {
  const save = useAction(profileService.save, [keys.profile]);
  return { save: (patch: Partial<Profile>) => save.mutateAsync([patch]), pending: save.isPending };
}

/** 10-1, 10-S2 */
export function PersonalEdit() {
  return <WithProfile title="Personal details">{(p) => <PersonalForm p={p} />}</WithProfile>;
}
function PersonalForm({ p }: { p: Profile }) {
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
    <EditFrame title="Personal details" dirty={name !== p.nickname} canSave={!error} saving={pending} onSave={submit} gap="gap-4">
      <p className="type-heading-small text-text-primary">What should we call you?</p>
      {touched && error ? (
        <Input label="Nickname *" value={name} error={error} placeholder="Enter your nickname" onChange={(e) => setName(e.target.value)} />
      ) : (
        <LabeledField label="Nickname *">
          <FieldControl value={name} placeholder="Enter your nickname" aria-label="Nickname" onChange={(e) => { setName(e.target.value); setTouched(true); }} />
        </LabeledField>
      )}
      <p className={caption}>Shown in Profile. Use 1–20 characters.</p>
    </EditFrame>
  );
}

/** 10-2 / 10-3 families and 10-S3 (`?pick=due`). */
export function PregnancyEdit() {
  return <WithProfile title="Pregnancy details">{(p) => <PregnancyForm p={p} />}</WithProfile>;
}
const COUNTS: { value: BabyCount; label: string }[] = [
  { value: 'one', label: 'One baby' },
  { value: 'twins', label: 'Twins' },
  { value: 'unconfirmed', label: 'Not sure yet' },
];

function PregnancyForm({ p }: { p: Profile }) {
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
    <EditFrame title="Pregnancy details" dirty={!isSamePregnancy(f, initial)} canSave={pregnancyValid(f)} saving={pending} onSave={submit}>
      <p className="type-caption-strong text-text-primary">Pregnancy type</p>
      <div className="flex gap-3">
        {COUNTS.map((c) => (
          <Chip key={c.value} selected={f.babyCount === c.value} className="flex-1" onClick={() => setF({ ...f, babyCount: c.value })}>{c.label}</Chip>
        ))}
      </div>
      <LabeledField label="Due date *">
        {/* Manual weeks don't change the due date, so the field only displays it then. */}
        {manual ? (
          <PickerField value={f.dueDate ? formatDateLong(f.dueDate) : ''} placeholder="Choose a due date" />
        ) : (
          <PickerField value={f.dueDate ? formatDateLong(f.dueDate) : ''} placeholder="Choose a due date" onClick={() => setParams({ pick: 'due' })} />
        )}
        {errors.dueDate && <span className="type-caption-default text-text-brand">{errors.dueDate}</span>}
      </LabeledField>
      <p className="type-caption-strong text-text-primary">Pregnancy week source</p>
      <SegmentedTabs
        options={[{ value: 'dueDate', label: 'From due date' }, { value: 'manual', label: 'Set manually' }]}
        value={f.source}
        onChange={setSource}
      />
      {manual ? (
        <>
          <div className="flex gap-3">
            <LabeledField label="Weeks *" className="flex-1">
              <FieldControl inputMode="numeric" value={f.weeks} aria-label="Weeks" onChange={(e) => setF({ ...f, weeks: e.target.value.replace(/\D/g, '').slice(0, 2) })} />
              {errors.weeks && <span className="type-caption-default text-text-brand">{errors.weeks}</span>}
            </LabeledField>
            <LabeledField label="Days *" className="flex-1">
              <FieldControl inputMode="numeric" value={f.days} aria-label="Days" onChange={(e) => setF({ ...f, days: e.target.value.replace(/\D/g, '').slice(0, 1) })} />
              {errors.days && <span className="type-caption-default text-text-brand">{errors.days}</span>}
            </LabeledField>
          </div>
          <p className={caption}>As of {formatDateLong(t)}. Updates daily. Enter 0–6 days. Manual weeks don't change your due date.</p>
        </>
      ) : (
        <>
          <RecordRow title={`Current week: ${ageLabel(dueAge)}`} detail={`From due date · As of ${formatDateLong(t)}`} />
          <p className={caption}>Weeks update daily. Update your due date if your care team changes it, or set your week manually.</p>
        </>
      )}
    </EditFrame>
  );
}

/** 10-S3 */
function DuePicker({ value, onConfirm, onCancel }: { value: ISODate | ''; onConfirm: (d: ISODate) => void; onCancel: () => void }) {
  const t = today();
  const [sel, setSel] = useState<ISODate>(value || t);
  const [month, setMonth] = useState<ISODate>(value || t);
  return (
    <RecordPage className="gap-3">
      <RecordHeader title="Due date" onBack={onCancel} />
      <MonthCalendar month={month} onMonthChange={setMonth} selected={sel} onSelect={setSel} />
      <p className="type-label-default text-text-primary">Selected: {formatDateLong(sel)}</p>
      <Button block onClick={() => onConfirm(sel)}>Confirm due date</Button>
      <Button block variant="outline" onClick={onCancel}>Cancel</Button>
    </RecordPage>
  );
}

/** 10-4 */
export function BodyEdit() {
  return <WithProfile title="Body details">{(p) => <BodyFormView p={p} />}</WithProfile>;
}
function BodyFormView({ p }: { p: Profile }) {
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
    <EditFrame title="Body details" dirty={!isSameBody(f, initial)} canSave={bodyValid(f)} saving={pending} onSave={submit}>
      {field('height', 'Height (cm)')}
      {field('pre', 'Pre-pregnancy weight (kg, optional)')}
      {field('current', 'Current weight (kg)')}
      {field('waist', 'Waist size (cm, optional)')}
      <p className={caption}>
        Updated: {formatDateLong(p.body.updatedOn ?? today())}
        <br />
        For your personal records. Enter actual measurements.
      </p>
    </EditFrame>
  );
}

/** 10-5 (personal / body / one baby) and 10-5b (twins pregnancy). */
export function Saved() {
  return <WithProfile title="Profile updated">{(p) => <SavedView p={p} />}</WithProfile>;
}
function SavedView({ p }: { p: Profile }) {
  const navigate = useNavigate();
  const fromPregnancy = (useLocation().state as { from?: string } | null)?.from === 'pregnancy';
  const t = today();
  const due = profileDue(p, t);
  const dueText = due ? `Due ${formatDateLong(due)}` : 'Due date not set';
  const age = ageLabel(pregnancyAge(p.pregnancy, t));
  const twins = fromPregnancy && p.babyCount === 'twins';
  const source = p.pregnancy?.kind === 'manual' ? 'Weeks set manually' : age;
  return (
    <RecordPage className="gap-4">
      <RecordHeader title={twins ? 'Pregnancy details updated' : 'Profile updated'} onBack={() => navigate('/profile/edit')} />
      <p className="type-label-default text-text-brand">Changes saved</p>
      {twins ? (
        <RecordRow title={`Twins · ${age}`} detail={`${dueText} · ${source}`} />
      ) : (
        <>
          <RecordRow title={p.nickname} detail={`${dueText} · ${age}`} />
          <RecordRow title="Body details" detail={`Height ${cm(p.body.heightCm)} · Weight ${kg(p.body.currentWeightKg)} · Waist ${cm(p.body.waistCm)}`} />
        </>
      )}
      <Button block onClick={() => navigate('/profile', { replace: true })}>Back to Profile</Button>
      <Button block variant="outline" onClick={() => navigate(twins ? '/profile/pregnancy' : '/profile/edit', { replace: true })}>Keep editing</Button>
    </RecordPage>
  );
}
