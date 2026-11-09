import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'fs';

function copyToHomepagePlugin() {
  return {
    name: 'copy-to-homepage',
    closeBundle() {
      try {
        if (fs.existsSync('dist')) {
          fs.cpSync('dist', 'homepage', { recursive: true });
        }
      } catch (err) {
        console.warn('[Build] Note copying to homepage:', err.message);
      }
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), copyToHomepagePlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
