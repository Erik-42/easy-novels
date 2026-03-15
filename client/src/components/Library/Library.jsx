import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { getDb } from '../../services/db/pouch';
import { createProjectPayload } from '../../services/db/schema';
import Modal from '../Modal/Modal';
import './Library.css';

const DEFAULT_TITLE = 'Nouveau roman';

export default function Library() {
  const { projects, loading, error, refetch } = useProjects();
  const [creating, setCreating] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(DEFAULT_TITLE);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(1);
  const [deleting, setDeleting] = useState(false);

  const openCreateModal = () => {
    setNewTitle(DEFAULT_TITLE);
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const title = newTitle.trim() || DEFAULT_TITLE;
    setCreating(true);
    closeCreateModal();
    try {
      const db = await getDb();
      const doc = createProjectPayload({ title });
      await db.put(doc);
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const openDeleteModal = (project) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteConfirmStep(1);
  };

  const closeDeleteModal = () => {
    if (!deleting) {
      setProjectToDelete(null);
      setDeleteConfirmStep(1);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      const db = await getDb();
      await db.remove(projectToDelete._id, projectToDelete._rev);
      refetch();
      closeDeleteModal();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="library__loading">Chargement…</p>;
  if (error) return <p className="library__error">Erreur : {error.message}</p>;

  return (
    <section className="library">
      <header className="library__header">
        <h2 className="library__headline">Bibliothèque</h2>
        <button
          type="button"
          className="library__btn library__btn--primary"
          onClick={openCreateModal}
          disabled={creating}
        >
          {creating ? 'Création…' : '+ Nouveau roman'}
        </button>
      </header>
      <div className="library__grid">
        {projects.length === 0 ? (
          <p className="library__empty">Aucun roman. Cliquez sur « + Nouveau roman » pour commencer.</p>
        ) : (
          projects.map((p) => (
            <article key={p._id} className="library__card">
              <h3 className="library__card-title">{p.title}</h3>
              <p className="library__card-meta">
                Objectif : {(p.stats?.wordGoal ?? 0).toLocaleString('fr-FR')} mots
              </p>
              <div className="library__card-actions">
                <Link to={`/book/${p._id}/outline`} className="library__card-link">
                  Ouvrir
                </Link>
                <button
                  type="button"
                  className="library__card-btn library__card-btn--danger"
                  onClick={openDeleteModal(p)}
                  aria-label={`Supprimer ${p.title}`}
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <Modal
        isOpen={createModalOpen}
        onClose={closeCreateModal}
        title="Titre du roman"
      >
        <form
          className="modal__form"
          onSubmit={handleCreateSubmit}
          noValidate
        >
          <input
            type="text"
            className="modal__input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={DEFAULT_TITLE}
            autoFocus
            aria-label="Titre du roman"
          />
          <div className="modal__form-actions">
            <button
              type="button"
              className="modal__btn modal__btn--secondary"
              onClick={closeCreateModal}
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
        isOpen={Boolean(projectToDelete)}
        onClose={closeDeleteModal}
        title={deleteConfirmStep === 1 ? 'Supprimer ce roman ?' : 'Dernière confirmation'}
      >
        {projectToDelete && deleteConfirmStep === 1 && (
          <>
            <p className="modal__text">
              « {projectToDelete.title} » sera définitivement supprimé. Voulez-vous continuer ?
            </p>
            <div className="modal__form-actions">
              <button
                type="button"
                className="modal__btn modal__btn--secondary"
                onClick={closeDeleteModal}
              >
                Annuler
              </button>
              <button
                type="button"
                className="modal__btn modal__btn--primary"
                onClick={() => setDeleteConfirmStep(2)}
              >
                Continuer
              </button>
            </div>
          </>
        )}
        {projectToDelete && deleteConfirmStep === 2 && (
          <>
            <p className="modal__text">
              Supprimer définitivement « {projectToDelete.title} » ? Cette action est irréversible.
            </p>
            <div className="modal__form-actions">
              <button
                type="button"
                className="modal__btn modal__btn--secondary"
                onClick={() => setDeleteConfirmStep(1)}
                disabled={deleting}
              >
                Retour
              </button>
              <button
                type="button"
                className="modal__btn modal__btn--danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
