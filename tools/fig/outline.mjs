// Print a spec JSON as a compact indented outline (one node per line) — cheaper to read than the JSON.
//   node tools/fig/outline.mjs design/spec/screens/52-1712.json [more files...]
//   node tools/fig/outline.mjs --component "Nestly/Button"     (every component whose name starts with it)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2);
let files = args;
if (args[0] === '--component') {
  const index = JSON.parse(fs.readFileSync(path.join(root, 'design/spec/index.json'), 'utf8'));
  files = index.components.filter((c) => c.file && c.name.startsWith(args[1])).map((c) => path.join(root, 'design/spec', c.file));
}

const short = (v) => (typeof v === 'string' ? v.replace(/var\(--nestly-(color-)?([^)]+)\)/g, '$$$2') : JSON.stringify(v));
function line(n, depth) {
  const bits = [];
  bits.push(n.type === 'TEXT' ? `T "${(n.text ?? '').replace(/\n/g, '⏎')}"` : n.type === 'INSTANCE' ? `<${n.component}>` : `${n.type[0]} ${n.name}`);
  bits.push(`${n.w}×${n.h}`);
  if (n.x != null) bits.push(`@${n.x},${n.y}`);
  if (n.rotate) bits.push(`rot${n.rotate}`);
  if (n.grow) bits.push('grow');
  if (n.stretch) bits.push('stretch');
  if (n.hugMain) bits.push('hug');
  if (n.layout) {
    const l = n.layout;
    bits.push(`${l.dir}${l.gap ? ` gap${l.gap}` : ''}${l.pad ? ` pad${l.pad.join('/')}` : ''}${l.justify ? ` j:${l.justify}` : ''}${l.align ? ` a:${l.align}` : ''}${l.wrap ? ' wrap' : ''}`);
  }
  if (n.fill) bits.push(`fill:${short(n.fill)}`);
  if (n.stroke) bits.push(`stroke:${short(n.stroke.paint)}/${n.stroke.weight}${n.stroke.dash ? ' dashed' : ''}`);
  if (n.radius != null) bits.push(`r${Array.isArray(n.radius) ? n.radius.join('/') : n.radius}`);
  if (n.shadow) bits.push(`shadow:${short(n.shadow.join(' | '))}`);
  if (n.opacity != null) bits.push(`op${n.opacity}`);
  if (n.clip) bits.push('clip');
  if (n.type === 'TEXT') bits.push(`${n.style ? n.style.replace('Nestly/', '') : `${n.font} ${n.size}/${n.lineHeight ?? ''}`} ${short(n.color)}${n.align ? ` ${n.align}` : ''}`);
  if (n.icon) bits.push(`icon:${n.icon}`);
  if (n.props) bits.push(`props:${JSON.stringify(n.props)}`);
  if (n.texts) bits.push(`texts:${JSON.stringify(n.texts)}`);
  if (n.colorOverrides) bits.push(`colors:${short(JSON.stringify(n.colorOverrides))}`);
  if (n.svg) bits.push(`svg:${n.svg}`);
  if (n.links) bits.push(`→ ${n.links.map((l) => (l.back ? 'BACK' : l.toName)).join(', ')}`);
  return `${'  '.repeat(depth)}${bits.join(' ')}`;
}
function walk(n, depth, out) {
  out.push(line(n, depth));
  for (const c of n.children ?? []) walk(c, depth + 1, out);
  return out;
}
for (const f of files) {
  const spec = JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log(`# ${spec.name} (${spec.id})${spec.description ? ` — ${spec.description}` : ''}`);
  console.log(walk(spec, 0, []).join('\n'));
  console.log();
}
