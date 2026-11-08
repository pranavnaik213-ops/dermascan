const SEARCH_RADIUS_METERS = 15_000;
const REQUEST_WINDOW_MS = 60_000;
const REQUEST_LIMIT = 12;
const CACHE_TTL_MS = 10 * 60_000;
const UPSTREAM_TIMEOUT_MS = 9_000;
const OVERPASS_ENDPOINTS = [
  process.env.OVERPASS_ENDPOINT || 'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter'
];
const requestsByIp = new Map();
const cache = new Map();

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
    if (bytes > 2048) throw new Error('BODY_TOO_LARGE');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function isAllowed(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try { if (new URL(origin).host !== host) return false; } catch { return false; }
  }
  const forwarded = req.headers['x-forwarded-for'];
  const ip = String(req.headers['x-real-ip'] || (Array.isArray(forwarded) ? forwarded[0] : forwarded) || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  for (const [key, timestamps] of requestsByIp) {
    const recent = timestamps.filter((timestamp) => now - timestamp < REQUEST_WINDOW_MS);
    if (recent.length) requestsByIp.set(key, recent);
    else requestsByIp.delete(key);
  }
  const timestamps = requestsByIp.get(ip) || [];
  if (timestamps.length >= REQUEST_LIMIT) return false;
  requestsByIp.set(ip, [...timestamps, now]);
  return true;
}

function makeQuery(latitude, longitude) {
  return `[out:json][timeout:15];(nwr(around:${SEARCH_RADIUS_METERS},${latitude},${longitude})["amenity"="veterinary"];nwr(around:${SEARCH_RADIUS_METERS},${latitude},${longitude})["amenity"="animal_shelter"];nwr(around:${SEARCH_RADIUS_METERS},${latitude},${longitude})["social_facility"="animal_shelter"];);out center tags 100;`;
}

async function fetchListings(query) {
  let lastError;
  for (const endpoint of [...new Set(OVERPASS_ENDPOINTS)]) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          Accept: 'application/json',
          'User-Agent': 'DermaScan/1.0 (nearby animal care directory)'
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
      });
      if (!response.ok) {
        lastError = new Error(`OpenStreetMap data service returned ${response.status}.`);
        continue;
      }
      const data = await response.json();
      if (!Array.isArray(data.elements)) {
        lastError = new Error('OpenStreetMap data service returned an invalid response.');
        continue;
      }
      return data.elements;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('OpenStreetMap data services are unavailable.');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST to find nearby care.' });
  if (!isAllowed(req)) return send(res, 429, { error: 'Too many nearby searches. Wait a minute and try again.' });
  let body;
  try { body = await readBody(req); } catch { return send(res, 400, { error: 'A valid approximate location is required.' }); }
  const latitude = Number(body?.latitude);
  const longitude = Number(body?.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return send(res, 400, { error: 'A valid approximate location is required.' });
  }
  // Keep query precision bounded even if a client sends more than the UI normally provides.
  const roundedLatitude = Number(latitude.toFixed(3));
  const roundedLongitude = Number(longitude.toFixed(3));
  const key = `${roundedLatitude}:${roundedLongitude}`;
  for (const [cachedKey, value] of cache) {
    if (Date.now() - value.savedAt >= CACHE_TTL_MS) cache.delete(cachedKey);
  }
  const cached = cache.get(key);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return send(res, 200, { elements: cached.elements, cached: true });

  try {
    const elements = await fetchListings(makeQuery(roundedLatitude, roundedLongitude));
    if (cache.size >= 100) cache.delete(cache.keys().next().value);
    cache.set(key, { elements, savedAt: Date.now() });
    return send(res, 200, { elements, cached: false });
  } catch {
    return send(res, 503, { error: 'Nearby listings could not be loaded right now. Try again shortly or use the map search links.' });
  }
}
