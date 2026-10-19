import { useUp } from '@/app/nav';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Button, Chip, ConfirmDialog, CompanionDialog, Input, RecordPage, Sheet, TimeFields, cx } from '@/components';
import { keys, useAction, useMeal, useRewards } from '@/data/queries';
import { mealService, today } from '@/data/services';
import { growthPercent, tasksDone } from '@/data/rules';
import type { FoodItem, Meal } from '@/data/types';
import { MEAL_TYPES, formatDate, isDirty, parseMealType, typeLabel, validateFood, validateMeal, type MealDraft } from './logic';
import { FoodList, PhotoRow } from './parts';

const nowTime = () => new Date().toTimeString().slice(0, 5);

/** meals/new */
export function NewMeal() {
  const [q] = useSearchParams();
  const initial: MealDraft = {
    date: /^\d{4}-\d{2}-\d{2}$/.test(q.get('date') ?? '') ? q.get('date')! : today(),
    time: nowTime(),
    type: parseMealType(q.get('type')) ?? 'breakfast',
    loggedFor: 'Me',
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
  const navigate = useNavigate();
  return (
    <RecordPage>
      <p className="type-body-default text-text-secondary">This meal was not found.</p>
      <Button onClick={() => navigate('/records', { replace: true })}>Back to records</Button>
    </RecordPage>
  );
}

const newId = () => globalThis.crypto?.randomUUID?.() ?? `f${Date.now()}${Math.random().toString(36).slice(2)}`;

function MealForm({ initial, meal }: { initial: MealDraft; meal?: Meal }) {
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
        <button type="button" aria-label="Back" onClick={leave} className="type-heading-large text-text-brand">
          ‹
        </button>
        <h1 className="type-heading-medium text-text-primary">{meal ? 'Edit meal' : 'Add meal'}</h1>
      </header>
      <p className="type-label-default text-text-primary">{formatDate(draft.date)}</p>
      <div className="flex gap-4">
        {/* 24-hour time via the shared TimeFields (native <input type=time> shows AM/PM in en locales). */}
        <Input
          label="Meal time"
          readOnly
          className="min-w-0 flex-1"
          value={draft.time}
          error={v.errors.time}
          onClick={() => setPickingTime(draft.time || '12:00')}
        />
        <Input label="Logged for" className="min-w-0 flex-1" value={draft.loggedFor} onChange={(e) => set({ loggedFor: e.target.value })} />
      </div>
      <div className="flex gap-2">
        {MEAL_TYPES.map((t) => (
          <Chip key={t.type} selected={draft.type === t.type} onClick={() => set({ type: t.type })}>
            {t.label}
          </Chip>
        ))}
      </div>
      {draft.photoIds.length === 0 && <p className="type-caption-default text-text-secondary">A photo is optional. A text entry is enough.</p>}
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
          <p className="type-heading-small text-text-primary">No food added yet</p>
          <p className="type-body-default text-text-secondary">{v.errors.foods}</p>
        </div>
      ) : (
        <FoodList foods={draft.foods} onSelect={setEditing} />
      )}
      <Button block variant="outline" onClick={() => setEditing('new')}>
        ＋ Add food
      </Button>
      <p className="type-caption-default text-text-secondary">Tap a food to edit its name, portion or remove it.</p>
      <Button block disabled={!v.ok || create.isPending || update.isPending} onClick={save}>
        Save meal
      </Button>

      <Sheet open={pickingTime !== null} title="Meal time" onClose={() => setPickingTime(null)}>
        {pickingTime !== null && <TimeFields variant="row" value={pickingTime} onChange={setPickingTime} />}
        <Button
          block
          onClick={() => {
            set({ time: pickingTime! });
            setPickingTime(null);
          }}
        >
          Confirm time
        </Button>
        <Button block variant="outline" onClick={() => setPickingTime(null)}>
          Cancel
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
        title="Save before leaving?"
        message="This meal has unsaved changes."
        confirmLabel="Keep editing"
        cancelLabel="Discard changes"
        onConfirm={() => setConfirmLeave(false)}
        onCancel={discard}
      />
      <CompanionDialog
        open={!!reward}
        title="Meal logged!"
        metric={`＋${reward?.awarded ?? 0} BP`}
        body={
          <>
            {typeLabel(draft.type)} saved. {r ? tasksDone(r, today()).length : 0} of 3 tasks done today.
            <br />
            Growth progress: {growthBefore}% → {growthNow}%.
          </>
        }
        footnote={
          <>
            Balance: {(r?.balance ?? 0) - (reward?.awarded ?? 0)} → {r?.balance ?? 0} BP
            <br />
            Today's meal reward claimed
          </>
        }
        confirmLabel="Done"
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
  const existing = target && target !== 'new' ? target : null;
  const [name, setName] = useState(existing?.name ?? '');
  const [portion, setPortion] = useState(existing?.portion ?? '');
  const [touched, setTouched] = useState(false);
  const err = validateFood(name);
  return (
    <Sheet
      open={target !== null}
      title={existing ? 'Edit food' : 'Add food'}
      onClose={onClose}
      trailing={
        <button type="button" onClick={onClose} className="type-body-default text-text-brand">
          Close
        </button>
      }
    >
      <p className="type-caption-default text-text-secondary">
        {existing ? 'Update this food, then save the meal.' : `Add to ${type.toLowerCase()}. Meal time stays at ${time}.`}
      </p>
      <Input label="Food name" placeholder="e.g. Burger" value={name} error={touched ? err : undefined} onBlur={() => setTouched(true)} onChange={(e) => setName(e.target.value)} />
      <Input label="Portion" placeholder="e.g. 150 g, 1 bowl, 1 handful" value={portion} onChange={(e) => setPortion(e.target.value)} />
      <p className="type-caption-default text-text-secondary">A name is required. You can add the portion later.</p>
      <Button block disabled={!!err} onClick={() => onSave({ id: existing?.id ?? newId(), name: name.trim(), portion: portion.trim() })}>
        {existing ? 'Save changes' : 'Add to meal'}
      </Button>
      {existing && (
        <button type="button" onClick={() => onRemove(existing.id)} className={cx('self-start type-body-default text-text-brand')}>
          Remove food
        </button>
      )}
    </Sheet>
  );
}
