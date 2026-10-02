import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // `tsconfig` path mapping only affects `tsc`; Vite resolves through
      // node_modules, which points at `dist` and does not exist in a clean
      // checkout. Point tests at the sibling's source instead.
      '@chaos-design/shadcn-kits': path.resolve(
        __dirname,
        '../shadcn-kits/src/index.ts',
      ),
    },
  },
});
