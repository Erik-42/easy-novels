import { useState, useEffect, useRef } from 'react';
import { useOutline } from '../../hooks/useOutline';
import { useCurrentProject } from '../../contexts/CurrentProject';
import { PROJECT_STATUS, PROJECT_STATUS_LABELS } from '../../services/db/schema';
import './OutlineGeneral.css';

const STATUS_OPTIONS = [
  { value: PROJECT_STATUS.TODO, label: PROJECT_STATUS_LABELS[PROJECT_STATUS.TODO] },
  { value: PROJECT_STATUS.FIRST_DRAFT, label: PROJECT_STATUS_LABELS[PROJECT_STATUS.FIRST_DRAFT] },
  { value: PROJECT_STATUS.REVISED, label: PROJECT_STATUS_LABELS[PROJECT_STATUS.REVISED] },
  { value: PROJECT_STATUS.DONE, label: PROJECT_STATUS_LABELS[PROJECT_STATUS.DONE] },
  { value: PROJECT_STATUS.PROOFREAD, label: PROJECT_STATUS_LABELS[PROJECT_STATUS.PROOFREAD] },
  { value: PROJECT_STATUS.APPROVED_REVIEW, label: PROJECT_STATUS_LABELS[PROJECT_STATUS.APPROVED_REVIEW] },
];

const emptyBook = {
  titre: '',
  sousTitre: '',
  serie: '',
  genre: '',
  license: '',
  imageCouverture: '',
  imageQuatrieme: '',
};

const emptyAuthor = {
  nom: '',
  mail: '',
  autresPublications: '',
};

export default function OutlineGeneral({ projectId }) {
  const { project, loading, error, updateProject } = useOutline(projectId);
  const { updateCurrentProject } = useCurrentProject();
  const saveDebounceRef = useRef(null);

  const [bookStatut, setBookStatut] = useState(PROJECT_STATUS.TODO);
  const [bookTitre, setBookTitre] = useState('');
  const [bookSousTitre, setBookSousTitre] = useState('');
  const [bookSerie, setBookSerie] = useState('');
  const [bookGenre, setBookGenre] = useState('');
  const [bookLicense, setBookLicense] = useState('');
  const [bookImageCouverture, setBookImageCouverture] = useState('');
  const [bookImageQuatrieme, setBookImageQuatrieme] = useState('');
  const [authorNom, setAuthorNom] = useState('');
  const [authorMail, setAuthorMail] = useState('');
  const [authorAutresPublications, setAuthorAutresPublications] = useState('');

  const syncedProjectIdRef = useRef(null);
  useEffect(() => {
    if (!project) return;
    if (syncedProjectIdRef.current === projectId) return;
    syncedProjectIdRef.current = projectId;
    const status = project.status === 'draft' ? PROJECT_STATUS.FIRST_DRAFT : (project.status ?? PROJECT_STATUS.TODO);
    setBookStatut(status);
    const g = project.outlineGeneral ?? {};
    const b = g.book ?? emptyBook;
    const a = g.author ?? emptyAuthor;
    setBookTitre(b.titre ?? '');
    setBookSousTitre(b.sousTitre ?? '');
    setBookSerie(b.serie ?? '');
    setBookGenre(b.genre ?? '');
    setBookLicense(b.license ?? '');
    setBookImageCouverture(b.imageCouverture ?? '');
    setBookImageQuatrieme(b.imageQuatrieme ?? '');
    setAuthorNom(a.nom ?? '');
    setAuthorMail(a.mail ?? '');
    setAuthorAutresPublications(a.autresPublications ?? '');
  }, [project, projectId]);

  useEffect(() => {
    if (!projectId || !project) return;
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(async () => {
      saveDebounceRef.current = null;
      await updateProject({
        status: bookStatut,
        outlineGeneral: {
          book: {
            titre: bookTitre.trim() || '',
            sousTitre: bookSousTitre.trim() || '',
            serie: bookSerie.trim() || '',
            genre: bookGenre.trim() || '',
            license: bookLicense.trim() || '',
            imageCouverture: bookImageCouverture.trim() || '',
            imageQuatrieme: bookImageQuatrieme.trim() || '',
          },
          author: {
            nom: authorNom.trim() || '',
            mail: authorMail.trim() || '',
            autresPublications: authorAutresPublications.trim() || '',
          },
        },
      });
      if (projectId) updateCurrentProject({ status: bookStatut });
    }, 400);
    return () => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    };
  }, [
    projectId,
    bookStatut,
    bookTitre,
    bookSousTitre,
    bookSerie,
    bookGenre,
    bookLicense,
    bookImageCouverture,
    bookImageQuatrieme,
    authorNom,
    authorMail,
    authorAutresPublications,
    updateProject,
    updateCurrentProject,
  ]);

  const handleCoverFile = (e, setter) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result ?? '');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (loading) return <p className="outline-general__loading">Chargement…</p>;
  if (error) return <p className="outline-general__error">Erreur : {error.message}</p>;

  return (
    <div className="outline-general">
      <div className="outline-general__layout">
        <div className="outline-general__left">
          <div className="outline-general__portrait-block">
            <span className="outline-general__portrait-label">Couverture</span>
            <div className="outline-general__portrait">
              {bookImageCouverture ? (
                <div className="outline-general__portrait-wrap">
                  <img src={bookImageCouverture} alt="Couverture" className="outline-general__portrait-img" />
                  <button
                    type="button"
                    className="outline-general__portrait-remove"
                    onClick={() => setBookImageCouverture('')}
                    aria-label="Supprimer la couverture"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="outline-general__portrait-empty">Aucune image</div>
              )}
            </div>
            <div className="outline-general__portrait-field">
              <input
                type="file"
                accept="image/*"
                className="outline-general__file outline-general__portrait-file"
                onChange={(e) => handleCoverFile(e, setBookImageCouverture)}
                aria-label="Choisir une image de couverture"
              />
              <input
                type="url"
                className="outline-general__input outline-general__portrait-input"
                value={bookImageCouverture.startsWith('data:') ? '' : bookImageCouverture}
                onChange={(e) => setBookImageCouverture(e.target.value)}
                placeholder="URL de l'image"
              />
            </div>
          </div>
          <div className="outline-general__portrait-block">
            <span className="outline-general__portrait-label">4e de couverture</span>
            <div className="outline-general__portrait">
              {bookImageQuatrieme ? (
                <div className="outline-general__portrait-wrap">
                  <img src={bookImageQuatrieme} alt="4e de couverture" className="outline-general__portrait-img" />
                  <button
                    type="button"
                    className="outline-general__portrait-remove"
                    onClick={() => setBookImageQuatrieme('')}
                    aria-label="Supprimer l'image"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="outline-general__portrait-empty">Aucune image</div>
              )}
            </div>
            <div className="outline-general__portrait-field">
              <input
                type="file"
                accept="image/*"
                className="outline-general__file outline-general__portrait-file"
                onChange={(e) => handleCoverFile(e, setBookImageQuatrieme)}
                aria-label="Choisir une image"
              />
              <input
                type="url"
                className="outline-general__input outline-general__portrait-input"
                value={bookImageQuatrieme.startsWith('data:') ? '' : bookImageQuatrieme}
                onChange={(e) => setBookImageQuatrieme(e.target.value)}
                placeholder="URL de l'image"
              />
            </div>
          </div>
        </div>

        <div className="outline-general__main">
          <div className="outline-general__editor">
            <div className="outline-general__editor-header">
              <h2 className="outline-general__editor-title">Général</h2>
            </div>
            <form className="outline-general__form" onSubmit={(e) => e.preventDefault()} noValidate>
              <div className="outline-general__section-title">Informations sur le livre</div>
              <label className="outline-general__field">
                <span className="outline-general__field-label">Statut</span>
                <select
                  className="outline-general__select"
                  value={bookStatut}
                  onChange={(e) => setBookStatut(e.target.value)}
                  aria-label="Statut du livre"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="outline-general__field">
                <span className="outline-general__field-label">Titre</span>
                <input
                  type="text"
                  className="outline-general__input"
                  value={bookTitre}
                  onChange={(e) => setBookTitre(e.target.value)}
                  placeholder="Titre du livre"
                />
              </label>
              <label className="outline-general__field">
                <span className="outline-general__field-label">Sous-titre</span>
                <input
                  type="text"
                  className="outline-general__input"
                  value={bookSousTitre}
                  onChange={(e) => setBookSousTitre(e.target.value)}
                  placeholder="Sous-titre"
                />
              </label>
              <label className="outline-general__field">
                <span className="outline-general__field-label">Série</span>
                <input
                  type="text"
                  className="outline-general__input"
                  value={bookSerie}
                  onChange={(e) => setBookSerie(e.target.value)}
                  placeholder="Nom de la série"
                />
              </label>
              <label className="outline-general__field">
                <span className="outline-general__field-label">Genre</span>
                <input
                  type="text"
                  className="outline-general__input"
                  value={bookGenre}
                  onChange={(e) => setBookGenre(e.target.value)}
                  placeholder="Ex. Roman, Fantasy…"
                />
              </label>
              <label className="outline-general__field">
                <span className="outline-general__field-label">License</span>
                <input
                  type="text"
                  className="outline-general__input"
                  value={bookLicense}
                  onChange={(e) => setBookLicense(e.target.value)}
                  placeholder="Ex. CC BY-NC-ND, Tous droits réservés…"
                />
              </label>

              <div className="outline-general__section-title">Informations sur l'auteur</div>
              <label className="outline-general__field">
                <span className="outline-general__field-label">Nom</span>
                <input
                  type="text"
                  className="outline-general__input"
                  value={authorNom}
                  onChange={(e) => setAuthorNom(e.target.value)}
                  placeholder="Nom de l'auteur"
                />
              </label>
              <label className="outline-general__field">
                <span className="outline-general__field-label">Mail</span>
                <input
                  type="email"
                  className="outline-general__input"
                  value={authorMail}
                  onChange={(e) => setAuthorMail(e.target.value)}
                  placeholder="email@exemple.com"
                />
              </label>
              <label className="outline-general__field">
                <span className="outline-general__field-label">Autres publications</span>
                <textarea
                  className="outline-general__input outline-general__textarea"
                  rows={5}
                  value={authorAutresPublications}
                  onChange={(e) => setAuthorAutresPublications(e.target.value)}
                  placeholder="Liste ou liens vers vos autres ouvrages…"
                />
              </label>
              <p className="outline-general__hint">Les changements sont sauvegardés automatiquement.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
