import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import analyzeHandler from './api/analyze.js';

function localApiPlugin() {
  return {
    name: 'dermascan-local-api',
    configureServer(server) {
      server.middlewares.use('/api/analyze', (req, res, next) => {
        analyzeHandler(req, res).catch(next);
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), '');
  if (localEnv.OPENAI_API_KEY && !process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = localEnv.OPENAI_API_KEY;
  }
  if (localEnv.OPENAI_VISION_MODEL && !process.env.OPENAI_VISION_MODEL) {
    process.env.OPENAI_VISION_MODEL = localEnv.OPENAI_VISION_MODEL;
  }

  return {
    plugins: [react(), localApiPlugin()],
    server: { host: true }
  };
});
