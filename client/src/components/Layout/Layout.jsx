import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MenuBar from './MenuBar';
import AboutModal from '../AboutModal/AboutModal';
import './Layout.css';
import './Sidebar.css';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="layout">
      {!isHome && (
        <header className="layout__menubar">
          <MenuBar onAboutClick={() => setAboutOpen(true)} />
        </header>
      )}
      <div className="layout__content">
        <aside className="layout__sidebar">
          <Sidebar />
        </aside>
        <main className="layout__main">
          <Outlet />
        </main>
      </div>
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
