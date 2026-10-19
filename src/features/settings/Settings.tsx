import { Button, RecordHeader, RecordPage, SettingRow } from '@/components';
import { useNavigate } from 'react-router';
import { useLeave } from './useLeave';

/** 11-0 Settings. Profile edit screens (10-*) belong to the profile module; those rows go to /profile for now. */
export function Settings() {
  const navigate = useNavigate();
  const leave = useLeave('/profile');
  return (
    <RecordPage className="gap-4">
      <RecordHeader title="Settings" onBack={leave} />
      <SettingRow icon="Reminder" title="Notifications" detail="Reminder types, times and toggles" onClick={() => navigate('/settings/notifications')} />
      <SettingRow icon="Profile" title="Personal details" detail="Edit nickname" onClick={() => navigate('/profile')} />
      <SettingRow icon="Calendar" title="Pregnancy details" detail="Due date, week and pregnancy type" onClick={() => navigate('/profile')} />
      <SettingRow icon="Record" title="Body details" detail="Height, weight and waist size" onClick={() => navigate('/profile')} />
      <p className="type-caption-default text-text-secondary">Manage notification permissions in device settings.</p>
      <Button block onClick={() => navigate('/profile')}>
        Done
      </Button>
    </RecordPage>
  );
}
