import { Button, ConfirmDialog, RecordHeader, RecordPage, RecordRow, TextArea, moodMeta } from '@/components';
import { keys, useAction, useMood } from '@/data/queries';
import { moodService } from '@/data/services';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { MissingEntry } from './MoodForm';
import { formatDateTime } from './format';

/** 07-4 Mood details (+ 07-S1 delete confirmation). */
export function MoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const saved = (useLocation().state as { saved?: boolean } | null)?.saved;
  const { data: entry, isLoading } = useMood(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const remove = useAction(moodService.remove, [keys.moods]);

  if (isLoading) return <RecordPage><RecordHeader title="Mood journal" fallback="/mood" /></RecordPage>;
  if (!entry) return <MissingEntry />;

  return (
    <RecordPage>
      <RecordHeader title="Mood journal" fallback="/mood" />
      {saved && <p className="type-label-default text-text-brand">Saved. Thank you for caring for yourself.</p>}
      <RecordRow title={moodMeta[entry.mood].label} detail={formatDateTime(entry.at)} />
      <TextArea value={entry.note} readOnly aria-label="Note" />
      <Button block variant="outline" icon="Edit" onClick={() => navigate(`/mood/${entry.id}/edit`)}>Edit entry</Button>
      <Button block variant="outline" icon="Delete" onClick={() => setConfirmOpen(true)}>Delete entry</Button>
      <Button block onClick={() => navigate('/mood')}>Back to mood journal</Button>
      <ConfirmDialog
        open={confirmOpen}
        danger
        title="Delete this mood entry?"
        message="This cannot be undone. You can keep it and return later."
        confirmLabel="Delete"
        cancelLabel="Keep entry"
        onConfirm={async () => {
          await remove.mutateAsync([entry.id]);
          setConfirmOpen(false);
          navigate('/mood', { replace: true });
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </RecordPage>
  );
}
