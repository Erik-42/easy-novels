import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};
import { CurrentProjectProvider } from './contexts/CurrentProject';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import Library from './components/Library/Library';
import BookView from './components/BookView/BookView';
import './App.css';

function App() {
  return (
    <CurrentProjectProvider>
      <BrowserRouter future={routerFuture}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="library" element={<Library />} />
            <Route path="book/:projectId/:view?" element={<BookView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CurrentProjectProvider>
  );
}

export default App;
