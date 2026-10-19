import { Button, Chip, FieldControl, LabeledField, NotificationRow, PickerField, RecordHeader, RecordPage, ReminderOption, SegmentedTabs, TimeFields, cx } from '@/components';
import type { IconName } from '@/components';
import { keys, useAction, useSettings } from '@/data/queries';
import { settingsService } from '@/data/services';
import type { NotificationSettings, ReminderKey, TimeOfDay } from '@/data/types';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { REMINDER_OPTIONS, type ReminderOptionKey, type ReminderUnit, customMinutes, isOptionSelected, reminderText, splitMinutes, toggleReminder } from '@/data/reminders';
import { tr, useT } from '@/i18n';
import { common } from '@/i18n/common';
import { weekdayNames } from '@/i18n/format';
import { messages } from './i18n';
import { isOn, isReminderKey, savedNotice, setOn } from './logic';
import { useLeave } from './useLeave';

type Slot = 'time' | 'breakfast' | 'lunch' | 'dinner';
type Msgs = typeof messages.en;
const titles = (t: Msgs): Record<ReminderKey, string> => ({
  mood: t.moodReminder,
  movement: t.movementReminder,
  meals: t.mealReminders,
  weekly: t.weeklyUpdateReminder,
  appointments: t.appointmentReminders,
});
const rowInfo = (t: Msgs): Record<ReminderKey, { icon: IconName; title: string; description: string }> => ({
  mood: { icon: 'Reminder', title: t.moodReminder, description: t.moodReminderDesc },
  movement: { icon: 'Reminder', title: t.movementReminder, description: t.movementReminderDesc },
  meals: { icon: 'Food', title: t.mealReminders, description: t.mealLogDesc },
  weekly: { icon: 'Milestone', title: t.weeklyUpdates, description: t.weeklyUpdatesOne },
  appointments: { icon: 'Calendar', title: t.appointmentReminders, description: t.apptReminderDesc },
});

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
  const t = useT(messages);
  const c = tr(common);
  const navigate = useNavigate();
  const leave = useLeave('/settings/notifications');
  const [params, setParams] = useSearchParams();
  const save = useAction(settingsService.save, [keys.settings]);
  const [draft, setDraft] = useState(saved);
  const [timeDraft, setTimeDraft] = useState<TimeOfDay>('00:00');
  const [customN, setCustomN] = useState('30');
  const [customUnit, setCustomUnit] = useState<ReminderUnit>('minutes');
  const slot = params.get('time') as Slot | null;
  const custom = params.get('custom') === '1';

  useEffect(() => {
    if (slot) setTimeDraft(getTime(draft, rkey, slot));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot]);

  const onSave = async () => {
    await save.mutateAsync([{ notifications: draft }]);
    navigate('/settings/notifications', { replace: true, state: { notice: savedNotice(saved, draft) } });
  };

  if (custom) {
    const confirm = () => {
      setDraft({ ...draft, appointments: { ...draft.appointments, defaultReminder: { kind: 'custom', minutesBefore: customMinutes(Math.max(1, Number(customN) || 1), customUnit) } } });
      navigate(-1);
    };
    return (
      <RecordPage className="gap-3">
        <RecordHeader title={c.customReminder} onBack={() => navigate(-1)} />
        <LabeledField label={t.remindBeforeAppt}>
          <FieldControl inputMode="numeric" aria-label={t.amount} value={customN} onChange={(e) => setCustomN(e.target.value.replace(/\D/g, '').slice(0, 4))} />
        </LabeledField>
        <SegmentedTabs options={[{ value: 'minutes', label: t.minutesLower }, { value: 'hours', label: t.hoursLower }, { value: 'days', label: t.daysLower }]} value={customUnit} onChange={setCustomUnit} />
        <Button block onClick={confirm}>
          {t.confirm}
        </Button>
        <Button block variant="outline" onClick={() => navigate(-1)}>
          {t.cancel}
        </Button>
      </RecordPage>
    );
  }

  if (slot) {
    return (
      <RecordPage className="gap-3">
        <RecordHeader title={t.reminderTime} onBack={() => navigate(-1)} />
        <TimeFields variant="row" value={timeDraft} onChange={setTimeDraft} />
        <Button
          block
          onClick={() => {
            setDraft(withTime(draft, rkey, slot, timeDraft));
            navigate(-1);
          }}
        >
          {t.confirmTime}
        </Button>
        <Button block variant="outline" onClick={() => navigate(-1)}>
          {t.cancel}
        </Button>
      </RecordPage>
    );
  }

  const on = isOn(draft, rkey);
  const openTime = (s: Slot) => setParams({ time: s });
  const row = rowInfo(t)[rkey];
  const days = weekdayNames('short');
  const mealName = { breakfast: t.breakfast, lunch: t.lunch, dinner: t.dinner };
  const timeField = (s: Slot) => (
    <div className={cx(!on && 'opacity-50')}>
      <LabeledField label={t.reminderTime}>
        <PickerField value={getTime(draft, rkey, s)} onClick={on ? () => openTime(s) : undefined} />
      </LabeledField>
    </div>
  );

  return (
    <RecordPage className="gap-3">
      <RecordHeader title={titles(t)[rkey]} onBack={leave} />
      {rkey === 'meals' ? (
        <>
          <p className="type-body-default text-text-secondary">{t.setEachReminder}</p>
          {(['breakfast', 'lunch', 'dinner'] as const).map((m) => (
            <NotificationRow
              key={m}
              icon="Food"
              title={mealName[m]}
              description={t.everyDay}
              schedule={draft.meals.times[m]}
              checked={draft.meals.enabled[m]}
              onChange={(v) => setDraft({ ...draft, meals: { ...draft.meals, enabled: { ...draft.meals.enabled, [m]: v } } })}
              onClick={() => openTime(m)}
            />
          ))}
        </>
      ) : (
        <NotificationRow icon={row.icon} title={row.title} description={row.description} schedule={on ? t.on : rkey === 'appointments' ? t.off : t.offTimeKept} checked={on} onChange={(v) => setDraft(setOn(draft, rkey, v))} />
      )}
      {rkey === 'weekly' && (
        <>
          <p className="type-caption-strong text-text-primary">{t.dayOfWeek}</p>
          <div className="flex gap-1">
            {days.map((d, i) => (
              <Chip key={i} className="flex-1 px-0" selected={draft.weekly.weekday === i} onClick={() => setDraft({ ...draft, weekly: { ...draft.weekly, weekday: i } })}>
                {d}
              </Chip>
            ))}
          </div>
        </>
      )}
      {(rkey === 'mood' || rkey === 'movement' || rkey === 'weekly') && timeField('time')}
      {rkey === 'appointments' && (
        <>
          <h2 className="type-heading-small text-text-primary">{t.defaultForNew}</h2>
          {REMINDER_OPTIONS.filter((o) => o.key !== 'none').map((o) => {
            const dr = draft.appointments.defaultReminder;
            const sel = isOptionSelected(dr, o.key);
            const pick = (k: ReminderOptionKey) => {
              if (k === 'custom') {
                const s = splitMinutes(dr.kind === 'custom' ? dr.minutesBefore : 30);
                setCustomN(String(s.amount || 30));
                setCustomUnit(s.unit);
                setParams({ custom: '1' });
              } else setDraft({ ...draft, appointments: { ...draft.appointments, defaultReminder: toggleReminder(dr, k) } });
            };
            const hourDay = o.key === 'hour' || o.key === 'day';
            return (
              <ReminderOption key={o.key} selected={sel} onClick={() => pick(o.key)}>
                {hourDay && sel ? '✓ ' : ''}
                {o.key === 'custom' && sel ? reminderText(dr) : o.label}
              </ReminderOption>
            );
          })}
        </>
      )}
      {rkey !== 'meals' && (
      <p className="type-caption-default text-text-secondary">
        {rkey === 'weekly'
          ? t.weeklyNote
          : rkey === 'appointments'
            ? t.apptNote
            : t.localTimeNote}
      </p>
      )}
      <Button block onClick={onSave}>
        {t.saveSettings}
      </Button>
      <Button block variant="outline" onClick={leave}>
        {t.cancel}
      </Button>
      {rkey === 'movement' && <p className="type-caption-default text-text-secondary">{t.movementNote}</p>}
    </RecordPage>
  );
}
