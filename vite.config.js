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
    // CLI `--host` / `server.host` binds the listener; keep a stable origin for
    // iframe postMessage target matching against nav URLs (localhost:5173).
    origin: 'http://localhost:5173',
    cors: true,
    // Do not hard-pin hmr.host — Vite follows `--host` so LAN clients get a
    // reachable HMR websocket. clientPort stays on the companion port.
    hmr: {
      clientPort: 5173,
    },
  },
  build: {
    outDir: 'dist/web/app',
    emptyOutDir: true,
  },
}));
