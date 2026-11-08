export const PHOTO_BUCKET = 'dermascan-private';
export const MAX_STORED_PHOTO_BYTES = 2 * 1024 * 1024;

export function getSupabaseConfig() {
  const rawUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!rawUrl || !secretKey) return null;

  try {
    const projectUrl = new URL(rawUrl);
    const localHost = ['localhost', '127.0.0.1'].includes(projectUrl.hostname);
    if ((!localHost && projectUrl.protocol !== 'https:') || projectUrl.username || projectUrl.password) return null;
    return { baseUrl: projectUrl.origin, secretKey };
  } catch {
    return null;
  }
}

export function decodeStoredJpeg(dataUrl) {
  const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl || '');
  if (!match) return null;
  const bytes = Buffer.from(match[1], 'base64');
  if (bytes.length < 4 || bytes.length > MAX_STORED_PHOTO_BYTES) return null;
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? bytes : null;
}

function supabaseHeaders(config, extra = {}) {
  return { apikey: config.secretKey, ...extra };
}

export async function uploadPrivatePhoto(config, folder, photoBytes) {
  const objectPath = `${folder}/${crypto.randomUUID()}.jpg`;
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(`${config.baseUrl}/storage/v1/object/${PHOTO_BUCKET}/${encodedPath}`, {
    method: 'POST',
    headers: supabaseHeaders(config, {
      'Content-Type': 'image/jpeg',
      'x-upsert': 'false'
    }),
    body: photoBytes
  });
  if (!response.ok) throw new Error('PHOTO_STORAGE_FAILED');
  return objectPath;
}

export async function insertRecord(config, table, record) {
  const response = await fetch(`${config.baseUrl}/rest/v1/${table}?select=id,created_at`, {
    method: 'POST',
    headers: supabaseHeaders(config, {
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }),
    body: JSON.stringify(record)
  });
  if (!response.ok) throw new Error('DATABASE_INSERT_FAILED');
  const rows = await response.json();
  if (!Array.isArray(rows) || !rows[0]?.id) throw new Error('DATABASE_INSERT_FAILED');
  return rows[0];
}

export async function findAnalysis(config, analysisId) {
  const query = new URLSearchParams({ id: `eq.${analysisId}`, select: 'id,photo_path,animal' });
  const response = await fetch(`${config.baseUrl}/rest/v1/photo_analyses?${query}`, {
    headers: supabaseHeaders(config)
  });
  if (!response.ok) throw new Error('ANALYSIS_LOOKUP_FAILED');
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function removePrivatePhoto(config, objectPath) {
  const response = await fetch(`${config.baseUrl}/storage/v1/object/${PHOTO_BUCKET}`, {
    method: 'DELETE',
    headers: supabaseHeaders(config, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prefixes: [objectPath] })
  });
  return response.ok;
}
