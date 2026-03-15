import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useOutline } from '../../hooks/useOutline';
import { DEFAULT_OUTLINE_CATEGORY_FIELDS } from '../../services/db/schema';
import Modal from '../Modal/Modal';
import './OutlineCategory.css';

export default function OutlineCategory({ projectId, categoryId }) {
  const {
    categories,
    getItemsForCategory,
    loading,
    error,
    updateCategory,
    addItem,
    updateItem,
    deleteItem,
  } = useOutline(projectId);

  const category = useMemo(
    () => categories.find((c) => c._id === categoryId) ?? null,
    [categories, categoryId]
  );
  const items = categoryId ? getItemsForCategory(categoryId) : [];
  const currentFields = useMemo(
    () => (category?.fields?.length ? category.fields : DEFAULT_OUTLINE_CATEGORY_FIELDS),
    [category?.fields, category?._id]
  );

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [modalAddItem, setModalAddItem] = useState(false);
  const [modalDeleteItem, setModalDeleteItem] = useState(false);
  const [modalEditFields, setModalEditFields] = useState(false);
  const [fieldsEdit, setFieldsEdit] = useState([]);
  const [promptValue, setPromptValue] = useState('');
  const saveTimeoutRef = useRef(null);

  const selectedItem = items.find((i) => i._id === selectedItemId) ?? null;

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

  useEffect(() => {
    if (selectedItem && currentFields.length) {
      syncEditFromItem(selectedItem, currentFields);
    }
  }, [selectedItemId, selectedItem?._id, currentFields, syncEditFromItem]);

  const handleFieldChange = (fieldId, value) => {
    setEditValues((prev) => ({ ...prev, [fieldId]: value }));
    if (!selectedItemId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateItem(selectedItemId, { [fieldId]: value });
    }, 400);
  };

  const openEditFields = () => {
    setFieldsEdit((category?.fields ?? DEFAULT_OUTLINE_CATEGORY_FIELDS).map((f) => ({ ...f })));
    setModalEditFields(true);
  };

  const submitEditFields = () => {
    if (!categoryId || !fieldsEdit.length) return;
    updateCategory(categoryId, { fields: fieldsEdit });
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

  const openAddItem = () => {
    setPromptValue('Nouvelle fiche');
    setModalAddItem(true);
  };

  const submitAddItem = (e) => {
    e.preventDefault();
    const title = promptValue.trim() || 'Nouvelle fiche';
    if (!categoryId) return;
    addItem(categoryId, title).then((newId) => {
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

  const selectItem = (item) => {
    setSelectedItemId(item._id);
    syncEditFromItem(item, currentFields);
  };

  if (loading) return <p className="outline-category__loading">Chargement…</p>;
  if (error) return <p className="outline-category__error">Erreur : {error.message}</p>;
  if (!category) return <p className="outline-category__error">Catégorie introuvable.</p>;

  return (
    <div className="outline-category">
      <div className="outline-category__layout">
        <div className="outline-category__left">
          <aside className="outline-category__sidebar">
            <div className="outline-category__sidebar-header">
              <div className="outline-category__sidebar-title">{category.name}</div>
              <button
                type="button"
                className="outline-category__sidebar-action"
                onClick={openAddItem}
              >
                + Ajouter
              </button>
            </div>
            {items.length === 0 ? (
              <div className="outline-category__sidebar-empty">
                <p>Aucune fiche.</p>
              </div>
            ) : (
              <div className="outline-category__list">
                {items.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    className={`outline-category__list-item ${selectedItemId === item._id ? 'outline-category__list-item--active' : ''}`}
                    onClick={() => selectItem(item)}
                  >
                    <span className="outline-category__list-name">
                      {currentFields[0] ? (item[currentFields[0].id] || 'Sans titre') : (item.title || 'Sans titre')}
                    </span>
                    {currentFields[1] && (
                      <span className="outline-category__list-meta">
                        {(item[currentFields[1].id] || '').toString().slice(0, 60)}
                        {(item[currentFields[1].id] || '').length > 60 ? '…' : ''}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>

        <div className="outline-category__main">
          <div className="outline-category__main-header">
            <h2 className="outline-category__main-title">{category.name}</h2>
            <div className="outline-category__main-actions">
              <button
                type="button"
                className="outline-category__btn outline-category__btn--secondary"
                onClick={openEditFields}
              >
                Modifier les champs
              </button>
            </div>
          </div>

          <div className="outline-category__content">
            {selectedItem ? (
              <>
                <div className="outline-category__editor-header">
                  <div className="outline-category__editor-title">Éditer la fiche</div>
                  <button
                    type="button"
                    className="outline-category__btn outline-category__btn--danger"
                    onClick={openDeleteItem}
                  >
                    Supprimer
                  </button>
                </div>
                <div className="outline-category__form">
                  {currentFields.map((field) => (
                    <label key={field.id} className="outline-category__field">
                      <span className="outline-category__field-label">{field.label}</span>
                      {field.type === 'textarea' ? (
                        <textarea
                          className="outline-category__input outline-category__textarea"
                          rows={6}
                          value={editValues[field.id] ?? ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          aria-label={field.label}
                        />
                      ) : (
                        <input
                          type="text"
                          className="outline-category__input"
                          value={editValues[field.id] ?? ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          aria-label={field.label}
                        />
                      )}
                    </label>
                  ))}
                </div>
                <p className="outline-category__hint">Les changements sont sauvegardés automatiquement.</p>
              </>
            ) : (
              <div className="outline-category__editor-empty">
                Sélectionnez une fiche à gauche pour l'éditer, ou cliquez sur « + Ajouter » pour en créer une.
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalAddItem}
        onClose={() => setModalAddItem(false)}
        title="Nouvelle fiche"
      >
        <form className="modal__form" onSubmit={submitAddItem} noValidate>
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
        title="Modifier les champs"
      >
        <p className="modal__text">
          Définissez les champs affichés pour chaque fiche. Le premier champ sert de titre dans la liste.
        </p>
        <div className="outline-category__fields-edit">
          {fieldsEdit.map((field, index) => (
            <div key={`${field.id}-${index}`} className="outline-category__fields-edit-row">
              <input
                type="text"
                className="modal__input outline-category__fields-edit-label"
                value={field.label}
                onChange={(e) => updateFieldEdit(index, 'label', e.target.value)}
                placeholder="Libellé"
                aria-label="Libellé du champ"
              />
              <select
                className="outline-category__fields-edit-type"
                value={field.type}
                onChange={(e) => updateFieldEdit(index, 'type', e.target.value)}
                aria-label="Type du champ"
              >
                <option value="text">Texte court</option>
                <option value="textarea">Texte long</option>
              </select>
              <button
                type="button"
                className="modal__btn modal__btn--danger outline-category__fields-edit-remove"
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
            className="outline-category__fields-edit-add modal__btn modal__btn--secondary"
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
    </div>
  );
}
