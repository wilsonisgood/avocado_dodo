import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, RecordHeader, RecordMetric, RecordPage, TextArea } from '@/components';
import { keys, useAction, useMovement, useProfile } from '@/data/queries';
import { movementService } from '@/data/services';
import type { MovementSession } from '@/data/types';
import { useT } from '@/i18n';
import { messages } from './i18n';
import { MovementNotice } from './shared';
import { countLabel, dateSlash, hm, hms } from './time';

/** 08-4 · Session summary. */
export function ReviewPage() {
  const t = useT(messages);
  const { id } = useParams();
  const m = useMovement(id);
  if (m.isLoading) return <RecordPage>{null}</RecordPage>;
  if (!m.data) return <RecordPage><RecordHeader title={t.sessionSummary} onBack={() => history.back()} /></RecordPage>;
  return <Review session={m.data} />;
}

function Review({ session }: { session: MovementSession }) {
  const t = useT(messages);
  const navigate = useNavigate();
  const profile = useProfile();
  const [notes, setNotes] = useState(session.notes);
  const update = useAction(movementService.update, [keys.movements]);
  const reopen = useAction(movementService.reopen, [keys.movements]);
  const start = new Date(session.startedAt);
  const end = new Date(session.endedAt ?? session.startedAt);
  const range = `${dateSlash(start)} · ${hm(start)}–${hms(end)}`;

  return (
    <RecordPage>
      <RecordHeader title={t.sessionSummary} fallback="/movement" />
      <RecordMetric label={t.metricLabel} value={countLabel(session.movements.length)} detail={range} />
      <TextArea aria-label={t.notesOptional} placeholder={t.notesPlaceholder} value={notes} onChange={(e) => setNotes(e.target.value)} />
      {profile.data?.babyCount === 'twins' && <p className="type-caption-default text-text-secondary">{t.twinsReview}</p>}
      <Button
        block
        onClick={async () => {
          await update.mutateAsync([session.id, { notes: notes.trim() }]);
          navigate('/movement/history', { replace: true, state: { saved: true } });
        }}
      >
        {t.saveSession}
      </Button>
      <Button
        block
        variant="outline"
        onClick={async () => {
          await update.mutateAsync([session.id, { notes: notes.trim() }]);
          await reopen.mutateAsync([session.id]);
          navigate('/movement', { replace: true });
        }}
      >
        {t.continueSession}
      </Button>
      <MovementNotice />
    </RecordPage>
  );
}
