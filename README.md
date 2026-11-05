# 🌙 Night Has Come — ERSE Edition (v2)

Le site ne fait **qu'une chose** : attribuer les rôles. Le jeu (votes, nuit/jour) se joue ailleurs.

1. Le maître du jeu colle la liste des joueurs dans `/admin`.
2. Le site tire les rôles au hasard (1 loup pour 5 joueurs, 1 voyante, 1 chevalier, le reste villageois).
3. Chaque joueur reçoit un **lien personnel** (+ QR code). En l'ouvrant, il brise un sceau de cire : une lettre sort d'une enveloppe et lui révèle son rôle.
4. Le lien est **à usage unique** : une fois la lettre ouverte, il s'autodétruit pour tout autre appareil.

## Arborescence

```
night-has-come/
├── api/                       Fonctions serverless Vercel (backend)
│   ├── _lib/                  http, firebase, auth, roles (non exposés en route)
│   ├── create.js              POST  /api/create        (admin) crée la partie + tire les rôles
│   ├── check.js               GET   /api/check         état d'une lettre (jamais le rôle)
│   ├── reveal.js              POST  /api/reveal        brise le sceau (atomique, une seule fois)
│   ├── admin-list.js          GET   /api/admin-list    (admin) parties / détail d'une partie
│   ├── admin-reset.js         POST  /api/admin-reset   (admin) réactive une lettre
│   └── admin-delete.js        POST  /api/admin-delete  (admin) supprime une partie
├── src/
│   ├── pages/                 Home, Letter (enveloppe), Admin, NotFound
│   ├── components/            Envelope, LetterSheet, BloodDrips, QR
│   ├── lib/                   api.js, clipboard.js
│   ├── styles/                global.css, envelope.css, admin.css
│   ├── config.js              ← textes des rôles, durées, option KEEP_ON_DEVICE
│   ├── App.jsx, main.jsx
├── scripts/test-roles.mjs     Tests de l'attribution des rôles
├── public/favicon.svg
├── firestore.rules            Règles Firestore : tout refusé (accès via le serveur uniquement)
├── vercel.json, vite.config.js, package.json, index.html
├── .env.example, .gitignore
└── README.md
```

## Mise en place (≈ 15 min)

### 1. Firebase
1. [console.firebase.google.com](https://console.firebase.google.com) → créer un projet (ou réutiliser l'ancien).
2. **Firestore Database** → *Créer une base* (mode production).
3. Onglet **Règles** → colle le contenu de `firestore.rules` → *Publier*.
4. **Paramètres du projet → Comptes de service → Générer une nouvelle clé privée** : tu télécharges un fichier `.json`.

> Les collections `nhc_games` et `nhc_letters` sont créées automatiquement. Elles n'entrent pas en conflit avec l'ancienne version.

### 2. Variables d'environnement

| Variable | Valeur |
|---|---|
| `ADMIN_PASSWORD` | Une phrase longue, c'est ton mot de passe `/admin` |
| `FIREBASE_SERVICE_ACCOUNT` | Le contenu du `.json` téléchargé, **sur une seule ligne** (ou son encodage base64 : `base64 -w0 fichier.json`) |
| `SHOW_WOLF_ALLIES` | `true` (les loups voient leurs complices dans leur lettre) ou `false` |

### 3. Déploiement sur Vercel
1. Pousse le dossier sur GitHub (le `.gitignore` empêche d'envoyer `.env` et les clés).
2. [vercel.com](https://vercel.com) → *Add New → Project* → importe le dépôt. Vercel détecte Vite tout seul.
3. *Settings → Environment Variables* : ajoute les 3 variables ci-dessus, puis **redéploie**.
4. Ouvre `https://ton-site.vercel.app/admin`.

### Test en local
```bash
npm install
npm test                # vérifie l'attribution des rôles
cp .env.example .env    # puis remplis les valeurs
npx vercel dev          # lance le site ET l'API sur http://localhost:3000
```
(`npm run dev` seul ne lance que le frontend : l'API n'y répond pas.)

## Utilisation

1. `/admin` → mot de passe → colle les noms (un par ligne) → *Sceller les lettres*.
2. Pour chaque joueur : **Copier le message**, **WhatsApp** ou son **QR code**. Envoie-lui son lien **en privé**.
3. Coche *Afficher les rôles* pour voir qui est quoi (décoché par défaut, pour ne rien dévoiler à ceux qui regardent ton écran).
4. Les badges *Scellée / Ouverte* se mettent à jour toutes les 15 s : tu vois qui a déjà lu sa lettre.

### Quand un joueur a perdu sa lettre
Clique **Réactiver le lien** sur sa carte : il pourra l'ouvrir une nouvelle fois.

## Comportement de la lettre

- **Aperçu WhatsApp/Telegram** : sans effet. Le rôle n'est demandé au serveur qu'au clic sur le sceau, jamais au chargement de la page.
- **Une seule ouverture** : le serveur utilise une transaction Firestore ; même deux clics simultanés ne donnent le rôle qu'à un seul appareil.
- **Rafraîchissement accidentel** : avec `KEEP_ON_DEVICE = true` (dans `src/config.js`), la lettre reste relisible sur **le même appareil et le même navigateur**. Tout autre appareil voit « lettre en cendres ». Mets `false` pour une lecture strictement unique.
- **Conseil aux joueurs** : ouvrir le lien dans **un seul navigateur** et y rester. Le navigateur intégré de WhatsApp et Safari/Chrome ne partagent pas leur stockage.

## Personnaliser

- Textes des lettres et règles rappelées : `src/config.js` → `ROLES`.
- Message d'invitation : `src/config.js` → `inviteMessage`.
- Couleurs : variables CSS en haut de `src/styles/global.css`.
- Durée de l'animation : `src/config.js` → `TIMING`.

## Sécurité

- Les liens contiennent 144 bits d'aléa : impossibles à deviner.
- Le rôle n'est jamais envoyé avant le clic sur le sceau, et `check` ne le renvoie jamais.
- Firestore est fermé aux navigateurs : seules les fonctions serveur y accèdent.
- Le mot de passe admin est comparé en temps constant, avec un délai de 0,5 s sur échec.
- Ne partage jamais l'écran de `/admin` avec les rôles affichés.
