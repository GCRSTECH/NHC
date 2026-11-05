// Réglages et textes du jeu. Modifie ici sans toucher au reste du code.

/**
 * true  : après ouverture, la lettre reste relisible sur LE MÊME appareil (filet de sécurité
 *         contre un rafraîchissement accidentel). Tout autre appareil voit une lettre brûlée.
 * false : lecture strictement unique ; une fois repliée, elle est perdue (sauf réactivation admin).
 */
export const KEEP_ON_DEVICE = true;

/** Durées de l'animation d'ouverture (ms). */
export const TIMING = { seal: 550, open: 950, rise: 1000 };

export const ROLES = {
  loup: {
    label: 'Loup',
    glyph: '🐺',
    verdict: 'Tu es un Loup.',
    body: "Sous ta peau, quelque chose a faim. Quand la nuit tombe et que le village ferme les yeux, c'est toi qui choisis celui qui ne les rouvrira pas.",
    rules: [
      "La nuit, les loups désignent ensemble leur victime. Il faut au moins 2 votes pour qu'elle tombe.",
      'Le jour, tu te fonds dans la foule : les loups ne votent pas, ils mentent.',
      'Vous gagnez quand les loups sont aussi nombreux que les villageois.',
    ],
  },
  voyante: {
    label: 'Voyante',
    glyph: '👁️',
    verdict: 'Tu es la Voyante.',
    body: 'Tes yeux percent la chair et les mensonges. La nuit, les morts te murmurent ce que les vivants cachent.',
    rules: [
      "Chaque nuit, tu peux demander le rôle exact d'UNE personne.",
      'Ton pouvoir ou ton vote : jamais les deux la même nuit.',
      'Si tu tombes, ton rôle est révélé et tes visions s’éteignent.',
    ],
  },
  chevalier: {
    label: 'Chevalier',
    glyph: '🛡️',
    verdict: 'Tu es le Chevalier.',
    body: "Ton armure est tachée de ceux que tu n'as pas pu sauver. Cette nuit encore, un seul corps pourra se dresser entre les crocs et leur proie.",
    rules: [
      'Chaque nuit, tu peux protéger UNE personne, jamais toi-même.',
      'Ton pouvoir ou ton vote : jamais les deux la même nuit.',
      'Si tu tombes, ton rôle est révélé et ton bouclier se brise.',
    ],
  },
  villageois: {
    label: 'Villageois',
    glyph: '🕯️',
    verdict: 'Tu es un Villageois.',
    body: "Pas de crocs, pas de visions, pas d'armure : seulement ton instinct et ta voix. C'est peu. C'est parfois assez pour pendre un monstre.",
    rules: [
      'Le jour, vote avec le village pour éliminer celui que tu soupçonnes (2 votes minimum).',
      'Écoute, observe, doute de tout le monde.',
      'Le village gagne quand tous les loups sont morts.',
    ],
  },
};

/** Message à envoyer à chaque joueur (WhatsApp, SMS...). */
export function inviteMessage(name, link) {
  return [
    '🌙 NIGHT HAS COME — ERSE Edition 🌙',
    '',
    `${name}, une lettre scellée t'attend.`,
    "Ouvre ce lien seul(e), à l'abri des regards. Il ne fonctionne que pour toi, sur un seul appareil.",
    '',
    link,
  ].join('\n');
}
