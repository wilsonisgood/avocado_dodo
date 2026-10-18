import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, RecordHeader, RecordMetric, RecordPage, RecordRow, SectionHeader } from '@/components';
import { keys, useAction, useActiveMovement } from '@/data/queries';
import { movementService } from '@/data/services';
import type { MovementSession } from '@/data/types';
import { MovementNotice, useBack } from './shared';
import { countLabel, dateLong, elapsedMs, formatElapsed, hm } from './time';

/** Entry: 08-0 when nothing is running, otherwise 08-1…08-3 (recording / paused). */
export function MovementPage() {
  const active = useActiveMovement();
  if (active.isLoading) return <RecordPage>{null}</RecordPage>;
  return active.data ? <Recording session={active.data} /> : <Start />;
}

function Start() {
  const navigate = useNavigate();
  const back = useBack();
  const start = useAction(movementService.start, [keys.movements]);
  return (
    <RecordPage>
      <RecordHeader title="Movement log" onBack={back} />
      <SectionHeader>Notice baby's usual pattern</SectionHeader>
      <p className="type-body-default text-text-secondary">Tap once for each movement you feel. This log has no daily target.</p>
      <MovementNotice />
      <Button block onClick={() => start.mutate([])}>Start a session</Button>
      <Button block variant="outline" onClick={() => navigate('/movement/history')}>View history</Button>
      <RecordRow title="Expecting twins?" detail="Log what you feel overall, even if you can't identify which baby moved. Follow your care team's guidance." />
    </RecordPage>
  );
}

function Recording({ session }: { session: MovementSession }) {
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
      <RecordHeader title="Log movements" onBack={back} />
      <p className="type-label-default text-text-secondary">{paused ? 'Paused · Timer stopped' : `Recording · ${dateLong(started)} · ${hm(started)}`}</p>
      <RecordMetric label="Movements this session" value={countLabel(count)} detail={`Elapsed ${formatElapsed(elapsedMs(session, now))} · Movements may come and go`} />
      {paused ? (
        <Button block onClick={() => resume.mutate([id])}>Resume</Button>
      ) : (
        <Button block icon="Plus" onClick={() => tap.mutate([id])}>Movement ＋1</Button>
      )}
      <Button block variant="outline" disabled={count === 0} onClick={() => undo.mutate([id])}>Undo last</Button>
      {!paused && <Button block variant="outline" icon="Pause" onClick={() => pause.mutate([id])}>Pause</Button>}
      <Button
        block
        variant="outline"
        onClick={async () => {
          await finish.mutateAsync([id]);
          navigate(`/movement/review/${id}`, { replace: true });
        }}
      >
        Finish & review
      </Button>
      <MovementNotice />
    </RecordPage>
  );
}
