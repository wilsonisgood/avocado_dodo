import type { CSSProperties } from 'react';
import { asset } from '@/components';

// Figma vector layers re-assembled from the exported SVGs (viewBox already includes the stroke bleed).
type Layer = {
  id: string;
  w: number;
  h: number;
  x: number;
  y: number;
  rot?: number;
};

function Assembled({ size, layers, className }: { size: number; layers: Layer[]; className?: string }) {
  return (
    <span className={className} style={{ width: size, height: size }} aria-hidden>
      <span
        style={{
          position: 'relative',
          display: 'block',
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        {layers.map((l) => {
          const style: CSSProperties = {
            position: 'absolute',
            left: l.x,
            top: l.y,
            width: l.w,
            height: l.h,
            maxWidth: 'none',
          };
          if (l.rot) {
            // Figma gives the rotated bounding-box corner; rotate around its centre instead.
            const r = (Math.abs(l.rot) * Math.PI) / 180;
            const bw = l.w * Math.cos(r) + l.h * Math.sin(r);
            const bh = l.w * Math.sin(r) + l.h * Math.cos(r);
            Object.assign(style, { left: l.x + bw / 2 - l.w / 2, top: l.y + bh / 2 - l.h / 2, transform: `rotate(${l.rot}deg)` });
          }
          return <img key={l.id} src={asset(`assets/vectors/${l.id}.svg`)} alt="" style={style} />;
        })}
      </span>
    </span>
  );
}

const L = (id: string, w: number, h: number, x: number, y: number, rot?: number): Layer => ({ id, w, h, x, y, rot });

export const WelcomeHeroIcon = () => (
  <Assembled size={40} layers={[L('1-2714', 23.33, 10, 8.33, 25), L('1-2715', 13.33, 13.33, 13.33, 5)]} />
);
export const ProfileHeroIcon = () => <Assembled size={32} layers={[L('1-1208', 26.67, 24, 2.67, 4)]} />;

const HEIGHT = [
  L('1-1233', 13.33, 13.33, 1.33, 1.33),
  L('1-1234', 1.33, 1.33, 9.66, 7),
  L('1-1235', 1.33, 1.33, 7.66, 5),
  L('1-1236', 1.33, 1.33, 5.66, 3),
  L('1-1237', 1.33, 1.33, 11.66, 8.99),
];
const WEIGHT = [L('1-1245', 4, 4, 6, 1.33), L('1-1246', 13.3, 8.66, 1.36, 5.33)];
const FIELD_ICONS = { height: HEIGHT, weight: WEIGHT };

/** 16px muted icon at the left inside a FieldControl (02). */
export function FieldIcon({ kind }: { kind: 'height' | 'weight' | 'waist' }) {
  const cls = 'pointer-events-none absolute left-3 top-2.5';
  if (kind === 'waist') {
    return (
      <span className={`${cls} flex size-4 items-center justify-center rounded-999 border border-icon-muted text-text-muted`} aria-hidden>
        <span className="text-[10px] font-bold leading-[15px]">W</span>
      </span>
    );
  }
  return <Assembled className={`${cls} text-icon-muted`} size={16} layers={FIELD_ICONS[kind]} />;
}

const BABY = [
  L('40-623', 0.01, 0.01, 9.75, 13),
  L('40-624', 0.01, 0.01, 16.25, 13),
  L('40-625', 4.33, 0.54, 10.83, 17.33),
  L('40-626', 21.51, 19.41, 2.24, 3.25),
];
const TWINS = [
  L('40-628', 0.01, 0.01, -0.47, 14.02, -18.31),
  L('40-629', 0.01, 0.01, 5.7, 11.98, -18.31),
  L('40-630', 4.33, 0.54, 1.92, 17.79, -18.31),
  L('40-631', 21.51, 19.41, -10.66, 7.12, -18.31),
  L('40-632', 0.01, 0.01, 20.86, 12.32, 12),
  L('40-633', 0.01, 0.01, 27.22, 13.67, 12),
  L('40-634', 4.33, 0.54, 21.02, 16.79, 12),
  L('40-635', 21.51, 19.41, 15.55, 1.23, 12),
];
/** 03 step icon: one baby (03-1), twins (03-2). 03-3 uses the Profile icon in the design. */
export const BabyStepIcon = ({ twins }: { twins?: boolean }) => <Assembled size={26} layers={twins ? TWINS : BABY} />;
