import { Icon } from '@/components';
import { useActiveMovement, useMealsOn, useMoods, useMovements } from '@/data/queries';
import { addDays } from '@/data/rules';
import { useT } from '@/i18n';
import { messages } from './i18n';
import { today } from '@/data/services';
import { useNavigate, useSearchParams } from 'react-router';
import { FoodList, KickSummary, MoodEmpty, MoodRow, NutritionSummary, DateNavigation } from './parts';
import { missingMainMeals, moodsOn, movementCountOn, resolveDate, sortMeals, sumConfirmed } from './logic';

/** 05.Health Record: read-only daily summary; `?date=YYYY-MM-DD` switches the day. */
export function RecordsPage() {
  const t = useT(messages);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const now = today();
  const date = resolveDate(params.get('date'), now);
  const go = (d: string) => setParams(d === now ? {} : { date: d }, { replace: true });

  const meals = sortMeals(useMealsOn(date).data ?? []);
  const sessions = useMovements().data ?? [];
  const active = useActiveMovement().data;
  const moods = moodsOn(date, useMoods().data ?? []);

  const missing = missingMainMeals(meals);
  const newMeal = (type?: string) => navigate(`/meals/new?${type ? `type=${type}&` : ''}date=${date}`);

  return (
    <div className="flex min-h-full flex-col bg-bg-canvas">
      <header className="border-b border-border-default bg-bg-surface px-6 pb-px pt-8">
        <h1 className="py-0 type-heading-large text-text-primary">{t.title}</h1>
      </header>
      <div className="flex flex-col gap-6 p-5">
        <DateNavigation date={date} canNext={date < now} onPrev={() => go(addDays(date, -1))} onNext={() => go(addDays(date, 1))} />
        <NutritionSummary totals={sumConfirmed(meals)} isToday={date === now} />
        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 type-heading-small text-text-secondary"><Icon name="Food" size={16} />{t.mealLog}</h2>
          <FoodList
            meals={meals}
            missing={missing}
            onOpen={(m) => navigate(`/meals/${m.id}`)}
            onEstimate={(m) => navigate(`/meals/${m.id}/estimate`)}
            onAdd={newMeal}
            onAddMeal={() => newMeal(missing[0] ?? 'snack')}
          />
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 type-heading-small text-text-secondary"><Icon name="Kick" size={16} />{t.movementLog}</h2>
          <KickSummary count={movementCountOn(date, sessions, active)} onLog={() => navigate('/movement')} onHistory={() => navigate('/movement/history')} />
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 type-heading-small text-text-secondary"><Icon name="Mood" size={16} />{t.moodJournal}</h2>
          {moods.length === 0 ? (
            <MoodEmpty onLog={() => navigate('/mood/new')} />
          ) : (
            <div className="flex flex-col gap-3">
              {moods.map((m) => <MoodRow key={m.id} entry={m} onOpen={() => navigate(`/mood/${m.id}`)} />)}
            </div>
          )}
          <button type="button" onClick={() => navigate('/mood')} className="self-start type-caption-strong text-text-brand">{t.viewMoodHistory}</button>
        </section>
      </div>
    </div>
  );
}
