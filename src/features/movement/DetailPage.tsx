import { useNavigate, useParams } from 'react-router';
import { Button, RecordHeader, RecordMetric, RecordPage, RecordRow } from '@/components';
import { useMovement } from '@/data/queries';
import { MovementNotice } from './shared';
import { countLabel, dateLong, elapsedMs, formatElapsed, hm } from './time';

/** 08-6 · Movement details. */
export function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const m = useMovement(id);
  const s = m.data;
  const toHistory = () => navigate('/movement/history', { replace: true });
  if (!s) return <RecordPage><RecordHeader title="Movement details" onBack={toHistory} /></RecordPage>;
  const d = new Date(s.startedAt);
  return (
    <RecordPage>
      <RecordHeader title="Movement details" onBack={toHistory} />
      <RecordMetric label="Movements this session" value={countLabel(s.movements.length)} detail={`${dateLong(d)} · ${hm(d)} · Duration ${formatElapsed(elapsedMs(s, 0))}`} />
      <RecordRow title="Notes" detail={s.notes || 'No notes'} />
      <p className="type-caption-default text-text-secondary">Scope: Overall observations, including for twins</p>
      <Button block variant="outline" onClick={toHistory}>Back to history</Button>
      <MovementNotice />
    </RecordPage>
  );
}
