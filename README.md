# DermaScan

DermaScan helps people photograph and document animal skin concerns. Its optional AI feature describes visible image details only; it does not diagnose a disease or recommend treatment.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add an OpenAI API key. Keep `.env.local` private and never commit it.
3. Start the Vite development server with `npm run dev`.

The analysis endpoint is `api/analyze.js`. The Vite dev server exposes the same endpoint locally. On Vercel, add `OPENAI_API_KEY` in the project's Environment Variables before deployment. `OPENAI_VISION_MODEL` is optional and defaults to `gpt-4.1-mini`.

When a user chooses **Analyze visible signs**, the browser resizes the image and sends it to the server endpoint. The endpoint forwards it to the OpenAI Responses API. The API key stays server-side. The model is instructed to describe visible features only; disease identification, diagnosis, and treatment advice are intentionally excluded.

Image analysis requires a configured API key and may incur API usage charges. Without the key, photo capture and local reports still work; analysis returns a configuration message.

## Commands

- `npm run dev` — start local development
- `npm run lint` — check source with Oxlint
- `npm run build` — create the production bundle
- `npm run preview` — preview the production bundle
