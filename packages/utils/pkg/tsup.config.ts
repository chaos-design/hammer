// packages/shared/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  dts: true,
  splitting: false,
  treeshake: true,
  outDir: 'lib',
  format: ['cjs', 'esm'],
});
