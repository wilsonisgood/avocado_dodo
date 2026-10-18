import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

// base './' + hash routing so the build works from any GitHub Pages sub-path (LEDGER D-pages).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  // Worktrees symlink node_modules from the main checkout; allow its real path (fonts are served from there).
  server: { fs: { allow: [import.meta.dirname, fs.realpathSync(path.resolve(import.meta.dirname, 'node_modules'))] } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
