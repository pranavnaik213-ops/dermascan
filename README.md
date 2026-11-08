# DermaScan

DermaScan helps people photograph and document animal skin concerns. Its optional AI feature describes visible image details only; it does not diagnose a disease or recommend treatment.

## Run locally

1. Install dependencies with `npm install`.
2. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL Editor. This creates the report/analysis tables and a private photo bucket.
3. Copy `.env.example` to `.env.local` and set the OpenAI and Supabase server secrets. Keep `.env.local` private and never commit it.
4. Start the Vite development server with `npm run dev`.

The Vercel API functions are `api/analyze.js` and `api/reports.js`. The Vite dev server exposes both endpoints locally. Set these server-only variables in Vercel before deployment: `OPENAI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SECRET_KEY`. `OPENAI_VISION_MODEL` is optional and defaults to `gpt-4.1-mini`.

When a user chooses **Analyze visible signs**, the browser resizes the image and sends it to the server endpoint. The endpoint forwards it to the OpenAI Responses API, then stores the image in private Supabase Storage and the observation record in Postgres. When a user submits a report, the report and attached image are stored in the same private backend. API keys stay server-side. No report or analysis read endpoint is exposed publicly; review records in the Supabase dashboard.

Draft fields stay in the browser until submission. Reports are recorded by DermaScan, but are not sent to or dispatched to a rescue service. Disease identification, diagnosis, and treatment advice are intentionally excluded.

Photo analysis and server recording require the OpenAI and Supabase environment variables and may incur API/storage charges. If backend storage is unavailable, report preparation falls back to a clearly labeled local download; it does not claim server recording succeeded.

## Commands

- `npm run dev` — start local development
- `npm run lint` — check source with Oxlint
- `npm run build` — create the production bundle
- `npm run preview` — preview the production bundle
