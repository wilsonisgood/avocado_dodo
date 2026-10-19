import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { Button, Chip, FieldControl, Icon, Input, LabeledField, cx } from '@/components';
import { BabyStepIcon, FieldIcon, ProfileHeroIcon, WelcomeHeroIcon } from './vectors';
import { keys, useAction, useProfile } from '@/data/queries';
import { profileService, today } from '@/data/services';
import type { BabyCount } from '@/data/types';
import { LanguageButton } from '@/app/LanguagePicker';
import { tr, useT } from '@/i18n';
import { common } from '@/i18n/common';
import { messages } from './i18n';
import { daysError, emptyDraft, nicknameError, toProfilePatch, weeksError, type Draft } from './logic';

type Ctx = { draft: Draft; set: Dispatch<SetStateAction<Draft>> };
const FlowContext = createContext<Ctx | null>(null);
const useFlow = () => useContext(FlowContext)!;

/** Layout for /welcome/*: holds the step values in React state (not in the service until the end). */
export function WelcomeFlow() {
  const profile = useProfile();
  const { pathname } = useLocation();
  const [draft, set] = useState<Draft>(emptyDraft);
  if (profile.isLoading) return null;
  if (profile.data) return <Navigate to="/home" replace />;
  return (
    <FlowContext.Provider value={{ draft, set }}>
      <div className="relative flex min-h-full flex-col overflow-hidden bg-bg-canvas">
        <Blobs />
        <div className="relative flex min-h-full flex-1 flex-col">
          {!pathname.endsWith('/baby') && <LanguageButton className="absolute right-4 top-4 z-10" />}
          <Outlet />
        </div>
      </div>
    </FlowContext.Provider>
  );
}

/** Blurred decorative circles behind 01/02 (the 03 screens have none). */
function Blobs() {
  const { pathname } = useLocation();
  if (pathname.endsWith('/baby')) return null;
  return (
    <>
      <span className="pointer-events-none absolute -right-10 -top-8 size-40 rounded-full bg-bg-blush opacity-20 blur-[64px]" aria-hidden />
      <span className="pointer-events-none absolute -bottom-10 -left-8 size-32 rounded-full bg-bg-soft opacity-20 blur-[64px]" aria-hidden />
    </>
  );
}

function Dots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex justify-center gap-2 pt-12">
      {[1, 2, 3].map((i) => (
        <span key={i} className={cx('h-1.5 rounded-999', i === step ? 'w-8 bg-bg-success' : i < step ? 'w-2 bg-bg-success' : 'w-2 bg-bg-disabled')} />
      ))}
    </div>
  );
}

function Hero({ icon, title, sub, big }: { icon: ReactNode; title: string; sub: string; big?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className={cx('flex items-center justify-center rounded-999 text-icon-default', big ? 'bg-bg-subtle-soft' : 'bg-bg-subtle-blush', big ? 'size-20' : 'size-16')}>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h1 className={cx('text-text-primary', big ? 'type-heading-large' : 'type-heading-medium')}>{title}</h1>
        <p className="type-body-default text-text-secondary">{sub}</p>
      </div>
    </div>
  );
}

export function NicknameStep() {
  const { draft, set } = useFlow();
  const navigate = useNavigate();
  const [touched, setTouched] = useState(false);
  const t = useT(messages);
  const error = touched && nicknameError(draft.nickname) ? t.nicknameError : undefined;
  const next = () => {
    setTouched(true);
    if (!nicknameError(draft.nickname)) navigate('/welcome/profile');
  };
  return (
    <>
      <Dots step={1} />
      <form
        className="flex flex-1 flex-col justify-between gap-8 px-8 pb-8 pt-8"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <div className="flex flex-1 flex-col justify-center gap-6">
          <Hero big icon={<WelcomeHeroIcon />} title={t.welcomeTitle} sub={t.welcomeSub} />
          <Input
            label={t.nicknameLabel}
            placeholder={t.nicknamePlaceholder}
            value={draft.nickname}
            error={error}
            onChange={(e) => set((d) => ({ ...d, nickname: e.target.value }))}
          />
        </div>
        <Button block type="submit">
          {t.continue}
        </Button>
      </form>
    </>
  );
}

export function ProfileStep() {
  const t = useT(messages);
  const { draft, set } = useFlow();
  const navigate = useNavigate();
  const bind = (k: 'dob' | 'age' | 'height' | 'weight' | 'waist', placeholder: string, mode: 'numeric' | 'text' = 'numeric') => ({
    value: draft[k],
    placeholder,
    inputMode: mode,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set((d) => ({ ...d, [k]: e.target.value })),
  });
  if (nicknameError(draft.nickname)) return <Navigate to="/welcome" replace />;
  return (
    <>
      <Dots step={2} />
      <div className="flex flex-1 flex-col justify-between gap-8 px-8 pb-8 pt-8">
        <div className="flex flex-col gap-6">
          <Hero icon={<ProfileHeroIcon />} title={t.profileTitle} sub={t.profileSub} />
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <LabeledField label={t.dob}>
                <FieldControl {...bind('dob', t.dobPlaceholder)} />
              </LabeledField>
              <LabeledField label={t.age}>
                <FieldControl {...bind('age', t.agePlaceholder)} />
              </LabeledField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <LabeledField label={t.height}>
                <div className="relative"><FieldControl className="pl-10" {...bind('height', '160')} /><FieldIcon kind="height" /></div>
              </LabeledField>
              <LabeledField label={t.weight}>
                <div className="relative"><FieldControl className="pl-10" {...bind('weight', '55')} /><FieldIcon kind="weight" /></div>
              </LabeledField>
            </div>
            <LabeledField label={t.waist}>
              <div className="relative"><FieldControl className="pl-10" {...bind('waist', t.waistPlaceholder)} /><FieldIcon kind="waist" /></div>
            </LabeledField>
          </div>
        </div>
        <Button block onClick={() => navigate('/welcome/baby')}>
          {t.continue}
        </Button>
      </div>
    </>
  );
}

const TYPE_IDS: BabyCount[] = ['one', 'twins', 'unconfirmed'];

export function BabyStep() {
  const t = useT(messages);
  const c = tr(common);
  const { draft, set } = useFlow();
  const navigate = useNavigate();
  const save = useAction(profileService.save, [keys.profile]);
  const [tried, setTried] = useState(false);
  if (nicknameError(draft.nickname)) return <Navigate to="/welcome" replace />;
  const wErr = tried && weeksError(draft.weeks) ? t.weeksError : undefined;
  const dErr = tried && daysError(draft.days) ? t.daysError : undefined;
  const setName = (i: 0 | 1, v: string) => set((d) => ({ ...d, names: i === 0 ? [v, d.names[1]] : [d.names[0], v] }));
  const finish = async () => {
    setTried(true);
    if (weeksError(draft.weeks) || daysError(draft.days)) return;
    await save.mutateAsync([toProfilePatch(draft, today())]);
    navigate('/home', { replace: true });
  };
  const age = (
    <div className="grid grid-cols-2 gap-4">
      <Input label={t.pregnancyWeek} inputMode="numeric" value={draft.weeks} error={wErr} onChange={(e) => set((d) => ({ ...d, weeks: e.target.value }))} trailing={<span className="type-caption-default text-text-secondary">{t.weeksUnit}</span>} />
      <Input label={t.extraDays} inputMode="numeric" value={draft.days} error={dErr} onChange={(e) => set((d) => ({ ...d, days: e.target.value }))} trailing={<span className="type-caption-default text-text-secondary">{t.daysUnit}</span>} />
    </div>
  );
  const note = (t: string) => <p className="type-caption-default text-text-secondary">{t}</p>;
  return (
    <div className="flex flex-col gap-3 p-6">
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="type-body-default text-text-brand" onClick={() => navigate('/welcome/profile')}>
          ‹ {c.back}
        </button>
        <div className="flex items-center gap-3">
          <span className="type-caption-strong text-text-secondary">3 / 3</span>
          <LanguageButton />
        </div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <span key={i} className="h-1 flex-1 rounded-999 bg-bg-success" />
        ))}
      </div>
      {draft.babyCount === 'unconfirmed' ? <Icon name="Profile" size={26} className="text-icon-default" /> : <BabyStepIcon twins={draft.babyCount === 'twins'} />}
      <h1 className="type-heading-large text-text-primary">{t.babyTitle}</h1>
      <p className="type-body-default text-text-secondary">{t.babySub}</p>
      <div className="flex gap-2">
        {TYPE_IDS.map((id) => (
          <Chip key={id} selected={draft.babyCount === id} className="flex-1" onClick={() => set((d) => ({ ...d, babyCount: id }))}>
            {{ one: t.oneBaby, twins: t.twins, unconfirmed: t.notSure }[id]}
          </Chip>
        ))}
      </div>
      {draft.babyCount === 'one' && (
        <>
          <Input label={t.babyNickname} placeholder={t.babyNicknamePlaceholder} value={draft.names[0]} onChange={(e) => setName(0, e.target.value)} />
          {age}
          {note(t.notSureHowFar)}
        </>
      )}
      {draft.babyCount === 'twins' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.babyA} placeholder={t.babyAPlaceholder} value={draft.names[0]} onChange={(e) => setName(0, e.target.value)} />
            <Input label={t.babyB} placeholder={t.babyNicknamePlaceholder} value={draft.names[1]} onChange={(e) => setName(1, e.target.value)} />
          </div>
          {note(t.abLabels)}
          {age}
          {note(t.twinsShare)}
        </>
      )}
      {draft.babyCount === 'unconfirmed' && (
        <>
          <p className="type-body-default text-text-secondary">{t.startLogging}</p>
          {age}
          {note(t.notSureHowFar)}
        </>
      )}
      <Button block disabled={save.isPending} onClick={finish}>
        {t.getStarted}
      </Button>
      {note(t.skipNicknames)}
    </div>
  );
}
