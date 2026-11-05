// Vérifie la logique d'attribution des rôles (node scripts/test-roles.mjs).
import assert from 'node:assert/strict';
import { assignRoles, cleanNames, defaultWolves, MIN_PLAYERS } from '../api/_lib/roles.js';

const count = (list, role) => list.filter((x) => x.role === role).length;

for (let n = MIN_PLAYERS; n <= 100; n++) {
  const names = Array.from({ length: n }, (_, i) => `Joueur ${i + 1}`);
  const out = assignRoles(names, undefined);
  const w = defaultWolves(n);
  assert.equal(out.length, n);
  assert.equal(count(out, 'loup'), w, `n=${n}: loups`);
  assert.equal(count(out, 'voyante'), 1, `n=${n}: voyante`);
  assert.equal(count(out, 'chevalier'), 1, `n=${n}: chevalier`);
  assert.equal(count(out, 'villageois'), n - w - 2, `n=${n}: villageois`);
  assert.ok(count(out, 'villageois') >= 1, `n=${n}: au moins 1 villageois`);
  assert.deepEqual(out.map((o) => o.name), names, `n=${n}: ordre des noms conservé`);
}

assert.equal(defaultWolves(4), 1);
assert.equal(defaultWolves(9), 1);
assert.equal(defaultWolves(10), 2);
assert.equal(defaultWolves(25), 5);

// Surcharge du nombre de loups
const ten = Array.from({ length: 10 }, (_, i) => `J${i}`);
assert.equal(count(assignRoles(ten, 3), 'loup'), 3);
assert.throws(() => assignRoles(ten, 0));
assert.throws(() => assignRoles(ten, 8));
assert.throws(() => assignRoles(ten, 1.5));
assert.doesNotThrow(() => assignRoles(ten, 7));

// Nettoyage des noms
assert.deepEqual(cleanNames(['  Alice ', 'Bob', '', 'Chloé   Dossou', 'Eve']), ['Alice', 'Bob', 'Chloé Dossou', 'Eve']);
assert.throws(() => cleanNames(['A', 'B', 'C']), /au moins/);
assert.throws(() => cleanNames(['Alice', 'alice', 'Bob', 'Carl']), /double/);
assert.throws(() => cleanNames('Alice'));
assert.throws(() => cleanNames(['A', 'B', 'C', 'x'.repeat(41)]), /trop long/);

// Le tirage doit réellement varier
const names = Array.from({ length: 12 }, (_, i) => `P${i}`);
const seen = new Set(Array.from({ length: 30 }, () => assignRoles(names).map((x) => x.role).join(',')));
assert.ok(seen.size > 5, 'le mélange doit varier');

console.log('✓ Tous les tests de rôles passent');
