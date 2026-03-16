import { useState, useEffect, useRef } from 'react';
import { useOutline } from '../../hooks/useOutline';
import Modal from '../Modal/Modal';
import './OutlinePersonnages.css';

const CATEGORY_NAME = 'Personnages';
const MODE_NEW = 'new';

const IMPORTANCE_OPTIONS = [
  { value: '', label: '— Choisir —' },
  { value: 'mineur', label: 'Mineur' },
  { value: 'secondaire', label: 'Secondaire' },
  { value: 'principal', label: 'Principal' },
  { value: 'autre', label: 'Autre' },
];

export default function OutlinePersonnages({ projectId }) {
  const {
    categories,
    getItemsForCategory,
    loading,
    error,
    addCategory,
    addItem,
    updateItem,
    deleteItem,
    refetch,
  } = useOutline(projectId);

  const personnagesCategory = categories.find(
    (c) => c.name && c.name.trim().toLowerCase() === CATEGORY_NAME.toLowerCase()
  );
  const characters = personnagesCategory
    ? getItemsForCategory(personnagesCategory._id)
    : [];

  const [selectedId, setSelectedId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formImportance, setFormImportance] = useState('');
  const [formMotivation, setFormMotivation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBiographie, setFormBiographie] = useState('');
  const [formObjectif, setFormObjectif] = useState('');
  const [formConflit, setFormConflit] = useState('');
  const [formImages, setFormImages] = useState([]);
  const [formImageIndex, setFormImageIndex] = useState(0);
  const [formImageInput, setFormImageInput] = useState('');
  const [modalDelete, setModalDelete] = useState(false);
  const deleteTargetRef = useRef(null);
  const saveDebounceRef = useRef(null);

  const isNew = selectedId === MODE_NEW;
  const selectedCharacter = selectedId && selectedId !== MODE_NEW
    ? characters.find((c) => c._id === selectedId)
    : null;

  const currentImage = formImages.length
    ? (formImages[formImageIndex] ?? formImages[0])
    : null;

  useEffect(() => {
    if (isNew) {
      setFormName('');
      setFormRole('');
      setFormImportance('');
      setFormMotivation('');
      setFormDescription('');
      setFormBiographie('');
      setFormObjectif('');
      setFormConflit('');
      setFormImages([]);
      setFormImageIndex(0);
      setFormImageInput('');
    } else if (selectedCharacter) {
      setFormName(selectedCharacter.title ?? '');
      setFormRole(selectedCharacter.role ?? '');
      setFormImportance(selectedCharacter.importance ?? '');
      setFormMotivation(selectedCharacter.motivation ?? '');
      setFormDescription(selectedCharacter.summary ?? '');
      setFormBiographie(selectedCharacter.biographie ?? '');
      setFormObjectif(selectedCharacter.objectif ?? '');
      setFormConflit(selectedCharacter.conflit ?? '');
      const imgs = Array.isArray(selectedCharacter.images)
        ? selectedCharacter.images
        : selectedCharacter.image
          ? [selectedCharacter.image]
          : [];
      setFormImages(imgs);
      setFormImageIndex(0);
      setFormImageInput('');
    }
  }, [selectedId, selectedCharacter?._id, isNew]);

  useEffect(() => {
    if (!selectedCharacter) return;
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      const filtered = formImages.filter((u) => u && String(u).trim());
      updateItem(selectedCharacter._id, {
        title: formName.trim() || 'Sans nom',
        role: formRole.trim(),
        importance: formImportance || undefined,
        motivation: formMotivation.trim() || undefined,
        summary: formDescription.trim() || undefined,
        biographie: formBiographie.trim() || undefined,
        objectif: formObjectif.trim() || undefined,
        conflit: formConflit.trim() || undefined,
        images: filtered,
        image: filtered[0]?.trim() || undefined,
      });
    }, 400);
    return () => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    };
  }, [
    selectedCharacter?._id,
    formName,
    formRole,
    formImportance,
    formDescription,
    formBiographie,
    formObjectif,
    formMotivation,
    formConflit,
    formImages,
  ]);

  const saveCharacterImages = async (nextImages) => {
    if (!selectedCharacter) return;
    const filtered = (nextImages ?? []).filter((u) => u && String(u).trim());
    await updateItem(selectedCharacter._id, {
      title: formName.trim() || 'Sans nom',
      role: formRole.trim(),
      importance: formImportance || undefined,
      motivation: formMotivation.trim() || undefined,
      summary: formDescription.trim() || undefined,
      biographie: formBiographie.trim() || undefined,
      objectif: formObjectif.trim() || undefined,
      conflit: formConflit.trim() || undefined,
      images: filtered,
      image: filtered[0]?.trim() || undefined,
    });
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result ?? '';
      const next = [...formImages, url];
      setFormImages(next);
      setFormImageIndex(next.length - 1);
      saveCharacterImages(next);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddImageUrl = (e) => {
    e?.preventDefault();
    const url = formImageInput.trim();
    if (!url) return;
    setFormImageInput('');
    const next = [...formImages, url];
    setFormImages(next);
    setFormImageIndex(next.length - 1);
    saveCharacterImages(next);
  };

  const handleRemoveCurrentImage = () => {
    if (!formImages.length) return;
    const next = formImages.filter((_, i) => i !== formImageIndex);
    const newIndex = next.length ? Math.min(formImageIndex, next.length - 1) : 0;
    setFormImages(next);
    setFormImageIndex(newIndex);
    saveCharacterImages(next);
  };

  const handlePrevImage = () => {
    setFormImageIndex((i) => (i > 0 ? i - 1 : formImages.length - 1));
  };

  const handleNextImage = () => {
    setFormImageIndex((i) => (i < formImages.length - 1 ? i + 1 : 0));
  };

  const selectCharacter = (id) => {
    setSelectedId(id);
  };

  const ensureCategory = async () => {
    if (personnagesCategory) return personnagesCategory._id;
    const newId = await addCategory(CATEGORY_NAME);
    await refetch();
    return newId;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const categoryId = await ensureCategory();
    if (!categoryId) return;
    const name = formName.trim() || 'Sans nom';
    const itemId = await addItem(categoryId, name);
    if (itemId) {
      await updateItem(itemId, {
        summary: formDescription.trim(),
        role: formRole.trim(),
        importance: formImportance || undefined,
        motivation: formMotivation.trim() || undefined,
        biographie: formBiographie.trim() || undefined,
        objectif: formObjectif.trim() || undefined,
        conflit: formConflit.trim() || undefined,
        images: formImages.filter((u) => u && String(u).trim()),
        image: formImages[0]?.trim() || undefined,
      });
      setSelectedId(itemId);
    }
  };

  const openDelete = (char) => {
    deleteTargetRef.current = char._id;
    setModalDelete(true);
  };

  const handleDeleteConfirm = async () => {
    const idToDelete = deleteTargetRef.current;
    if (!idToDelete) return;
    await deleteItem(idToDelete);
    setModalDelete(false);
    deleteTargetRef.current = null;
    if (selectedId === idToDelete) setSelectedId(null);
  };

  if (loading) return <p className="outline-personnages__loading">Chargement…</p>;
  if (error) return <p className="outline-personnages__error">Erreur : {error.message}</p>;

  return (
    <div className="outline-personnages">
      <div className="outline-personnages__layout">
        <div className="outline-personnages__left">
          <aside className="outline-personnages__sidebar">
            <div className="outline-personnages__sidebar-header">
              <div className="outline-personnages__sidebar-title">Personnages</div>
              <button
                type="button"
                className="outline-personnages__sidebar-action"
                onClick={() => {
                  ensureCategory().then(() => selectCharacter(MODE_NEW));
                }}
                disabled={!personnagesCategory}
              >
                + Ajouter
              </button>
            </div>
            {!personnagesCategory ? (
              <div className="outline-personnages__sidebar-empty">
                <p>Aucune catégorie « Personnages ».</p>
                <button
                  type="button"
                  className="outline-personnages__btn-create-cat"
                  onClick={ensureCategory}
                >
                  Créer la catégorie
                </button>
              </div>
            ) : characters.length === 0 ? (
              <div className="outline-personnages__sidebar-empty">
                <p>Aucun personnage.</p>
              </div>
            ) : (
              <div className="outline-personnages__list">
                {characters.map((char) => (
                  <button
                    key={char._id}
                    type="button"
                    className={`outline-personnages__list-item ${selectedId === char._id ? 'outline-personnages__list-item--active' : ''}`}
                    onClick={() => selectCharacter(char._id)}
                  >
                    <span className="outline-personnages__list-name">
                      {char.title || 'Sans nom'}
                    </span>
                    <div className="outline-personnages__list-meta">
                      {char.role && (
                        <span className="outline-personnages__list-role">{char.role}</span>
                      )}
                      {char.importance && (
                        <span className="outline-personnages__list-importance">
                          {IMPORTANCE_OPTIONS.find((o) => o.value === char.importance)?.label ?? char.importance}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>
          {(isNew || selectedCharacter) && (
            <div className="outline-personnages__portrait-block">
              <div className="outline-personnages__portrait-nav">
                <button
                  type="button"
                  className="outline-personnages__portrait-arrow"
                  onClick={handlePrevImage}
                  disabled={formImages.length <= 1}
                  aria-label="Image précédente"
                >
                  <span className="outline-personnages__portrait-arrow-icon" aria-hidden>‹</span>
                </button>
                <div className="outline-personnages__portrait">
                  {currentImage ? (
                    <img src={currentImage} alt="" className="outline-personnages__portrait-img" />
                  ) : (
                    <div className="outline-personnages__portrait-empty">Aucune image</div>
                  )}
                </div>
                <button
                  type="button"
                  className="outline-personnages__portrait-arrow"
                  onClick={handleNextImage}
                  disabled={formImages.length <= 1}
                  aria-label="Image suivante"
                >
                  <span className="outline-personnages__portrait-arrow-icon" aria-hidden>›</span>
                </button>
              </div>
              <div className="outline-personnages__portrait-field">
                <span className="outline-personnages__portrait-label">Image</span>
                <div className="outline-personnages__portrait-add">
                  <input
                    type="text"
                    className="outline-personnages__input outline-personnages__portrait-input"
                    value={formImageInput}
                    onChange={(e) => setFormImageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddImageUrl(e)}
                    placeholder="URL de l'image (Entrée pour ajouter)"
                  />
                  <button
                    type="button"
                    className="outline-personnages__btn outline-personnages__btn--danger outline-personnages__portrait-add-btn"
                    onClick={handleRemoveCurrentImage}
                    disabled={!formImages.length}
                    aria-label="Supprimer l'image affichée"
                  >
                    Supprimer
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="outline-personnages__file outline-personnages__portrait-file"
                  onChange={handleImageFile}
                  aria-label="Choisir un fichier image"
                />
                {formImages.length > 1 && (
                  <span className="outline-personnages__portrait-counter">
                    {formImageIndex + 1} / {formImages.length}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="outline-personnages__main">
          {!personnagesCategory ? (
            <div className="outline-personnages__editor-empty">
              Créez la catégorie « Personnages » dans la liste à gauche pour commencer.
            </div>
          ) : isNew ? (
            <div className="outline-personnages__editor">
              <h2 className="outline-personnages__editor-title">Nouveau personnage</h2>
              <form className="outline-personnages__form" onSubmit={handleCreate} noValidate>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Nom</span>
                  <input
                    type="text"
                    className="outline-personnages__input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nom du personnage"
                  />
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Rôle</span>
                  <input
                    type="text"
                    className="outline-personnages__input"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="Ex. protagoniste, antagoniste"
                  />
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Importance</span>
                  <select
                    className="outline-personnages__select"
                    value={formImportance}
                    onChange={(e) => setFormImportance(e.target.value)}
                    aria-label="Importance du personnage"
                  >
                    {IMPORTANCE_OPTIONS.map((opt) => (
                      <option key={opt.value || 'empty'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Motivation</span>
                  <input
                    type="text"
                    className="outline-personnages__input"
                    value={formMotivation}
                    onChange={(e) => setFormMotivation(e.target.value)}
                    placeholder="Objectif, désir, moteur du personnage…"
                  />
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Description</span>
                  <textarea
                    className="outline-personnages__input outline-personnages__textarea"
                    rows={8}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Apparence, caractère, passé…"
                  />
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Biographie</span>
                  <textarea
                    className="outline-personnages__input outline-personnages__textarea"
                    rows={6}
                    value={formBiographie}
                    onChange={(e) => setFormBiographie(e.target.value)}
                    placeholder="Histoire du personnage, passé, origines…"
                  />
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Objectif</span>
                  <textarea
                    className="outline-personnages__input outline-personnages__textarea"
                    rows={4}
                    value={formObjectif}
                    onChange={(e) => setFormObjectif(e.target.value)}
                    placeholder="Ce que le personnage veut atteindre dans l'histoire…"
                  />
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Conflit</span>
                  <textarea
                    className="outline-personnages__input outline-personnages__textarea"
                    rows={4}
                    value={formConflit}
                    onChange={(e) => setFormConflit(e.target.value)}
                    placeholder="Obstacles, tensions, contradictions internes ou externes…"
                  />
                </label>
                <div className="outline-personnages__form-actions">
                  <button type="submit" className="outline-personnages__btn outline-personnages__btn--primary">
                    Créer
                  </button>
                  <button
                    type="button"
                    className="outline-personnages__btn outline-personnages__btn--secondary"
                    onClick={() => setSelectedId(null)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          ) : selectedCharacter ? (
            <div className="outline-personnages__editor">
              <div className="outline-personnages__editor-header">
                <h2 className="outline-personnages__editor-title">Fiche personnage</h2>
                <button
                  type="button"
                  className="outline-personnages__btn outline-personnages__btn--danger"
                  onClick={() => openDelete(selectedCharacter)}
                >
                  Supprimer
                </button>
              </div>
              <form className="outline-personnages__form" onSubmit={(e) => e.preventDefault()} noValidate>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Nom</span>
                  <input
                    type="text"
                    className="outline-personnages__input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nom du personnage"
                  />
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Rôle</span>
                  <input
                    type="text"
                    className="outline-personnages__input"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="Ex. protagoniste, antagoniste"
                  />
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Importance</span>
                  <select
                    className="outline-personnages__select"
                    value={formImportance}
                    onChange={(e) => setFormImportance(e.target.value)}
                    aria-label="Importance du personnage"
                  >
                    {IMPORTANCE_OPTIONS.map((opt) => (
                      <option key={opt.value || 'empty'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Motivation</span>
                  <input
                    type="text"
                    className="outline-personnages__input"
                    value={formMotivation}
                    onChange={(e) => setFormMotivation(e.target.value)}
                    placeholder="Objectif, désir, moteur du personnage…"
                  />
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Description</span>
                  <textarea
                    className="outline-personnages__input outline-personnages__textarea"
                    rows={8}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Apparence, caractère, passé…"
                  />
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Biographie</span>
                  <textarea
                    className="outline-personnages__input outline-personnages__textarea"
                    rows={6}
                    value={formBiographie}
                    onChange={(e) => setFormBiographie(e.target.value)}
                    placeholder="Histoire du personnage, passé, origines…"
                  />
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Objectif</span>
                  <textarea
                    className="outline-personnages__input outline-personnages__textarea"
                    rows={4}
                    value={formObjectif}
                    onChange={(e) => setFormObjectif(e.target.value)}
                    placeholder="Ce que le personnage veut atteindre dans l'histoire…"
                  />
                </label>
                <label className="outline-personnages__field">
                  <span className="outline-personnages__field-label">Conflit</span>
                  <textarea
                    className="outline-personnages__input outline-personnages__textarea"
                    rows={4}
                    value={formConflit}
                    onChange={(e) => setFormConflit(e.target.value)}
                    placeholder="Obstacles, tensions, contradictions internes ou externes…"
                  />
                </label>
                <p className="outline-personnages__hint">Les changements sont sauvegardés automatiquement.</p>
              </form>
            </div>
          ) : (
            <div className="outline-personnages__editor-empty">
              Sélectionnez un personnage à gauche pour l’éditer, ou cliquez sur « + Ajouter » pour en créer un.
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalDelete}
        onClose={() => setModalDelete(false)}
        title="Supprimer ce personnage ?"
      >
        <p className="modal__text">
          Cette fiche personnage sera définitivement supprimée.
        </p>
        <div className="modal__form-actions">
          <button
            type="button"
            className="modal__btn modal__btn--secondary"
            onClick={() => setModalDelete(false)}
          >
            Annuler
          </button>
          <button
            type="button"
            className="modal__btn modal__btn--danger"
            onClick={handleDeleteConfirm}
          >
            Supprimer
          </button>
        </div>
      </Modal>
    </div>
  );
}
