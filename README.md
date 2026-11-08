# DermaScan

DermaScan helps people photograph and document animal skin concerns. Its optional AI feature describes visible image details only; it does not identify diseases, diagnose, or recommend treatment.

## Run locally

1. Install dependencies with `npm install`.
2. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL Editor. The schema creates private tables and a private photo bucket. Existing records without an account owner remain private and are not shown in user dashboards.
3. Enable email/password sign-in in Supabase Auth and set the project Site URL and allowed redirect URLs for local development and the deployed site.
4. Copy `.env.example` to `.env.local` and fill in the values below. Never commit `.env.local` or expose the Supabase secret key or OpenAI key to the browser.
5. Run `npm run dev`.

## Environment variables

Set these server-only variables in Vercel for the API routes:

- `SUPABASE_URL` — project URL
- `SUPABASE_ANON_KEY` — public anon key, used by the server to verify Supabase Auth sessions
- `SUPABASE_SECRET_KEY` — server secret key for privileged storage and database operations
- `OPENAI_API_KEY` — optional AI photo review credential
- `OPENAI_VISION_MODEL` — optional model override; defaults to `gpt-4.1-mini`

Set these public build variables in Vercel for browser sign-in (the anon key is designed for public clients and is restricted by server-side ownership checks):

- `VITE_SUPABASE_URL` — same Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — same public anon key

Never set `SUPABASE_SECRET_KEY` or `OPENAI_API_KEY` with a `VITE_` prefix.

## Private records and data controls

Users can create an account or sign in under **My records**. The API verifies each Supabase session and filters dashboard, update, and delete operations by the authenticated user ID. No unauthenticated report listing or record mutation endpoint is provided. Row Level Security is enabled, and browser roles have no table access.

Signed-in users can submit private reports with a photo, search report history, mark follow-up status, download a JSON receipt, delete an individual record, or delete all account reports and photo reviews. Stored records and photos remain until the user deletes them. Users can also clear the draft and receipts saved in the current browser; this does not affect server records. Reports are not sent to a rescue service. Nothing is dispatched.

Draft fields and local receipt copies stay in the current browser. Users can prepare and download a local report without an account; the interface labels it local-only. The JSON receipt includes the photo filename but not image bytes. Signed-in server reports store attached photos in a private bucket.

## Photo review and privacy

Photo review requires an account and `OPENAI_API_KEY`. After the user explicitly starts analysis, the selected photo is sent to the configured AI provider and saved in private Supabase Storage with visible-feature notes in Postgres. Analysis is limited to general visual descriptions and may be inaccurate. It does not identify a disease or replace a veterinarian. If storage fails, the review is not presented as successfully saved.

Report forms accept up to three photos. Images are resized in the browser before upload, and report attachments are kept small enough to fit the API request limits. Camera use and location access happen only after the user chooses those actions. The site explains that a photo is sent for AI review before the user starts it. Storage and AI provider usage may incur charges.

## API routes

- `POST /api/analyze` — authenticated visual photo review and private storage
- `POST /api/reports` — authenticated private report submission
- `GET /api/my-reports` — authenticated owner-scoped report and photo-review listing
- `PATCH /api/my-reports` — authenticated owner-scoped follow-up status update
- `DELETE /api/my-reports` — authenticated owner-scoped deletion of records and photos

The Vite development server exposes the same routes locally.

## Commands

- `npm run dev` — start local development
- `npm run lint` — check source with Oxlint
- `npm run build` — create the production bundle
- `npm run preview` — preview the production bundle
