import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  useEffect(() => {
    document.title = 'Night Has Come — ERSE Edition';
  }, []);

  return (
    <main className="center-page">
      <h1 className="title">Night Has Come</h1>
      <p className="subtitle">ERSE Edition</p>
      <p className="lead">
        Le village dort. Si une lettre scellée t’a été envoyée, ouvre le lien qui l’accompagne : il n’y a pas d’autre
        porte.
      </p>
      <Link to="/admin" className="faint-link">
        Espace du maître du jeu
      </Link>
    </main>
  );
}
