import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Envelope from '../components/Envelope.jsx';
import LetterSheet from '../components/LetterSheet.jsx';
import { checkLetter, revealLetter } from '../lib/api.js';
import { KEEP_ON_DEVICE, TIMING } from '../config.js';

const cacheKey = (token) => `nhc:letter:${token}`;

function readCache(token) {
  if (!KEEP_ON_DEVICE) return null;
  try {
    const raw = localStorage.getItem(cacheKey(token));
    const data = raw && JSON.parse(raw);
    return data && data.role ? data : null;
  } catch {
    return null;
  }
}

function writeCache(token, data) {
  if (!KEEP_ON_DEVICE) return;
  try {
    localStorage.setItem(cacheKey(token), JSON.stringify(data));
  } catch {
    /* stockage indisponible (navigation privée...) : la lettre restera à usage unique */
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const dur = (ms) => (prefersReducedMotion() ? Math.min(ms, 120) : ms);

// phases : loading | sealed | breaking | opening | rising | reading | burned | unknown | error
export default function Letter() {
  const { token } = useParams();
  const [phase, setPhase] = useState('loading');
  const [name, setName] = useState('');
  const [reveal, setReveal] = useState(null);
  const [error, setError] = useState('');
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    document.title = 'Une lettre scellée — Night Has Come';
  }, []);

  // Chargement initial : lecture seule, ne détruit jamais la lettre.
  useEffect(() => {
    const cached = readCache(token);
    if (cached) {
      setName(cached.name);
      setReveal(cached);
      setPhase('sealed');
      return undefined;
    }
    let live = true;
    checkLetter(token)
      .then((r) => {
        if (!live) return;
        if (r.state === 'sealed') {
          setName(r.name);
          setPhase('sealed');
        } else if (r.state === 'burned') {
          setName(r.name || '');
          setPhase('burned');
        } else {
          setPhase('unknown');
        }
      })
      .catch((e) => {
        if (!live) return;
        setError(e.message);
        setPhase('error');
      });
    return () => {
      live = false;
    };
  }, [token]);

  const breakSeal = useCallback(async () => {
    if (phase !== 'sealed') return;
    setError('');
    setPhase('breaking');
    try {
      // Le serveur est interrogé pendant que le sceau se brise.
      const pending = reveal ? Promise.resolve(reveal) : revealLetter(token);
      const [res] = await Promise.all([pending, wait(dur(TIMING.seal))]);
      if (!alive.current) return;

      if (res.state === 'burned') return setPhase('burned');
      if (res.state !== 'revealed') return setPhase('unknown');

      writeCache(token, res);
      setReveal(res);
      setName(res.name);

      setPhase('opening');
      await wait(dur(TIMING.open));
      if (!alive.current) return;
      setPhase('rising');
      await wait(dur(TIMING.rise));
      if (!alive.current) return;
      setPhase('reading');
    } catch (e) {
      if (!alive.current) return;
      setError(e.message || 'Une erreur est survenue.');
      setPhase('error');
    }
  }, [phase, reveal, token]);

  const fold = useCallback(() => {
    if (KEEP_ON_DEVICE) {
      setPhase('sealed');
    } else {
      setReveal(null);
      setPhase('burned');
    }
  }, []);

  const retry = () => (name ? setPhase('sealed') : window.location.reload());

  if (phase === 'loading') {
    return (
      <main className="letter-page">
        <p className="hint" role="status">
          Quelqu’un approche de la porte…
        </p>
      </main>
    );
  }

  if (phase === 'unknown') {
    return (
      <main className="letter-page">
        <section className="notice">
          <h1 className="notice-title">Aucune lettre ici</h1>
          <p>
            Ce lien ne correspond à aucune lettre. Vérifie que tu l’as copié en entier, ou demande-le de nouveau au
            maître du jeu.
          </p>
        </section>
      </main>
    );
  }

  if (phase === 'burned') {
    return (
      <main className="letter-page">
        <section className="burned" aria-labelledby="burned-title">
          <h1 id="burned-title" className="notice-title">
            {name ? `${name}, ` : ''}cette lettre est déjà partie en cendres.
          </h1>
          <p>
            Elle a été ouverte, et les flammes l’ont dévorée. Si tu l’as ouverte sur un autre appareil ou un autre
            navigateur, retourne-y. Sinon, préviens le maître du jeu : il peut la réactiver.
          </p>
        </section>
      </main>
    );
  }

  if (phase === 'error') {
    return (
      <main className="letter-page">
        <section className="notice" role="alert">
          <h1 className="notice-title">La lettre est restée muette</h1>
          <p>{error}</p>
          <p>Si le problème persiste, demande au maître du jeu de réactiver ton lien.</p>
          <button type="button" className="btn" onClick={retry}>
            Réessayer
          </button>
        </section>
      </main>
    );
  }

  const stage = phase === 'reading' ? 'done' : phase;
  const hint =
    phase === 'sealed'
      ? reveal
        ? 'Tu l’as déjà lue. Touche le sceau pour la relire.'
        : 'Une lettre scellée t’attend. Ouvre-la à l’abri des regards : touche le sceau.'
      : phase === 'breaking'
        ? 'Le sceau cède…'
        : phase === 'opening'
          ? 'Le papier crisse…'
          : phase === 'rising'
            ? 'Quelque chose glisse hors de l’enveloppe…'
            : '';

  return (
    <main className="letter-page">
      <Envelope name={name} stage={stage} onBreak={breakSeal} hasRead={Boolean(reveal)} />
      <p className="hint" role="status" aria-live="polite">
        {hint}
      </p>
      {phase === 'reading' && reveal && <LetterSheet data={reveal} onFold={fold} />}
    </main>
  );
}
