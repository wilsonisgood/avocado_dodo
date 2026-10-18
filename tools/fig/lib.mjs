// Shared helpers for reading design/.cache/doc.json (produced by decode.mjs).
import fs from 'node:fs';
import path from 'node:path';

export const root = path.resolve(import.meta.dirname, '../..');

export const gid = (g) => (g ? `${g.sessionID}:${g.localID}` : null);

export function loadDoc() {
  const file = path.join(root, 'design/.cache/doc.json');
  if (!fs.existsSync(file)) throw new Error('run `node tools/fig/decode.mjs` first');
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const byId = new Map();
  const children = new Map();
  for (const n of doc.nodeChanges) byId.set(gid(n.guid), n);
  for (const n of doc.nodeChanges) {
    const p = gid(n.parentIndex?.guid);
    if (!p) continue;
    if (!children.has(p)) children.set(p, []);
    children.get(p).push(n);
  }
  // Figma orders siblings by fractional-index strings in parentIndex.position.
  for (const list of children.values())
    list.sort((a, b) => (a.parentIndex.position < b.parentIndex.position ? -1 : 1));
  const kids = (id) => children.get(id) ?? [];
  return { doc, byId, kids };
}

// "color/bg/surface" -> "--nestly-color-bg-surface"
export const cssVarName = (name) => `--nestly-${name.replace(/[\/\s]+/g, '-').toLowerCase()}`;

const hex2 = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
export function colorToCss({ r, g, b, a = 1 }) {
  if (a >= 0.999) return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${+a.toFixed(3)})`;
}

// Only the local variable collections (the ones with a guid set id) are the source of truth;
// the assetRef copies are stale library links.
export function localVariables(byId) {
  const vars = new Map();
  for (const n of byId.values()) {
    if (n.type !== 'VARIABLE' || !n.variableSetID?.guid) continue;
    vars.set(gid(n.guid), n);
  }
  return vars;
}

export const r1 = (x) => (x == null ? x : Math.round(x * 100) / 100);
