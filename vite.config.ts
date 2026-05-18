import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: 'client',
  resolve: {
    alias: { '@': path.resolve(__dirname, 'client/src') },
  },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5174' },
  },
  build: {
    outDir: '../client/dist',
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./client/src/test/setup.ts'],
    include: ['client/src/**/*.test.{ts,tsx}', 'server/**/*.test.ts'],
  },
});
