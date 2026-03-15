import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuBar.css';

const MENUS = [
  {
    label: 'Fichier',
    items: [
      { id: 'new', label: 'Nouveau roman', path: '/library' },
      { id: 'library', label: 'Bibliothèque', path: '/library' },
    ],
  },
  {
    label: 'Édition',
    items: [
      { id: 'undo', label: 'Annuler', shortcut: 'Ctrl+Z', disabled: true },
      { id: 'redo', label: 'Rétablir', shortcut: 'Ctrl+Y', disabled: true },
    ],
  },
  {
    label: 'Aide',
    items: [
      { id: 'about', label: 'À propos' },
    ],
  },
];

function MenuBar({ onAboutClick }) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const barRef = useRef(null);

  useEffect(() => {
    if (openMenu === null) return;
    const handleClickOutside = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  const handleItemClick = (item) => {
    if (item.disabled) return;
    if (item.path) {
      navigate(item.path);
    } else if (item.id === 'about' && onAboutClick) {
      onAboutClick();
    }
    setOpenMenu(null);
  };

  return (
    <div className="menubar" ref={barRef} role="menubar">
      {MENUS.map((menu) => (
        <div key={menu.label} className="menubar__item">
          <button
            type="button"
            className="menubar__trigger"
            onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
            aria-haspopup="true"
            aria-expanded={openMenu === menu.label}
            aria-controls={`menubar-${menu.label}`}
            id={`menubar-trigger-${menu.label}`}
          >
            {menu.label}
          </button>
          {openMenu === menu.label && (
            <div
              id={`menubar-${menu.label}`}
              className="menubar__dropdown"
              role="menu"
              aria-labelledby={`menubar-trigger-${menu.label}`}
            >
              {menu.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className="menubar__option"
                  disabled={item.disabled}
                  onClick={() => handleItemClick(item)}
                >
                  <span className="menubar__option-label">{item.label}</span>
                  {item.shortcut && (
                    <span className="menubar__option-shortcut">{item.shortcut}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default MenuBar;
