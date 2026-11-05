import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import QR from '../components/QR.jsx';
import { adminCreate, adminDelete, adminList, adminReset } from '../lib/api.js';
import { copyText } from '../lib/clipboard.js';
import { ROLES, inviteMessage } from '../config.js';

const PW_KEY = 'nhc:admin';
const POLL_MS = 15000;
const linkFor = (token) => `${window.location.origin}/r/${token}`;
const dateFmt = (ms) =>
  ms ? new Date(ms).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '';

export default function Admin() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(PW_KEY) || '');
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [games, setGames] = useState([]);
  const [current, setCurrent] = useState(null); // { game, letters }
  const [form, setForm] = useState({ players: '', wolves: '', label: '' });
  const [showRoles, setShowRoles] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    document.title = 'Maître du jeu — Night Has Come';
  }, []);

  const refreshGames = useCallback(async (pw) => {
    const r = await adminList(pw);
    setGames(r.games || []);
  }, []);

  const login = useCallback(
    async (pw) => {
      setBusy(true);
      setError('');
      try {
        await refreshGames(pw);
        sessionStorage.setItem(PW_KEY, pw);
        setPassword(pw);
        setAuthed(true);
      } catch (e) {
        sessionStorage.removeItem(PW_KEY);
        setAuthed(false);
        setError(e.message);
      } finally {
        setBusy(false);
      }
    },
    [refreshGames],
  );

  // Reconnexion automatique si le mot de passe est déjà en session.
  useEffect(() => {
    if (password) login(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rafraîchit l'état des lettres (scellée / ouverte) toutes les 15 s.
  const currentId = current?.game.id;
  useEffect(() => {
    if (!authed || !currentId) return undefined;
    const id = setInterval(() => {
      adminList(password, currentId)
        .then((r) => setCurrent({ game: r.game, letters: r.letters }))
        .catch(() => {});
    }, POLL_MS);
    return () => clearInterval(id);
  }, [authed, currentId, password]);

  const flashCopied = (key) => {
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? '' : c)), 1800);
  };

  const copy = async (key, text) => {
    const ok = await copyText(text);
    if (ok) flashCopied(key);
    else setError('Copie impossible : sélectionne le texte et copie-le à la main.');
  };

  const openGame = async (id) => {
    setBusy(true);
    setError('');
    try {
      const r = await adminList(password, id);
      setCurrent({ game: r.game, letters: r.letters });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const createGame = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const players = form.players.split('\n');
      const r = await adminCreate(password, {
        players,
        wolves: form.wolves === '' ? undefined : Number(form.wolves),
        label: form.label,
      });
      setCurrent({ game: r.game, letters: r.letters });
      setForm({ players: '', wolves: '', label: '' });
      await refreshGames(password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const resetLetter = async (letter) => {
    if (!window.confirm(`Réactiver la lettre de ${letter.name} ? Elle pourra être ouverte une nouvelle fois.`)) return;
    try {
      await adminReset(password, letter.token);
      await openGame(current.game.id);
    } catch (e) {
      setError(e.message);
    }
  };

  const removeGame = async () => {
    if (!window.confirm(`Supprimer « ${current.game.label} » et toutes ses lettres ? C’est définitif.`)) return;
    try {
      await adminDelete(password, current.game.id);
      setCurrent(null);
      await refreshGames(password);
    } catch (e) {
      setError(e.message);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(PW_KEY);
    setPassword('');
    setAuthed(false);
    setCurrent(null);
    setGames([]);
    setShowRoles(false);
  };

  const summary = useMemo(() => {
    if (!current) return null;
    const counts = {};
    current.letters.forEach((l) => {
      counts[l.role] = (counts[l.role] || 0) + 1;
    });
    return { counts, opened: current.letters.filter((l) => l.opened).length, total: current.letters.length };
  }, [current]);

  const allMessages = () =>
    current.letters.map((l) => inviteMessage(l.name, linkFor(l.token))).join('\n\n— — —\n\n');

  // ---------- Connexion ----------
  if (!authed) {
    return (
      <main className="admin">
        <header className="admin-head">
          <h1 className="admin-title">Maître du jeu</h1>
        </header>
        <form
          className="panel narrow"
          onSubmit={(e) => {
            e.preventDefault();
            login(pwInput);
          }}
        >
          <label htmlFor="pw">Mot de passe</label>
          <input
            id="pw"
            type="password"
            autoComplete="current-password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            required
          />
          {error && (
            <p className="msg msg-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn" disabled={busy || !pwInput}>
            {busy ? 'Vérification…' : 'Entrer'}
          </button>
          <Link to="/" className="faint-link">
            Retour à l’accueil
          </Link>
        </form>
      </main>
    );
  }

  // ---------- Espace connecté ----------
  return (
    <main className="admin">
      <header className="admin-head">
        <h1 className="admin-title">Maître du jeu</h1>
        <button type="button" className="btn btn-ghost" onClick={logout}>
          Se déconnecter
        </button>
      </header>

      {error && (
        <p className="msg msg-error" role="alert">
          {error}
        </p>
      )}

      <section className="panel" aria-labelledby="new-title">
        <h2 id="new-title">Nouvelle partie</h2>
        <form onSubmit={createGame} className="stack">
          <div>
            <label htmlFor="players">Joueurs (un nom par ligne)</label>
            <textarea
              id="players"
              rows={8}
              value={form.players}
              onChange={(e) => setForm({ ...form, players: e.target.value })}
              placeholder={'Alice\nBob\nChloé\nDavid\nÈve'}
              required
            />
            <p className="field-help">
              {form.players.split('\n').filter((l) => l.trim()).length} joueur(s). Minimum 4, maximum 100.
            </p>
          </div>
          <div className="row">
            <div>
              <label htmlFor="label">Nom de la partie (facultatif)</label>
              <input
                id="label"
                value={form.label}
                maxLength={60}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="wolves">Nombre de loups</label>
              <input
                id="wolves"
                type="number"
                min={1}
                inputMode="numeric"
                value={form.wolves}
                placeholder="Auto (1 pour 5)"
                onChange={(e) => setForm({ ...form, wolves: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Tirage en cours…' : 'Sceller les lettres'}
          </button>
        </form>
      </section>

      {games.length > 0 && (
        <section className="panel" aria-labelledby="games-title">
          <h2 id="games-title">Parties précédentes</h2>
          <ul className="game-list">
            {games.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  className={`btn btn-ghost game-btn${current?.game.id === g.id ? ' is-current' : ''}`}
                  onClick={() => openGame(g.id)}
                  aria-pressed={current?.game.id === g.id}
                >
                  <span>{g.label}</span>
                  <span className="muted">
                    {g.total} joueurs · {g.wolves} loup{g.wolves > 1 ? 's' : ''} · {dateFmt(g.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {current && summary && (
        <section className="panel" aria-labelledby="cur-title">
          <div className="cur-head">
            <div>
              <h2 id="cur-title">{current.game.label}</h2>
              <p className="muted">
                {summary.opened} lettre{summary.opened > 1 ? 's' : ''} ouverte{summary.opened > 1 ? 's' : ''} sur{' '}
                {summary.total}. Mise à jour automatique.
              </p>
            </div>
            <div className="cur-actions">
              <button type="button" className="btn" onClick={() => copy('all', allMessages())}>
                {copied === 'all' ? 'Copié ✓' : 'Copier tous les messages'}
              </button>
              <button type="button" className="btn btn-danger" onClick={removeGame}>
                Supprimer la partie
              </button>
            </div>
          </div>

          <label className="check">
            <input type="checkbox" checked={showRoles} onChange={(e) => setShowRoles(e.target.checked)} />
            Afficher les rôles (attention aux regards sur ton écran)
          </label>

          {showRoles && (
            <p className="role-summary">
              {Object.entries(summary.counts).map(([role, n]) => (
                <span key={role} className={`role role-${role}`}>
                  {n} {ROLES[role]?.label || role}
                  {n > 1 ? 's' : ''}
                </span>
              ))}
            </p>
          )}

          <ul className="letter-grid">
            {current.letters.map((l) => {
              const link = linkFor(l.token);
              const message = inviteMessage(l.name, link);
              return (
                <li key={l.token} className="letter-card">
                  <div className="lc-head">
                    <strong>{l.name}</strong>
                    <span className={`badge ${l.opened ? 'is-opened' : 'is-sealed'}`}>
                      {l.opened ? `Ouverte ${dateFmt(l.openedAt)}` : 'Scellée'}
                    </span>
                  </div>
                  <p className="lc-role">
                    {showRoles ? (
                      <span className={`role role-${l.role}`}>
                        {ROLES[l.role]?.glyph} {ROLES[l.role]?.label}
                      </span>
                    ) : (
                      <span className="muted">Rôle masqué</span>
                    )}
                  </p>
                  <QR value={link} label={l.name} />
                  <input
                    className="link-field"
                    readOnly
                    value={link}
                    aria-label={`Lien de ${l.name}`}
                    onFocus={(e) => e.target.select()}
                  />
                  <div className="lc-actions">
                    <button type="button" className="btn btn-small" onClick={() => copy(`l-${l.token}`, link)}>
                      {copied === `l-${l.token}` ? 'Copié ✓' : 'Copier le lien'}
                    </button>
                    <button type="button" className="btn btn-small" onClick={() => copy(`m-${l.token}`, message)}>
                      {copied === `m-${l.token}` ? 'Copié ✓' : 'Copier le message'}
                    </button>
                    <a
                      className="btn btn-small btn-ghost"
                      href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                    {l.opened && (
                      <button type="button" className="btn btn-small btn-ghost" onClick={() => resetLetter(l)}>
                        Réactiver le lien
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
