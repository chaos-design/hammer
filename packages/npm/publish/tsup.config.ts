import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  dts: true,
  splitting: false,
  treeshake: true,
  outDir: 'dist',
  format: ['cjs', 'esm'],
  // The package has both named and a default export; be explicit instead of
  // relying on tsup's inferred interop.
  cjsInterop: true,
});
