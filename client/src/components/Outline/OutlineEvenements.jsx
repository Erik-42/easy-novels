import { useState, useEffect, useRef } from 'react';
import { useOutline } from '../../hooks/useOutline';
import Modal from '../Modal/Modal';
import './OutlineEvenements.css';

const CATEGORY_NAME = 'Événements';
const MODE_NEW = 'new';

const TYPE_OPTIONS = [
  { value: '', label: '— Choisir —' },
  { value: 'bataille', label: 'Bataille' },
  { value: 'mariage', label: 'Mariage' },
  { value: 'reunion', label: 'Réunion' },
  { value: 'voyage', label: 'Voyage' },
  { value: 'decouverte', label: 'Découverte' },
  { value: 'mort', label: 'Mort' },
  { value: 'naissance', label: 'Naissance' },
  { value: 'fete', label: 'Fête' },
  { value: 'autre', label: 'Autre' },
];

const DEFAULT_IMPORTANCE_OPTIONS = [
  { value: 'important', label: 'Important' },
  { value: 'mineur', label: 'Mineur' },
  { value: 'secondaire', label: 'Secondaire' },
  { value: 'autre', label: 'Autre' },
  { value: 'principal', label: 'Principal' },
];

export default function OutlineEvenements({ projectId }) {
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

  const evenementsCategory = categories.find(
    (c) => c.name && c.name.trim().toLowerCase() === CATEGORY_NAME.toLowerCase()
  );
  const personnagesCategory = categories.find(
    (c) => c.name && c.name.trim().toLowerCase() === 'personnages'
  );
  const events = evenementsCategory
    ? getItemsForCategory(evenementsCategory._id)
    : [];
  const personnages = personnagesCategory
    ? getItemsForCategory(personnagesCategory._id)
    : [];

  const [selectedId, setSelectedId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formLieu, setFormLieu] = useState('');
  const [formImportance, setFormImportance] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formContexte, setFormContexte] = useState('');
  const [formPersonnageIds, setFormPersonnageIds] = useState([]);
  const [formImages, setFormImages] = useState([]);
  const [formImageIndex, setFormImageIndex] = useState(0);
  const [formImageInput, setFormImageInput] = useState('');
  const [modalDelete, setModalDelete] = useState(false);
  const [modalEditImportance, setModalEditImportance] = useState(false);
  const [importanceOptionsEdit, setImportanceOptionsEdit] = useState([]);
  const deleteTargetRef = useRef(null);

  const importanceOptions = evenementsCategory?.importanceOptions ?? DEFAULT_IMPORTANCE_OPTIONS;

  const isNew = selectedId === MODE_NEW;
  const selectedEvent = selectedId && selectedId !== MODE_NEW
    ? events.find((e) => e._id === selectedId)
    : null;

  const currentImage = formImages.length
    ? (formImages[formImageIndex] ?? formImages[0])
    : null;

  useEffect(() => {
    if (isNew) {
      setFormName('');
      setFormType('');
      setFormDate('');
      setFormLieu('');
      setFormImportance('');
      setFormDescription('');
      setFormContexte('');
      setFormPersonnageIds([]);
      setFormImages([]);
      setFormImageIndex(0);
      setFormImageInput('');
    } else if (selectedEvent) {
      setFormName(selectedEvent.title ?? '');
      setFormType(selectedEvent.type ?? '');
      setFormDate(selectedEvent.date ?? '');
      setFormLieu(selectedEvent.lieu ?? '');
      setFormImportance(selectedEvent.importance ?? '');
      setFormDescription(selectedEvent.summary ?? '');
      setFormContexte(selectedEvent.contexte ?? '');
      setFormPersonnageIds(Array.isArray(selectedEvent.personnageIds) ? selectedEvent.personnageIds : []);
      const imgs = Array.isArray(selectedEvent.images)
        ? selectedEvent.images
        : selectedEvent.image
          ? [selectedEvent.image]
          : [];
      setFormImages(imgs);
      setFormImageIndex(0);
      setFormImageInput('');
    }
  }, [selectedId, selectedEvent?._id, isNew]);

  const saveEventImages = async (nextImages) => {
    if (!selectedEvent) return;
    const filtered = (nextImages ?? []).filter((u) => u && String(u).trim());
    await updateItem(selectedEvent._id, {
      title: formName.trim() || 'Sans nom',
      type: formType || undefined,
      date: formDate.trim() || undefined,
      lieu: formLieu.trim() || undefined,
      importance: formImportance || undefined,
      summary: formDescription.trim() || undefined,
      contexte: formContexte.trim() || undefined,
      personnageIds: formPersonnageIds.filter(Boolean),
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
      saveEventImages(next);
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
    saveEventImages(next);
  };

  const handleRemoveCurrentImage = () => {
    if (!formImages.length) return;
    const next = formImages.filter((_, i) => i !== formImageIndex);
    const newIndex = next.length ? Math.min(formImageIndex, next.length - 1) : 0;
    setFormImages(next);
    setFormImageIndex(newIndex);
    saveEventImages(next);
  };

  const handlePrevImage = () => {
    setFormImageIndex((i) => (i > 0 ? i - 1 : formImages.length - 1));
  };

  const handleNextImage = () => {
    setFormImageIndex((i) => (i < formImages.length - 1 ? i + 1 : 0));
  };

  const selectEvent = (id) => {
    setSelectedId(id);
  };

  const ensureCategory = async () => {
    if (evenementsCategory) return evenementsCategory._id;
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
        date: formDate.trim() || undefined,
        lieu: formLieu.trim() || undefined,
        importance: formImportance || undefined,
        contexte: formContexte.trim() || undefined,
        personnageIds: formPersonnageIds.filter(Boolean),
        images: formImages.filter((u) => u && String(u).trim()),
        image: formImages[0]?.trim() || undefined,
      });
      setSelectedId(itemId);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    await updateItem(selectedEvent._id, {
      title: formName.trim() || 'Sans nom',
      type: formType || undefined,
      date: formDate.trim() || undefined,
      lieu: formLieu.trim() || undefined,
      importance: formImportance || undefined,
      summary: formDescription.trim(),
      contexte: formContexte.trim() || undefined,
      personnageIds: formPersonnageIds.filter(Boolean),
      images: formImages.filter((u) => u && String(u).trim()),
      image: formImages[0]?.trim() || undefined,
    });
  };

  const openEditImportanceList = () => {
    setImportanceOptionsEdit((evenementsCategory?.importanceOptions ?? DEFAULT_IMPORTANCE_OPTIONS).map((o) => ({ ...o })));
    setModalEditImportance(true);
  };

  const submitEditImportanceList = () => {
    if (!evenementsCategory || !importanceOptionsEdit.length) return;
    updateCategory(evenementsCategory._id, { importanceOptions: importanceOptionsEdit });
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

  const openDelete = (event) => {
    deleteTargetRef.current = event._id;
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

  if (loading) return <p className="outline-evenements__loading">Chargement…</p>;
  if (error) return <p className="outline-evenements__error">Erreur : {error.message}</p>;

  return (
    <div className="outline-evenements">
      <div className="outline-evenements__layout">
        <div className="outline-evenements__left">
          <aside className="outline-evenements__sidebar">
            <div className="outline-evenements__sidebar-header">
              <div className="outline-evenements__sidebar-title">Événements</div>
              <button
                type="button"
                className="outline-evenements__sidebar-action"
                onClick={() => {
                  ensureCategory().then(() => selectEvent(MODE_NEW));
                }}
                disabled={!evenementsCategory}
              >
                + Ajouter
              </button>
            </div>
            {!evenementsCategory ? (
              <div className="outline-evenements__sidebar-empty">
                <p>Aucune catégorie « Événements ».</p>
                <button
                  type="button"
                  className="outline-evenements__btn-create-cat"
                  onClick={ensureCategory}
                >
                  Créer la catégorie
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="outline-evenements__sidebar-empty">
                <p>Aucun événement.</p>
              </div>
            ) : (
              <div className="outline-evenements__list">
                {events.map((event) => (
                  <button
                    key={event._id}
                    type="button"
                    className={`outline-evenements__list-item ${selectedId === event._id ? 'outline-evenements__list-item--active' : ''}`}
                    onClick={() => selectEvent(event._id)}
                  >
                    <span className="outline-evenements__list-name">
                      {event.title || 'Sans nom'}
                    </span>
                    <div className="outline-evenements__list-meta">
                      {event.type && (
                        <span className="outline-evenements__list-type">
                          {TYPE_OPTIONS.find((o) => o.value === event.type)?.label ?? event.type}
                        </span>
                      )}
                      {event.date && (
                        <span className="outline-evenements__list-date">{event.date}</span>
                      )}
                      {event.importance && (
                        <span className="outline-evenements__list-importance">
                          {importanceOptions.find((o) => o.value === event.importance)?.label ?? event.importance}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>
          {(isNew || selectedEvent) && (
            <div className="outline-evenements__portrait-block">
              <div className="outline-evenements__portrait-nav">
                <button
                  type="button"
                  className="outline-evenements__portrait-arrow"
                  onClick={handlePrevImage}
                  disabled={formImages.length <= 1}
                  aria-label="Image précédente"
                >
                  <span className="outline-evenements__portrait-arrow-icon" aria-hidden>‹</span>
                </button>
                <div className="outline-evenements__portrait">
                  {currentImage ? (
                    <img src={currentImage} alt="" className="outline-evenements__portrait-img" />
                  ) : (
                    <div className="outline-evenements__portrait-empty">Aucune image</div>
                  )}
                </div>
                <button
                  type="button"
                  className="outline-evenements__portrait-arrow"
                  onClick={handleNextImage}
                  disabled={formImages.length <= 1}
                  aria-label="Image suivante"
                >
                  <span className="outline-evenements__portrait-arrow-icon" aria-hidden>›</span>
                </button>
              </div>
              <div className="outline-evenements__portrait-field">
                <span className="outline-evenements__portrait-label">Image</span>
                <div className="outline-evenements__portrait-add">
                  <input
                    type="text"
                    className="outline-evenements__input outline-evenements__portrait-input"
                    value={formImageInput}
                    onChange={(e) => setFormImageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddImageUrl(e)}
                    placeholder="URL de l'image (Entrée pour ajouter)"
                  />
                  <button
                    type="button"
                    className="outline-evenements__btn outline-evenements__btn--danger outline-evenements__portrait-add-btn"
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
                  className="outline-evenements__file outline-evenements__portrait-file"
                  onChange={handleImageFile}
                  aria-label="Choisir un fichier image"
                />
                {formImages.length > 1 && (
                  <span className="outline-evenements__portrait-counter">
                    {formImageIndex + 1} / {formImages.length}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="outline-evenements__main">
          {!evenementsCategory ? (
            <div className="outline-evenements__editor-empty">
              Créez la catégorie « Événements » dans la liste à gauche pour commencer.
            </div>
          ) : isNew ? (
            <div className="outline-evenements__editor">
              <h2 className="outline-evenements__editor-title">Nouvel événement</h2>
              <form className="outline-evenements__form" onSubmit={handleCreate} noValidate>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Nom</span>
                  <input
                    type="text"
                    className="outline-evenements__input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nom de l'événement"
                  />
                </label>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Type</span>
                  <select
                    className="outline-evenements__select"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    aria-label="Type d'événement"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value || 'empty'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Date</span>
                  <input
                    type="text"
                    className="outline-evenements__input"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="Ex. 15 mars 1429, printemps 1920…"
                  />
                </label>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Lieu</span>
                  <input
                    type="text"
                    className="outline-evenements__input"
                    value={formLieu}
                    onChange={(e) => setFormLieu(e.target.value)}
                    placeholder="Lieu de l'événement"
                  />
                </label>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">
                    Importance
                    {evenementsCategory && (
                      <button
                        type="button"
                        className="outline-evenements__field-edit-list"
                        onClick={openEditImportanceList}
                        aria-label="Modifier la liste des options"
                      >
                        Modifier la liste
                      </button>
                    )}
                  </span>
                  <select
                    className="outline-evenements__select"
                    value={formImportance}
                    onChange={(e) => setFormImportance(e.target.value)}
                    aria-label="Importance de l'événement"
                  >
                    <option value="">— Choisir —</option>
                    {importanceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Personnages impliqués</span>
                  {personnages.length === 0 ? (
                    <p className="outline-evenements__personnages-empty">Aucun personnage dans le projet.</p>
                  ) : (
                    <select
                      multiple
                      size={5}
                      value={formPersonnageIds}
                      onChange={(e) => setFormPersonnageIds(Array.from(e.target.selectedOptions, (o) => o.value))}
                      className="outline-evenements__personnages-select"
                      aria-label="Personnages impliqués (Ctrl+Clic pour plusieurs)"
                    >
                      {personnages.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title || p.name || 'Sans nom'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Description</span>
                  <textarea
                    className="outline-evenements__input outline-evenements__textarea"
                    rows={8}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Déroulement, acteurs, conséquences…"
                  />
                </label>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Contexte</span>
                  <textarea
                    className="outline-evenements__input outline-evenements__textarea"
                    rows={4}
                    value={formContexte}
                    onChange={(e) => setFormContexte(e.target.value)}
                    placeholder="Rôle dans l'histoire, liens avec les personnages…"
                  />
                </label>
                <div className="outline-evenements__form-actions">
                  <button type="submit" className="outline-evenements__btn outline-evenements__btn--primary">
                    Créer
                  </button>
                  <button
                    type="button"
                    className="outline-evenements__btn outline-evenements__btn--secondary"
                    onClick={() => setSelectedId(null)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          ) : selectedEvent ? (
            <div className="outline-evenements__editor">
              <div className="outline-evenements__editor-header">
                <h2 className="outline-evenements__editor-title">Fiche événement</h2>
                <button
                  type="button"
                  className="outline-evenements__btn outline-evenements__btn--danger"
                  onClick={() => openDelete(selectedEvent)}
                >
                  Supprimer
                </button>
              </div>
              <form className="outline-evenements__form" onSubmit={handleSave} noValidate>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Nom</span>
                  <input
                    type="text"
                    className="outline-evenements__input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nom de l'événement"
                  />
                </label>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Type</span>
                  <select
                    className="outline-evenements__select"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    aria-label="Type d'événement"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value || 'empty'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Date</span>
                  <input
                    type="text"
                    className="outline-evenements__input"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="Ex. 15 mars 1429, printemps 1920…"
                  />
                </label>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Lieu</span>
                  <input
                    type="text"
                    className="outline-evenements__input"
                    value={formLieu}
                    onChange={(e) => setFormLieu(e.target.value)}
                    placeholder="Lieu de l'événement"
                  />
                </label>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">
                    Importance
                    {evenementsCategory && (
                      <button
                        type="button"
                        className="outline-evenements__field-edit-list"
                        onClick={openEditImportanceList}
                        aria-label="Modifier la liste des options"
                      >
                        Modifier la liste
                      </button>
                    )}
                  </span>
                  <select
                    className="outline-evenements__select"
                    value={formImportance}
                    onChange={(e) => setFormImportance(e.target.value)}
                    aria-label="Importance de l'événement"
                  >
                    <option value="">— Choisir —</option>
                    {importanceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Personnages impliqués</span>
                  {personnages.length === 0 ? (
                    <p className="outline-evenements__personnages-empty">Aucun personnage dans le projet.</p>
                  ) : (
                    <select
                      multiple
                      size={5}
                      value={formPersonnageIds}
                      onChange={(e) => setFormPersonnageIds(Array.from(e.target.selectedOptions, (o) => o.value))}
                      className="outline-evenements__personnages-select"
                      aria-label="Personnages impliqués (Ctrl+Clic pour plusieurs)"
                    >
                      {personnages.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title || p.name || 'Sans nom'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Description</span>
                  <textarea
                    className="outline-evenements__input outline-evenements__textarea"
                    rows={8}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Déroulement, acteurs, conséquences…"
                  />
                </label>
                <label className="outline-evenements__field">
                  <span className="outline-evenements__field-label">Contexte</span>
                  <textarea
                    className="outline-evenements__input outline-evenements__textarea"
                    rows={4}
                    value={formContexte}
                    onChange={(e) => setFormContexte(e.target.value)}
                    placeholder="Rôle dans l'histoire, liens avec les personnages…"
                  />
                </label>
                <div className="outline-evenements__form-actions">
                  <button type="submit" className="outline-evenements__btn outline-evenements__btn--primary">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="outline-evenements__editor-empty">
              Sélectionnez un événement à gauche pour l'éditer, ou cliquez sur « + Ajouter » pour en créer un.
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalDelete}
        onClose={() => setModalDelete(false)}
        title="Supprimer cet événement ?"
      >
        <p className="modal__text">Cette fiche événement sera définitivement supprimée.</p>
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
        <p className="modal__text">
          Ajoutez, supprimez ou renommez les options de la liste « Importance » pour les fiches événements.
        </p>
        <div className="outline-evenements__importance-edit">
          {importanceOptionsEdit.map((opt, index) => (
            <div key={`${opt.value}-${index}`} className="outline-evenements__importance-edit-row">
              <input
                type="text"
                className="modal__input outline-evenements__importance-edit-label"
                value={opt.label}
                onChange={(e) => updateImportanceOption(index, 'label', e.target.value)}
                placeholder="Libellé"
                aria-label="Libellé de l'option"
              />
              <button
                type="button"
                className="modal__btn modal__btn--danger outline-evenements__importance-edit-remove"
                onClick={() => removeImportanceOption(index)}
                aria-label="Supprimer cette option"
                disabled={importanceOptionsEdit.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="outline-evenements__importance-edit-add modal__btn modal__btn--secondary"
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
