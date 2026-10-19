import { useNavigate, useParams } from 'react-router';
import { Button, RecordHeader, RecordMetric, RecordPage, RecordRow } from '@/components';
import { useMovement } from '@/data/queries';
import { useT } from '@/i18n';
import { messages } from './i18n';
import { MovementNotice } from './shared';
import { countLabel, dateLong, elapsedMs, formatElapsed, hm } from './time';

/** 08-6 · Movement details. */
export function DetailPage() {
  const t = useT(messages);
  const { id } = useParams();
  const navigate = useNavigate();
  const m = useMovement(id);
  const s = m.data;
  const toHistory = () => navigate('/movement/history', { replace: true });
  if (!s) return <RecordPage><RecordHeader title={t.movementDetails} onBack={toHistory} /></RecordPage>;
  const d = new Date(s.startedAt);
  return (
    <RecordPage>
      <RecordHeader title={t.movementDetails} onBack={toHistory} />
      <RecordMetric label={t.metricLabel} value={countLabel(s.movements.length)} detail={t.detailMetric(dateLong(d), hm(d), formatElapsed(elapsedMs(s, 0)))} />
      <RecordRow title={t.notes} detail={s.notes || t.noNotes} />
      <p className="type-caption-default text-text-secondary">{t.scope}</p>
      <Button block variant="outline" onClick={toHistory}>{t.backToHistory}</Button>
      <MovementNotice />
    </RecordPage>
  );
}
