import fs from 'node:fs';
import path from 'node:path';
import jsxSourceLocation from '@chaos-design/babel-plugin-jsx-source-location';
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
  plugins: [
    react({
      babel: {
        plugins: [jsxSourceLocation],
      },
    }),
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'CalendarScheduler',
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
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'es/index.css';
          return assetInfo.name || '[name][extname]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
