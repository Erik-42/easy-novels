import { createContext, useContext, useState, useCallback } from 'react';
import { getDb } from '../services/db/pouch';

const CurrentProjectContext = createContext(null);

export function CurrentProjectProvider({ children }) {
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProject = useCallback(async (projectId) => {
    if (!projectId) {
      setCurrentProject(null);
      return;
    }
    setLoading(true);
    try {
      const db = await getDb();
      const doc = await db.get(projectId);
      if (doc && doc.type === 'project') {
        setCurrentProject(doc);
      } else {
        setCurrentProject(null);
      }
    } catch (e) {
      setCurrentProject(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProject = useCallback(() => {
    setCurrentProject(null);
  }, []);

  /** Met à jour le projet en contexte sans refetch (évite le flash "Chargement…"). */
  const updateCurrentProject = useCallback((patch) => {
    setCurrentProject((prev) => (prev && patch ? { ...prev, ...patch } : prev));
  }, []);

  const value = {
    currentProject,
    loading,
    loadProject,
    clearProject,
    updateCurrentProject,
  };

  return (
    <CurrentProjectContext.Provider value={value}>
      {children}
    </CurrentProjectContext.Provider>
  );
}

export function useCurrentProject() {
  const ctx = useContext(CurrentProjectContext);
  if (!ctx) throw new Error('useCurrentProject must be used within CurrentProjectProvider');
  return ctx;
}
