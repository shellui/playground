import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/app/' : '/',
  server: {
    port: 5173,
    strictPort: true,
    origin: 'http://localhost:5173',
    cors: true,
    hmr: {
      clientPort: 5173,
      host: 'localhost',
      protocol: 'ws',
    },
  },
  build: {
    outDir: '../dist/app',
    emptyDirOutDir: true,
  },
}));
