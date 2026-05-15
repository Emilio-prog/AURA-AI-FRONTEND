import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const devApiProxyTarget = process.env.VITE_DEV_API_PROXY_TARGET;

export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    open: false,
    proxy: devApiProxyTarget
      ? {
          '/api': {
            target: devApiProxyTarget,
            changeOrigin: true,
            secure: true,
          },
        }
      : undefined,
  },
  preview: {
    host: 'localhost',
    port: 4173,
    open: false,
  },
});
