import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="home">
      <h1 className="home__title">Easy-Novels</h1>
      <p className="home__tagline">Plateforme d'écriture de romans — V2</p>
      <p className="home__desc">
        Bibliothèque, esquisses, éditeur, structure et objectifs. Offline-first avec PouchDB.
      </p>
      <Link to="/library" className="home__cta">Ouvrir la bibliothèque</Link>
    </section>
  );
}
