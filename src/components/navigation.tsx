import { NavLink } from 'react-router';
import { tr } from '@/i18n';
import { common } from '@/i18n/common';
import { Icon, type IconName } from './Icon';

// Nestly/BottomNavigation + Nestly/NavItem: 76px surface bar (12px bottom pad), four 97.5px items.
// Icons are two-tone: Default = peach + disabled, Selected = blush + active (from the component overrides).
const items: { to: string; label: 'navHome' | 'navRecords' | 'navTasks' | 'navProfile'; icon: IconName }[] = [
  { to: '/home', label: 'navHome', icon: 'Home' },
  { to: '/records', label: 'navRecords', icon: 'Record' },
  { to: '/tasks', label: 'navTasks', icon: 'Tasks' },
  { to: '/profile', label: 'navProfile', icon: 'Profile' },
];

// Profile's four layers alternate (disabled, disabled, peach, peach); the other icons are (peach, disabled).
const tones = (icon: IconName, selected: boolean) => {
  const accent = selected ? 'var(--nestly-color-icon-blush)' : 'var(--nestly-color-icon-peach)';
  const base = selected ? 'var(--nestly-color-icon-active)' : 'var(--nestly-color-icon-disabled)';
  return icon === 'Profile' ? [base, base, accent, accent] : [accent, base];
};

export function BottomNavigation() {
  return (
    <nav className="flex h-19 shrink-0 items-center justify-center border-t border-border-default bg-bg-surface pb-3">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} className="flex h-16 w-[97.5px] flex-col items-center justify-center gap-1 p-2">
          {({ isActive }) => (
            <>
              <Icon name={it.icon} layers={tones(it.icon, isActive)} />
              <span className={`type-caption-default ${isActive ? 'text-text-rose' : 'text-text-muted'}`}>{tr(common)[it.label]}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
