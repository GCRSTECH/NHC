import { useEffect, useRef } from 'react';
import { KEEP_ON_DEVICE, ROLES } from '../config.js';

function Splatter() {
  return (
    <svg className="splatter" viewBox="0 0 200 160" aria-hidden="true">
      <path d="M118 14c14-8 34-6 44 6 9 11 4 22 12 32 7 9 20 10 20 24 0 16-18 20-30 18-14-2-18 10-30 12-14 2-22-8-26-20-4-12-18-14-20-28-2-14 12-36 30-44z" />
      <circle cx="96" cy="26" r="6" />
      <circle cx="78" cy="48" r="3.5" />
      <circle cx="186" cy="118" r="5" />
      <circle cx="170" cy="140" r="2.8" />
      <circle cx="104" cy="92" r="3" />
      <circle cx="132" cy="112" r="4.2" />
    </svg>
  );
}

export default function LetterSheet({ data, onFold }) {
  const role = ROLES[data.role] || ROLES.villageois;
  const sheetRef = useRef(null);
  const foldRef = useRef(onFold);
  foldRef.current = onFold;

  useEffect(() => {
    sheetRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && foldRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const ink = (i) => ({ '--i': i });
  const allies = Array.isArray(data.allies) ? data.allies : [];

  return (
    <div className="reading">
      <div className="sheet-wrap">
        <article
          className={`sheet sheet-${data.role}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sheet-title"
          tabIndex={-1}
          ref={sheetRef}
        >
          <Splatter />
          <p className="sheet-hello ink" style={ink(0)}>
            {data.name},
          </p>
          <h1 id="sheet-title" className="sheet-verdict ink" style={ink(1)}>
            {role.verdict}
          </h1>
          <p className="sheet-glyph ink" style={ink(2)} aria-hidden="true">
            {role.glyph}
          </p>
          <p className="sheet-body ink" style={ink(3)}>
            {role.body}
          </p>

          {data.role === 'loup' && (
            <p className="sheet-pack ink" style={ink(4)}>
              {allies.length > 0 ? (
                <>
                  Ta meute : <strong>{allies.join(', ')}</strong>.
                </>
              ) : (
                <>Tu chasses seul : la meute, c’est toi.</>
              )}
            </p>
          )}

          <ul className="sheet-rules ink" style={ink(5)}>
            {role.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <p className="sheet-warning ink" style={ink(6)}>
            {KEEP_ON_DEVICE
              ? 'Cette lettre ne s’ouvrira sur aucun autre appareil. Replie-la avant de montrer ton écran à quelqu’un.'
              : 'Une fois repliée, cette lettre brûlera pour toujours. Retiens ce qu’elle dit.'}
          </p>

          <button type="button" className="btn btn-sheet ink" style={ink(7)} onClick={onFold}>
            {KEEP_ON_DEVICE ? 'Replier la lettre' : 'Brûler la lettre'}
          </button>
        </article>
      </div>
    </div>
  );
}
