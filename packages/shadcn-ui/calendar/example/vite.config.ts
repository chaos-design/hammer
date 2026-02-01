import jsxSourceLocation from '@chaos-design/babel-plugin-jsx-source-location';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [jsxSourceLocation],
      },
    }),
  ],
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@chaos-design/month-datepicker': path.resolve(
        __dirname,
        '../../month-datepicker/src/index.tsx',
      ),
      '@chaos-design/color-picker': path.resolve(
        __dirname,
        '../../color-picker/src/index.tsx',
      ),
      '@chaos-design/shadcn-kits': path.resolve(
        __dirname,
        '../../shadcn-kits/src/index.ts',
      ),
    },
  },
  server: {
    open: true,
  },
});
