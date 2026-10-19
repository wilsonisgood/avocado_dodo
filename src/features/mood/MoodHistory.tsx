import { Button, RecordEmpty, RecordHeader, RecordPage, RecordRow, SectionHeader, moodMeta } from '@/components';
import { useMoods } from '@/data/queries';
import { clock } from '@/data/services';
import { useNavigate } from 'react-router';
import { formatDay, rowDetail } from './format';
import { messages } from './i18n';
import { useLeave } from './useLeave';
import { useT } from '@/i18n';

/** 07-0 History / 07-1 Empty. */
export function MoodHistory() {
  const t = useT(messages);
  const navigate = useNavigate();
  const leave = useLeave('/records');
  const { data: moods, isLoading } = useMoods();
  if (isLoading || !moods) return <RecordPage><RecordHeader title={t.title} onBack={leave} /></RecordPage>;

  if (moods.length === 0) {
    return (
      <RecordPage>
        <RecordHeader title={t.title} onBack={leave} />
        <RecordEmpty title={t.emptyTitle}>{t.emptyBody}</RecordEmpty>
        <Button block onClick={() => navigate('/mood/new')}>{t.logFirst}</Button>
      </RecordPage>
    );
  }
  return (
    <RecordPage>
      <RecordHeader title={t.title} onBack={leave} />
      <p className="type-label-default text-text-secondary">{formatDay(clock.now())}</p>
      <SectionHeader>{t.careHeader}</SectionHeader>
      <Button block onClick={() => navigate('/mood/new')}>{t.add}</Button>
      {moods.map((m) => (
        <RecordRow key={m.id} title={moodMeta[m.mood].label} detail={rowDetail(m)} onClick={() => navigate(`/mood/${m.id}`)} />
      ))}
      <p className="type-caption-default text-text-secondary">{t.historyFooter}</p>
    </RecordPage>
  );
}
