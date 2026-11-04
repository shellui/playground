import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import pkg from './package.json' with { type: 'json' };

// Companion dev port. Defaults to 5173; the Shellui dev stack sets 5176 (admin owns 5173).
const devPort = Number(process.env.PLAYGROUND_DEV_PORT) || 5173;

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  // Optional: keep the iframe app off the shell cache (`node_modules/.vite-shellui`).
  cacheDir: 'node_modules/.vite-app',
  base: mode === 'production' ? '/app/' : '/',
  server: {
    port: devPort,
    strictPort: true,
    // CLI `--host` / `server.host` binds the listener; keep a stable origin for
    // iframe postMessage target matching against nav URLs (localhost:<devPort>).
    origin: `http://localhost:${devPort}`,
    cors: true,
    // Do not hard-pin hmr.host: Vite follows `--host` so LAN clients get a
    // reachable HMR websocket. clientPort stays on the companion port.
    hmr: {
      clientPort: devPort,
    },
  },
  build: {
    outDir: 'dist/web/app',
    emptyOutDir: true,
  },
}));
