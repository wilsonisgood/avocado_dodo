// design/.cache/doc.json -> compact per-screen specs for implementers (METHOD §3).
//   design/spec/index.json              screens + components overview
//   design/spec/screens/<id>.json       one per frame on "04 · App Screens"
//   design/spec/components/<id>.json    component (SYMBOL) definitions referenced by screens
// Resolves text styles and instance overrides (PITFALLS §fig 2, 3) and prints variable names
// instead of raw colors wherever the design binds one.
import fs from 'node:fs';
import path from 'node:path';
import { loadDoc, gid, cssVarName, colorToCss, r1, root } from './lib.mjs';

const { byId, kids } = loadDoc();
const APP_PAGE = '0:1';

// ---- variables: local guid and library assetRef key both map to a name -------------------------
const varName = new Map();
for (const n of byId.values()) {
  if (n.type !== 'VARIABLE') continue;
  varName.set(gid(n.guid), n.name);
  if (n.key) varName.set(n.key, n.name);
}
const aliasName = (alias) => varName.get(alias?.guid ? gid(alias.guid) : alias?.assetRef?.key);
const boundVar = (cv) => {
  const name = aliasName(cv?.value?.alias);
  return name ? `var(${cssVarName(name)})` : null;
};

// ---- symbols ------------------------------------------------------------------------------------
const symbolName = (sym) => {
  const parent = byId.get(gid(sym.parentIndex?.guid));
  // Variants live under a component set (a FRAME with isStateGroup); name it "Set / Variant".
  return parent?.isStateGroup ? `${parent.name} / ${sym.name}` : sym.name;
};
const propDefs = new Map(); // defID -> name
for (const n of byId.values())
  for (const d of n.componentPropDefs ?? []) if (d.name) propDefs.set(gid(d.id), d.name.replace(/#\d+:\d+$/, ''));
// Library-linked defs have no local name; fall back to the layer that consumes the prop.
for (const n of byId.values())
  for (const r of n.componentPropRefs ?? []) {
    const id = gid(r.defID);
    if (id && !propDefs.has(id)) propDefs.set(id, `${n.name}.${r.componentPropNodeField === 'TEXT_DATA' ? 'text' : r.componentPropNodeField === 'VISIBLE' ? 'visible' : 'swap'}`);
  }

const iconName = (sym) => {
  const m = /^Nestly\/Icon\/(.+)$/.exec(sym?.name ?? '');
  return m ? m[1] : null;
};

// ---- paints / effects ---------------------------------------------------------------------------
// Same naming as assets.mjs: public/assets/images/<hash>.<ext>
function imageFile(hash) {
  if (!hash) return null;
  const h = Buffer.from(hash.bytesBase64, 'base64').toString('hex');
  const src = path.join(root, 'design/.cache/images', h);
  const head = fs.existsSync(src) ? fs.readFileSync(src).subarray(0, 4).toString('hex') : '';
  return `assets/images/${h}.${head.startsWith('ffd8') ? 'jpg' : head.startsWith('52494646') ? 'webp' : 'png'}`;
}
function paint(p) {
  if (p.visible === false) return null;
  const op = p.opacity ?? 1;
  if (p.type === 'SOLID') {
    const v = boundVar(p.colorVar);
    const c = colorToCss({ ...p.color, a: (p.color.a ?? 1) * op });
    return v && op >= 0.999 ? v : v ? `${v} @${r1(op)}` : c;
  }
  if (p.type === 'IMAGE') return { image: imageFile(p.image?.hash), scale: p.imageScaleMode };
  if (p.type.startsWith('GRADIENT'))
    return { gradient: p.type, stops: (p.stops ?? []).map((s) => [colorToCss(s.color), r1(s.position)]) };
  return { unsupported: p.type };
}
const paints = (list) => {
  const out = (list ?? []).map(paint).filter(Boolean);
  return out.length ? (out.length === 1 ? out[0] : out) : undefined;
};
function effects(list) {
  const out = (list ?? [])
    .filter((e) => e.visible !== false)
    .map((e) => {
      const color = boundVar(e.colorVar) ?? colorToCss(e.color);
      const o = e.offset ?? { x: 0, y: 0 };
      if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW')
        return `${e.type === 'INNER_SHADOW' ? 'inset ' : ''}${r1(o.x)}px ${r1(o.y)}px ${r1(e.radius)}px ${r1(e.spread ?? 0)}px ${color}`;
      return `${e.type} ${r1(e.radius)}px`;
    });
  return out.length ? out : undefined;
}

// ---- text ---------------------------------------------------------------------------------------
function textStyle(n) {
  const style = n.styleIdForText?.guid ? byId.get(gid(n.styleIdForText.guid)) : null;
  const src = style ?? n;
  const lh = src.lineHeight;
  return {
    style: style?.name,
    font: `${src.fontName?.family} ${src.fontName?.style}`,
    size: src.fontSize,
    lineHeight: lh?.units === 'PIXELS' ? lh.value : lh?.units === 'PERCENT' && lh.value !== 100 ? `${lh.value}%` : undefined,
    letterSpacing: src.letterSpacing?.value ? `${r1(src.letterSpacing.value)}${src.letterSpacing.units === 'PERCENT' ? '%' : 'px'}` : undefined,
  };
}

// ---- layout -------------------------------------------------------------------------------------
function layout(n) {
  if (!n.stackMode || n.stackMode === 'NONE') return undefined;
  const pad = [
    n.stackVerticalPadding ?? 0,
    n.stackPaddingRight ?? n.stackHorizontalPadding ?? 0,
    n.stackPaddingBottom ?? n.stackVerticalPadding ?? 0,
    n.stackHorizontalPadding ?? 0,
  ].map(r1);
  return {
    dir: n.stackMode === 'HORIZONTAL' ? 'row' : n.stackMode === 'VERTICAL' ? 'column' : n.stackMode.toLowerCase(),
    gap: r1(n.stackSpacing ?? 0) || undefined,
    pad: pad.some(Boolean) ? pad : undefined,
    justify: n.stackPrimaryAlignItems,
    align: n.stackCounterAlignItems,
    wrap: n.stackWrap === 'WRAP' || undefined,
  };
}
function sizing(n, parent) {
  const inFlow = parent?.stackMode && parent.stackMode !== 'NONE' && n.stackPositioning !== 'ABSOLUTE';
  const out = {};
  if (inFlow) {
    if (n.stackChildPrimaryGrow) out.grow = 1;
    if (n.stackChildAlignSelf === 'STRETCH') out.stretch = true;
  }
  if (n.stackMode && n.stackMode !== 'NONE') {
    if (n.stackPrimarySizing && n.stackPrimarySizing !== 'FIXED') out.hugMain = true;
    if (n.stackCounterSizing && n.stackCounterSizing !== 'FIXED') out.hugCross = true;
  }
  return { inFlow, ...out };
}
const radius = (n) => {
  const four = [n.rectangleTopLeftCornerRadius, n.rectangleTopRightCornerRadius, n.rectangleBottomRightCornerRadius, n.rectangleBottomLeftCornerRadius].map((x) => r1(x ?? 0));
  if (n.rectangleCornerRadiiIndependent && four.some((x) => x !== four[0])) return four;
  const r = n.cornerRadius ?? four[0];
  return r ? r1(r) : undefined;
};

// ---- prototype links ----------------------------------------------------------------------------
function links(n) {
  const out = [];
  for (const it of n.prototypeInteractions ?? []) {
    for (const a of it.actions ?? []) {
      const dest = a.transitionNodeID ? byId.get(gid(a.transitionNodeID)) : null;
      if (dest) out.push({ on: it.event?.interactionType, to: gid(dest.guid), toName: dest.name, nav: a.navigationType });
      else if (a.connectionType === 'BACK') out.push({ on: it.event?.interactionType, back: true });
    }
  }
  return out.length ? out : undefined;
}

// ---- tree ---------------------------------------------------------------------------------------
const usedSymbols = new Set();
const vectorNodes = new Set();

function instanceInfo(n) {
  const sym = byId.get(gid(n.symbolData?.symbolID));
  if (!sym) return { component: '(missing)' };
  usedSymbols.add(gid(sym.guid));
  const props = {};
  // Start from the component's defaults (props the instance does not override keep them).
  const holder = sym.componentPropDefs?.length ? sym : byId.get(gid(sym.parentIndex?.guid));
  const assigned = new Set((n.componentPropAssignments ?? []).map((a) => gid(a.defID)));
  for (const d of holder?.componentPropDefs ?? []) {
    if (assigned.has(gid(d.id)) || !d.name) continue;
    const v = d.initialValue ?? {};
    const val = v.textValue?.characters ?? v.boolValue ?? (v.guidValue ? byId.get(gid(v.guidValue))?.name : undefined);
    if (val !== undefined) props[d.name.replace(/#\d+:\d+$/, '')] = val;
  }
  for (const a of n.componentPropAssignments ?? []) {
    let name = propDefs.get(gid(a.defID)) ?? gid(a.defID);
    for (let k = 2; name in props; k++) name = `${name.replace(/#\d+$/, '')}#${k}`; // several props can share a layer name
    const v = a.value ?? {};
    props[name] = v.textValue?.characters ?? v.boolValue ?? (v.guidValue ? byId.get(gid(v.guidValue))?.name : undefined) ?? '?';
  }
  // Text overrides that are not exposed as component props.
  const texts = {};
  for (const o of n.symbolData?.symbolOverrides ?? []) {
    if (!o.textData?.characters) continue;
    const target = byId.get(gid(o.guidPath.guids.at(-1)));
    texts[target?.name ?? gid(o.guidPath.guids.at(-1))] = o.textData.characters;
  }
  const colorOverrides = (n.symbolData?.symbolOverrides ?? [])
    .filter((o) => o.fillPaints || o.strokePaints)
    .map((o) => ({ target: byId.get(gid(o.guidPath.guids.at(-1)))?.name, fill: paints(o.fillPaints), stroke: paints(o.strokePaints) }));
  return {
    component: symbolName(sym),
    componentId: gid(sym.guid),
    icon: iconName(sym) ?? undefined,
    props: Object.keys(props).length ? props : undefined,
    texts: Object.keys(texts).length ? texts : undefined,
    colorOverrides: colorOverrides.length ? colorOverrides : undefined,
  };
}

function node(n, parent) {
  if (n.visible === false) return null;
  const s = sizing(n, parent);
  const base = {
    id: gid(n.guid),
    type: n.type,
    name: n.name,
    w: r1(n.size?.x),
    h: r1(n.size?.y),
    ...(s.inFlow ? {} : { x: r1(n.transform?.m02), y: r1(n.transform?.m12) }),
    rotate: n.transform && Math.abs(n.transform.m10) > 1e-3 ? r1((Math.atan2(n.transform.m10, n.transform.m00) * 180) / Math.PI) : undefined,
    grow: s.grow,
    stretch: s.stretch,
    hugMain: s.hugMain,
    hugCross: s.hugCross,
    opacity: n.opacity != null && n.opacity < 0.999 ? r1(n.opacity) : undefined,
    layout: layout(n),
    fill: n.type === 'TEXT' ? undefined : paints(n.fillPaints),
    stroke: paints(n.strokePaints) && n.strokeWeight ? { paint: paints(n.strokePaints), weight: r1(n.strokeWeight), align: n.strokeAlign, dash: n.dashPattern } : undefined,
    radius: radius(n),
    shadow: effects(n.effects),
    clip: n.frameMaskDisabled === false || undefined,
    links: links(n),
  };
  if (n.type === 'TEXT') {
    Object.assign(base, textStyle(n), {
      text: n.textData?.characters,
      color: paints(n.fillPaints),
      align: n.textAlignHorizontal && n.textAlignHorizontal !== 'LEFT' ? n.textAlignHorizontal : undefined,
      case: n.textCase,
      autoResize: n.textAutoResize,
    });
    return clean(base);
  }
  if (n.type === 'INSTANCE') {
    const sym = byId.get(gid(n.symbolData?.symbolID));
    if (sym) {
      const def = node(sym, null);
      for (const k of ['layout', 'fill', 'stroke', 'radius', 'shadow', 'clip', 'opacity'])
        if (JSON.stringify(base[k]) === JSON.stringify(def[k])) delete base[k];
    }
    return clean({ ...base, ...instanceInfo(n) });
  }
  if (['VECTOR', 'ELLIPSE', 'STAR', 'REGULAR_POLYGON', 'BOOLEAN_OPERATION', 'LINE', 'BRUSH'].includes(n.type)) {
    vectorNodes.add(gid(n.guid));
    return clean({ ...base, svg: `assets/vectors/${gid(n.guid).replace(':', '-')}.svg` });
  }
  const children = kids(gid(n.guid)).map((c) => node(c, n)).filter(Boolean);
  return clean({ ...base, children: children.length ? children : undefined });
}

// Pretty JSON, but arrays of primitives and small leaf objects stay on one line (fewer tokens to read).
function dump(v) {
  return JSON.stringify(v, null, 1).replace(/\[\s*([^\[\]{}]*?)\s*\]/g, (m, inner) => `[${inner.replace(/\s*\n\s*/g, ' ')}]`)
    .replace(/\{\s*([^\[\]{}]*?)\s*\}/g, (m, inner) => (inner.length < 160 ? `{ ${inner.replace(/\s*\n\s*/g, ' ')} }` : m));
}

function clean(o) {
  for (const k of Object.keys(o)) if (o[k] === undefined || o[k] === false) delete o[k];
  return o;
}

// ---- module mapping (METHOD §1) -----------------------------------------------------------------
const MODULES = [
  [/^0[123]/, 'onboarding'], [/^04/, 'home'], [/^05/, 'meals'], [/^06|^12/, 'tasks-shop'],
  [/^07\.Personal/, 'profile'], [/^07/, 'mood'], [/^08/, 'movement'], [/^09/, 'appointments'],
  [/^10/, 'profile'], [/^11/, 'settings'],
];
const moduleOf = (name) => MODULES.find(([re]) => re.test(name))?.[1] ?? 'other';

// ---- write --------------------------------------------------------------------------------------
const out = path.join(root, 'design/spec');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'screens'), { recursive: true });
fs.mkdirSync(path.join(out, 'components'), { recursive: true });
const fileId = (id) => id.replace(':', '-');

const screens = [];
for (const f of kids(APP_PAGE)) {
  if (f.type !== 'FRAME' || f.visible === false || !/^\d/.test(f.name)) continue;
  const spec = node(f, null);
  delete spec.x;
  delete spec.y;
  const file = `screens/${fileId(spec.id)}.json`;
  fs.writeFileSync(path.join(out, file), dump(spec));
  screens.push({ id: spec.id, name: f.name, module: moduleOf(f.name), w: spec.w, h: spec.h, file, bytes: fs.statSync(path.join(out, file)).size });
}

// Component definitions: everything screens reference, plus whatever those reference in turn.
const components = [];
const done = new Set();
while ([...usedSymbols].some((id) => !done.has(id))) {
  for (const id of [...usedSymbols]) {
    if (done.has(id)) continue;
    done.add(id);
    const sym = byId.get(id);
    if (iconName(sym)) {
      components.push({ id, name: symbolName(sym), icon: iconName(sym) });
      continue;
    }
    const spec = node(sym, null);
    delete spec.x;
    delete spec.y;
    spec.description = sym.symbolDescription ?? sym.description;
    const file = `components/${fileId(id)}.json`;
    fs.writeFileSync(path.join(out, file), dump(spec));
    components.push({ id, name: symbolName(sym), file });
  }
}
components.sort((a, b) => a.name.localeCompare(b.name));
screens.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
fs.writeFileSync(path.join(out, 'index.json'), dump({ screens, components }));
fs.writeFileSync(path.join(root, 'design/.cache/vector-nodes.json'), JSON.stringify([...vectorNodes]));
console.log(`spec: ${screens.length} screens, ${components.length} components, ${vectorNodes.size} vectors -> design/spec/`);
