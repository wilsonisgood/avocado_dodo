import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from './cx';

// Nestly/Button (03 · Components): Size × Style × State.
//   Medium: 44px, pad 12/16, radius 14, Label/Default.   Small: 32px, pad 8/16, pill, Caption/Strong.
type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  size?: 'medium' | 'small';
  variant?: 'primary' | 'outline' | 'soft';
  icon?: IconName;
  /** Stretch to the parent's width (most buttons in the screens are full width). */
  block?: boolean;
  children: ReactNode;
};

const variants = {
  primary: 'bg-action-default text-text-on-action active:bg-action-pressed',
  outline: 'bg-bg-surface text-text-primary border border-border-default active:bg-bg-canvas',
  soft: 'bg-bg-soft text-text-primary active:bg-bg-blush',
};

export function Button({ size = 'medium', variant = 'primary', icon, block, className, disabled, children, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 px-4 whitespace-nowrap transition-colors',
        size === 'medium' ? 'h-11 rounded-14 py-3 type-label-default' : 'h-8 rounded-999 py-2 type-caption-strong',
        disabled ? 'cursor-not-allowed bg-bg-disabled text-text-primary' : variants[variant],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}
