import path from 'path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

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
      external: ['react', 'react-dom', 'react/jsx-runtime', 'clsx', 'tailwind-merge'],
      output: {
        preserveModules: false,
      },
    },
  },
});
