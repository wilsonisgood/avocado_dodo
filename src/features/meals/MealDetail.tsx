import { useUp } from '@/app/nav';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Button, ConfirmDialog, RecordPage } from '@/components';
import { keys, useAction, useMeal } from '@/data/queries';
import { mealService } from '@/data/services';
import { estimateNutrition, formatDate, typeLabel } from './logic';
import { MissingMeal } from './MealForm';
import { Banner, FoodList, PhotoRow, TextLink } from './parts';

const BANNERS: Record<string, string> = {
  saved: "Saved to today's meal log",
  updated: "Meal updated · Today's points already claimed",
  estimated: 'Nutrition estimate saved',
};

/** meals/:id (05-3 / 05-5 / 12-F2) */
export function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const up = useUp('/records');
  const banner = (useLocation().state as { banner?: string } | null)?.banner;
  const { data: meal, isLoading } = useMeal(id);
  const remove = useAction(mealService.remove, [keys.meals]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (isLoading) return <RecordPage>{null}</RecordPage>;
  if (!meal) return <MissingMeal />;
  const n = meal.nutrition?.confirmed ? meal.nutrition : undefined;

  return (
    <RecordPage className="gap-4 pb-8">
      <header className="flex items-center gap-3">
        <button type="button" aria-label="Back" onClick={up} className="type-heading-large text-text-brand">
          ‹
        </button>
        <h1 className="type-heading-medium text-text-primary">Meal details</h1>
      </header>
      {banner && BANNERS[banner] && <Banner>{BANNERS[banner]}</Banner>}
      <h2 className="type-heading-large text-text-primary">{typeLabel(meal.type)}</h2>
      <p className="-mt-2 type-body-default text-text-secondary">
        {formatDate(meal.date)} · {meal.time}
      </p>
      <PhotoRow photoIds={meal.photoIds} />
      <FoodList foods={meal.foods} />
      <div className="flex flex-col gap-3 rounded-14 border border-border-default bg-bg-surface p-4">
        <p className="type-heading-small text-text-primary">{n ? 'Nutrition for this meal' : 'Nutrition not estimated yet'}</p>
        <p className="type-body-default text-text-secondary">
          {n ? `${n.kcal} kcal · Protein ${n.proteinG} g · Carbs ${n.carbsG} g` : 'Keep this entry and review nutrition later.'}
        </p>
      </div>
      <Button block variant="soft" onClick={() => navigate(`/meals/${meal.id}/estimate`)}>
        {n ? 'Estimate again' : 'Estimate with AI'}
      </Button>
      <Button block variant="outline" onClick={() => navigate(`/meals/${meal.id}/edit`)}>
        Edit meal
      </Button>
      <TextLink onClick={() => setConfirmDelete(true)}>Delete meal</TextLink>
      <ConfirmDialog
        open={confirmDelete}
        danger
        title="Delete this meal?"
        message="This cannot be undone."
        confirmLabel="Keep entry"
        cancelLabel="Delete"
        onConfirm={() => setConfirmDelete(false)}
        onCancel={async () => {
          await remove.mutateAsync([meal.id]);
          navigate('/records', { replace: true });
        }}
      />
    </RecordPage>
  );
}

/** meals/:id/estimate (05-4): sample estimate, not medical advice. */
export function MealEstimate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const up = useUp('/records'); // /meals/:id is the ancestor when we came from it
  const { data: meal, isLoading } = useMeal(id);
  const update = useAction(mealService.update, [keys.meals]);
  if (isLoading) return <RecordPage>{null}</RecordPage>;
  if (!meal) return <MissingMeal />;
  const est = estimateNutrition(meal.foods);
  const rows: [string, string][] = [
    ['Energy', `${est.kcal} kcal`],
    ['Protein', `${est.proteinG} g`],
    ['Carbs', `${est.carbsG} g`],
  ];
  return (
    <RecordPage className="gap-4 pb-8">
      <header className="flex items-center gap-3">
        <button type="button" aria-label="Back" onClick={up} className="type-heading-large text-text-brand">
          ‹
        </button>
        <h1 className="type-heading-medium text-text-primary">Review nutrition estimate</h1>
      </header>
      <p className="type-heading-small text-text-primary">
        {typeLabel(meal.type)} · {meal.foods.length} foods
      </p>
      <p className="-mt-2 type-body-default text-text-secondary">Sample estimates. Check food names and portions.</p>
      <div className="flex flex-col gap-3 rounded-16 bg-bg-soft p-5">
        {rows.map(([k, val]) => (
          <div key={k} className="flex justify-between gap-3">
            <span className="type-body-default text-text-primary">{k}</span>
            <span className="type-heading-small text-text-primary">{val}</span>
          </div>
        ))}
      </div>
      <FoodList foods={meal.foods} />
      <p className="type-caption-default text-text-secondary">Estimates may vary. Edit portions and estimate again, or save the food log only.</p>
      <Button block variant="outline" onClick={() => navigate(`/meals/${meal.id}/edit`)}>
        Edit foods & portions
      </Button>
      <Button
        block
        onClick={async () => {
          await update.mutateAsync([meal.id, { nutrition: { ...est, confirmed: true } }]);
          navigate(`/meals/${meal.id}`, { replace: true, state: { banner: 'estimated' } });
        }}
      >
        Confirm & save estimate
      </Button>
      <TextLink onClick={() => navigate(`/meals/${meal.id}`, { replace: true })}>Skip estimate</TextLink>
    </RecordPage>
  );
}
