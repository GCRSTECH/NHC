// Enveloppe animée en CSS pur. `stage` pilote l'animation :
// sealed → breaking (sceau) → opening (rabat) → rising (lettre) → done (lecture)
export default function Envelope({ name, stage, onBreak, hasRead }) {
  const open = stage === 'opening' || stage === 'rising' || stage === 'done';
  const rise = stage === 'rising' || stage === 'done';
  const cls = [
    'env-scene',
    stage === 'breaking' && 'is-breaking',
    open && 'is-open',
    rise && 'is-rise',
    stage === 'done' && 'is-done',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls}>
      <div className="envelope">
        <div className="env-back" />
        <div className="env-letter" aria-hidden="true" />
        <div className="env-front">
          <svg className="env-folds" viewBox="0 0 100 64" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 64 L50 34.6 L100 64" />
            <path d="M0 0 L50 34.6 L100 0" />
          </svg>
          <p className="env-to">Pour {name}</p>
        </div>
        <div className="env-flap" />
        <button
          type="button"
          className="env-seal"
          onClick={onBreak}
          disabled={stage !== 'sealed'}
          aria-label={hasRead ? 'Briser le sceau pour relire ta lettre' : 'Briser le sceau pour ouvrir ta lettre'}
        >
          <span aria-hidden="true">☾</span>
        </button>
      </div>
    </div>
  );
}
