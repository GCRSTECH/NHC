import { useEffect, useState } from 'react';

// La lib `qrcode` est chargée à la demande : elle n'alourdit pas la page des joueurs.
export default function QR({ value, label, size = 132 }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let live = true;
    import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(value, { margin: 1, width: size * 2, errorCorrectionLevel: 'M' }),
      )
      .then((url) => live && setSrc(url))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [value, size]);

  if (!src) return <div className="qr qr-empty" style={{ width: size, height: size }} aria-hidden="true" />;
  return <img className="qr" src={src} width={size} height={size} alt={`QR code de la lettre de ${label}`} />;
}
