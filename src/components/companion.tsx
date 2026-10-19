import { fruitImages } from '@/data/fruitImages';
import type { AccessoryId } from '@/data/types';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { tr } from '@/i18n';
import { common } from '@/i18n/common';
import { cx } from './cx';

const base = import.meta.env.BASE_URL;

let assetTheme: 'light' | 'dark' = 'light';
/** Set by app/theme.ts before rendering; design vectors have a dark-mode copy (tools/fig/assets.mjs). */
export const setAssetTheme = (t: 'light' | 'dark') => {
  assetTheme = t;
};

/** Public asset URL that works under any GitHub Pages sub-path; design vectors follow the theme. */
export const asset = (p: string) => {
  const rel = p.replace(/^\//, '');
  const themed = assetTheme === 'dark' ? rel.replace(/^assets\/(vectors|accessories)\//, 'assets/$1-dark/') : rel;
  return `${base}${themed}`;
};

/** Closest illustrated week at or below `week` (the design ships 4, 6, 8 … 40). */
export function fruitImageForWeek(week: number) {
  const weeks = Object.keys(fruitImages).map(Number).sort((a, b) => a - b);
  const w = [...weeks].reverse().find((x) => x <= week) ?? weeks[0];
  return asset(fruitImages[w]);
}

/**
 * Nestly/FruitCompanion: the fruit baby with an optional head accessory. Geometry from Accessory=Bow / Leaf:
 * fruit 164px, accessory 63.36×42.24 at (71, 1) relative to the fruit — kept as percentages so the
 * companion scales to any box. `size` in px, or 'fill' to take the parent's width (square).
 */
export function FruitCompanion({ week, accessory, size = 164, className }: { week: number; accessory?: AccessoryId | null; size?: number | 'fill'; className?: string }) {
  const box = size === 'fill' ? { width: '100%', aspectRatio: '1' } : { width: size, height: size };
  return (
    <div className={cx('relative', className)} style={box}>
      <img src={fruitImageForWeek(week)} alt={tr(common).fruitAlt} className="size-full object-contain" />
      {accessory && (
        <img
          src={asset(`assets/accessories/${accessory}.svg`)}
          alt=""
          className="absolute"
          style={{ left: `${(71 / 164) * 100}%`, top: `${(1 / 164) * 100}%`, width: `${(63.36 / 164) * 100}%`, height: `${(42.24 / 164) * 100}%` }}
        />
      )}
    </div>
  );
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Idle "floating" wrapper for the fruit baby: each mount starts from a random spot (a small offset that
 * stays inside the clipped circle), a random point of the drift/tilt cycle and a slightly random speed,
 * so twins never move in sync. Motion-sensitive users get the still, randomly placed fruit (index.css).
 */
export function FloatingFruit({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const [r] = useState(() => ({ x: rand(-8, 8), y: rand(-6, 6), delay: -rand(0, 4.5), duration: rand(3.6, 4.8) }));
  return (
    <div className={cx('fruit-float', className)} style={{ ...style, translate: `${r.x}% ${r.y}%`, animationDelay: `${r.delay}s`, animationDuration: `${r.duration}s` }}>
      {children}
    </div>
  );
}

/** Nestly/CompanionProgress: Growth progress label + %, 8px track, caption. Shared by Home and Tasks. */
export function CompanionProgress({ percent, caption, className }: { percent: number; caption: string; className?: string }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <span className="flex-1 type-label-default text-text-primary">{tr(common).growthProgress}</span>
        <span className="type-heading-medium text-text-brand">{p}%</span>
      </div>
      <div className="h-2 rounded-999 bg-bg-canvas" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-2 rounded-999 bg-bg-success" style={{ width: `${p}%` }} />
      </div>
      <p className="type-caption-default text-text-secondary">{caption}</p>
    </div>
  );
}

const MOOD_KEY = { happy: 'moodHappy', calm: 'moodCalm', sad: 'moodSad', tired: 'moodTired', worried: 'moodWorried' } as const;
const EMOJI = { happy: '🙂', calm: '😐', sad: '😢', tired: '😴', worried: '😟' } as const;
/** `label` is a getter so it follows the active language. */
const moods = Object.fromEntries(
  (Object.keys(EMOJI) as (keyof typeof EMOJI)[]).map((k) => [
    k,
    {
      emoji: EMOJI[k],
      get label() {
        return tr(common)[MOOD_KEY[k]];
      },
    },
  ]),
) as { [K in keyof typeof EMOJI]: { emoji: string; readonly label: string } };
export type MoodKind = keyof typeof moods;
export const moodMeta = moods;

/** Nestly/MoodChoice: 96×88 tile (Heading/Large emoji + caption); Selected = soft fill + focus border. */
export function MoodChoice({ mood, selected, onClick, compact }: { mood: MoodKind; selected?: boolean; onClick?: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx(
        'flex flex-1 flex-col items-center justify-center gap-1 rounded-14 border p-3 text-text-primary',
        compact ? 'h-14' : 'h-22',
        selected ? 'border-border-focus bg-bg-soft' : 'border-transparent bg-bg-canvas',
      )}
    >
      <span className="type-heading-large">{moods[mood].emoji}</span>
      <span className="type-caption-default">{moods[mood].label}</span>
    </button>
  );
}
