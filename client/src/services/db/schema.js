/**
 * Schéma et helpers pour les documents PouchDB — Easy-Novels V2.
 * Types : project, section, scene, outlineCategory, outlineItem, note, document, userSettings.
 */

export const DOC_TYPES = {
  PROJECT: 'project',
  SECTION: 'section',
  SCENE: 'scene',
  OUTLINE_CATEGORY: 'outlineCategory',
  OUTLINE_ITEM: 'outlineItem',
  NOTE: 'note',
  DOCUMENT: 'document',
  USER_SETTINGS: 'userSettings',
};

function nowIso() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

/** Statuts possibles du projet (roman). */
export const PROJECT_STATUS = {
  TODO: 'todo',
  FIRST_DRAFT: 'first_draft',
  REVISED: 'revised',
  DONE: 'done',
  PROOFREAD: 'proofread',
  APPROVED_REVIEW: 'approved_review',
};

/** Libellés affichés pour chaque statut. */
export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.TODO]: 'À faire',
  [PROJECT_STATUS.FIRST_DRAFT]: '1er brouillon',
  [PROJECT_STATUS.REVISED]: 'Révisé',
  [PROJECT_STATUS.DONE]: 'Fini',
  [PROJECT_STATUS.PROOFREAD]: 'Relecture',
  [PROJECT_STATUS.APPROVED_REVIEW]: 'Validé à revoir',
  draft: '1er brouillon', /* rétrocompat */
};

/** Créer un nouveau projet (roman). */
export function createProjectPayload({ title = 'Nouveau roman' }) {
  const projectId = id('project');
  return {
    _id: projectId,
    type: DOC_TYPES.PROJECT,
    title: title.trim() || 'Nouveau roman',
    status: PROJECT_STATUS.TODO,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    stats: {
      wordGoal: 50000,
      deadline: null,
      lastEditedSceneId: null,
    },
    structure: [],
    outlineCategoryIds: [],
  };
}

/** Créer une section (acte ou chapitre). */
export function createSectionPayload({ projectId, sectionType = 'chapter', title, parentId = null, order = 0 }) {
  const sectionId = id('section');
  const payload = {
    _id: sectionId,
    type: DOC_TYPES.SECTION,
    projectId,
    sectionType,
    title: title?.trim() || 'Sans titre',
    order,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  if (sectionType === 'chapter' || sectionType === 'section') {
    payload.parentId = parentId;
    payload.sceneIds = [];
  } else {
    payload.childIds = [];
  }
  return payload;
}

/** Créer une scène. */
export function createScenePayload({ projectId, sectionId, title = 'Nouvelle scène', order = 0 }) {
  const sceneId = id('scene');
  return {
    _id: sceneId,
    type: DOC_TYPES.SCENE,
    projectId,
    sectionId,
    title: title.trim() || 'Nouvelle scène',
    content: '',
    wordCount: 0,
    status: 'todo',
    order,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

/** Champs par défaut pour les fiches d'une catégorie (vue Fiches par catégorie). */
export const DEFAULT_OUTLINE_CATEGORY_FIELDS = [
  { id: 'title', label: 'Titre', type: 'text' },
  { id: 'summary', label: 'Synopsis', type: 'textarea' },
];

/** Créer une catégorie d'esquisse (avec sous-module par défaut : champs Titre + Synopsis). */
export function createOutlineCategoryPayload({ projectId, name, order = 0 }) {
  const categoryId = id('outlineCategory');
  return {
    _id: categoryId,
    type: DOC_TYPES.OUTLINE_CATEGORY,
    projectId,
    name: name?.trim() || 'Catégorie',
    order,
    itemIds: [],
    fields: DEFAULT_OUTLINE_CATEGORY_FIELDS.map((f) => ({ ...f })),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

/** Créer une fiche d'esquisse. */
export function createOutlineItemPayload({ projectId, categoryId, title = '', summary = '' }) {
  const itemId = id('outlineItem');
  return {
    _id: itemId,
    type: DOC_TYPES.OUTLINE_ITEM,
    projectId,
    categoryId,
    title: title?.trim() || 'Sans titre',
    summary: summary?.trim() || '',
    linkedSceneIds: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

/** Créer une note. */
export function createNotePayload({ projectId, title = '', content = '', tags = [] }) {
  const noteId = id('note');
  return {
    _id: noteId,
    type: DOC_TYPES.NOTE,
    projectId,
    title: title?.trim() || 'Sans titre',
    content: content?.trim() || '',
    tags: Array.isArray(tags) ? tags : [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

/** Créer un document source (métadonnées). */
export function createDocumentPayload({ projectId, title, documentType = 'link', url = null, storageKey = null, mimeType = null }) {
  const docId = id('document');
  return {
    _id: docId,
    type: DOC_TYPES.DOCUMENT,
    projectId,
    title: title?.trim() || 'Sans titre',
    documentType,
    url: url || null,
    storageKey: storageKey || null,
    mimeType: mimeType || null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}
