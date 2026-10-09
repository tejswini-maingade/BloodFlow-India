import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, forward API calls to the Express backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
});
