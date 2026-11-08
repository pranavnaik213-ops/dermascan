import {
  authenticateUser,
  analysisPhotoIsInReport,
  deleteAllOwnedRecords,
  deleteOwnedAnalysis,
  deleteOwnedReport,
  getSupabaseConfig,
  listOwnedReports,
  listOwnedAnalyses,
  removePrivatePhoto,
  updateOwnedReport
} from '../server/persistence.js';

const STATUSES = new Set(['prepared', 'contacted', 'resolved', 'archived']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function send(res, status, body) {
  if (typeof res.status === 'function') return res.status(status).json(body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function validOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default async function handler(req, res) {
  if (!['GET', 'PATCH', 'DELETE'].includes(req.method)) return send(res, 405, { error: 'Use GET, PATCH, or DELETE.' });
  if (req.method !== 'GET' && !validOrigin(req)) return send(res, 403, { error: 'Cross-origin requests are not allowed.' });
  const database = getSupabaseConfig();
  if (!database) return send(res, 503, { error: 'Private dashboard is not configured. Add the Supabase URL and keys to the server and browser environment.' });

  let owner;
  try { owner = await authenticateUser(database, req); } catch { return send(res, 503, { error: 'Could not verify your account. Please try again.' }); }
  if (!owner) return send(res, 401, { error: 'Sign in to view and manage your records.' });

  if (req.method === 'GET') {
    try {
      const [reports, analyses] = await Promise.all([
        listOwnedReports(database, owner.id),
        listOwnedAnalyses(database, owner.id)
      ]);
      return send(res, 200, { reports, analyses });
    } catch {
      return send(res, 503, { error: 'Could not load your reports. Please try again.' });
    }
  }

  if (req.method === 'PATCH') {
    let body;
    try { body = await readBody(req); } catch { return send(res, 400, { error: 'Request body must be valid JSON.' }); }
    const status = body?.status;
    const reportId = body?.reportId;
    if (!STATUSES.has(status) || typeof reportId !== 'string' || !UUID.test(reportId)) return send(res, 400, { error: 'Choose a valid report and follow-up status.' });
    try {
      const report = await updateOwnedReport(database, owner.id, reportId, status);
      return report ? send(res, 200, { report }) : send(res, 404, { error: 'Report was not found in your account.' });
    } catch {
      return send(res, 503, { error: 'Could not update this report. Please retry.' });
    }
  }

  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  if (url.searchParams.get('all') === '1') {
    try {
      const paths = await deleteAllOwnedRecords(database, owner.id);
      const results = await Promise.all([...new Set(paths)].map((path) => removePrivatePhoto(database, path).catch(() => false)));
      return send(res, 200, { deleted: true, photoCleanupComplete: results.every(Boolean) });
    } catch {
      return send(res, 503, { error: 'Could not delete all account records. Please retry.' });
    }
  }

  const analysisId = url.searchParams.get('analysisId');
  const reportId = url.searchParams.get('id');
  if ((analysisId && !UUID.test(analysisId)) || (reportId && !UUID.test(reportId))) return send(res, 400, { error: 'Record ID is invalid.' });
  try {
    if (analysisId) {
      const photoRetained = await analysisPhotoIsInReport(database, owner.id, analysisId);
      const analysis = await deleteOwnedAnalysis(database, owner.id, analysisId);
      if (!analysis) return send(res, 404, { error: 'Photo review was not found in your account.' });
      const photoCleanupComplete = photoRetained || await removePrivatePhoto(database, analysis.photo_path).catch(() => false);
      return send(res, 200, { deleted: true, photoCleanupComplete, photoRetained });
    }
    if (!reportId) return send(res, 400, { error: 'Choose a report to delete.' });
    const report = await deleteOwnedReport(database, owner.id, reportId);
    if (!report) return send(res, 404, { error: 'Report was not found in your account.' });
    const reportPhotoPaths = new Set([report.photo_path, ...(report.photo_paths || [])].filter(Boolean));
    if (report.analysis_id) reportPhotoPaths.delete(report.photo_path);
    const photoResults = await Promise.all([...reportPhotoPaths].map((path) => removePrivatePhoto(database, path).catch(() => false)));
    const photoCleanupComplete = photoResults.every(Boolean);
    return send(res, 200, { deleted: true, photoCleanupComplete });
  } catch {
    return send(res, 503, { error: 'Could not delete this record. Please retry.' });
  }
}
