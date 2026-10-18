import type { CSSProperties } from 'react';
import { iconData, type IconName, type IconPath } from './icons/iconData';

export type { IconName };

type Props = {
  name: IconName;
  /** Rendered size in px (icons are drawn on their own artboard and scaled). Default 24. */
  size?: number;
  /**
   * Per-layer colors, indexed by the source vector layer (`vec` in iconData).
   * Two-tone icons (nav, profile) need this; single-color icons just follow `color`/currentColor.
   */
  layers?: (string | undefined)[];
  className?: string;
  style?: CSSProperties;
  title?: string;
};

/** Nestly/Icon/* from the design, drawn inline so it can be tinted with CSS. */
export function Icon({ name, size = 24, layers, className, style, title }: Props) {
  const icon: { w: number; h: number; paths: IconPath[] } = iconData[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${icon.w} ${icon.h}`}
      overflow="visible"
      className={className}
      style={{ flexShrink: 0, ...style }}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {icon.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          transform={p.transform}
          fillRule={p.evenodd ? 'evenodd' : undefined}
          fill={layers?.[p.vec] ?? p.color ?? 'currentColor'}
        />
      ))}
    </svg>
  );
}
