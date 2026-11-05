// Petits utilitaires HTTP partagés par toutes les fonctions.

const TOKEN_RE = /^[A-Za-z0-9_-]{16,64}$/;
const ID_RE = /^[A-Za-z0-9]{10,40}$/;

export const isToken = (v) => typeof v === 'string' && TOKEN_RE.test(v);
export const isGameId = (v) => typeof v === 'string' && ID_RE.test(v);

export function send(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}

export function allow(req, res, method) {
  if (req.method !== method) {
    res.setHeader('Allow', method);
    send(res, 405, { error: 'Méthode non autorisée.' });
    return false;
  }
  return true;
}

export function bodyOf(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === 'string') {
    try {
      return JSON.parse(b);
    } catch {
      return {};
    }
  }
  return b;
}

export function fail(res, error) {
  console.error('[night-has-come]', error);
  if (error && error.code === 'CONFIG') {
    return send(res, 500, { error: `Configuration serveur incomplète : ${error.message} (voir le README).` });
  }
  return send(res, 500, { error: 'Erreur serveur. Réessaie dans un instant.' });
}
