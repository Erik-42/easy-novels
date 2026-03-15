import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOutline } from '../../hooks/useOutline';
import Modal from '../Modal/Modal';
import OutlinePersonnages from './OutlinePersonnages';
import './Outline.css';

const SUBMODULE_FICHES = 'fiches';
const SUBMODULE_PERSONNAGES = 'personnages';

export default function Outline({ projectId }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const subFromUrl = searchParams.get('sub') === SUBMODULE_PERSONNAGES ? SUBMODULE_PERSONNAGES : SUBMODULE_FICHES;
  const [subModule, setSubModule] = useState(subFromUrl);

  useEffect(() => {
    setSubModule(subFromUrl);
  }, [subFromUrl]);

  const {
    categories,
    getItemsForCategory,
    loading,
    error,
    addCategory,
    renameCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem,
  } = useOutline(projectId);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');

  const [modalAddCategory, setModalAddCategory] = useState(false);
  const [modalRenameCategory, setModalRenameCategory] = useState(false);
  const [modalDeleteCategory, setModalDeleteCategory] = useState(false);
  const [modalAddItem, setModalAddItem] = useState(false);
  const [modalDeleteItem, setModalDeleteItem] = useState(false);

  const [promptValue, setPromptValue] = useState('');
  const saveTimeoutRef = useRef(null);

  const selectedCategory = categories.find((c) => c._id === selectedCategoryId) ?? categories[0] ?? null;
  const effectiveCategoryId = selectedCategory?._id ?? selectedCategoryId;
  const items = effectiveCategoryId ? getItemsForCategory(effectiveCategoryId) : [];
  const selectedItem = items.find((i) => i._id === selectedItemId) ?? null;

  useEffect(() => {
    if (categories.length && !selectedCategoryId) {
      setSelectedCategoryId(categories[0]._id);
    }
    if (categories.length && selectedCategoryId && !categories.find((c) => c._id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0]._id);
      setSelectedItemId(null);
    }
  }, [categories, selectedCategoryId]);

  const syncEditFromItem = useCallback((item) => {
    if (!item) {
      setEditTitle('');
      setEditSummary('');
      return;
    }
    setEditTitle(item.title ?? '');
    setEditSummary(item.summary ?? '');
  }, []);

  const selectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedItemId(null);
    syncEditFromItem(null);
  };

  const selectItem = (item) => {
    setSelectedItemId(item._id);
    syncEditFromItem(item);
  };

  const handleTitleChange = (value) => {
    setEditTitle(value);
    if (!selectedItemId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateItem(selectedItemId, { title: value });
    }, 400);
  };

  const handleSummaryChange = (value) => {
    setEditSummary(value);
    if (!selectedItemId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateItem(selectedItemId, { summary: value });
    }, 400);
  };

  const openAddCategory = () => {
    setPromptValue('Nouvelle catégorie');
    setModalAddCategory(true);
  };

  const submitAddCategory = () => {
    const name = promptValue.trim() || 'Nouvelle catégorie';
    addCategory(name).then((newCategoryId) => {
      setModalAddCategory(false);
      if (newCategoryId) setSelectedCategoryId(newCategoryId);
    });
  };

  const openRenameCategory = () => {
    setPromptValue(selectedCategory?.name ?? '');
    setModalRenameCategory(true);
  };

  const submitRenameCategory = () => {
    const name = promptValue.trim();
    if (name && effectiveCategoryId) {
      renameCategory(effectiveCategoryId, name);
      setModalRenameCategory(false);
    }
  };

  const openDeleteCategory = () => setModalDeleteCategory(true);

  const submitDeleteCategory = () => {
    if (effectiveCategoryId) {
      deleteCategory(effectiveCategoryId);
      setModalDeleteCategory(false);
      setSelectedCategoryId(categories[0]?._id ?? null);
      setSelectedItemId(null);
    }
  };

  const openAddItem = () => {
    setPromptValue('Nouvelle fiche');
    setModalAddItem(true);
  };

  const submitAddItem = () => {
    const title = promptValue.trim() || 'Nouvelle fiche';
    addItem(effectiveCategoryId, title).then((newId) => {
      setModalAddItem(false);
      setSelectedItemId(newId);
      const newItem = { _id: newId, title, summary: '' };
      syncEditFromItem(newItem);
    });
  };

  const openDeleteItem = () => setModalDeleteItem(true);

  const submitDeleteItem = () => {
    if (selectedItemId) {
      deleteItem(selectedItemId);
      setModalDeleteItem(false);
      setSelectedItemId(null);
      syncEditFromItem(null);
    }
  };

  if (loading) return <p className="outline__loading">Chargement…</p>;
  if (error) return <p className="outline__error">Erreur : {error.message}</p>;

  return (
    <section className="outline">
      <nav className="outline__subnav" aria-label="Sous-modules Esquisser">
        <button
          type="button"
          className={`outline__subnav-btn ${subModule === SUBMODULE_FICHES ? 'outline__subnav-btn--active' : ''}`}
          onClick={() => {
            setSubModule(SUBMODULE_FICHES);
            setSearchParams({});
          }}
        >
          Fiches par catégorie
        </button>
        <button
          type="button"
          className={`outline__subnav-btn ${subModule === SUBMODULE_PERSONNAGES ? 'outline__subnav-btn--active' : ''}`}
          onClick={() => {
            setSubModule(SUBMODULE_PERSONNAGES);
            setSearchParams({ sub: SUBMODULE_PERSONNAGES });
          }}
        >
          Personnages
        </button>
      </nav>

      {subModule === SUBMODULE_PERSONNAGES ? (
        <OutlinePersonnages projectId={projectId} />
      ) : (
      <div className="outline__layout">
        <aside className="outline__sidebar">
          <div className="outline__sidebar-header">
            <div className="outline__sidebar-title">Catégories</div>
            <button
              type="button"
              className="outline__sidebar-action"
              onClick={openAddCategory}
            >
              + Catégorie
            </button>
          </div>
          <div className="outline__categories">
            {categories.map((c) => (
              <button
                key={c._id}
                type="button"
                className={`outline__category ${c._id === effectiveCategoryId ? 'outline__category--active' : ''}`}
                onClick={() => selectCategory(c._id)}
              >
                <span className="outline__category-name">{c.name}</span>
                <span className="outline__category-count">
                  {(c.itemIds ?? []).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="outline__main">
          <div className="outline__main-header">
            <div>
              <div className="outline__main-title">
                {selectedCategory ? selectedCategory.name : 'Aucune catégorie'}
              </div>
              <div className="outline__main-subtitle">
                Fiches d’esquisse pour ce roman
              </div>
            </div>
            <div className="outline__main-actions">
              <button
                type="button"
                className="outline__main-button"
                onClick={openAddItem}
                disabled={!effectiveCategoryId}
              >
                + Fiche
              </button>
              <button
                type="button"
                className="outline__main-button"
                onClick={openRenameCategory}
                disabled={!effectiveCategoryId}
              >
                Renommer
              </button>
              <button
                type="button"
                className="outline__main-button outline__main-button--danger"
                onClick={openDeleteCategory}
                disabled={!effectiveCategoryId}
              >
                Supprimer
              </button>
            </div>
          </div>

          <div className="outline__content">
            <div className="outline__items">
              {items.length
                ? items.map((i) => (
                    <button
                      key={i._id}
                      type="button"
                      className={`outline__item ${i._id === selectedItemId ? 'outline__item--active' : ''}`}
                      onClick={() => selectItem(i)}
                    >
                      <div className="outline__item-title">{i.title || 'Sans titre'}</div>
                      <div className="outline__item-subtitle">
                        {i.summary ? i.summary : 'Sans synopsis'}
                      </div>
                    </button>
                  ))
                : (
                    <div className="outline__empty">
                      Aucune fiche dans cette catégorie.
                    </div>
                  )}
            </div>

            <div className="outline__editor">
              {selectedItem ? (
                <>
                  <div className="outline__editor-header">
                    <div className="outline__editor-title">Éditer la fiche</div>
                    <button
                      type="button"
                      className="outline__editor-delete"
                      onClick={openDeleteItem}
                    >
                      Supprimer
                    </button>
                  </div>
                  <label className="outline__field">
                    <span className="outline__field-label">Titre</span>
                    <input
                      type="text"
                      className="outline__field-input"
                      value={editTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      aria-label="Titre de la fiche"
                    />
                  </label>
                  <label className="outline__field">
                    <span className="outline__field-label">Synopsis</span>
                    <textarea
                      className="outline__field-textarea"
                      rows={6}
                      value={editSummary}
                      onChange={(e) => handleSummaryChange(e.target.value)}
                      aria-label="Synopsis"
                    />
                  </label>
                  <div className="outline__editor-hint">
                    Les changements sont sauvegardés automatiquement.
                  </div>
                </>
              ) : (
                <div className="outline__editor-empty">
                  Sélectionnez une fiche à gauche pour l’éditer.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      <Modal
        isOpen={modalAddCategory}
        onClose={() => setModalAddCategory(false)}
        title="Nouvelle catégorie"
      >
        <form
          className="modal__form"
          onSubmit={(e) => {
            e.preventDefault();
            submitAddCategory();
          }}
        >
          <input
            type="text"
            className="modal__input"
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            placeholder="Nom de la catégorie"
            autoFocus
            aria-label="Nom"
          />
          <div className="modal__form-actions">
            <button
              type="button"
              className="modal__btn modal__btn--secondary"
              onClick={() => setModalAddCategory(false)}
            >
              Annuler
            </button>
            <button type="submit" className="modal__btn modal__btn--primary">
              Créer
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalRenameCategory}
        onClose={() => setModalRenameCategory(false)}
        title="Renommer la catégorie"
      >
        <form
          className="modal__form"
          onSubmit={(e) => {
            e.preventDefault();
            submitRenameCategory();
          }}
        >
          <input
            type="text"
            className="modal__input"
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            placeholder="Nouveau nom"
            autoFocus
            aria-label="Nouveau nom"
          />
          <div className="modal__form-actions">
            <button
              type="button"
              className="modal__btn modal__btn--secondary"
              onClick={() => setModalRenameCategory(false)}
            >
              Annuler
            </button>
            <button type="submit" className="modal__btn modal__btn--primary">
              Renommer
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalDeleteCategory}
        onClose={() => setModalDeleteCategory(false)}
        title="Supprimer la catégorie"
      >
        <p className="modal__text">
          Supprimer la catégorie et toutes ses fiches ?
        </p>
        <div className="modal__form-actions">
          <button
            type="button"
            className="modal__btn modal__btn--secondary"
            onClick={() => setModalDeleteCategory(false)}
          >
            Annuler
          </button>
          <button
            type="button"
            className="modal__btn modal__btn--danger"
            onClick={submitDeleteCategory}
          >
            Supprimer
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modalAddItem}
        onClose={() => setModalAddItem(false)}
        title="Nouvelle fiche"
      >
        <form
          className="modal__form"
          onSubmit={(e) => {
            e.preventDefault();
            submitAddItem();
          }}
        >
          <input
            type="text"
            className="modal__input"
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            placeholder="Titre de la fiche"
            autoFocus
            aria-label="Titre"
          />
          <div className="modal__form-actions">
            <button
              type="button"
              className="modal__btn modal__btn--secondary"
              onClick={() => setModalAddItem(false)}
            >
              Annuler
            </button>
            <button type="submit" className="modal__btn modal__btn--primary">
              Créer
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalDeleteItem}
        onClose={() => setModalDeleteItem(false)}
        title="Supprimer la fiche"
      >
        <p className="modal__text">Supprimer cette fiche ?</p>
        <div className="modal__form-actions">
          <button
            type="button"
            className="modal__btn modal__btn--secondary"
            onClick={() => setModalDeleteItem(false)}
          >
            Annuler
          </button>
          <button
            type="button"
            className="modal__btn modal__btn--danger"
            onClick={submitDeleteItem}
          >
            Supprimer
          </button>
        </div>
      </Modal>
    </section>
  );
}
