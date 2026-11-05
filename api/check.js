// GET /api/check?token=... — public : la lettre existe-t-elle, est-elle encore scellée ?
// Ne renvoie JAMAIS le rôle. Lecture seule : un aperçu de lien (WhatsApp...) ne détruit rien.
import { getDb, LETTERS } from './_lib/firebase.js';
import { allow, fail, isToken, send } from './_lib/http.js';

export default async function handler(req, res) {
  if (!allow(req, res, 'GET')) return;
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    if (!isToken(token)) return send(res, 404, { state: 'unknown' });

    const snap = await getDb().collection(LETTERS).doc(token).get();
    if (!snap.exists) return send(res, 404, { state: 'unknown' });

    const d = snap.data();
    return send(res, 200, { state: d.opened ? 'burned' : 'sealed', name: d.name });
  } catch (e) {
    return fail(res, e);
  }
}
