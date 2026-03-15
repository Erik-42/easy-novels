import { useEffect } from 'react';
import './Modal.css';

/**
 * Modale réutilisable. Contenu et actions passés en enfants.
 * @param {boolean} isOpen - Contrôle l'affichage
 * @param {function} onClose - Callback à la fermeture (clic overlay ou Escape)
 * @param {string} title - Titre de la modale
 * @param {React.ReactNode} children - Contenu (formulaires, texte, etc.)
 * @param {string} [ariaLabel] - Accessibilité (défaut: title)
 */
export default function Modal({ isOpen, onClose, title, children, ariaLabel }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title}
    >
      <div
        className="modal__backdrop"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Fermer"
      />
      <div className="modal__dialog">
        <header className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <span className="modal__close-icon" aria-hidden>×</span>
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
