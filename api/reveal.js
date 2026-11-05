// POST /api/reveal { token } — public : brise le sceau. Atomique : une seule requête obtient le rôle.
import { getDb, LETTERS, FieldValue } from './_lib/firebase.js';
import { allow, bodyOf, fail, isToken, send } from './_lib/http.js';

export default async function handler(req, res) {
  if (!allow(req, res, 'POST')) return;
  try {
    const { token } = bodyOf(req);
    if (!isToken(token)) return send(res, 404, { state: 'unknown' });

    const showAllies = (process.env.SHOW_WOLF_ALLIES ?? 'true').toLowerCase() !== 'false';
    const db = getDb();
    const ref = db.collection(LETTERS).doc(token);

    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return { state: 'unknown' };

      const data = snap.data();
      if (data.opened) return { state: 'burned', name: data.name };

      // Toutes les lectures AVANT les écritures (règle des transactions Firestore).
      let allies = [];
      if (data.role === 'loup' && showAllies) {
        const mates = await tx.get(db.collection(LETTERS).where('gameId', '==', data.gameId));
        allies = mates.docs
          .map((d) => d.data())
          .filter((m) => m.role === 'loup' && m.name !== data.name)
          .map((m) => m.name);
      }

      tx.update(ref, { opened: true, openedAt: FieldValue.serverTimestamp() });
      return { state: 'revealed', name: data.name, role: data.role, allies };
    });

    return send(res, result.state === 'unknown' ? 404 : 200, result);
  } catch (e) {
    return fail(res, e);
  }
}
