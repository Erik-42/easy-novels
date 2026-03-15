import Modal from '../Modal/Modal';
import './AboutModal.css';

const APP_NAME = 'Easy-Novels';
const VERSION = '2.0.0';

export default function AboutModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="À propos">
      <div className="about-modal">
        <p className="about-modal__name">{APP_NAME}</p>
        <p className="about-modal__version">Version {VERSION}</p>
        <p className="about-modal__description">
          Application offline-first pour écrire des romans : esquisses, rédaction,
          structure et objectifs.
        </p>
        <p className="about-modal__tech">
          Réalisée avec React, Vite et PouchDB.
        </p>
      </div>
    </Modal>
  );
}
