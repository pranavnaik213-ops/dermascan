import { decodeStoredJpeg, findAnalysis, getSupabaseConfig, insertRecord, removePrivatePhoto, uploadPrivatePhoto } from '../server/persistence.js';

const MAX_REQUEST_BYTES = 3 * 1024 * 1024;
const ALLOWED_ANIMALS = new Set(['Dog', 'Cat', 'Bird', 'Other / unsure']);
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 6;
const requestTimes = new Map();

function send(res, status, body) {
  if (typeof res.status === 'function') return res.status(status).json(body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > MAX_REQUEST_BYTES) throw new Error('BODY_TOO_LARGE');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function checkOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function allowRequest(req) {
  const now = Date.now();
  for (const [key, timestamps] of requestTimes) {
    const recent = timestamps.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
    if (recent.length) requestTimes.set(key, recent);
    else requestTimes.delete(key);
  }
  const forwarded = req.headers['x-forwarded-for'];
  const ip = String(req.headers['x-real-ip'] || (Array.isArray(forwarded) ? forwarded[0] : forwarded) || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const timestamps = requestTimes.get(ip) || [];
  if (timestamps.length >= RATE_LIMIT) return false;
  requestTimes.set(ip, [...timestamps, now]);
  return true;
}

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST to save a report.' });
  if (!checkOrigin(req)) return send(res, 403, { error: 'Cross-origin requests are not allowed.' });
  const database = getSupabaseConfig();
  if (!database) return send(res, 503, { error: 'Secure report storage is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY on the server.' });

  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    const tooLarge = error.message === 'BODY_TOO_LARGE';
    return send(res, tooLarge ? 413 : 400, { error: tooLarge ? 'Report is too large.' : 'Request body must be valid JSON.' });
  }

  if (!allowRequest(req)) return send(res, 429, { error: 'Too many reports were submitted. Please wait a minute and try again.' });
  if (!ALLOWED_ANIMALS.has(body?.animal)) return send(res, 400, { error: 'Choose a valid animal type.' });
  if (typeof body?.reportCode !== 'string' || !/^DS-[A-Z0-9-]{6,64}$/i.test(body.reportCode)) {
    return send(res, 400, { error: 'Report ID is invalid.' });
  }
  if (typeof body?.location !== 'string' || !body.location.trim() || body.location.length > 500) {
    return send(res, 400, { error: 'Enter a location under 500 characters.' });
  }
  if (typeof body?.landmark !== 'string' || body.landmark.length > 300 || typeof body?.observations !== 'string' || body.observations.length > 1200) {
    return send(res, 400, { error: 'Landmark or notes exceed the allowed length.' });
  }
  if (body?.photoName != null && (typeof body.photoName !== 'string' || body.photoName.length > 255)) {
    return send(res, 400, { error: 'Photo filename is invalid.' });
  }
  if (body?.analysisId != null && !isUuid(body.analysisId)) return send(res, 400, { error: 'Analysis ID is invalid.' });

  let photoPath = null;
  let uploadedPath = null;
  if (body.analysisId) {
    try {
      const analysisRecord = await findAnalysis(database, body.analysisId);
      if (!analysisRecord || analysisRecord.animal !== body.animal) return send(res, 400, { error: 'The attached analysis could not be found.' });
      photoPath = analysisRecord.photo_path;
    } catch {
      return send(res, 503, { error: 'Could not verify the attached analysis. Please try again.' });
    }
  } else if (body.photoDataUrl != null) {
    const bytes = decodeStoredJpeg(body.photoDataUrl);
    if (!bytes) return send(res, 400, { error: 'Attached photo must be a valid JPEG under 2 MB.' });
    try {
      uploadedPath = await uploadPrivatePhoto(database, 'reports', bytes);
      photoPath = uploadedPath;
    } catch {
      return send(res, 503, { error: 'Could not store the report photo. Please try again.' });
    }
  }

  try {
    const record = await insertRecord(database, 'reports', {
      report_code: body.reportCode,
      animal: body.animal,
      location: body.location.trim(),
      landmark: body.landmark.trim(),
      observations: body.observations.trim(),
      photo_name: body.photoName || null,
      photo_path: photoPath,
      analysis_id: body.analysisId || null,
      status: 'prepared'
    });
    return send(res, 201, { reportId: record.id, createdAt: record.created_at, status: 'recorded' });
  } catch {
    if (uploadedPath) await removePrivatePhoto(database, uploadedPath).catch(() => false);
    return send(res, 503, { error: 'The report could not be recorded. Please retry; no server record was created.' });
  }
}
