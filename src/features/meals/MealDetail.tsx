import { useUp } from '@/app/nav';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Button, ConfirmDialog, RecordPage } from '@/components';
import { keys, useAction, useMeal } from '@/data/queries';
import { mealService } from '@/data/services';
import { useT } from '@/i18n';
import { common } from '@/i18n/common';
import { messages } from './i18n';
import { estimateNutrition, formatDate, typeLabel } from './logic';
import { MissingMeal } from './MealForm';
import { Banner, FoodList, PhotoRow, TextLink } from './parts';

/** meals/:id (05-3 / 05-5 / 12-F2) */
export function MealDetail() {
  const t = useT(messages);
  const c = useT(common);
  const BANNERS: Record<string, string> = { saved: t.bannerSaved, updated: t.bannerUpdated, estimated: t.bannerEstimated };
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
        <button type="button" aria-label={c.back} onClick={up} className="type-heading-large text-text-brand">
          ‹
        </button>
        <h1 className="type-heading-medium text-text-primary">{t.mealDetails}</h1>
      </header>
      {banner && BANNERS[banner] && <Banner>{BANNERS[banner]}</Banner>}
      <h2 className="type-heading-large text-text-primary">{typeLabel(meal.type)}</h2>
      <p className="-mt-2 type-body-default text-text-secondary">
        {formatDate(meal.date)} · {meal.time}
      </p>
      <PhotoRow photoIds={meal.photoIds} />
      <FoodList foods={meal.foods} />
      <div className="flex flex-col gap-3 rounded-14 border border-border-default bg-bg-surface p-4">
        <p className="type-heading-small text-text-primary">{n ? t.nutritionFor : t.nutritionNot}</p>
        <p className="type-body-default text-text-secondary">
          {n ? t.nutritionLine(n.kcal, n.proteinG, n.carbsG) : t.reviewLater}
        </p>
      </div>
      <Button block variant="soft" onClick={() => navigate(`/meals/${meal.id}/estimate`)}>
        {n ? t.estimateAgain : t.estimateAI}
      </Button>
      <Button block variant="outline" onClick={() => navigate(`/meals/${meal.id}/edit`)}>
        {t.editMealBtn}
      </Button>
      <TextLink onClick={() => setConfirmDelete(true)}>{t.deleteMeal}</TextLink>
      <ConfirmDialog
        open={confirmDelete}
        danger
        title={t.deleteTitle}
        message={t.cannotUndo}
        confirmLabel={t.keepEntry}
        cancelLabel={t.delete}
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
  const t = useT(messages);
  const c = useT(common);
  const { id } = useParams();
  const navigate = useNavigate();
  const up = useUp('/records'); // /meals/:id is the ancestor when we came from it
  const { data: meal, isLoading } = useMeal(id);
  const update = useAction(mealService.update, [keys.meals]);
  if (isLoading) return <RecordPage>{null}</RecordPage>;
  if (!meal) return <MissingMeal />;
  const est = estimateNutrition(meal.foods);
  const rows: [string, string][] = [
    [t.energy, t.nutritionKcal(est.kcal)],
    [t.protein, t.nutritionG(est.proteinG)],
    [t.carbs, t.nutritionG(est.carbsG)],
  ];
  return (
    <RecordPage className="gap-4 pb-8">
      <header className="flex items-center gap-3">
        <button type="button" aria-label={c.back} onClick={up} className="type-heading-large text-text-brand">
          ‹
        </button>
        <h1 className="type-heading-medium text-text-primary">{t.reviewEstimate}</h1>
      </header>
      <p className="type-heading-small text-text-primary">
        {t.typeFoods(typeLabel(meal.type), meal.foods.length)}
      </p>
      <p className="-mt-2 type-body-default text-text-secondary">{t.sampleEstimates}</p>
      <div className="flex flex-col gap-3 rounded-16 bg-bg-soft p-5">
        {rows.map(([k, val]) => (
          <div key={k} className="flex justify-between gap-3">
            <span className="type-body-default text-text-primary">{k}</span>
            <span className="type-heading-small text-text-primary">{val}</span>
          </div>
        ))}
      </div>
      <FoodList foods={meal.foods} />
      <p className="type-caption-default text-text-secondary">{t.estimatesVary}</p>
      <Button block variant="outline" onClick={() => navigate(`/meals/${meal.id}/edit`)}>
        {t.editFoodsPortions}
      </Button>
      <Button
        block
        onClick={async () => {
          await update.mutateAsync([meal.id, { nutrition: { ...est, confirmed: true } }]);
          navigate(`/meals/${meal.id}`, { replace: true, state: { banner: 'estimated' } });
        }}
      >
        {t.confirmSave}
      </Button>
      <TextLink onClick={() => navigate(`/meals/${meal.id}`, { replace: true })}>{t.skipEstimate}</TextLink>
    </RecordPage>
  );
}
