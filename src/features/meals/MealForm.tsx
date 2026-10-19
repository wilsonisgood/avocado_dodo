import { useUp } from '@/app/nav';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Button, Chip, ConfirmDialog, CompanionDialog, Input, RecordPage, Sheet, TimeFields, cx } from '@/components';
import { keys, useAction, useMeal, useRewards } from '@/data/queries';
import { mealService, today } from '@/data/services';
import { growthPercent, tasksDone } from '@/data/rules';
import { useT } from '@/i18n';
import { common } from '@/i18n/common';
import type { FoodItem, Meal } from '@/data/types';
import { messages } from './i18n';
import { formatDate, mealTypes, isDirty, parseMealType, typeLabel, validateFood, validateMeal, type MealDraft } from './logic';
import { FoodList, PhotoRow } from './parts';

const nowTime = () => new Date().toTimeString().slice(0, 5);

/** meals/new */
export function NewMeal() {
  const t = useT(messages);
  const [q] = useSearchParams();
  const initial: MealDraft = {
    date: /^\d{4}-\d{2}-\d{2}$/.test(q.get('date') ?? '') ? q.get('date')! : today(),
    time: nowTime(),
    type: parseMealType(q.get('type')) ?? 'breakfast',
    loggedFor: t.loggedForMe,
    photoIds: [],
    foods: [],
  };
  return <MealForm initial={initial} />;
}

/** meals/:id/edit */
export function EditMeal() {
  const { id } = useParams();
  const { data: meal, isLoading } = useMeal(id);
  if (isLoading) return <RecordPage>{null}</RecordPage>;
  if (!meal) return <MissingMeal />;
  const { date, time, type, loggedFor, photoIds, foods } = meal;
  return <MealForm meal={meal} initial={{ date, time, type, loggedFor, photoIds, foods }} />;
}

export function MissingMeal() {
  const t = useT(messages);
  const navigate = useNavigate();
  return (
    <RecordPage>
      <p className="type-body-default text-text-secondary">{t.notFound}</p>
      <Button onClick={() => navigate('/records', { replace: true })}>{t.backToRecords}</Button>
    </RecordPage>
  );
}

const newId = () => globalThis.crypto?.randomUUID?.() ?? `f${Date.now()}${Math.random().toString(36).slice(2)}`;

function MealForm({ initial, meal }: { initial: MealDraft; meal?: Meal }) {
  const t = useT(messages);
  const c = useT(common);
  const navigate = useNavigate();
  const [draft, setDraft] = useState<MealDraft>(initial);
  const [added, setAdded] = useState<string[]>([]); // photos uploaded in this session (cleaned up on discard)
  const [editing, setEditing] = useState<FoodItem | 'new' | null>(null);
  /** Meal time being picked in the sheet (null = closed). */
  const [pickingTime, setPickingTime] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const up = useUp('/records');
  const [reward, setReward] = useState<{ id: string; awarded: number } | null>(null);
  const create = useAction(mealService.create, [keys.meals, keys.rewards]);
  const update = useAction(mealService.update, [keys.meals]);
  const addPhoto = useAction(mealService.addPhoto, []);
  const rewards = useRewards();

  const v = validateMeal(draft);
  const dirty = isDirty(draft, initial);
  const set = (p: Partial<MealDraft>) => setDraft((d) => ({ ...d, ...p }));

  const leave = () => (dirty ? setConfirmLeave(true) : up());
  const discard = async () => {
    await Promise.all(added.map((p) => mealService.removePhoto(p)));
    up();
  };
  const save = async () => {
    if (!v.ok) return;
    if (meal) {
      await update.mutateAsync([meal.id, draft]);
      navigate(`/meals/${meal.id}`, { replace: true, state: { banner: 'updated' } });
    } else {
      const { meal: m, awarded } = await create.mutateAsync([draft]);
      if (awarded > 0) setReward({ id: m.id, awarded });
      else navigate(`/meals/${m.id}`, { replace: true, state: { banner: 'saved' } });
    }
  };
  const r = rewards.data;
  const growthNow = r ? growthPercent(r) : 0;
  const growthBefore = r ? growthPercent({ ...r, lifetimeEarned: r.lifetimeEarned - (reward?.awarded ?? 0) }) : 0;

  return (
    <RecordPage className="gap-4 pb-8">
      <header className="flex items-center gap-3">
        <button type="button" aria-label={c.back} onClick={leave} className="type-heading-large text-text-brand">
          ‹
        </button>
        <h1 className="type-heading-medium text-text-primary">{meal ? t.editMeal : t.addMeal}</h1>
      </header>
      <p className="type-label-default text-text-primary">{formatDate(draft.date)}</p>
      <div className="flex gap-4">
        {/* 24-hour time via the shared TimeFields (native <input type=time> shows AM/PM in en locales). */}
        <Input
          label={t.mealTime}
          readOnly
          className="min-w-0 flex-1"
          value={draft.time}
          error={v.errors.time}
          onClick={() => setPickingTime(draft.time || '12:00')}
        />
        <Input label={t.loggedFor} className="min-w-0 flex-1" value={draft.loggedFor} onChange={(e) => set({ loggedFor: e.target.value })} />
      </div>
      <div className="flex gap-2">
        {mealTypes().map((m) => (
          <Chip key={m.type} selected={draft.type === m.type} onClick={() => set({ type: m.type })}>
            {m.label}
          </Chip>
        ))}
      </div>
      {draft.photoIds.length === 0 && <p className="type-caption-default text-text-secondary">{t.photoOptional}</p>}
      <PhotoRow
        photoIds={draft.photoIds}
        onAdd={async (file) => {
          const [pid] = [await addPhoto.mutateAsync([file])];
          setAdded((a) => [...a, pid]);
          setDraft((d) => ({ ...d, photoIds: [...d.photoIds, pid] }));
        }}
      />
      {draft.foods.length === 0 ? (
        <div className="flex flex-col gap-3 rounded-14 border border-border-default bg-bg-surface p-6">
          <p className="type-heading-small text-text-primary">{t.noFoodYet}</p>
          <p className="type-body-default text-text-secondary">{v.errors.foods}</p>
        </div>
      ) : (
        <FoodList foods={draft.foods} onSelect={setEditing} />
      )}
      <Button block variant="outline" onClick={() => setEditing('new')}>
        {t.addFood}
      </Button>
      <p className="type-caption-default text-text-secondary">{t.tapFoodHint}</p>
      <Button block disabled={!v.ok || create.isPending || update.isPending} onClick={save}>
        {t.saveMeal}
      </Button>

      <Sheet open={pickingTime !== null} title={t.mealTime} onClose={() => setPickingTime(null)}>
        {pickingTime !== null && <TimeFields variant="row" value={pickingTime} onChange={setPickingTime} />}
        <Button
          block
          onClick={() => {
            set({ time: pickingTime! });
            setPickingTime(null);
          }}
        >
          {t.confirmTime}
        </Button>
        <Button block variant="outline" onClick={() => setPickingTime(null)}>
          {t.cancel}
        </Button>
      </Sheet>

      <FoodSheet
        key={editing === null ? 'closed' : editing === 'new' ? 'new' : editing.id}
        target={editing}
        type={typeLabel(draft.type)}
        time={draft.time}
        onClose={() => setEditing(null)}
        onSave={(f) => {
          setDraft((d) => ({ ...d, foods: d.foods.some((x) => x.id === f.id) ? d.foods.map((x) => (x.id === f.id ? f : x)) : [...d.foods, f] }));
          setEditing(null);
        }}
        onRemove={(id) => {
          setDraft((d) => ({ ...d, foods: d.foods.filter((x) => x.id !== id) }));
          setEditing(null);
        }}
      />
      <ConfirmDialog
        open={confirmLeave}
        title={t.saveBeforeLeaving}
        message={t.unsavedChanges}
        confirmLabel={t.keepEditing}
        cancelLabel={t.discardChanges}
        onConfirm={() => setConfirmLeave(false)}
        onCancel={discard}
      />
      <CompanionDialog
        open={!!reward}
        title={t.mealLogged}
        metric={`＋${reward?.awarded ?? 0} BP`}
        body={
          <>
            {t.rewardSaved(typeLabel(draft.type), r ? tasksDone(r, today()).length : 0)}
            <br />
            {t.rewardGrowth(growthBefore, growthNow)}
          </>
        }
        footnote={
          <>
            {t.rewardBalance((r?.balance ?? 0) - (reward?.awarded ?? 0), r?.balance ?? 0)}
            <br />
            {t.rewardClaimed}
          </>
        }
        confirmLabel={t.done}
        onConfirm={() => navigate(`/meals/${reward!.id}`, { replace: true, state: { banner: 'saved' } })}
      />
    </RecordPage>
  );
}

function FoodSheet({
  target,
  type,
  time,
  onClose,
  onSave,
  onRemove,
}: {
  target: FoodItem | 'new' | null;
  type: string;
  time: string;
  onClose: () => void;
  onSave: (f: FoodItem) => void;
  onRemove: (id: string) => void;
}) {
  const t = useT(messages);
  const existing = target && target !== 'new' ? target : null;
  const [name, setName] = useState(existing?.name ?? '');
  const [portion, setPortion] = useState(existing?.portion ?? '');
  const [touched, setTouched] = useState(false);
  const err = validateFood(name);
  return (
    <Sheet
      open={target !== null}
      title={existing ? t.editFood : t.addFoodTitle}
      onClose={onClose}
      trailing={
        <button type="button" onClick={onClose} className="type-body-default text-text-brand">
          {t.close}
        </button>
      }
    >
      <p className="type-caption-default text-text-secondary">
        {existing ? t.updateFoodHint : t.addToHint(type, time)}
      </p>
      <Input label={t.foodName} placeholder={t.foodNamePlaceholder} value={name} error={touched ? err : undefined} onBlur={() => setTouched(true)} onChange={(e) => setName(e.target.value)} />
      <Input label={t.portion} placeholder={t.portionPlaceholder} value={portion} onChange={(e) => setPortion(e.target.value)} />
      <p className="type-caption-default text-text-secondary">{t.nameRequiredHint}</p>
      <Button block disabled={!!err} onClick={() => onSave({ id: existing?.id ?? newId(), name: name.trim(), portion: portion.trim() })}>
        {existing ? t.saveChanges : t.addToMeal}
      </Button>
      {existing && (
        <button type="button" onClick={() => onRemove(existing.id)} className={cx('self-start type-body-default text-text-brand')}>
          {t.removeFood}
        </button>
      )}
    </Sheet>
  );
}
