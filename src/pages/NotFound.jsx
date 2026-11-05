import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page introuvable — Night Has Come';
  }, []);

  return (
    <main className="center-page">
      <h1 className="title title-sm">Rien ici</h1>
      <p className="lead">Cette page n’existe pas. Si tu cherches ta lettre, utilise le lien qu’on t’a envoyé.</p>
      <Link to="/" className="faint-link">
        Retour à l’accueil
      </Link>
    </main>
  );
}
