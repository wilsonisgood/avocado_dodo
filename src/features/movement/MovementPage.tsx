import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, RecordHeader, RecordMetric, RecordPage, RecordRow, SectionHeader } from '@/components';
import { keys, useAction, useActiveMovement } from '@/data/queries';
import { movementService } from '@/data/services';
import type { MovementSession } from '@/data/types';
import { useT } from '@/i18n';
import { messages } from './i18n';
import { MovementNotice, useBack } from './shared';
import { countLabel, dateLong, elapsedMs, formatElapsed, hm } from './time';

/** Entry: 08-0 when nothing is running, otherwise 08-1…08-3 (recording / paused). */
export function MovementPage() {
  const active = useActiveMovement();
  if (active.isLoading) return <RecordPage>{null}</RecordPage>;
  return active.data ? <Recording session={active.data} /> : <Start />;
}

function Start() {
  const t = useT(messages);
  const navigate = useNavigate();
  const back = useBack();
  const start = useAction(movementService.start, [keys.movements]);
  return (
    <RecordPage>
      <RecordHeader title={t.movementLog} onBack={back} />
      <SectionHeader>{t.usualPattern}</SectionHeader>
      <p className="type-body-default text-text-secondary">{t.startIntro}</p>
      <MovementNotice />
      <Button block onClick={() => start.mutate([])}>{t.startSession}</Button>
      <Button block variant="outline" onClick={() => navigate('/movement/history')}>{t.viewHistory}</Button>
      <RecordRow title={t.twinsTitle} detail={t.twinsBody} />
    </RecordPage>
  );
}

function Recording({ session }: { session: MovementSession }) {
  const t = useT(messages);
  const navigate = useNavigate();
  const back = useBack();
  const [now, setNow] = useState(() => Date.now());
  const paused = !!session.pausedAt;
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(t);
    };
  }, []);
  const tap = useAction(movementService.tap, [keys.movements]);
  const undo = useAction(movementService.undo, [keys.movements]);
  const pause = useAction(movementService.pause, [keys.movements]);
  const resume = useAction(movementService.resume, [keys.movements]);
  const finish = useAction(movementService.finish, [keys.movements]);
  const id = session.id;
  const count = session.movements.length;
  const started = new Date(session.startedAt);

  return (
    <RecordPage>
      <RecordHeader title={t.logMovements} onBack={back} />
      <p className="type-label-default text-text-secondary">{paused ? t.pausedStatus : t.recording(dateLong(started), hm(started))}</p>
      <RecordMetric label={t.metricLabel} value={countLabel(count)} detail={t.elapsedDetail(formatElapsed(elapsedMs(session, now)))} />
      {paused ? (
        <Button block onClick={() => resume.mutate([id])}>{t.resume}</Button>
      ) : (
        <Button block icon="Plus" onClick={() => tap.mutate([id])}>{t.addMovement}</Button>
      )}
      <Button block variant="outline" disabled={count === 0} onClick={() => undo.mutate([id])}>{t.undoLast}</Button>
      {!paused && <Button block variant="outline" icon="Pause" onClick={() => pause.mutate([id])}>{t.pause}</Button>}
      <Button
        block
        variant="outline"
        onClick={async () => {
          await finish.mutateAsync([id]);
          navigate(`/movement/review/${id}`, { replace: true });
        }}
      >
        {t.finishReview}
      </Button>
      <MovementNotice />
    </RecordPage>
  );
}
