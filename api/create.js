// POST /api/create — admin : crée une partie, tire les rôles, génère une lettre scellée par joueur.
import { randomBytes } from 'node:crypto';
import { getDb, GAMES, LETTERS, FieldValue } from './_lib/firebase.js';
import { allow, bodyOf, fail, send } from './_lib/http.js';
import { requireAdmin } from './_lib/auth.js';
import { assignRoles, cleanNames } from './_lib/roles.js';

export default async function handler(req, res) {
  if (!allow(req, res, 'POST')) return;
  try {
    if (!(await requireAdmin(req, res))) return;

    const body = bodyOf(req);
    let assigned;
    try {
      const names = cleanNames(body.players);
      const wolves =
        body.wolves === undefined || body.wolves === null || body.wolves === ''
          ? undefined
          : Number(body.wolves);
      assigned = assignRoles(names, wolves);
    } catch (e) {
      return send(res, 400, { error: e.message });
    }

    const db = getDb();
    const gameRef = db.collection(GAMES).doc();
    const label =
      String(body.label || '').trim().slice(0, 60) ||
      `Partie du ${new Date().toLocaleDateString('fr-FR', { timeZone: 'Africa/Lagos' })}`;
    const wolves = assigned.filter((a) => a.role === 'loup').length;

    const batch = db.batch();
    batch.set(gameRef, {
      label,
      total: assigned.length,
      wolves,
      createdAt: FieldValue.serverTimestamp(),
    });

    const letters = assigned.map((a, order) => {
      const token = randomBytes(18).toString('base64url'); // 24 caractères, 144 bits d'aléa
      batch.set(db.collection(LETTERS).doc(token), {
        gameId: gameRef.id,
        name: a.name,
        role: a.role,
        order,
        opened: false,
        openedAt: null,
        createdAt: FieldValue.serverTimestamp(),
      });
      return { token, name: a.name, role: a.role, order, opened: false, openedAt: null };
    });

    await batch.commit();
    return send(res, 201, {
      game: { id: gameRef.id, label, total: assigned.length, wolves },
      letters,
    });
  } catch (e) {
    return fail(res, e);
  }
}
