import { defineConfig } from 'vite';
import { slotsApiPlugin } from './src/server/slotsApi.js';

export default defineConfig({
  plugins: [slotsApiPlugin()],
  server: {
    port: 5173,
    open: false
  }
});
