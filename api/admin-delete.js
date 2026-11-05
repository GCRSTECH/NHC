// POST /api/admin-delete { gameId } — admin : supprime une partie et toutes ses lettres.
import { getDb, GAMES, LETTERS } from './_lib/firebase.js';
import { allow, bodyOf, fail, isGameId, send } from './_lib/http.js';
import { requireAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
  if (!allow(req, res, 'POST')) return;
  try {
    if (!(await requireAdmin(req, res))) return;
    const { gameId } = bodyOf(req);
    if (!isGameId(gameId)) return send(res, 400, { error: 'Identifiant de partie invalide.' });

    const db = getDb();
    const letters = await db.collection(LETTERS).where('gameId', '==', gameId).get();
    const batch = db.batch();
    letters.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(db.collection(GAMES).doc(gameId));
    await batch.commit();

    return send(res, 200, { ok: true, deleted: letters.size });
  } catch (e) {
    return fail(res, e);
  }
}
