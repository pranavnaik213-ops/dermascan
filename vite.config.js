import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function copyToHomepagePlugin() {
  return {
    name: 'copy-to-homepage',
    closeBundle() {
      try {
        if (fs.existsSync('dist')) {
          for (const dirName of ['assets', 'models', 'ort']) {
            const target = path.join('homepage', dirName);
            if (fs.existsSync(target)) {
              fs.rmSync(target, { recursive: true, force: true });
            }
          }
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
  optimizeDeps: {
    exclude: ['onnxruntime-web']
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    cssTarget: ['chrome103', 'edge103', 'firefox103', 'safari14']
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
