import { Button, Icon, RecordEmpty, asset, cx, moodMeta } from '@/components';
import { usePhotoUrl } from '@/data/queries';
import type { Meal, MoodEntry } from '@/data/types';
import { NUTRITION_TARGETS, clockTime, mealDetail, mealTitle, mealTypeLabel, progressPct, type NutritionTotals } from './logic';
import type { MealType } from '@/data/types';
import { common } from '@/i18n/common';
import { useT } from '@/i18n';
import { fmtDate } from '@/i18n/format';
import { messages } from './i18n';

const card = 'rounded-16 border border-border-default bg-bg-surface shadow-sm';

/** Nestly/DateNavigation */
export function DateNavigation({ date, canNext, onPrev, onNext }: { date: string; canNext: boolean; onPrev: () => void; onNext: () => void }) {
  const t = useT(messages);
  return (
    <div className={cx('flex items-center justify-between px-2', 'h-14.5 rounded-14 border border-border-default bg-bg-surface shadow-sm')}>
      <button type="button" aria-label={t.prevDay} onClick={onPrev} className="flex size-9 items-center justify-center rounded-10">
        <img src={asset('assets/vectors/53-902.svg')} alt="" className="size-5" />
      </button>
      <div className="flex flex-1 items-center justify-center gap-2 type-heading-small text-text-primary">
        <Icon name="Calendar" size={16} className="text-icon-secondary" />
        {fmtDate(date)}
      </div>
      <button type="button" aria-label={t.nextDay} disabled={!canNext} onClick={onNext} className={cx('flex size-9 items-center justify-center rounded-10', !canNext && 'opacity-40')}>
        <img src={asset('assets/vectors/53-906.svg')} alt="" className="size-5" />
      </button>
    </div>
  );
}

function Bar({ label, value, target, fill }: { label: string; value: number; target: number; fill: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between type-caption-default">
        <span className="text-text-secondary">{label}</span>
        <span className="type-caption-strong text-text-primary">{`${Math.round(value)} / ${target}`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg-surface">
        <div className={cx('h-full rounded-full', fill)} style={{ width: `${progressPct(value, target)}%` }} />
      </div>
    </div>
  );
}

/** Nestly/Record/NutritionSummary (targets are the design's fixed demo values). */
export function NutritionSummary({ totals, isToday }: { totals: NutritionTotals; isToday: boolean }) {
  const t = useT(messages);
  return (
    <section className="flex flex-col gap-3 rounded-16 border border-border-peach bg-bg-soft p-4">
      <h2 className="flex items-center gap-2 type-heading-small text-text-brand">
        <Icon name="Nutrition" size={16} />
        {isToday ? t.todaysNutrition : t.nutrition}
      </h2>
      <div className="flex flex-col gap-3">
        <Bar label={t.energy} value={totals.kcal} target={NUTRITION_TARGETS.kcal} fill="bg-bg-warning" />
        <Bar label={t.protein} value={totals.proteinG} target={NUTRITION_TARGETS.proteinG} fill="bg-bg-success" />
        <Bar label={t.carbs} value={totals.carbsG} target={NUTRITION_TARGETS.carbsG} fill="bg-bg-blush" />
      </div>
    </section>
  );
}

function Thumb({ meal, index }: { meal: Meal; index: number }) {
  const { data: url } = usePhotoUrl(meal.photoIds[0] ?? '');
  // The design's tile overlay (55-1901 / 55-1910) is the literal text "&#26089;" / "&#21320;" outlined into a vector
  // (an HTML-escaped 早 / 午 from the designer's import), so only the coloured tile is used (LEDGER D-glyph).
  const bg = index % 2 === 0 ? '55-1900' : '55-1909';
  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-10">
      {meal.photoIds[0] && url ? (
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        <img src={asset(`assets/vectors/${bg}.svg`)} alt="" className="absolute inset-0 size-full" />
      )}
    </div>
  );
}

/** Nestly/Record/FoodList */
export function FoodList({ meals, missing, onOpen, onEstimate, onAdd, onAddMeal }: { meals: Meal[]; missing: MealType[]; onOpen: (m: Meal) => void; onEstimate: (m: Meal) => void; onAdd: (t: MealType) => void; onAddMeal: () => void }) {
  const t = useT(messages);
  return (
    <div className={cx(card, 'flex flex-col overflow-hidden p-px')}>
      {meals.map((m, i) => (
        <div key={m.id} className="flex items-center gap-3 border-b border-border-default px-3 py-3">
          <button type="button" onClick={() => onOpen(m)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
            <Thumb meal={m} index={i} />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate type-heading-small text-text-primary">{mealTitle(m)}</span>
              <span className={cx('type-caption-default', m.nutrition?.confirmed ? 'text-text-muted' : 'text-text-muted')}>{mealDetail(m)}</span>
            </span>
          </button>
          {!m.nutrition?.confirmed && (
            <Button size="small" variant="soft" onClick={() => onEstimate(m)}>
              {t.estimate}
            </Button>
          )}
        </div>
      ))}
      {missing.map((type) => (
        <button key={type} type="button" onClick={() => onAdd(type)} className="flex items-center gap-3 border-b border-border-default px-3 py-3 text-left">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-10 border border-dashed border-border-default bg-bg-canvas">
            <Icon name="Camera" size={20} className="text-icon-secondary" />
          </span>
          <span className="type-heading-small text-text-muted">{t.notLogged(mealTypeLabel(type))}</span>
        </button>
      ))}
      <div className="p-3">
        <Button block onClick={onAddMeal}>{t.addMeal}</Button>
      </div>
    </div>
  );
}

/** Nestly/Record/KickSummary: the line chart is the design's sample vector (decorative). */
export function KickSummary({ count, onLog, onHistory }: { count: number; onLog: () => void; onHistory: () => void }) {
  const t = useT(messages);
  const c = useT(common);
  return (
    <div className={cx(card, 'flex flex-col gap-3 p-4')}>
      <div className="flex items-center justify-between">
        <h3 className="type-heading-small text-text-primary">{count === 0 ? t.count : t.todaysCount}</h3>
        <span className="type-heading-large text-text-sand">{count}</span>
      </div>
      {count > 0 && (
        <div className="relative h-45 overflow-hidden" aria-hidden>
          <div className="absolute left-0.5 top-[65.75px] h-[112.25px] w-[332px]">
            <img src={asset('assets/vectors/55-1943.svg')} alt="" className="absolute left-[3px] top-[3px] w-[326px]" />
            {[['55-1945', 0, 63.75], ['55-1946', 81.5, 106.25], ['55-1947', 162.99, 0], ['55-1948', 244.49, 85], ['55-1949', 325.99, 42.5]].map(([id, x, y]) => (
              <img key={id as string} src={asset(`assets/vectors/${id}.svg`)} alt="" className="absolute w-1.5" style={{ left: x as number, top: y as number }} />
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <Button className="flex-1" onClick={onLog}>{t.logMovements}</Button>
        <Button variant="outline" onClick={onHistory}>{c.navRecords}</Button>
      </div>
    </div>
  );
}

/** Nestly/Record/MoodRow */
export function MoodRow({ entry, onOpen }: { entry: MoodEntry; onOpen: () => void }) {
  const meta = moodMeta[entry.mood];
  return (
    <button type="button" onClick={onOpen} className={cx(card, 'flex h-15.5 items-center gap-3 rounded-14 px-3 text-left')}>
      <span className="type-heading-large">{meta.emoji}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-heading-small text-text-primary">{meta.label}</span>
        <span className="truncate type-caption-default text-text-muted">{entry.note ? `${clockTime(entry.at)} · ${entry.note}` : clockTime(entry.at)}</span>
      </span>
    </button>
  );
}

export function MoodEmpty({ onLog }: { onLog: () => void }) {
  const t = useT(messages);
  return (
    <div className="flex flex-col gap-3">
      <RecordEmpty title={t.noMood}>{t.noMoodBody}</RecordEmpty>
      <Button variant="outline" block onClick={onLog}>{t.logMood}</Button>
    </div>
  );
}
