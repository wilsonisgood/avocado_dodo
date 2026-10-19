import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Chip,
  CompanionDialog,
  CompanionProgress,
  ConfirmDialog,
  FieldControl,
  FruitCompanion,
  Icon,
  IconButton,
  Input,
  LabeledField,
  MoodChoice,
  MonthCalendar,
  TimeFields,
  NotificationRow,
  RecordEmpty,
  RecordHeader,
  RecordMetric,
  RecordNotice,
  RecordPage,
  RecordRow,
  ReminderOption,
  SectionHeader,
  SegmentedTabs,
  SettingRow,
  TextArea,
  Toggle,
} from '@/components';
import { iconData, type IconName } from '@/components/icons/iconData';
import { loadDemoData } from '@/data/demo';
import { useAction, useSettings } from '@/data/queries';
import { dataService, settingsService } from '@/data/services';

/** #/playground — data controls + a gallery of the shared components to compare with 03 · Components. */
export function DevPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const setTheme = useAction(settingsService.save, [['settings']]);
  const [chip, setChip] = useState('Lunch');
  const [on, setOn] = useState(true);
  const [tab, setTab] = useState<'up' | 'past'>('up');
  const [dialog, setDialog] = useState<'confirm' | 'reward' | null>(null);
  const [month, setMonth] = useState('2026-10-01');
  const [day, setDay] = useState('2026-10-22');
  const [time, setTime] = useState('08:30');

  const run = async (fn: () => Promise<unknown>, to: string) => {
    await fn();
    qc.clear();
    navigate(to);
  };

  return (
    <RecordPage>
      <RecordHeader title="Playground" onBack={() => navigate('/')} />

      <SectionHeader>Data</SectionHeader>
      <div className="flex flex-wrap gap-2">
        <Button size="small" onClick={() => run(loadDemoData, '/home')}>
          Load demo data
        </Button>
        <Button size="small" variant="outline" onClick={() => run(dataService.reset, '/')}>
          Fresh install
        </Button>
      </div>
      <SegmentedTabs
        options={[
          { value: 'system', label: 'System' },
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
        value={settings?.theme ?? 'system'}
        onChange={(theme) => setTheme.mutate([{ theme }])}
      />

      <SectionHeader>Buttons</SectionHeader>
      <div className="flex flex-wrap gap-2">
        <Button>Save session</Button>
        <Button variant="outline">Save session</Button>
        <Button variant="soft">Save session</Button>
        <Button disabled>Save session</Button>
        <Button icon="Plus">Movement ＋1</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="small">Save session</Button>
        <Button size="small" variant="outline">
          Save session
        </Button>
        <Button size="small" variant="soft">
          Save session
        </Button>
        <IconButton icon="Back" label="Back" />
      </div>

      <SectionHeader>Chips, toggles, tabs</SectionHeader>
      <div className="flex flex-wrap gap-2">
        {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((c) => (
          <Chip key={c} selected={chip === c} onClick={() => setChip(c)}>
            {c}
          </Chip>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Toggle checked={on} onChange={setOn} label="Demo toggle" />
        <Toggle checked={!on} onChange={(v) => setOn(!v)} label="Demo toggle 2" />
        <Toggle checked={false} disabled label="Disabled toggle" />
      </div>
      <SegmentedTabs options={[{ value: 'up', label: 'Upcoming' }, { value: 'past', label: 'Past' }]} value={tab} onChange={setTab} />

      <SectionHeader>Fields</SectionHeader>
      <Input label="Your nickname" placeholder="e.g. Amy" helper="Start your journey with a name you love" />
      <Input label="Your nickname" defaultValue="Amy" error="Enter a nickname to continue" />
      <LabeledField label="Appointment name *">
        <FieldControl defaultValue="Prenatal visit" />
      </LabeledField>
      <TextArea placeholder="Anything you'd like to remember? (optional)" />

      <SectionHeader>Record blocks</SectionHeader>
      <RecordMetric label="Movements this session" value="3 movements" detail="Elapsed 00:45 · Started at 14:00" />
      <RecordNotice title="Every baby has a different pattern">
        If movements slow, stop or change, contact your maternity care team immediately.
      </RecordNotice>
      <RecordRow title="Feeling good today" detail="14:00 · A walk with baby" onClick={() => {}} />
      <RecordEmpty title="A little space for how you feel">No perfect words needed. A feeling is enough.</RecordEmpty>
      <SettingRow icon="Profile" title="Personal details" detail="Nickname and basic details" onClick={() => {}} />
      <NotificationRow icon="Reminder" title="Mood journal" description="Make a little time for yourself" schedule="Daily at 20:30" checked={on} onChange={setOn} />
      <NotificationRow icon="Reminder" title="Mood journal" description="Make a little time for yourself" schedule="Daily at 20:30" checked={false} disabled onChange={() => {}} />
      <ReminderOption selected>1 day before</ReminderOption>
      <ReminderOption>1 hour before</ReminderOption>

      <SectionHeader>Mood</SectionHeader>
      <div className="flex gap-2">
        <MoodChoice mood="happy" selected />
        <MoodChoice mood="calm" />
        <MoodChoice mood="sad" />
      </div>
      <div className="flex gap-2">
        <MoodChoice mood="tired" compact />
        <MoodChoice mood="worried" compact />
      </div>

      <SectionHeader>Fruit baby</SectionHeader>
      <div className="flex items-center justify-center gap-2 rounded-16 bg-bg-soft py-2">
        <FruitCompanion week={12} />
        <FruitCompanion week={12} accessory="bow" size={96} />
        <FruitCompanion week={12} accessory="leaf" size={96} />
      </div>
      <CompanionProgress percent={72} caption="2/3 tasks done today" className="rounded-16 bg-bg-surface p-4" />

      <SectionHeader>Schedule</SectionHeader>
      <MonthCalendar month={month} onMonthChange={setMonth} selected={day} onSelect={setDay} events={new Set(['2026-10-08', '2026-10-22'])} />
      <TimeFields title="Appointment time" value={time} onChange={setTime} />

      <SectionHeader>Dialogs</SectionHeader>
      <div className="flex gap-2">
        <Button size="small" variant="outline" onClick={() => setDialog('confirm')}>
          Confirm dialog
        </Button>
        <Button size="small" variant="outline" onClick={() => setDialog('reward')}>
          Reward dialog
        </Button>
      </div>
      <ConfirmDialog
        open={dialog === 'confirm'}
        title="Save before leaving?"
        message="This meal has unsaved changes."
        confirmLabel="Keep editing"
        cancelLabel="Discard changes"
        onConfirm={() => setDialog(null)}
        onCancel={() => setDialog(null)}
      />
      <CompanionDialog
        open={dialog === 'reward'}
        title="Meal logged!"
        metric="＋10 BP"
        body="Breakfast saved. Thank you for caring for yourself."
        footnote="Balance: 120 → 130 BP"
        confirmLabel="Confirm"
        onConfirm={() => setDialog(null)}
      />

      <SectionHeader>Icons</SectionHeader>
      <div className="grid grid-cols-6 gap-3 rounded-16 bg-bg-surface p-4 text-icon-default">
        {(Object.keys(iconData) as IconName[]).map((n) => (
          <div key={n} className="flex flex-col items-center gap-1">
            <Icon name={n} />
            <span className="type-caption-default text-[10px] text-text-muted">{n}</span>
          </div>
        ))}
      </div>
    </RecordPage>
  );
}
