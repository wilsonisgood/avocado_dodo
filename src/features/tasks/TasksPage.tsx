// 06.Task / 12-1, 12-2, 12-10, 12-13: daily tasks, points and the fruit baby's growth.
import { useNavigate } from 'react-router';
import { RecordRow } from '@/components';
import { useRewards } from '@/data/queries';
import { growthPercent } from '@/data/rules';
import { today } from '@/data/services';
import { TASK_LINK, bp, taskRows, taskSummary } from './copy';
import { DailyTaskRow, TasksProgress } from './parts';
import { useT } from '@/i18n';
import { messages } from './i18n';

export function TasksPage() {
  const navigate = useNavigate();
  const t = useT(messages);
  const r = useRewards().data;
  if (!r) return null;
  const day = today();
  const summary = taskSummary(r, day);
  return (
    <div className="flex flex-col gap-4 bg-bg-canvas p-6">
      <div className="flex items-center gap-3">
        <h1 className="flex-1 type-heading-medium text-text-primary">{t.tasksTitle}</h1>
        <span className="type-label-default text-text-brand">{bp(r.balance)}</span>
      </div>
      <TasksProgress accessory={r.equipped} percent={growthPercent(r)} caption={summary.caption} onShop={() => navigate('/shop')} />
      <h2 className="type-heading-small text-text-primary">{summary.heading}</h2>
      {taskRows(r, day).map((row) => {
        const to = TASK_LINK[row.key];
        return <DailyTaskRow key={row.key} row={row} onAction={!row.done && to ? () => navigate(to) : undefined} />;
      })}
      <p className="type-caption-default text-text-secondary">{t.earnNote}</p>
      <RecordRow title={t.movementTitle} detail={t.movementDetail} onClick={() => navigate('/movement')} />
      <p className="type-caption-default text-text-secondary">{t.spendNote}</p>
    </div>
  );
}
