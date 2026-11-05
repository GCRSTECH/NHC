import { createHash, timingSafeEqual } from 'node:crypto';
import { send } from './http.js';

const digest = (s) => createHash('sha256').update(String(s)).digest();

function readPassword(req) {
  const raw = req.headers['x-admin-password'] || '';
  try {
    return decodeURIComponent(String(raw));
  } catch {
    return '';
  }
}

/** Retourne true si le mot de passe admin est correct, sinon répond 401/500 et retourne false. */
export async function requireAdmin(req, res) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    send(res, 500, { error: 'ADMIN_PASSWORD manquant côté serveur (voir le README).' });
    return false;
  }
  if (timingSafeEqual(digest(readPassword(req)), digest(expected))) return true;

  await new Promise((r) => setTimeout(r, 500)); // freine les essais en rafale
  send(res, 401, { error: 'Mot de passe incorrect.' });
  return false;
}
