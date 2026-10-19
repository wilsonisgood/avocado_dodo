import { Button, Chip, LabeledField, NotificationRow, PickerField, RecordHeader, RecordPage, ReminderOption, TimeFields, cx } from '@/components';
import type { IconName } from '@/components';
import { keys, useAction, useSettings } from '@/data/queries';
import { settingsService } from '@/data/services';
import type { NotificationSettings, ReminderKey, TimeOfDay } from '@/data/types';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { WEEKDAYS, isOn, isReminderKey, savedNotice, setOn } from './logic';
import { useLeave } from './useLeave';

type Slot = 'time' | 'breakfast' | 'lunch' | 'dinner';
const TITLES: Record<ReminderKey, string> = {
  mood: 'Mood reminder',
  movement: 'Movement reminder',
  meals: 'Meal reminders',
  weekly: 'Weekly update reminder',
  appointments: 'Appointment reminders',
};
const ROW: Record<ReminderKey, { icon: IconName; title: string; description: string }> = {
  mood: { icon: 'Reminder', title: 'Mood reminder', description: 'A daily moment to note how you feel' },
  movement: { icon: 'Reminder', title: 'Movement reminder', description: "Choose whether you'd like a reminder" },
  meals: { icon: 'Food', title: 'Meal reminders', description: 'Breakfast, lunch and dinner' },
  weekly: { icon: 'Milestone', title: 'Weekly updates', description: 'One reminder each week' },
  appointments: { icon: 'Calendar', title: 'Appointment reminders', description: 'Prenatal visits and other health plans' },
};
const APPT_OPTIONS = ['At start time', '1 hour before', '1 day before', 'Custom reminder'];

function getTime(n: NotificationSettings, key: ReminderKey, slot: Slot): TimeOfDay {
  if (slot === 'breakfast' || slot === 'lunch' || slot === 'dinner') return n.meals.times[slot];
  if (key === 'mood') return n.mood.time;
  if (key === 'movement') return n.movement.time;
  return n.weekly.time;
}
function withTime(n: NotificationSettings, key: ReminderKey, slot: Slot, t: TimeOfDay): NotificationSettings {
  if (slot === 'breakfast' || slot === 'lunch' || slot === 'dinner') return { ...n, meals: { ...n.meals, times: { ...n.meals.times, [slot]: t } } };
  if (key === 'mood') return { ...n, mood: { ...n.mood, time: t } };
  if (key === 'movement') return { ...n, movement: { ...n.movement, time: t } };
  return { ...n, weekly: { ...n.weekly, time: t } };
}

/** 11-4 … 11-8 and the 11-S2 time picker (a sub-view, `?time=<slot>`, so the unsaved draft survives). */
export function Reminder() {
  const { key } = useParams();
  const { data } = useSettings();
  if (!isReminderKey(key)) return <Navigate to="/settings/notifications" replace />;
  if (!data) return null;
  return <ReminderForm rkey={key} saved={data.notifications} />;
}

function ReminderForm({ rkey, saved }: { rkey: ReminderKey; saved: NotificationSettings }) {
  const navigate = useNavigate();
  const leave = useLeave('/settings/notifications');
  const [params, setParams] = useSearchParams();
  const save = useAction(settingsService.save, [keys.settings]);
  const [draft, setDraft] = useState(saved);
  const [timeDraft, setTimeDraft] = useState<TimeOfDay>('00:00');
  const [apptDefault, setApptDefault] = useState('1 hour before'); // no field in Settings for this; prototype-local
  const slot = params.get('time') as Slot | null;

  useEffect(() => {
    if (slot) setTimeDraft(getTime(draft, rkey, slot));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot]);

  const onSave = async () => {
    await save.mutateAsync([{ notifications: draft }]);
    navigate('/settings/notifications', { replace: true, state: { notice: savedNotice(saved, draft) } });
  };

  if (slot) {
    return (
      <RecordPage className="gap-3">
        <RecordHeader title="Reminder time" onBack={() => navigate(-1)} />
        <TimeFields value={timeDraft} onChange={setTimeDraft} />
        <Button
          block
          onClick={() => {
            setDraft(withTime(draft, rkey, slot, timeDraft));
            navigate(-1);
          }}
        >
          Confirm time
        </Button>
        <Button block variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </RecordPage>
    );
  }

  const on = isOn(draft, rkey);
  const openTime = (s: Slot) => setParams({ time: s });
  const row = ROW[rkey];
  const timeField = (s: Slot) => (
    <div className={cx(!on && 'opacity-50')}>
      <LabeledField label="Reminder time">
        <PickerField value={getTime(draft, rkey, s)} onClick={on ? () => openTime(s) : undefined} />
      </LabeledField>
    </div>
  );

  return (
    <RecordPage className="gap-3">
      <RecordHeader title={TITLES[rkey]} onBack={leave} />
      {rkey === 'meals' ? (
        <>
          <p className="type-body-default text-text-secondary">Set each reminder to suit your routine.</p>
          {(['breakfast', 'lunch', 'dinner'] as const).map((m) => (
            <NotificationRow
              key={m}
              icon="Food"
              title={m[0].toUpperCase() + m.slice(1)}
              description="Every day"
              schedule={draft.meals.times[m]}
              checked={draft.meals.on}
              onChange={(v) => setDraft(setOn(draft, 'meals', v))}
              onClick={() => openTime(m)}
            />
          ))}
        </>
      ) : (
        <NotificationRow icon={row.icon} title={row.title} description={row.description} schedule={on ? 'On' : rkey === 'appointments' ? 'Off' : 'Off · Your time is saved'} checked={on} onChange={(v) => setDraft(setOn(draft, rkey, v))} />
      )}
      {rkey === 'weekly' && (
        <>
          <p className="type-caption-strong text-text-primary">Day of week</p>
          <div className="flex gap-1">
            {WEEKDAYS.map((d, i) => (
              <Chip key={d} className="flex-1 px-0" selected={draft.weekly.weekday === i} onClick={() => setDraft({ ...draft, weekly: { ...draft.weekly, weekday: i } })}>
                {d}
              </Chip>
            ))}
          </div>
        </>
      )}
      {(rkey === 'mood' || rkey === 'movement' || rkey === 'weekly') && timeField('time')}
      {rkey === 'appointments' && (
        <>
          <h2 className="type-heading-small text-text-primary">Default for new appointments</h2>
          {APPT_OPTIONS.map((o) => (
            <ReminderOption key={o} selected={apptDefault === o} onClick={() => setApptDefault(o)}>
              {o}
            </ReminderOption>
          ))}
        </>
      )}
      {rkey !== 'meals' && (
      <p className="type-caption-default text-text-secondary">
        {rkey === 'weekly'
          ? 'Reminds you to view weekly content. Your pregnancy details stay the same.'
          : rkey === 'appointments'
            ? 'Applies to new appointments only. Existing reminders stay the same; edit them in appointment details.'
            : "Reminders use your device's local time."}
      </p>
      )}
      <Button block onClick={onSave}>
        Save settings
      </Button>
      <Button block variant="outline" onClick={leave}>
        Cancel
      </Button>
      {rkey === 'movement' && <p className="type-caption-default text-text-secondary">A logging reminder, with no movement target.</p>}
    </RecordPage>
  );
}
