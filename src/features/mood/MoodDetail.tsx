import { Button, ConfirmDialog, RecordHeader, RecordPage, RecordRow, TextArea, moodMeta } from '@/components';
import { keys, useAction, useMood } from '@/data/queries';
import { moodService } from '@/data/services';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { MissingEntry } from './MoodForm';
import { formatDateTime } from './format';
import { messages } from './i18n';
import { useT } from '@/i18n';

/** 07-4 Mood details (+ 07-S1 delete confirmation). */
export function MoodDetail() {
  const t = useT(messages);
  const { id } = useParams();
  const navigate = useNavigate();
  const saved = (useLocation().state as { saved?: boolean } | null)?.saved;
  const { data: entry, isLoading } = useMood(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const remove = useAction(moodService.remove, [keys.moods]);

  if (isLoading) return <RecordPage><RecordHeader title={t.title} fallback="/mood" /></RecordPage>;
  if (!entry) return <MissingEntry />;

  return (
    <RecordPage>
      <RecordHeader title={t.title} fallback="/mood" />
      {saved && <p className="type-label-default text-text-brand">{t.saved}</p>}
      <RecordRow title={moodMeta[entry.mood].label} detail={formatDateTime(entry.at)} />
      <TextArea value={entry.note} readOnly aria-label={t.note} />
      <Button block variant="outline" icon="Edit" onClick={() => navigate(`/mood/${entry.id}/edit`)}>{t.editEntry}</Button>
      <Button block variant="outline" icon="Delete" onClick={() => setConfirmOpen(true)}>{t.deleteEntry}</Button>
      <Button block onClick={() => navigate('/mood')}>{t.backToJournal}</Button>
      <ConfirmDialog
        open={confirmOpen}
        danger
        title={t.deleteTitle}
        message={t.deleteMessage}
        confirmLabel={t.delete}
        cancelLabel={t.keepEntry}
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
