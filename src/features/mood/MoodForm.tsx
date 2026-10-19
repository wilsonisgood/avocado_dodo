import { Button, ConfirmDialog, FieldControl, MoodChoice, RecordHeader, RecordPage, SectionHeader, TextArea } from '@/components';
import { keys, useAction, useMood } from '@/data/queries';
import { clock, moodService } from '@/data/services';
import type { Mood } from '@/data/types';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { MOOD_KINDS, formatDateTime, isDirty, parseMoodParam } from './format';
import { messages } from './i18n';
import { useLeave } from './useLeave';
import { useT } from '@/i18n';

/** 07-2/07-3 Add mood (`?mood=` preselect) and 07-5 Edit mood. */
export function MoodAdd() {
  const [params] = useSearchParams();
  return <MoodForm initialMood={parseMoodParam(params.get('mood'))} initialNote="" />;
}

export function MoodEdit() {
  const t = useT(messages);
  const { id } = useParams();
  const { data: entry, isLoading } = useMood(id);
  if (isLoading) return <RecordPage><RecordHeader title={t.editTitle} /></RecordPage>;
  if (!entry) return <MissingEntry />;
  return <MoodForm entry={entry} initialMood={entry.mood} initialNote={entry.note} />;
}

export function MissingEntry() {
  const t = useT(messages);
  const leave = useLeave('/mood');
  return (
    <RecordPage>
      <RecordHeader title={t.title} onBack={leave} />
      <p className="type-body-default text-text-secondary">{t.missing}</p>
    </RecordPage>
  );
}

function MoodForm({ entry, initialMood, initialNote }: { entry?: { id: string; at: string; mood: Mood; note: string }; initialMood?: Mood; initialNote: string }) {
  const t = useT(messages);
  const navigate = useNavigate();
  const leave = useLeave('/mood');
  const [mood, setMood] = useState<Mood | undefined>(initialMood);
  const [note, setNote] = useState(initialNote);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [at] = useState(() => entry?.at ?? clock.now().toISOString());
  const create = useAction(moodService.create, [keys.moods, keys.rewards]);
  const update = useAction(moodService.update, [keys.moods]);

  // Preselecting from the home card is not a user edit, so only changes against the initial state count.
  const dirty = entry ? isDirty({ mood, note }, entry) : isDirty({ mood: mood === initialMood ? undefined : mood, note });
  const requestLeave = () => (dirty ? setConfirmOpen(true) : leave());
  const canSave = mood !== undefined && (!entry || dirty);

  const save = async () => {
    if (!mood) return;
    if (entry) {
      await update.mutateAsync([entry.id, { mood, note }]);
      navigate(`/mood/${entry.id}`, { replace: true, state: { saved: true } });
    } else {
      const { entry: created } = await create.mutateAsync([{ at, mood, note }]);
      navigate(`/mood/${created.id}`, { replace: true, state: { saved: true } });
    }
  };

  return (
    <RecordPage>
      <RecordHeader title={entry ? t.editTitle : t.addTitle} onBack={requestLeave} />
      {!entry && <SectionHeader>{t.feeling}</SectionHeader>}
      <div className="flex h-22 w-full shrink-0 gap-2">
        {MOOD_KINDS.map((k) => (
          <MoodChoice key={k} mood={k} selected={mood === k} onClick={() => setMood(k)} />
        ))}
      </div>
      <FieldControl value={formatDateTime(at)} readOnly aria-label={t.dateTime} />
      <TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.placeholder} aria-label={t.note} />
      {!entry && <p className="type-caption-default text-text-secondary">{t.hint}</p>}
      <Button block disabled={!canSave || create.isPending || update.isPending} onClick={save}>
        {entry ? t.saveChanges : t.saveMood}
      </Button>
      <Button block variant="outline" onClick={requestLeave}>{t.cancel}</Button>
      <ConfirmDialog
        open={confirmOpen}
        title={t.leaveTitle}
        message={t.leaveMessage}
        confirmLabel={t.keepWriting}
        cancelLabel={t.discardLeave}
        onConfirm={() => setConfirmOpen(false)}
        onCancel={() => {
          setConfirmOpen(false);
          leave();
        }}
      />
    </RecordPage>
  );
}
