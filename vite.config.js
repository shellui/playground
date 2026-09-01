import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // Optional: keep the iframe app off the shell cache (`node_modules/.vite-shellui`).
  cacheDir: 'node_modules/.vite-app',
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
    outDir: 'dist/web/app',
    emptyOutDir: true,
  },
}));
