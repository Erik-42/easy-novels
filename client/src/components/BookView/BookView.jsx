import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { useCurrentProject } from '../../contexts/CurrentProject';
import { getDb } from '../../services/db/pouch';
import { PROJECT_STATUS_LABELS } from '../../services/db/schema';
import Outline from '../Outline/Outline';
import Modal from '../Modal/Modal';
import './BookView.css';

const VIEWS = ['outline', 'writing', 'organize', 'schedule', 'notes', 'documents'];

function BookViewHeader({ title, status, onEditTitle, showEditTitle }) {
  const label = PROJECT_STATUS_LABELS[status] ?? 'À faire';
  const statusKey = status === 'draft' ? 'first_draft' : (status || 'todo');
  const statusClass = `book-view__status--${statusKey}`;
  return (
    <header className="book-view__header">
      <span className={`book-view__status ${statusClass}`}>{label}</span>
      <h1 className="book-view__title">{title}</h1>
      {showEditTitle && (
        <button
          type="button"
          className="book-view__edit-title"
          onClick={onEditTitle}
          aria-label="Modifier le titre du roman"
        >
          Modifier le titre
        </button>
      )}
    </header>
  );
}

export default function BookView() {
  const { projectId, view } = useParams();
  const [searchParams] = useSearchParams();
  const { currentProject, loading, loadProject } = useCurrentProject();
  const validView = VIEWS.includes(view) ? view : 'outline';
  const sub = searchParams.get('sub');
  const showEditTitle = validView === 'outline' && sub === 'general';
  const [editTitleOpen, setEditTitleOpen] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');

  useEffect(() => {
    loadProject(projectId);
  }, [projectId, loadProject]);

  const openEditTitle = () => {
    setEditTitleValue(currentProject?.title ?? '');
    setEditTitleOpen(true);
  };

  const closeEditTitle = () => setEditTitleOpen(false);

  const handleEditTitleSubmit = async (e) => {
    e.preventDefault();
    const title = editTitleValue.trim() || currentProject?.title;
    if (!title || !projectId) return;
    try {
      const db = await getDb();
      const doc = await db.get(projectId);
      await db.put({
        ...doc,
        title,
        updatedAt: new Date().toISOString(),
      });
      await loadProject(projectId);
      closeEditTitle();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Chargement du projet…</p>;
  if (!currentProject) return <Navigate to="/library" replace />;

  const status = currentProject.status ?? 'todo';

  return (
    <section className="book-view">
      <BookViewHeader
        title={currentProject.title}
        status={status}
        onEditTitle={openEditTitle}
        showEditTitle={showEditTitle}
      />
      <div className="book-view__body">
        {validView === 'outline' ? (
          <Outline projectId={projectId} />
        ) : (
          <>
            <p className="book-view__view-label">Vue : {validView}</p>
            <p className="book-view__placeholder">
              Module « {validView} » à implémenter (Phase 1.6 et suivantes).
            </p>
          </>
        )}
      </div>

      <Modal
        isOpen={editTitleOpen}
        onClose={closeEditTitle}
        title="Modifier le titre du roman"
      >
        <form className="modal__form" onSubmit={handleEditTitleSubmit} noValidate>
          <input
            type="text"
            className="modal__input"
            value={editTitleValue}
            onChange={(e) => setEditTitleValue(e.target.value)}
            placeholder="Titre du roman"
            autoFocus
            aria-label="Titre du roman"
          />
          <div className="modal__form-actions">
            <button
              type="button"
              className="modal__btn modal__btn--secondary"
              onClick={closeEditTitle}
            >
              Annuler
            </button>
            <button type="submit" className="modal__btn modal__btn--primary">
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
