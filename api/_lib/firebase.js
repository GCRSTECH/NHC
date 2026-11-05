import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export const GAMES = 'nhc_games';
export const LETTERS = 'nhc_letters';
export { FieldValue };

function configError(message) {
  const e = new Error(message);
  e.code = 'CONFIG';
  return e;
}

function loadServiceAccount() {
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT || '').trim();
  if (!raw) throw configError('FIREBASE_SERVICE_ACCOUNT est vide');

  // JSON brut, ou le même JSON encodé en base64.
  let text = raw;
  if (!text.startsWith('{')) text = Buffer.from(raw, 'base64').toString('utf8');

  let account;
  try {
    account = JSON.parse(text);
  } catch {
    throw configError("FIREBASE_SERVICE_ACCOUNT n'est pas un JSON valide");
  }
  if (typeof account.private_key === 'string') {
    account.private_key = account.private_key.replace(/\\n/g, '\n');
  }
  return account;
}

export function getDb() {
  if (!getApps().length) {
    initializeApp({ credential: cert(loadServiceAccount()) });
  }
  return getFirestore();
}
