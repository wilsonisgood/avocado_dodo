import { fruitImages } from '@/data/fruitImages';
import type { AccessoryId } from '@/data/types';
import { cx } from './cx';

const base = import.meta.env.BASE_URL;

/** Public asset URL that works under any GitHub Pages sub-path. */
export const asset = (p: string) => `${base}${p.replace(/^\//, '')}`;

/** Closest illustrated week at or below `week` (the design ships 4, 6, 8 … 40). */
export function fruitImageForWeek(week: number) {
  const weeks = Object.keys(fruitImages).map(Number).sort((a, b) => a - b);
  const w = [...weeks].reverse().find((x) => x <= week) ?? weeks[0];
  return asset(fruitImages[w]);
}

/**
 * Nestly/FruitCompanion: the fruit baby (164px in a 372×180 stage) with an optional head accessory
 * (96×64 artboard drawn at 66%, top-right of the fruit as in Accessory=Bow / Leaf).
 */
export function FruitCompanion({ week, accessory, size = 164, className }: { week: number; accessory?: AccessoryId | null; size?: number; className?: string }) {
  const k = size / 164;
  return (
    <div className={cx('relative', className)} style={{ width: size, height: size }}>
      <img src={fruitImageForWeek(week)} alt="Your fruit baby" className="size-full object-contain" />
      {accessory && (
        <img
          src={asset(`assets/accessories/${accessory}.svg`)}
          alt=""
          className="absolute"
          style={{ left: (175 - 104) * k, top: 1 * k, width: 63.36 * k, height: 42.24 * k }}
        />
      )}
    </div>
  );
}

/** Nestly/CompanionProgress: Growth progress label + %, 8px track, caption. Shared by Home and Tasks. */
export function CompanionProgress({ percent, caption, className }: { percent: number; caption: string; className?: string }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <span className="flex-1 type-label-default text-text-primary">Growth progress</span>
        <span className="type-heading-medium text-text-brand">{p}%</span>
      </div>
      <div className="h-2 rounded-999 bg-bg-canvas" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-2 rounded-999 bg-bg-success" style={{ width: `${p}%` }} />
      </div>
      <p className="type-caption-default text-text-secondary">{caption}</p>
    </div>
  );
}

const moods = {
  happy: { emoji: '🙂', label: 'Happy' },
  calm: { emoji: '😐', label: 'Calm' },
  sad: { emoji: '😢', label: 'Sad' },
  tired: { emoji: '😴', label: 'Tired' },
  worried: { emoji: '😟', label: 'Worried' },
} as const;
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
