import { RecordHeader, RecordNotice, RecordPage } from '@/components';

/** Stand-in for screens a module task has not built yet. */
export function Placeholder({ title, frames, back = true }: { title: string; frames: string; back?: boolean }) {
  return (
    <RecordPage>
      {back ? <RecordHeader title={title} /> : <h1 className="type-heading-large text-text-primary">{title}</h1>}
      <RecordNotice title="Not built yet">Design frames: {frames}</RecordNotice>
    </RecordPage>
  );
}
