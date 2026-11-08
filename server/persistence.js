export const PHOTO_BUCKET = 'dermascan-private';
export const MAX_STORED_PHOTO_BYTES = 2 * 1024 * 1024;

export function getSupabaseConfig() {
  const rawUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!rawUrl || !secretKey || !anonKey) return null;

  try {
    const projectUrl = new URL(rawUrl);
    const localHost = ['localhost', '127.0.0.1'].includes(projectUrl.hostname);
    if ((!localHost && projectUrl.protocol !== 'https:') || projectUrl.username || projectUrl.password) return null;
    return { baseUrl: projectUrl.origin, secretKey, anonKey };
  } catch {
    return null;
  }
}

export async function authenticateUser(config, request) {
  const authorization = request.headers.authorization || '';
  const token = /^Bearer\s+(.+)$/i.exec(authorization)?.[1];
  if (!token || token.length > 8192) return null;
  const response = await fetch(`${config.baseUrl}/auth/v1/user`, {
    headers: { apikey: config.anonKey, Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  const user = await response.json();
  return typeof user.id === 'string' ? user : null;
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

export async function findAnalysis(config, analysisId, ownerId) {
  const query = new URLSearchParams({ id: `eq.${analysisId}`, owner_id: `eq.${ownerId}`, select: 'id,photo_path,animal' });
  const response = await fetch(`${config.baseUrl}/rest/v1/photo_analyses?${query}`, {
    headers: supabaseHeaders(config)
  });
  if (!response.ok) throw new Error('ANALYSIS_LOOKUP_FAILED');
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function listOwnedReports(config, userId) {
  const query = new URLSearchParams({
    owner_id: `eq.${userId}`,
    select: 'id,report_code,created_at,animal,location,landmark,observations,photo_name,status,observed_at',
    order: 'created_at.desc',
    limit: '1000'
  });
  const response = await fetch(`${config.baseUrl}/rest/v1/reports?${query}`, { headers: supabaseHeaders(config) });
  if (!response.ok) throw new Error('REPORT_LIST_FAILED');
  return response.json();
}

export async function listOwnedAnalyses(config, userId) {
  const query = new URLSearchParams({
    owner_id: `eq.${userId}`,
    select: 'id,created_at,animal,image_kind,image_quality,visible_observations,summary',
    order: 'created_at.desc',
    limit: '1000'
  });
  const response = await fetch(`${config.baseUrl}/rest/v1/photo_analyses?${query}`, { headers: supabaseHeaders(config) });
  if (!response.ok) throw new Error('ANALYSIS_LIST_FAILED');
  return response.json();
}

export async function updateOwnedReport(config, userId, reportId, status) {
  const query = new URLSearchParams({ id: `eq.${reportId}`, owner_id: `eq.${userId}`, select: 'id,status' });
  const response = await fetch(`${config.baseUrl}/rest/v1/reports?${query}`, {
    method: 'PATCH',
    headers: supabaseHeaders(config, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('REPORT_UPDATE_FAILED');
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function deleteOwnedReport(config, userId, reportId) {
  const query = new URLSearchParams({ id: `eq.${reportId}`, owner_id: `eq.${userId}`, select: 'id,photo_path,photo_paths,analysis_id' });
  const response = await fetch(`${config.baseUrl}/rest/v1/reports?${query}`, {
    method: 'DELETE',
    headers: supabaseHeaders(config, { Prefer: 'return=representation' })
  });
  if (!response.ok) throw new Error('REPORT_DELETE_FAILED');
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function deleteAllOwnedRecords(config, userId) {
  const query = new URLSearchParams({ owner_id: `eq.${userId}`, select: 'id,photo_path,photo_paths,analysis_id' });
  const [reportsResponse, analysesResponse] = await Promise.all([
    fetch(`${config.baseUrl}/rest/v1/reports?${query}`, { method: 'DELETE', headers: supabaseHeaders(config, { Prefer: 'return=representation' }) }),
    fetch(`${config.baseUrl}/rest/v1/photo_analyses?${query}`, { method: 'DELETE', headers: supabaseHeaders(config, { Prefer: 'return=representation' }) })
  ]);
  if (!reportsResponse.ok || !analysesResponse.ok) throw new Error('ACCOUNT_DATA_DELETE_FAILED');
  const reports = await reportsResponse.json();
  const analyses = await analysesResponse.json();
  return [...(reports || []), ...(analyses || [])].flatMap((item) => [item.photo_path, ...(item.photo_paths || [])]).filter(Boolean);
}

export async function deleteOwnedAnalysis(config, userId, analysisId) {
  const query = new URLSearchParams({ id: `eq.${analysisId}`, owner_id: `eq.${userId}`, select: 'id,photo_path' });
  const response = await fetch(`${config.baseUrl}/rest/v1/photo_analyses?${query}`, {
    method: 'DELETE',
    headers: supabaseHeaders(config, { Prefer: 'return=representation' })
  });
  if (!response.ok) throw new Error('ANALYSIS_DELETE_FAILED');
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

export async function analysisPhotoIsInReport(config, userId, analysisId) {
  const query = new URLSearchParams({ owner_id: `eq.${userId}`, analysis_id: `eq.${analysisId}`, select: 'id', limit: '1' });
  const response = await fetch(`${config.baseUrl}/rest/v1/reports?${query}`, { headers: supabaseHeaders(config) });
  if (!response.ok) throw new Error('ANALYSIS_REFERENCE_LOOKUP_FAILED');
  const rows = await response.json();
  return Array.isArray(rows) && rows.length > 0;
}

export async function removePrivatePhoto(config, objectPath) {
  const response = await fetch(`${config.baseUrl}/storage/v1/object/${PHOTO_BUCKET}`, {
    method: 'DELETE',
    headers: supabaseHeaders(config, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prefixes: [objectPath] })
  });
  return response.ok;
}
