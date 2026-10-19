import { Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button, RecordEmpty, RecordHeader, RecordPage, RecordRow, SectionHeader } from '@/components';
import { keys, useAction, useMovements } from '@/data/queries';
import { movementService } from '@/data/services';
import { useT } from '@/i18n';
import { messages } from './i18n';
import { MovementNotice } from './shared';
import { countLabel, dateLong, elapsedMs, formatElapsed, hm } from './time';

/** 08-5 History / 08-7 Empty history. */
export function HistoryPage() {
  const t = useT(messages);
  const navigate = useNavigate();
  const saved = (useLocation().state as { saved?: boolean } | null)?.saved;
  const list = useMovements();
  const start = useAction(movementService.start, [keys.movements]);
  const sessions = list.data ?? [];
  const goStart = async () => {
    // Resume an unfinished session if there is one; otherwise begin a new one.
    if (!(await movementService.active())) await start.mutateAsync([]);
    navigate('/movement');
  };
  let lastDay = '';
  return (
    <RecordPage>
      <RecordHeader title={t.movementLog} fallback="/movement" />
      {list.isLoading ? null : sessions.length === 0 ? (
        <RecordEmpty title={t.noLogsTitle}>{t.noLogsBody}</RecordEmpty>
      ) : (
        saved && <p className="type-label-default text-text-brand">{t.sessionSaved}</p>
      )}
      <Button block onClick={goStart}>{sessions.length === 0 ? t.startSession : t.newSession}</Button>
      {sessions.map((s) => {
        const d = new Date(s.startedAt);
        const day = dateLong(d);
        const header = day !== lastDay;
        lastDay = day;
        return (
          <Fragment key={s.id}>
            {header && <SectionHeader>{day}</SectionHeader>}
            <RecordRow
              title={`${hm(d)} · ${countLabel(s.movements.length)}`}
              detail={`${formatElapsed(elapsedMs(s, 0))} · ${s.notes || t.overallObservations}`}
              onClick={() => navigate(`/movement/${s.id}`)}
            />
          </Fragment>
        );
      })}
      <MovementNotice />
    </RecordPage>
  );
}
