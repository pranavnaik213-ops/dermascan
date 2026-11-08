const SESSION_KEY = 'dermascan_auth_session_v1';

export function getAuthConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && anonKey ? { url: url.replace(/\/$/, ''), anonKey } : null;
}

export function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (!session?.access_token || !session?.refresh_token || !session?.expires_at) return null;
    return session;
  } catch {
    return null;
  }
}

function saveSession(session) {
  const next = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: Date.now() + (Number(session.expires_in) || 3600) * 1000,
    user: session.user
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  return next;
}

async function authRequest(path, payload, method = 'POST') {
  const config = getAuthConfig();
  if (!config) throw new Error('Account access is not configured yet.');
  const response = await fetch(`${config.url}/auth/v1/${path}`, {
    method,
    headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : undefined
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.msg || result.message || result.error_description || result.error || 'Account request failed.');
  return result;
}

export async function signIn(email, password) {
  const session = await authRequest('token?grant_type=password', { email, password });
  if (!session.access_token) throw new Error('Check your email for a confirmation link, then sign in.');
  return saveSession(session);
}

export async function signUp(email, password) {
  const result = await authRequest('signup', { email, password });
  if (!result.access_token) return null;
  return saveSession(result);
}

export async function signOut() {
  const session = readSession();
  const config = getAuthConfig();
  if (session && config) {
    await fetch(`${config.url}/auth/v1/logout`, {
      method: 'POST',
      headers: { apikey: config.anonKey, Authorization: `Bearer ${session.access_token}` }
    }).catch(() => undefined);
  }
  try { localStorage.removeItem(SESSION_KEY); } catch { /* The in-memory session is still cleared by the app. */ }
}

export async function getAccessToken() {
  const session = readSession();
  if (!session) return null;
  if (session.expires_at - Date.now() > 60_000) return session.access_token;
  const refreshed = await authRequest('token?grant_type=refresh_token', { refresh_token: session.refresh_token });
  return saveSession(refreshed).access_token;
}

export async function privateApiFetch(path, options = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Sign in to continue.');
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(path, { ...options, headers });
}
