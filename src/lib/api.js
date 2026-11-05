// Appels vers les fonctions serverless (/api/*).

async function request(path, { method = 'GET', body, admin } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (admin) headers['x-admin-password'] = encodeURIComponent(admin);

  let res;
  try {
    res = await fetch(`/api/${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  } catch {
    const err = new Error('Connexion impossible. Vérifie ta connexion internet.');
    err.network = true;
    throw err;
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* corps vide ou non JSON */
  }

  // Les réponses « état » (unknown/burned...) sont normales même en 404.
  if (data && data.state) return data;
  if (!res.ok) {
    const err = new Error((data && data.error) || `Erreur ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// --- Joueurs ---
export const checkLetter = (token) => request(`check?token=${encodeURIComponent(token)}`);
export const revealLetter = (token) => request('reveal', { method: 'POST', body: { token } });

// --- Maître du jeu ---
export const adminList = (pw, gameId) =>
  request(gameId ? `admin-list?gameId=${encodeURIComponent(gameId)}` : 'admin-list', { admin: pw });
export const adminCreate = (pw, payload) => request('create', { method: 'POST', body: payload, admin: pw });
export const adminReset = (pw, token) => request('admin-reset', { method: 'POST', body: { token }, admin: pw });
export const adminDelete = (pw, gameId) => request('admin-delete', { method: 'POST', body: { gameId }, admin: pw });
