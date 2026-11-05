import { randomInt } from 'node:crypto';

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 100;
export const MAX_NAME_LENGTH = 40;

/** 1 loup pour 5 joueurs, minimum 1. */
export const defaultWolves = (n) => Math.max(1, Math.floor(n / 5));

/** Mélange de Fisher-Yates avec un aléa cryptographique. */
export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Nettoie la liste de noms et lève une Error (message affichable) si elle est invalide. */
export function cleanNames(input) {
  if (!Array.isArray(input)) throw new Error('La liste des joueurs est manquante.');

  const names = input
    .map((n) => String(n ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (names.length < MIN_PLAYERS) {
    throw new Error(`Il faut au moins ${MIN_PLAYERS} joueurs (tu en as ${names.length}).`);
  }
  if (names.length > MAX_PLAYERS) {
    throw new Error(`Maximum ${MAX_PLAYERS} joueurs par partie.`);
  }
  const tooLong = names.find((n) => n.length > MAX_NAME_LENGTH);
  if (tooLong) throw new Error(`Nom trop long (max ${MAX_NAME_LENGTH} caractères) : « ${tooLong} ».`);

  const seen = new Set();
  const dupes = new Set();
  for (const n of names) {
    const key = n.toLocaleLowerCase('fr');
    if (seen.has(key)) dupes.add(n);
    seen.add(key);
  }
  if (dupes.size) {
    throw new Error(`Noms en double : ${[...dupes].join(', ')}. Ajoute une initiale pour les distinguer.`);
  }
  return names;
}

/**
 * Attribue les rôles. Retourne [{ name, role }] dans l'ordre de la liste d'entrée.
 * Rôles : loup (x wolves), 1 voyante, 1 chevalier, le reste villageois.
 */
export function assignRoles(names, wolves) {
  const n = names.length;
  const w = wolves === undefined ? defaultWolves(n) : wolves;

  if (!Number.isInteger(w) || w < 1 || w > n - 3) {
    throw new Error(`Nombre de loups invalide : il doit être entre 1 et ${n - 3} pour ${n} joueurs.`);
  }

  const pool = [
    ...Array(w).fill('loup'),
    'voyante',
    'chevalier',
    ...Array(n - w - 2).fill('villageois'),
  ];
  const shuffled = shuffle(pool);
  return names.map((name, i) => ({ name, role: shuffled[i] }));
}
