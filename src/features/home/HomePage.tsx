import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, CompanionProgress, FieldControl, FruitCompanion, fruitImageForWeek, Icon, MoodChoice, asset, cx, type IconName, type MoodKind } from '@/components';
import { appointmentTypeLabel, relativeDay, shortDateWithWeekday } from '@/data/labels';
import { useActiveMovement, useAppointments, useMealsOn, useMoods, useMovements, useProfile, useRewards } from '@/data/queries';
import { growthPercent, pregnancyAge } from '@/data/rules';
import { today } from '@/data/services';
import type { MealType } from '@/data/types';
import { moodOn, movementsOn, nextAppointment, taskProgress } from './logic';

const card = 'flex flex-col rounded-16 border border-border-default bg-bg-surface shadow-card';

function CardTitle({ icon, children, right }: { icon: IconName; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex h-6 items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 type-heading-small text-text-primary">
        <Icon name={icon} size={20} />
        {children}
      </h3>
      {right}
    </div>
  );
}

// ---- header ------------------------------------------------------------------------------------
function Header() {
  const day = today();
  const { data: profile, isLoading } = useProfile();
  const { data: rewards } = useRewards();
  const age = profile ? pregnancyAge(profile.pregnancy, day) : null;
  const progress = taskProgress(rewards, day);
  const twins = profile?.babyCount === 'twins';
  const week = age?.weeks ?? 0;
  return (
    <header className="relative h-67.5 shrink-0 overflow-hidden rounded-b-[40px] bg-bg-blush">
      <img src={asset('assets/vectors/7-3.svg')} alt="" className="absolute top-[-95px] left-47 h-[271px] w-[263px]" />
      {age && (
        <div className="absolute top-2 right-6">
          {twins ? (
            <div className="relative h-[150px] w-[150px]">
              <img src={fruitImageForWeek(week)} alt="" className="absolute top-14 left-2 size-[91px] -rotate-[32deg] object-contain" />
              <img src={fruitImageForWeek(week)} alt="" className="absolute top-3 left-0 size-[91px] rotate-[34deg] object-contain" />
            </div>
          ) : (
            <FruitCompanion week={week} size={120} />
          )}
        </div>
      )}
      <div className="absolute top-8 left-6 flex w-[200px] flex-col gap-1">
        {age ? (
          <>
            <h1 className="type-heading-large text-text-primary">Week {age.weeks}</h1>
            {age.weeks === 4 && <p className="type-body-default text-text-primary">Baby: avocado size</p>}
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-999 bg-bg-surface px-3 py-1 type-caption-strong text-text-sage shadow-card">
              <Icon name="Growth" size={12} />
              Growing
            </span>
          </>
        ) : (
          !isLoading && (
            <Link to="/profile" className="type-label-default text-text-brand underline">
              Set your pregnancy week
            </Link>
          )
        )}
        <Link to="/tasks" className="mt-2 w-fit">
          <Button size="small" variant="soft" tabIndex={-1}>
            Baby's note
          </Button>
        </Link>
      </div>
      <Link to="/tasks" className="absolute right-6 bottom-4 left-6 block">
        <CompanionProgress percent={rewards ? growthPercent(rewards) : 0} caption={`${progress.done}/${progress.total} tasks done today`} />
      </Link>
    </header>
  );
}

// ---- cards -------------------------------------------------------------------------------------
function QuickActions() {
  const tiles: { to: string; label: string; bg: string; text: string; ring: string; icon: ReactNode }[] = [
    { to: '/meals/new', label: 'Meals', bg: 'bg-bg-subtle-success', text: 'text-text-sage', ring: '', icon: <Icon name="Food" size={16} className="text-icon-sage" /> },
    { to: '/movement', label: 'Movement', bg: 'bg-bg-soft', text: 'text-text-brand', ring: 'border border-border-peach', icon: <Icon name="Kick" size={20} /> },
    { to: '/mood/new', label: 'Mood', bg: 'bg-bg-blush', text: 'text-text-brand', ring: 'border border-border-blush', icon: <Icon name="Mood" size={16} className="text-icon-muted" /> },
  ];
  return (
    <section className={cx(card, 'gap-3 p-5')}>
      <Link to="/tasks">
        <CardTitle icon="Tasks">Today's task progress</CardTitle>
      </Link>
      <div className="flex gap-2">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className={cx('flex h-17 flex-1 flex-col items-center gap-1 rounded-14 p-2', t.bg)}>
            <span className={cx('flex size-8 items-center justify-center rounded-999 bg-bg-surface shadow-card', t.ring)}>{t.icon}</span>
            <span className={cx('type-caption-strong', t.text)}>{t.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const MEAL_BUTTONS: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Breakfast' },
  { type: 'lunch', label: 'Lunch' },
  { type: 'dinner', label: 'Dinner' },
  { type: 'snack', label: 'Snack' },
];

function FoodSummary() {
  const navigate = useNavigate();
  const { data: meals } = useMealsOn(today());
  const todo = !meals || meals.length === 0;
  return (
    <section className={cx(card, 'gap-3 p-4')}>
      <CardTitle
        icon="Food"
        right={
          <Link to="/records" className="rounded-999 bg-bg-subtle-error px-3 py-1 type-caption-default text-text-rose">
            {todo ? 'To do >' : `${meals.length} logged >`}
          </Link>
        }
      >
        Food diary
      </CardTitle>
      <div className="flex items-center gap-3">
        <Link to="/meals/new" className="flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-10 border border-dashed border-border-default bg-bg-canvas">
          <Icon name="Camera" size={20} className="text-icon-muted" />
          <span className="type-caption-default text-text-muted">Photo</span>
        </Link>
        <div className="grid flex-1 grid-cols-3 gap-2">
          {MEAL_BUTTONS.map((b, i) => (
            <Button key={b.type} size="small" variant="soft" className={cx('px-2', i === 3 && 'col-span-3')} onClick={() => navigate(`/meals/new?type=${b.type}`)}>
              {b.label}
            </Button>
          ))}
        </div>
      </div>
      <Link to="/records" className="relative flex gap-3 rounded-10 bg-bg-subtle-soft p-3">
        <Icon name="Food" size={16} className="mt-0.5 shrink-0" />
        <div className="flex flex-1 flex-col gap-0.5 pr-6">
          <p className="type-label-default text-text-primary">✨ AI meal tips</p>
          <p className="type-caption-default text-text-secondary">Try an egg or a glass of soy milk for a little extra protein.</p>
        </div>
        <Icon name="ChevronRight" size={16} className="absolute top-5 right-3" />
      </Link>
    </section>
  );
}

function KickSummary() {
  const { data: sessions } = useMovements();
  const { data: active } = useActiveMovement();
  const count = movementsOn(today(), sessions ?? [], active);
  return (
    <section className={cx(card, 'relative gap-2 px-4 pt-4 pb-px')}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle icon="Kick">Baby movements</CardTitle>
          <p className="type-caption-default text-text-secondary">Notice your baby's usual pattern</p>
        </div>
        <span className="type-metric text-text-primary">{count}</span>
      </div>
      <div className="relative h-25">
        <img src={asset('assets/vectors/55-1742.svg')} alt="" className="absolute top-[39px] left-[5px] h-[56px] w-[254px]" />
        <Link to="/movement" className="absolute top-11 right-0">
          <span className="flex size-14 items-center justify-center rounded-999 bg-action-default type-label-default text-text-on-action active:bg-action-pressed">Start</span>
        </Link>
      </div>
    </section>
  );
}

function MoodSummary() {
  const navigate = useNavigate();
  const { data: moods } = useMoods();
  const current = moodOn(today(), moods);
  const kinds: MoodKind[] = ['happy', 'calm', 'sad'];
  return (
    <section className={cx(card, 'gap-3 px-4 pt-4 pb-px')}>
      <CardTitle icon="Mood">Mood journal</CardTitle>
      <div className="flex gap-2">
        {kinds.map((m) => (
          <MoodChoice key={m} mood={m} compact selected={current === m} onClick={() => navigate(`/mood/new?mood=${m}`)} />
        ))}
      </div>
      <FieldControl readOnly placeholder="How are you feeling right now?" className="mb-4 h-9 cursor-pointer" onClick={() => navigate('/mood/new')} />
    </section>
  );
}

// Text is the design's only timeline content (Weeks 0–13); it is shown at any week, labelled as such.
const TIMELINE = [
  { title: 'Weeks 6–8: First prenatal visit', body: 'Location, heartbeat and number of babies.', badge: 'Heartbeat noted' },
  { title: 'Weeks 10–12: NIPT screening', body: 'Discuss screening options with your care team.' },
  { title: 'Weeks 11–13: Nuchal translucency', body: 'A screening option to discuss with your care team.' },
];

function Timeline() {
  return (
    <section className={cx(card, 'gap-4 p-5')}>
      <CardTitle icon="Journal" right={<span className="rounded-999 bg-bg-compat-f0ede8 px-3 py-1 type-caption-strong text-text-brand">Weeks 0–13</span>}>
        Pregnancy timeline
      </CardTitle>
      <ol className="relative flex flex-col gap-5">
        <span className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-bg-disabled" aria-hidden />
        {TIMELINE.map((t) => (
          <li key={t.title} className="relative pl-8">
            <span className="absolute top-1.5 left-0 flex size-5 items-center justify-center rounded-999 border border-border-surface bg-bg-blush shadow-card">
              <span className="size-2 rounded-999 bg-bg-blush" />
            </span>
            <h4 className="type-heading-small text-text-primary">{t.title}</h4>
            <p className="mt-1 type-caption-default text-text-secondary">{t.body}</p>
            {t.badge && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-8 bg-bg-subtle-success px-2 py-1 type-caption-default text-text-sage">
                <Icon name="Location" size={12} />
                {t.badge}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function AppointmentCard() {
  const day = today();
  const { data: list } = useAppointments();
  const next = nextAppointment(list, day);
  const body = next ? (
    <>
      <p className="type-label-default text-text-primary">{next.name}</p>
      <p className="type-caption-default text-text-secondary">
        {shortDateWithWeekday(next.date)} · {next.time}
        {next.location ? ` · ${next.location}` : ''} · {appointmentTypeLabel(next.type)}
      </p>
    </>
  ) : (
    <p className="type-caption-default text-text-secondary">No upcoming appointments</p>
  );
  return (
    <section className="flex flex-col gap-2 rounded-16 bg-bg-soft p-4 shadow-card">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Icon name="Calendar" size={20} />
          <h3 className="flex-1 type-heading-small text-text-primary">Health appointments</h3>
          {next && <span className="type-caption-strong text-text-brand">{relativeDay(next.date, day)}</span>}
        </div>
        {next ? <Link to={`/appointments/${next.id}`} className="flex flex-col gap-1">{body}</Link> : body}
      </div>
      <div className="flex gap-2">
        <Link to="/appointments/new" className="flex-1">
          <Button size="small" block tabIndex={-1}>Add</Button>
        </Link>
        <Link to="/appointments" className="flex-1">
          <Button size="small" variant="outline" block tabIndex={-1}>View all</Button>
        </Link>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <div className="flex min-h-full flex-col gap-5 bg-bg-canvas pb-6">
      <Header />
      <div className="flex flex-col gap-5 px-5">
        <QuickActions />
        <FoodSummary />
        <KickSummary />
        <MoodSummary />
        <Timeline />
        <AppointmentCard />
      </div>
    </div>
  );
}
