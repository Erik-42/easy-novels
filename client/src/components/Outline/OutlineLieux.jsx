import { useState, useEffect, useRef } from 'react';
import { useOutline } from '../../hooks/useOutline';
import Modal from '../Modal/Modal';
import './OutlineLieux.css';

const CATEGORY_NAME = 'Lieux';
const MODE_NEW = 'new';

const TYPE_OPTIONS = [
  { value: '', label: '— Choisir —' },
  { value: 'ville', label: 'Ville' },
  { value: 'pays', label: 'Pays' },
  { value: 'batiment', label: 'Bâtiment' },
  { value: 'region', label: 'Région' },
  { value: 'autre', label: 'Autre' },
];

const DEFAULT_IMPORTANCE_OPTIONS = [
  { value: 'important', label: 'Important' },
  { value: 'mineur', label: 'Mineur' },
  { value: 'secondaire', label: 'Secondaire' },
  { value: 'autre', label: 'Autre' },
  { value: 'principal', label: 'Principal' },
];

export default function OutlineLieux({ projectId }) {
  const {
    categories,
    getItemsForCategory,
    loading,
    error,
    addCategory,
    addItem,
    updateItem,
    updateCategory,
    deleteItem,
    refetch,
  } = useOutline(projectId);

  const lieuxCategory = categories.find(
    (c) => c.name && c.name.trim().toLowerCase() === CATEGORY_NAME.toLowerCase()
  );
  const lieux = lieuxCategory
    ? getItemsForCategory(lieuxCategory._id)
    : [];

  const [selectedId, setSelectedId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [formImportance, setFormImportance] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formContexte, setFormContexte] = useState('');
  const [formImages, setFormImages] = useState([]);
  const [formImageIndex, setFormImageIndex] = useState(0);
  const [formImageInput, setFormImageInput] = useState('');
  const [modalDelete, setModalDelete] = useState(false);
  const [modalEditImportance, setModalEditImportance] = useState(false);
  const [importanceOptionsEdit, setImportanceOptionsEdit] = useState([]);
  const deleteTargetRef = useRef(null);

  const importanceOptions = lieuxCategory?.importanceOptions ?? DEFAULT_IMPORTANCE_OPTIONS;

  const isNew = selectedId === MODE_NEW;
  const selectedLieu = selectedId && selectedId !== MODE_NEW
    ? lieux.find((l) => l._id === selectedId)
    : null;

  const currentImage = formImages.length
    ? (formImages[formImageIndex] ?? formImages[0])
    : null;

  useEffect(() => {
    if (isNew) {
      setFormName('');
      setFormType('');
      setFormImportance('');
      setFormDescription('');
      setFormContexte('');
      setFormImages([]);
      setFormImageIndex(0);
      setFormImageInput('');
    } else if (selectedLieu) {
      setFormName(selectedLieu.title ?? '');
      setFormType(selectedLieu.type ?? '');
      setFormImportance(selectedLieu.importance ?? '');
      setFormDescription(selectedLieu.summary ?? '');
      setFormContexte(selectedLieu.contexte ?? '');
      const imgs = Array.isArray(selectedLieu.images)
        ? selectedLieu.images
        : selectedLieu.image
          ? [selectedLieu.image]
          : [];
      setFormImages(imgs);
      setFormImageIndex(0);
      setFormImageInput('');
    }
  }, [selectedId, selectedLieu?._id, isNew]);

  const saveLieuImages = async (nextImages) => {
    if (!selectedLieu) return;
    const filtered = (nextImages ?? []).filter((u) => u && String(u).trim());
    await updateItem(selectedLieu._id, {
      title: formName.trim() || 'Sans nom',
      type: formType || undefined,
      importance: formImportance || undefined,
      summary: formDescription.trim() || undefined,
      contexte: formContexte.trim() || undefined,
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
      saveLieuImages(next);
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
    saveLieuImages(next);
  };

  const handleRemoveCurrentImage = () => {
    if (!formImages.length) return;
    const next = formImages.filter((_, i) => i !== formImageIndex);
    const newIndex = next.length ? Math.min(formImageIndex, next.length - 1) : 0;
    setFormImages(next);
    setFormImageIndex(newIndex);
    saveLieuImages(next);
  };

  const handlePrevImage = () => {
    setFormImageIndex((i) => (i > 0 ? i - 1 : formImages.length - 1));
  };

  const handleNextImage = () => {
    setFormImageIndex((i) => (i < formImages.length - 1 ? i + 1 : 0));
  };

  const selectLieu = (id) => {
    setSelectedId(id);
  };

  const ensureCategory = async () => {
    if (lieuxCategory) return lieuxCategory._id;
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
        type: formType || undefined,
        importance: formImportance || undefined,
        contexte: formContexte.trim() || undefined,
        images: formImages.filter((u) => u && String(u).trim()),
        image: formImages[0]?.trim() || undefined,
      });
      setSelectedId(itemId);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedLieu) return;
    await updateItem(selectedLieu._id, {
      title: formName.trim() || 'Sans nom',
      type: formType || undefined,
      importance: formImportance || undefined,
      summary: formDescription.trim(),
      contexte: formContexte.trim() || undefined,
      images: formImages.filter((u) => u && String(u).trim()),
      image: formImages[0]?.trim() || undefined,
    });
  };

  const openEditImportanceList = () => {
    setImportanceOptionsEdit((lieuxCategory?.importanceOptions ?? DEFAULT_IMPORTANCE_OPTIONS).map((o) => ({ ...o })));
    setModalEditImportance(true);
  };

  const submitEditImportanceList = () => {
    if (!lieuxCategory || !importanceOptionsEdit.length) return;
    updateCategory(lieuxCategory._id, { importanceOptions: importanceOptionsEdit });
    setModalEditImportance(false);
  };

  const addImportanceOption = () => {
    setImportanceOptionsEdit((prev) => [...prev, { value: `option_${Date.now()}`, label: 'Nouvelle option' }]);
  };

  const removeImportanceOption = (index) => {
    setImportanceOptionsEdit((prev) => prev.filter((_, i) => i !== index));
  };

  const updateImportanceOption = (index, key, val) => {
    setImportanceOptionsEdit((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: val };
      return next;
    });
  };

  const openDelete = (lieu) => {
    deleteTargetRef.current = lieu._id;
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

  if (loading) return <p className="outline-lieux__loading">Chargement…</p>;
  if (error) return <p className="outline-lieux__error">Erreur : {error.message}</p>;

  return (
    <div className="outline-lieux">
      <div className="outline-lieux__layout">
        <div className="outline-lieux__left">
          <aside className="outline-lieux__sidebar">
            <div className="outline-lieux__sidebar-header">
              <div className="outline-lieux__sidebar-title">Lieux</div>
              <button
                type="button"
                className="outline-lieux__sidebar-action"
                onClick={() => {
                  ensureCategory().then(() => selectLieu(MODE_NEW));
                }}
                disabled={!lieuxCategory}
              >
                + Ajouter
              </button>
            </div>
            {!lieuxCategory ? (
              <div className="outline-lieux__sidebar-empty">
                <p>Aucune catégorie « Lieux ».</p>
                <button
                  type="button"
                  className="outline-lieux__btn-create-cat"
                  onClick={ensureCategory}
                >
                  Créer la catégorie
                </button>
              </div>
            ) : lieux.length === 0 ? (
              <div className="outline-lieux__sidebar-empty">
                <p>Aucun lieu.</p>
              </div>
            ) : (
              <div className="outline-lieux__list">
                {lieux.map((lieu) => (
                  <button
                    key={lieu._id}
                    type="button"
                    className={`outline-lieux__list-item ${selectedId === lieu._id ? 'outline-lieux__list-item--active' : ''}`}
                    onClick={() => selectLieu(lieu._id)}
                  >
                    <span className="outline-lieux__list-name">
                      {lieu.title || 'Sans nom'}
                    </span>
                    <div className="outline-lieux__list-meta">
                      {lieu.type && (
                        <span className="outline-lieux__list-type">
                          {TYPE_OPTIONS.find((o) => o.value === lieu.type)?.label ?? lieu.type}
                        </span>
                      )}
                      {lieu.importance && (
                        <span className="outline-lieux__list-importance">
                          {importanceOptions.find((o) => o.value === lieu.importance)?.label ?? lieu.importance}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>
          {(isNew || selectedLieu) && (
            <div className="outline-lieux__portrait-block">
              <div className="outline-lieux__portrait-nav">
                <button
                  type="button"
                  className="outline-lieux__portrait-arrow"
                  onClick={handlePrevImage}
                  disabled={formImages.length <= 1}
                  aria-label="Image précédente"
                >
                  <span className="outline-lieux__portrait-arrow-icon" aria-hidden>‹</span>
                </button>
                <div className="outline-lieux__portrait">
                  {currentImage ? (
                    <img src={currentImage} alt="" className="outline-lieux__portrait-img" />
                  ) : (
                    <div className="outline-lieux__portrait-empty">Aucune image</div>
                  )}
                </div>
                <button
                  type="button"
                  className="outline-lieux__portrait-arrow"
                  onClick={handleNextImage}
                  disabled={formImages.length <= 1}
                  aria-label="Image suivante"
                >
                  <span className="outline-lieux__portrait-arrow-icon" aria-hidden>›</span>
                </button>
              </div>
              <div className="outline-lieux__portrait-field">
                <span className="outline-lieux__portrait-label">Image</span>
                <div className="outline-lieux__portrait-add">
                  <input
                    type="text"
                    className="outline-lieux__input outline-lieux__portrait-input"
                    value={formImageInput}
                    onChange={(e) => setFormImageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddImageUrl(e)}
                    placeholder="URL (Entrée pour ajouter)"
                  />
                  <button
                    type="button"
                    className="outline-lieux__btn outline-lieux__btn--danger outline-lieux__portrait-add-btn"
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
                  className="outline-lieux__file outline-lieux__portrait-file"
                  onChange={handleImageFile}
                  aria-label="Choisir un fichier image"
                />
                {formImages.length > 1 && (
                  <span className="outline-lieux__portrait-counter">
                    {formImageIndex + 1} / {formImages.length}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="outline-lieux__main">
          {!lieuxCategory ? (
            <div className="outline-lieux__editor-empty">
              Créez la catégorie « Lieux » dans la liste à gauche pour commencer.
            </div>
          ) : isNew ? (
            <div className="outline-lieux__editor">
              <h2 className="outline-lieux__editor-title">Nouveau lieu</h2>
              <form className="outline-lieux__form" onSubmit={handleCreate} noValidate>
                <label className="outline-lieux__field">
                  <span className="outline-lieux__field-label">Nom</span>
                  <input
                    type="text"
                    className="outline-lieux__input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nom du lieu"
                  />
                </label>
                <label className="outline-lieux__field">
                  <span className="outline-lieux__field-label">Type</span>
                  <select
                    className="outline-lieux__select"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    aria-label="Type de lieu"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value || 'empty'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="outline-lieux__field">
                  <span className="outline-lieux__field-label">
                    Importance
                    {lieuxCategory && (
                      <button
                        type="button"
                        className="outline-lieux__field-edit-list"
                        onClick={openEditImportanceList}
                        aria-label="Modifier la liste"
                      >
                        Modifier la liste
                      </button>
                    )}
                  </span>
                  <select
                    className="outline-lieux__select"
                    value={formImportance}
                    onChange={(e) => setFormImportance(e.target.value)}
                    aria-label="Importance"
                  >
                    <option value="">— Choisir —</option>
                    {importanceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="outline-lieux__field">
                  <span className="outline-lieux__field-label">Description</span>
                  <textarea
                    className="outline-lieux__input outline-lieux__textarea"
                    rows={8}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Description du lieu…"
                  />
                </label>
                <label className="outline-lieux__field">
                  <span className="outline-lieux__field-label">Contexte</span>
                  <textarea
                    className="outline-lieux__input outline-lieux__textarea"
                    rows={4}
                    value={formContexte}
                    onChange={(e) => setFormContexte(e.target.value)}
                    placeholder="Rôle dans l'histoire…"
                  />
                </label>
                <div className="outline-lieux__form-actions">
                  <button type="submit" className="outline-lieux__btn outline-lieux__btn--primary">
                    Créer
                  </button>
                  <button
                    type="button"
                    className="outline-lieux__btn outline-lieux__btn--secondary"
                    onClick={() => setSelectedId(null)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          ) : selectedLieu ? (
            <div className="outline-lieux__editor">
              <div className="outline-lieux__editor-header">
                <h2 className="outline-lieux__editor-title">Fiche lieu</h2>
                <button
                  type="button"
                  className="outline-lieux__btn outline-lieux__btn--danger"
                  onClick={() => openDelete(selectedLieu)}
                >
                  Supprimer
                </button>
              </div>
              <form className="outline-lieux__form" onSubmit={handleSave} noValidate>
                <label className="outline-lieux__field">
                  <span className="outline-lieux__field-label">Nom</span>
                  <input
                    type="text"
                    className="outline-lieux__input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nom du lieu"
                  />
                </label>
                <label className="outline-lieux__field">
                  <span className="outline-lieux__field-label">Type</span>
                  <select
                    className="outline-lieux__select"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    aria-label="Type de lieu"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value || 'empty'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="outline-lieux__field">
                  <span className="outline-lieux__field-label">
                    Importance
                    {lieuxCategory && (
                      <button
                        type="button"
                        className="outline-lieux__field-edit-list"
                        onClick={openEditImportanceList}
                        aria-label="Modifier la liste"
                      >
                        Modifier la liste
                      </button>
                    )}
                  </span>
                  <select
                    className="outline-lieux__select"
                    value={formImportance}
                    onChange={(e) => setFormImportance(e.target.value)}
                    aria-label="Importance"
                  >
                    <option value="">— Choisir —</option>
                    {importanceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="outline-lieux__field">
                  <span className="outline-lieux__field-label">Description</span>
                  <textarea
                    className="outline-lieux__input outline-lieux__textarea"
                    rows={8}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Description du lieu…"
                  />
                </label>
                <label className="outline-lieux__field">
                  <span className="outline-lieux__field-label">Contexte</span>
                  <textarea
                    className="outline-lieux__input outline-lieux__textarea"
                    rows={4}
                    value={formContexte}
                    onChange={(e) => setFormContexte(e.target.value)}
                    placeholder="Rôle dans l'histoire…"
                  />
                </label>
                <div className="outline-lieux__form-actions">
                  <button type="submit" className="outline-lieux__btn outline-lieux__btn--primary">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="outline-lieux__editor-empty">
              Sélectionnez un lieu à gauche pour l'éditer, ou « + Ajouter » pour en créer un.
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalDelete}
        onClose={() => setModalDelete(false)}
        title="Supprimer ce lieu ?"
      >
        <p className="modal__text">Cette fiche lieu sera définitivement supprimée.</p>
        <div className="modal__form-actions">
          <button type="button" className="modal__btn modal__btn--secondary" onClick={() => setModalDelete(false)}>
            Annuler
          </button>
          <button type="button" className="modal__btn modal__btn--danger" onClick={handleDeleteConfirm}>
            Supprimer
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modalEditImportance}
        onClose={() => setModalEditImportance(false)}
        title="Modifier la liste Importance"
      >
        <p className="modal__text">Ajoutez, supprimez ou renommez les options pour les fiches lieux.</p>
        <div className="outline-lieux__importance-edit">
          {importanceOptionsEdit.map((opt, index) => (
            <div key={`${opt.value}-${index}`} className="outline-lieux__importance-edit-row">
              <input
                type="text"
                className="modal__input outline-lieux__importance-edit-label"
                value={opt.label}
                onChange={(e) => updateImportanceOption(index, 'label', e.target.value)}
                placeholder="Libellé"
                aria-label="Libellé"
              />
              <button
                type="button"
                className="modal__btn modal__btn--danger outline-lieux__importance-edit-remove"
                onClick={() => removeImportanceOption(index)}
                aria-label="Supprimer"
                disabled={importanceOptionsEdit.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="outline-lieux__importance-edit-add modal__btn modal__btn--secondary"
            onClick={addImportanceOption}
          >
            + Ajouter une option
          </button>
        </div>
        <div className="modal__form-actions">
          <button type="button" className="modal__btn modal__btn--secondary" onClick={() => setModalEditImportance(false)}>
            Annuler
          </button>
          <button type="button" className="modal__btn modal__btn--primary" onClick={submitEditImportanceList}>
            Enregistrer
          </button>
        </div>
      </Modal>
    </div>
  );
}
