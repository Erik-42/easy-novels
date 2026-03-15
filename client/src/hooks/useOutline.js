import { useState, useEffect, useCallback, useRef } from 'react';
import { getDb } from '../services/db/pouch';
import {
  createOutlineCategoryPayload,
  createOutlineItemPayload,
} from '../services/db/schema';

/**
 * Charge les catégories et fiches d'esquisse pour un projet (PouchDB).
 * Expose CRUD et liste ordonnée.
 */
export function useOutline(projectId) {
  const [project, setProject] = useState(null);
  const [categories, setCategories] = useState([]);
  const [itemsMap, setItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const saveTimeoutRef = useRef(null);

  const fetchOutline = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      setCategories([]);
      setItemsMap({});
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const db = await getDb();
      const [projRes, catRes, itemRes] = await Promise.all([
        db.get(projectId).catch(() => null),
        db.allDocs({
          include_docs: true,
          startkey: 'outlineCategory_',
          endkey: 'outlineCategory_\uffff',
        }),
        db.allDocs({
          include_docs: true,
          startkey: 'outlineItem_',
          endkey: 'outlineItem_\uffff',
        }),
      ]);

      const projectDoc = projRes && projRes.type === 'project' ? projRes : null;
      const categoryDocs = (catRes?.rows || [])
        .map((r) => r.doc)
        .filter((d) => d && d.projectId === projectId);
      const itemDocs = (itemRes?.rows || [])
        .map((r) => r.doc)
        .filter((d) => d && d.projectId === projectId);

      const ids = projectDoc?.outlineCategoryIds ?? [];
      const orderMap = new Map(ids.map((id, i) => [id, i]));
      categoryDocs.sort((a, b) => {
        const oa = orderMap.has(a._id) ? orderMap.get(a._id) : 999;
        const ob = orderMap.has(b._id) ? orderMap.get(b._id) : 999;
        return oa !== ob ? oa - ob : (a.order ?? 0) - (b.order ?? 0);
      });

      const map = {};
      itemDocs.forEach((d) => {
        map[d._id] = d;
      });

      setProject(projectDoc);
      setCategories(categoryDocs);
      setItemsMap(map);
    } catch (e) {
      setError(e);
      setCategories([]);
      setItemsMap({});
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchOutline();
  }, [fetchOutline]);

  const getItemsForCategory = useCallback(
    (categoryId) => {
      const cat = categories.find((c) => c._id === categoryId);
      if (!cat || !Array.isArray(cat.itemIds)) return [];
      return (cat.itemIds || [])
        .map((id) => itemsMap[id])
        .filter(Boolean);
    },
    [categories, itemsMap]
  );

  const addCategory = useCallback(
    async (name) => {
      if (!projectId || !name?.trim()) return null;
      const db = await getDb();
      const projectDoc = await db.get(projectId);
      const order = (projectDoc.outlineCategoryIds ?? []).length;
      const categoryDoc = createOutlineCategoryPayload({
        projectId,
        name: name.trim(),
        order,
      });
      await db.put(categoryDoc);
      const nextIds = [...(projectDoc.outlineCategoryIds ?? []), categoryDoc._id];
      await db.put({
        ...projectDoc,
        outlineCategoryIds: nextIds,
        updatedAt: new Date().toISOString(),
      });
      await fetchOutline();
      return categoryDoc._id;
    },
    [projectId, fetchOutline]
  );

  const renameCategory = useCallback(
    async (categoryId, name) => {
      if (!name?.trim()) return;
      const db = await getDb();
      const doc = await db.get(categoryId);
      await db.put({
        ...doc,
        name: name.trim(),
        updatedAt: new Date().toISOString(),
      });
      await fetchOutline();
    },
    [fetchOutline]
  );

  const deleteCategory = useCallback(
    async (categoryId) => {
      const db = await getDb();
      const projectDoc = await db.get(projectId);
      const categoryDoc = await db.get(categoryId);
      const itemIds = categoryDoc.itemIds ?? [];
      for (const id of itemIds) {
        try {
          const item = await db.get(id);
          await db.remove(item);
        } catch (_) {}
      }
      await db.remove(categoryDoc);
      const nextIds = (projectDoc.outlineCategoryIds ?? []).filter(
        (id) => id !== categoryId
      );
      await db.put({
        ...projectDoc,
        outlineCategoryIds: nextIds,
        updatedAt: new Date().toISOString(),
      });
      await fetchOutline();
    },
    [projectId, fetchOutline]
  );

  const updateCategory = useCallback(
    async (categoryId, patch) => {
      if (!categoryId || !patch) return;
      const db = await getDb();
      const doc = await db.get(categoryId);
      await db.put({
        ...doc,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      await fetchOutline();
    },
    [fetchOutline]
  );

  const addItem = useCallback(
    async (categoryId, title) => {
      if (!projectId || !categoryId) return;
      const db = await getDb();
      const categoryDoc = await db.get(categoryId);
      const itemDoc = createOutlineItemPayload({
        projectId,
        categoryId,
        title: title?.trim() || 'Nouvelle fiche',
      });
      await db.put(itemDoc);
      const nextItemIds = [itemDoc._id, ...(categoryDoc.itemIds ?? [])];
      await db.put({
        ...categoryDoc,
        itemIds: nextItemIds,
        updatedAt: new Date().toISOString(),
      });
      await fetchOutline();
      return itemDoc._id;
    },
    [projectId, fetchOutline]
  );

  const updateItem = useCallback(
    async (itemId, patch) => {
      if (!itemId || !patch) return;
      const db = await getDb();
      const doc = await db.get(itemId);
      const updated = {
        ...doc,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      await db.put(updated);
      setItemsMap((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }));
    },
    []
  );

  const deleteItem = useCallback(
    async (itemId) => {
      const db = await getDb();
      const itemDoc = await db.get(itemId);
      const categoryId = itemDoc.categoryId;
      const categoryDoc = await db.get(categoryId);
      await db.remove(itemDoc);
      const nextItemIds = (categoryDoc.itemIds ?? []).filter((id) => id !== itemId);
      await db.put({
        ...categoryDoc,
        itemIds: nextItemIds,
        updatedAt: new Date().toISOString(),
      });
      await fetchOutline();
    },
    [fetchOutline]
  );

  return {
    project,
    categories,
    itemsMap,
    getItemsForCategory,
    loading,
    error,
    refetch: fetchOutline,
    addCategory,
    renameCategory,
    deleteCategory,
    updateCategory,
    addItem,
    updateItem,
    deleteItem,
  };
}
