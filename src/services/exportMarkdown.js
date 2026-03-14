import { computeProjectWordCount } from "./db.js";

function slugify(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "roman";
}

function buildMarkdown(project) {
  const lines = [];
  const totalWords = computeProjectWordCount(project);

  lines.push(`# ${project.title}`);
  lines.push("");
  lines.push(`- Statut : ${project.status === "draft" ? "Brouillon" : "En cours"}`);
  lines.push(`- Mots (scènes) : ${totalWords.toLocaleString("fr-FR")}`);
  lines.push("");

  const hasOutline = project.outline?.categories?.length;
  if (hasOutline) {
    lines.push("## Esquisse");
    lines.push("");
    for (const cat of project.outline.categories) {
      lines.push(`### ${cat.name}`);
      const items = (cat.itemIds ?? [])
        .map((id) => project.outline.items?.[id])
        .filter(Boolean);
      if (!items.length) {
        lines.push("");
        lines.push("_Aucune fiche_");
        lines.push("");
        continue;
      }
      for (const item of items) {
        lines.push("");
        lines.push(`#### ${item.title}`);
        if (item.summary) {
          lines.push("");
          lines.push(item.summary);
        }
        lines.push("");
      }
    }
    lines.push("");
  }

  const scenes = project.writing?.sceneOrder
    ?.map((id) => project.writing.scenes?.[id])
    .filter(Boolean) ?? [];

  if (scenes.length) {
    lines.push("## Manuscrit");
    lines.push("");

    const sections = project.organize?.sectionOrder
      ?.map((id) => project.organize.sections?.[id])
      .filter(Boolean) ?? [];

    const usedSceneIds = new Set();

    if (sections.length) {
      for (const section of sections) {
        lines.push("");
        lines.push(`### ${section.title}`);
        lines.push("");
        for (const sid of section.sceneIds ?? []) {
          const scene = project.writing.scenes?.[sid];
          if (!scene) continue;
          usedSceneIds.add(sid);
          lines.push(`#### ${scene.title}`);
          if (scene.synopsis) {
            lines.push("");
            lines.push(`> ${scene.synopsis}`);
            lines.push("");
          }
          if (scene.text) {
            lines.push("");
            lines.push(scene.text);
            lines.push("");
          } else {
            lines.push("");
            lines.push("_(Scène vide)_");
            lines.push("");
          }
        }
      }
    }

    const remaining = scenes.filter((s) => !usedSceneIds.has(s.id));
    if (remaining.length) {
      lines.push("");
      lines.push("### Scènes non rattachées");
      lines.push("");
      for (const scene of remaining) {
        lines.push(`#### ${scene.title}`);
        if (scene.synopsis) {
          lines.push("");
          lines.push(`> ${scene.synopsis}`);
          lines.push("");
        }
        if (scene.text) {
          lines.push("");
          lines.push(scene.text);
          lines.push("");
        } else {
          lines.push("");
          lines.push("_(Scène vide)_");
          lines.push("");
        }
      }
    }
  }

  return lines.join("\n");
}

export function exportProjectAsMarkdown(project) {
  const markdown = buildMarkdown(project);
  const blob = new Blob([markdown], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const base = slugify(project.title);
  a.download = `${base}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

