// POST /api/admin-reset { token } — admin : remet une lettre à l'état scellé (joueur qui a perdu la sienne).
import { getDb, LETTERS } from './_lib/firebase.js';
import { allow, bodyOf, fail, isToken, send } from './_lib/http.js';
import { requireAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
  if (!allow(req, res, 'POST')) return;
  try {
    if (!(await requireAdmin(req, res))) return;
    const { token } = bodyOf(req);
    if (!isToken(token)) return send(res, 400, { error: 'Lettre invalide.' });

    const ref = getDb().collection(LETTERS).doc(token);
    const snap = await ref.get();
    if (!snap.exists) return send(res, 404, { error: 'Lettre introuvable.' });

    await ref.update({ opened: false, openedAt: null });
    return send(res, 200, { ok: true });
  } catch (e) {
    return fail(res, e);
  }
}
