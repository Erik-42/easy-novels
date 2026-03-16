import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOutline } from '../../hooks/useOutline';
import { DEFAULT_OUTLINE_CATEGORY_FIELDS } from '../../services/db/schema';
import Modal from '../Modal/Modal';
import OutlinePersonnages from './OutlinePersonnages';
import OutlineLieux from './OutlineLieux';
import OutlineEvenements from './OutlineEvenements';
import OutlineCategory from './OutlineCategory';
import './Outline.css';

const SUBMODULE_FICHES = 'fiches';
const SUBMODULE_PERSONNAGES = 'personnages';
const SUBMODULE_LIEUX = 'lieux';
const SUBMODULE_EVENEMENTS = 'evenements';
const FIXED_SUBS = [SUBMODULE_FICHES, SUBMODULE_PERSONNAGES, SUBMODULE_LIEUX, SUBMODULE_EVENEMENTS];

/** Catégories réservées (sous-modules Personnages, Lieux, Événements) : non supprimables. */
const PROTECTED_CATEGORY_NAMES = ['personnages', 'lieux', 'evenements', 'événements'];

function isProtectedCategory(category) {
  if (!category?.name) return false;
  const norm = category.name.trim().toLowerCase();
  return PROTECTED_CATEGORY_NAMES.includes(norm);
}

export default function Outline({ projectId }) {
  const [searchParams] = useSearchParams();
  const subParam = searchParams.get('sub');
  const subFromUrl =
    subParam === SUBMODULE_PERSONNAGES ? SUBMODULE_PERSONNAGES
    : subParam === SUBMODULE_LIEUX ? SUBMODULE_LIEUX
    : subParam === SUBMODULE_EVENEMENTS ? SUBMODULE_EVENEMENTS
    : SUBMODULE_FICHES;
  const [subModule, setSubModule] = useState(subFromUrl);

  const {
    categories,
    getItemsForCategory,
    loading,
    error,
    addCategory,
    renameCategory,
    deleteCategory,
    updateCategory,
    addItem,
    updateItem,
    deleteItem,
  } = useOutline(projectId);

  const isCategorySub =
    subParam &&
    !FIXED_SUBS.includes(subParam) &&
    categories.some((c) => c._id === subParam);

  useEffect(() => {
    if (FIXED_SUBS.includes(subParam)) {
      setSubModule(subParam);
    } else if (subParam && categories.some((c) => c._id === subParam)) {
      setSubModule(subParam);
    } else {
      setSubModule(subParam === SUBMODULE_FICHES ? SUBMODULE_FICHES : subFromUrl);
    }
  }, [subParam, subFromUrl, categories]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const [modalAddCategory, setModalAddCategory] = useState(false);
  const [modalRenameCategory, setModalRenameCategory] = useState(false);
  const [modalDeleteCategory, setModalDeleteCategory] = useState(false);
  const [modalAddItem, setModalAddItem] = useState(false);
  const [modalDeleteItem, setModalDeleteItem] = useState(false);
  const [modalEditFields, setModalEditFields] = useState(false);
  const [fieldsEdit, setFieldsEdit] = useState([]);

  const [promptValue, setPromptValue] = useState('');
  const saveTimeoutRef = useRef(null);

  const selectedCategory = categories.find((c) => c._id === selectedCategoryId) ?? categories[0] ?? null;
  const effectiveCategoryId = selectedCategory?._id ?? selectedCategoryId;
  const items = effectiveCategoryId ? getItemsForCategory(effectiveCategoryId) : [];
  const selectedItem = items.find((i) => i._id === selectedItemId) ?? null;
  const currentFields = useMemo(
    () => (selectedCategory?.fields?.length ? selectedCategory.fields : DEFAULT_OUTLINE_CATEGORY_FIELDS),
    [selectedCategory?.fields, selectedCategory?._id]
  );

  useEffect(() => {
    if (categories.length && !selectedCategoryId) {
      setSelectedCategoryId(categories[0]._id);
    }
    if (categories.length && selectedCategoryId && !categories.find((c) => c._id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0]._id);
      setSelectedItemId(null);
    }
  }, [categories, selectedCategoryId]);

  const syncEditFromItem = useCallback((item, fields) => {
    if (!item) {
      setEditValues({});
      return;
    }
    const f = fields ?? DEFAULT_OUTLINE_CATEGORY_FIELDS;
    const next = {};
    f.forEach((field) => {
      next[field.id] = item[field.id] ?? '';
    });
    setEditValues(next);
  }, []);

  const selectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedItemId(null);
    syncEditFromItem(null);
  };

  const selectItem = (item) => {
    setSelectedItemId(item._id);
    syncEditFromItem(item, currentFields);
  };

  useEffect(() => {
    if (selectedItem && currentFields.length) {
      syncEditFromItem(selectedItem, currentFields);
    }
  }, [selectedItemId, effectiveCategoryId, currentFields, syncEditFromItem]);

  const handleFieldChange = (fieldId, value) => {
    setEditValues((prev) => ({ ...prev, [fieldId]: value }));
    if (!selectedItemId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateItem(selectedItemId, { [fieldId]: value });
    }, 400);
  };

  const openEditFields = () => {
    setFieldsEdit((selectedCategory?.fields ?? DEFAULT_OUTLINE_CATEGORY_FIELDS).map((f) => ({ ...f })));
    setModalEditFields(true);
  };

  const submitEditFields = () => {
    if (!effectiveCategoryId || !fieldsEdit.length) return;
    updateCategory(effectiveCategoryId, { fields: fieldsEdit });
    setModalEditFields(false);
  };

  const addFieldEdit = () => {
    setFieldsEdit((prev) => [...prev, { id: `field_${Date.now()}`, label: 'Nouveau champ', type: 'text' }]);
  };

  const removeFieldEdit = (index) => {
    setFieldsEdit((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFieldEdit = (index, key, value) => {
    setFieldsEdit((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
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
    if (effectiveCategoryId && !isProtectedCategory(selectedCategory)) {
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
      const initial = {};
      currentFields.forEach((f) => {
        initial[f.id] = f.id === 'title' ? title : '';
      });
      updateItem(newId, initial);
      syncEditFromItem({ _id: newId, ...initial }, currentFields);
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
      {subModule === SUBMODULE_PERSONNAGES ? (
        <OutlinePersonnages projectId={projectId} />
      ) : subModule === SUBMODULE_LIEUX ? (
        <OutlineLieux projectId={projectId} />
      ) : subModule === SUBMODULE_EVENEMENTS ? (
        <OutlineEvenements projectId={projectId} />
      ) : isCategorySub ? (
        <OutlineCategory projectId={projectId} categoryId={subParam} />
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
                onClick={openEditFields}
                disabled={!effectiveCategoryId}
              >
                Modifier les champs
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
                disabled={!effectiveCategoryId || isProtectedCategory(selectedCategory)}
                title={isProtectedCategory(selectedCategory) ? 'Cette catégorie ne peut pas être supprimée' : undefined}
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
                      <div className="outline__item-title">
                        {currentFields[0] ? (i[currentFields[0].id] || 'Sans titre') : (i.title || 'Sans titre')}
                      </div>
                      <div className="outline__item-subtitle">
                        {currentFields[1] ? (i[currentFields[1].id] || '') : (i.summary || 'Sans synopsis')}
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
                  {currentFields.map((field) => (
                    <label key={field.id} className="outline__field">
                      <span className="outline__field-label">{field.label}</span>
                      {field.type === 'textarea' ? (
                        <textarea
                          className="outline__field-textarea"
                          rows={6}
                          value={editValues[field.id] ?? ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          aria-label={field.label}
                        />
                      ) : (
                        <input
                          type="text"
                          className="outline__field-input"
                          value={editValues[field.id] ?? ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          aria-label={field.label}
                        />
                      )}
                    </label>
                  ))}
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

      <Modal
        isOpen={modalEditFields}
        onClose={() => setModalEditFields(false)}
        title="Modifier les champs de la catégorie"
      >
        <p className="modal__text">
          Définissez les champs affichés pour chaque fiche de cette catégorie. Le premier champ sert de titre dans la liste.
        </p>
        <div className="outline__fields-edit">
          {fieldsEdit.map((field, index) => (
            <div key={`${field.id}-${index}`} className="outline__fields-edit-row">
              <input
                type="text"
                className="modal__input outline__fields-edit-label"
                value={field.label}
                onChange={(e) => updateFieldEdit(index, 'label', e.target.value)}
                placeholder="Libellé"
                aria-label="Libellé du champ"
              />
              <select
                className="outline__fields-edit-type"
                value={field.type}
                onChange={(e) => updateFieldEdit(index, 'type', e.target.value)}
                aria-label="Type du champ"
              >
                <option value="text">Texte court</option>
                <option value="textarea">Texte long</option>
              </select>
              <button
                type="button"
                className="modal__btn modal__btn--danger outline__fields-edit-remove"
                onClick={() => removeFieldEdit(index)}
                aria-label="Supprimer ce champ"
                disabled={fieldsEdit.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="outline__fields-edit-add modal__btn modal__btn--secondary"
            onClick={addFieldEdit}
          >
            + Ajouter un champ
          </button>
        </div>
        <div className="modal__form-actions">
          <button
            type="button"
            className="modal__btn modal__btn--secondary"
            onClick={() => setModalEditFields(false)}
          >
            Annuler
          </button>
          <button
            type="button"
            className="modal__btn modal__btn--primary"
            onClick={submitEditFields}
          >
            Enregistrer
          </button>
        </div>
      </Modal>
    </section>
  );
}
