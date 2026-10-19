import { Button, NotificationRow, RecordHeader, RecordPage } from '@/components';
import type { IconName } from '@/components';
import { keys, useAction, useSettings } from '@/data/queries';
import { settingsService } from '@/data/services';
import type { NotificationSettings, ReminderKey } from '@/data/types';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useT } from '@/i18n';
import { messages } from './i18n';
import { isDirty, isOn, masterText, permissionLine, savedNotice, scheduleText, setOn } from './logic';
import { useLeave } from './useLeave';

type Msgs = typeof messages.en;
const rows = (t: Msgs): { key: ReminderKey; icon: IconName; title: string; description: string }[] => [
  { key: 'appointments', icon: 'Calendar', title: t.appointmentReminders, description: t.appointmentRemindersDesc },
  { key: 'meals', icon: 'Food', title: t.mealLog, description: t.mealLogDesc },
  { key: 'mood', icon: 'Mood', title: t.moodJournal, description: t.moodJournalDesc },
  { key: 'movement', icon: 'Kick', title: t.movementNotes, description: t.movementNotesDesc },
  { key: 'weekly', icon: 'Milestone', title: t.weeklyUpdates, description: t.weeklyUpdatesDesc },
];

/** 11-1 … 11-3d: master switch + one row per reminder; edits stay local until "Save settings". */
export function Notifications() {
  const t = useT(messages);
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
    if (notice === t.savedAllOff && !isDirty(data.notifications, draft)) return navigate('/settings');
    await save.mutateAsync([{ notifications: draft }]);
    setNotice(savedNotice(data.notifications, draft));
  };

  return (
    <RecordPage className="gap-3">
      <RecordHeader title={t.notifications} onBack={leave} />
      {notice && <p className="type-caption-strong text-text-brand">{notice}</p>}
      <NotificationRow
        icon="Settings"
        title={t.allReminders}
        description={t.allRemindersDesc}
        schedule={masterText(draft.all)}
        checked={draft.all}
        onClick={() => change({ ...draft, all: !draft.all })}
        onChange={(all) => change({ ...draft, all })}
      />
      <button type="button" onClick={() => navigate('/settings/permission')} className="text-left type-caption-default text-text-secondary">
        {permissionLine(draft.devicePermission)}
      </button>
      {rows(t).map((r) => (
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
        {t.saveSettings}
      </Button>
    </RecordPage>
  );
}
