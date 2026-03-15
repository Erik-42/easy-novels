import { useState, useEffect, useCallback, useRef } from 'react';
import { getDb } from '../services/db/pouch';

/**
 * Liste tous les projets (romans) depuis PouchDB.
 * Réagit aux changements via db.changes().
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const changesRef = useRef(null);

  const fetchProjects = useCallback(async () => {
    try {
      const db = await getDb();
      const result = await db.allDocs({
        include_docs: true,
        startkey: 'project_',
        endkey: 'project_\uffff',
      });
      const list = result.rows
        .map((row) => row.doc)
        .filter((doc) => doc.type === 'project')
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setProjects(list);
      setError(null);
    } catch (e) {
      setError(e);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const db = await getDb();
        if (cancelled) return;
        await fetchProjects();
        if (cancelled) return;
        changesRef.current = db
          .changes({
            live: true,
            since: 'now',
            filter: (doc) => doc.type === 'project',
          })
          .on('change', fetchProjects);
      } catch (e) {
        if (!cancelled) {
          setError(e);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (changesRef.current) {
        changesRef.current.cancel();
        changesRef.current = null;
      }
    };
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}
