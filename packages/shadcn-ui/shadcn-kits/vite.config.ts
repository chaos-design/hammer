import fs from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Keep `dependencies` and `peerDependencies` out of the bundle.
 *
 * Bundling them would ship a second copy of React into every consumer, break
 * context sharing between the library and the host app, and silently pin
 * whatever version happened to be installed at build time.
 */
const readExternal = () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'),
  ) as {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };

  return [
    'react',
    'react-dom',
    'react/jsx-runtime',
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ];
};

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        utils: path.resolve(__dirname, 'src/utils/clsx.ts'),
        hooks: path.resolve(__dirname, 'src/hooks/use-mobile.tsx'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const dir = format === 'es' ? 'es' : 'lib';
        const ext = format === 'es' ? 'js' : 'cjs';
        return `${dir}/${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: readExternal(),
      output: {
        preserveModules: false,
      },
    },
  },
});
