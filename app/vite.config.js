import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/app/' : '/',
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: '../dist/app',
    emptyDirOutDir: true,
  },
}));
