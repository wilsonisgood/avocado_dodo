// Decode design/*.fig into design/.cache/doc.json (node tree) + design/.cache/images/ (PITFALLS §fig 1).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { decodeBinarySchema, compileSchema } from 'kiwi-schema';

const root = path.resolve(import.meta.dirname, '../..');
const figFile = fs.readdirSync(path.join(root, 'design')).find((f) => f.endsWith('.fig'));
if (!figFile) throw new Error('no .fig in design/');
const cache = path.join(root, 'design/.cache');
fs.rmSync(cache, { recursive: true, force: true });
fs.mkdirSync(cache, { recursive: true });
execFileSync('unzip', ['-q', '-o', path.join(root, 'design', figFile), '-d', path.join(cache, 'zip')]);

const buf = fs.readFileSync(path.join(cache, 'zip/canvas.fig'));
if (buf.subarray(0, 8).toString() !== 'fig-kiwi') throw new Error('not a fig-kiwi file');
const chunks = [];
for (let o = 12; o < buf.length; ) {
  const n = buf.readUInt32LE(o);
  chunks.push(buf.subarray(o + 4, o + 4 + n));
  o += 4 + n;
}
const inflate = (c) => (c[0] === 0x28 && c[1] === 0xb5 ? zlib.zstdDecompressSync(c) : zlib.inflateRawSync(c));
const schema = decodeBinarySchema(inflate(chunks[0]));
const msg = compileSchema(schema).decodeMessage(inflate(chunks[1]));

// Blobs (vector path commands etc.) are kept as base64 so tools can rebuild SVG paths.
const blobs = (msg.blobs ?? []).map((b) => Buffer.from(b.bytes).toString('base64'));
const json = JSON.stringify({ nodeChanges: msg.nodeChanges, blobs }, (k, v) =>
  v instanceof Uint8Array ? { bytesBase64: Buffer.from(v).toString('base64') } : v,
);
fs.writeFileSync(path.join(cache, 'doc.json'), json);
fs.renameSync(path.join(cache, 'zip/images'), path.join(cache, 'images'));
console.log(`decoded ${figFile}: ${msg.nodeChanges.length} nodes, ${blobs.length} blobs`);
