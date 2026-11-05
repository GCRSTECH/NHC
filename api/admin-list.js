// GET /api/admin-list[?gameId=...] — admin : liste des parties, ou détail d'une partie (lettres + rôles).
import { getDb, GAMES, LETTERS } from './_lib/firebase.js';
import { allow, fail, isGameId, send } from './_lib/http.js';
import { requireAdmin } from './_lib/auth.js';

const ms = (t) => (t && typeof t.toMillis === 'function' ? t.toMillis() : null);

export default async function handler(req, res) {
  if (!allow(req, res, 'GET')) return;
  try {
    if (!(await requireAdmin(req, res))) return;
    const db = getDb();
    const gameId = typeof req.query.gameId === 'string' ? req.query.gameId : '';

    if (!gameId) {
      const snap = await db.collection(GAMES).orderBy('createdAt', 'desc').limit(30).get();
      const games = snap.docs.map((d) => {
        const g = d.data();
        return { id: d.id, label: g.label, total: g.total, wolves: g.wolves, createdAt: ms(g.createdAt) };
      });
      return send(res, 200, { games });
    }

    if (!isGameId(gameId)) return send(res, 400, { error: 'Identifiant de partie invalide.' });

    const gameSnap = await db.collection(GAMES).doc(gameId).get();
    if (!gameSnap.exists) return send(res, 404, { error: 'Partie introuvable.' });
    const g = gameSnap.data();

    const lettersSnap = await db.collection(LETTERS).where('gameId', '==', gameId).get();
    const letters = lettersSnap.docs
      .map((d) => {
        const l = d.data();
        return {
          token: d.id,
          name: l.name,
          role: l.role,
          order: l.order ?? 0,
          opened: Boolean(l.opened),
          openedAt: ms(l.openedAt),
        };
      })
      .sort((a, b) => a.order - b.order);

    return send(res, 200, {
      game: { id: gameId, label: g.label, total: g.total, wolves: g.wolves, createdAt: ms(g.createdAt) },
      letters,
    });
  } catch (e) {
    return fail(res, e);
  }
}
