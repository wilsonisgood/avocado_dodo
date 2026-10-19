import { Button, NotificationRow, RecordHeader, RecordPage } from '@/components';
import type { IconName } from '@/components';
import { keys, useAction, useSettings } from '@/data/queries';
import { settingsService } from '@/data/services';
import type { NotificationSettings, ReminderKey } from '@/data/types';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { isDirty, isOn, masterText, permissionLine, savedNotice, scheduleText, setOn } from './logic';
import { useLeave } from './useLeave';

const ROWS: { key: ReminderKey; icon: IconName; title: string; description: string }[] = [
  { key: 'appointments', icon: 'Calendar', title: 'Appointment reminders', description: 'Prenatal visits, injections and blood tests' },
  { key: 'meals', icon: 'Food', title: 'Meal log', description: 'Breakfast, lunch and dinner' },
  { key: 'mood', icon: 'Mood', title: 'Mood journal', description: 'Take a moment to note your feelings' },
  { key: 'movement', icon: 'Kick', title: 'Movement notes', description: 'Turn on if it suits your needs' },
  { key: 'weekly', icon: 'Milestone', title: 'Weekly updates', description: "Discover this week's little changes" },
];

/** 11-1 … 11-3d: master switch + one row per reminder; edits stay local until "Save settings". */
export function Notifications() {
  const { data } = useSettings();
  const leave = useLeave('/settings');
  const navigate = useNavigate();
  const location = useLocation();
  const save = useAction(settingsService.save, [keys.settings]);
  const [draft, setDraft] = useState<NotificationSettings | null>(null);
  const [notice, setNotice] = useState<string | null>((location.state as { notice?: string } | null)?.notice ?? null);

  useEffect(() => {
    if (data && !draft) setDraft(data.notifications);
  }, [data, draft]);
  if (!data || !draft) return null;

  const change = (next: NotificationSettings) => {
    setDraft(next);
    setNotice(null);
  };
  const onSave = async () => {
    if (notice === 'Saved: All reminders off' && !isDirty(data.notifications, draft)) return navigate('/settings');
    await save.mutateAsync([{ notifications: draft }]);
    setNotice(savedNotice(data.notifications, draft));
  };

  return (
    <RecordPage className="gap-3">
      <RecordHeader title="Notifications" onBack={leave} />
      {notice && <p className="type-caption-strong text-text-brand">{notice}</p>}
      <NotificationRow
        icon="Settings"
        title="All reminders"
        description="Control all Nestly reminders"
        schedule={masterText(draft.all)}
        checked={draft.all}
        onClick={() => change({ ...draft, all: !draft.all })}
        onChange={(all) => change({ ...draft, all })}
      />
      <button type="button" onClick={() => navigate('/settings/permission')} className="text-left type-caption-default text-text-secondary">
        {permissionLine(draft.devicePermission)}
      </button>
      {ROWS.map((r) => (
        <NotificationRow
          key={r.key}
          icon={r.icon}
          title={r.title}
          description={r.description}
          schedule={scheduleText(draft, r.key)}
          checked={isOn(draft, r.key)}
          disabled={!draft.all}
          onChange={(on) => change(setOn(draft, r.key, on))}
          onClick={draft.all ? () => navigate(`/settings/reminders/${r.key}`) : undefined}
        />
      ))}
      <Button block onClick={onSave}>
        Save settings
      </Button>
    </RecordPage>
  );
}
