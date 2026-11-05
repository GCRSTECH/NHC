// Gouttes de sang qui coulent une seule fois depuis le haut de l'écran au chargement.
const DRIPS = [
  { l: 3, w: 9, h: 70, d: 0.2, t: 5 },
  { l: 11, w: 13, h: 120, d: 1.1, t: 8 },
  { l: 19, w: 8, h: 46, d: 0.6, t: 4.5 },
  { l: 31, w: 11, h: 92, d: 1.8, t: 7 },
  { l: 44, w: 7, h: 38, d: 0.4, t: 4 },
  { l: 53, w: 14, h: 138, d: 2.2, t: 9 },
  { l: 64, w: 9, h: 64, d: 0.9, t: 6 },
  { l: 73, w: 12, h: 104, d: 1.5, t: 8 },
  { l: 82, w: 7, h: 52, d: 0.3, t: 5 },
  { l: 91, w: 11, h: 84, d: 2.6, t: 7.5 },
  { l: 97, w: 8, h: 40, d: 1.2, t: 4.5 },
];

export default function BloodDrips() {
  return (
    <div className="drips" aria-hidden="true">
      {DRIPS.map((d, i) => (
        <span
          key={i}
          className="drip"
          style={{
            left: `${d.l}%`,
            width: `${d.w}px`,
            '--h': `${d.h}px`,
            animationDelay: `${d.d}s`,
            animationDuration: `${d.t}s`,
          }}
        />
      ))}
    </div>
  );
}
