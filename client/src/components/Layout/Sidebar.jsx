import { Link, useParams, useLocation } from 'react-router-dom';

const SECTION_NAV = [
  { path: '/', label: 'Accueil' },
  { path: '/library', label: 'Bibliothèque' },
];

const BOOK_NAV = [
  { view: 'outline', label: 'Esquisser', subItems: [{ sub: 'personnages', label: 'Personnages' }] },
  { view: 'writing', label: 'Écrire' },
  { view: 'organize', label: 'Organiser' },
  { view: 'schedule', label: 'Programmer' },
  { view: 'notes', label: 'Notes' },
  { view: 'documents', label: 'Documents' },
];

export default function Sidebar() {
  const { projectId } = useParams();
  const location = useLocation();
  const isBook = Boolean(projectId);
  const searchParams = new URLSearchParams(location.search);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isBookViewActive = (view) => location.pathname === `/book/${projectId}/${view}`;
  const isOutlineWithSub = (sub) =>
    isBookViewActive('outline') && searchParams.get('sub') === sub;

  return (
    <nav className="sidebar">
      <div className="sidebar__brand">
        <Link to="/" className="sidebar__title">Easy-Novels</Link>
        <div className="sidebar__subtitle">V2 — React + PouchDB</div>
      </div>
      <div className="sidebar__nav">
        <div className="sidebar__label">Sections</div>
        {SECTION_NAV.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`sidebar__item ${isActive(path) ? 'active' : ''}`}
          >
            {label}
          </Link>
        ))}
        {isBook && BOOK_NAV.map(({ view, label, subItems }) => (
          <div key={view} className="sidebar__group">
            <Link
              to={`/book/${projectId}/${view}`}
              className={`sidebar__item ${isBookViewActive(view) ? 'active' : ''}`}
            >
              {label}
            </Link>
            {subItems && isBookViewActive(view) && (
              <div className="sidebar__sub">
                {subItems.map(({ sub, label: subLabel }) => (
                  <Link
                    key={sub}
                    to={`/book/${projectId}/${view}?sub=${sub}`}
                    className={`sidebar__item sidebar__item--sub ${isOutlineWithSub(sub) ? 'active' : ''}`}
                  >
                    {subLabel}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
