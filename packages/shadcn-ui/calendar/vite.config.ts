import path from 'path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import jsxSourceLocation from '@chaos-design/babel-plugin-jsx-source-location';

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
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@chaos-design/color-picker',
        '@chaos-design/month-datepicker',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@chaos-design/color-picker': 'colorPicker',
          '@chaos-design/month-datepicker': 'monthDatepicker',
        },
        assetFileNames: assetInfo => {
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
