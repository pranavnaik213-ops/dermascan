import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import analyzeHandler from './api/analyze.js';
import reportsHandler from './api/reports.js';
import myReportsHandler from './api/my-reports.js';

function localApiPlugin() {
  return {
    name: 'dermascan-local-api',
    configureServer(server) {
      server.middlewares.use('/api/analyze', (req, res, next) => {
        analyzeHandler(req, res).catch(next);
      });
      server.middlewares.use('/api/reports', (req, res, next) => {
        reportsHandler(req, res).catch(next);
      });
      server.middlewares.use('/api/my-reports', (req, res, next) => {
        myReportsHandler(req, res).catch(next);
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
  if (localEnv.SUPABASE_URL && !process.env.SUPABASE_URL) {
    process.env.SUPABASE_URL = localEnv.SUPABASE_URL;
  }
  if (localEnv.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SECRET_KEY) {
    process.env.SUPABASE_SECRET_KEY = localEnv.SUPABASE_SECRET_KEY;
  }
  if (localEnv.SUPABASE_ANON_KEY && !process.env.SUPABASE_ANON_KEY) {
    process.env.SUPABASE_ANON_KEY = localEnv.SUPABASE_ANON_KEY;
  }

  return {
    plugins: [react(), localApiPlugin()],
    server: { host: true }
  };
});
