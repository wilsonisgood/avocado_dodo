import { Button, RecordEmpty, RecordHeader, RecordPage, RecordRow, SectionHeader, moodMeta } from '@/components';
import { useMoods } from '@/data/queries';
import { clock } from '@/data/services';
import { useNavigate } from 'react-router';
import { formatDay, rowDetail } from './format';
import { useLeave } from './useLeave';

/** 07-0 History / 07-1 Empty. */
export function MoodHistory() {
  const navigate = useNavigate();
  const leave = useLeave('/records');
  const { data: moods, isLoading } = useMoods();
  if (isLoading || !moods) return <RecordPage><RecordHeader title="Mood journal" onBack={leave} /></RecordPage>;

  if (moods.length === 0) {
    return (
      <RecordPage>
        <RecordHeader title="Mood journal" onBack={leave} />
        <RecordEmpty title="A little space for how you feel">No perfect words needed. A feeling is enough.</RecordEmpty>
        <Button block onClick={() => navigate('/mood/new')}>Log your first mood</Button>
      </RecordPage>
    );
  }
  return (
    <RecordPage>
      <RecordHeader title="Mood journal" onBack={leave} />
      <p className="type-label-default text-text-secondary">{formatDay(clock.now())}</p>
      <SectionHeader>Every feeling deserves care</SectionHeader>
      <Button block onClick={() => navigate('/mood/new')}>Add mood</Button>
      {moods.map((m) => (
        <RecordRow key={m.id} title={moodMeta[m.mood].label} detail={rowDetail(m)} onClick={() => navigate(`/mood/${m.id}`)} />
      ))}
      <p className="type-caption-default text-text-secondary">Log as often as you like. Make space for your feelings.</p>
    </RecordPage>
  );
}
