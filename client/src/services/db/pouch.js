/**
 * Initialisation PouchDB pour Easy-Novels V2.
 * Base locale "easy-novels" — sync CouchDB (Phase 4).
 * Chargement à la demande pour éviter une erreur au premier rendu.
 */
const DB_NAME = 'easy-novels';
let db = null;
let dbPromise = null;

export async function getDb() {
  if (db) return db;
  if (!dbPromise) {
    dbPromise = (async () => {
      const PouchDB = (await import('pouchdb-browser')).default;
      db = new PouchDB(DB_NAME);
      return db;
    })();
  }
  return dbPromise;
}

export async function destroyDb() {
  if (db) {
    await db.destroy();
    db = null;
    dbPromise = null;
  }
}
