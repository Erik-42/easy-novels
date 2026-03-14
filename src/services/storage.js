// Compat legacy: conservé pour éviter de casser d’autres imports.
// La nouvelle source de vérité est `src/services/db.js`.
import { listProjects } from "./db.js";

export function loadProjects() {
  return listProjects().map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    createdAt: p.createdAt,
  }));
}

export function saveProjects() {
  // No-op : la nouvelle DB gère tout.
}

