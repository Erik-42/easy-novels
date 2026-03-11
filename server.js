import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const app = express();
const PORT = 3000;

// Servir les fichiers statiques du renderer
app.use(express.static(join(__dirname, "renderer")));

// Servir les fichiers à la racine du projet (browser-app.js)
app.use(express.static(__dirname));

// Servir les bibliothèques externes
app.use("/node_modules", express.static(join(__dirname, "node_modules")));

// API mock pour simuler les fonctionnalités Electron
app.get("/api/projects", (req, res) => {
  res.json([]);
});

app.get("/api/project/:path/chapters", (req, res) => {
  res.json([]);
});

app.get("/api/project/:path/characters", (req, res) => {
  res.json([]);
});

app.get("/api/project/:path/notes", (req, res) => {
  res.json([]);
});

// Route principale
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "renderer", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Novelist server running at http://localhost:${PORT}`);
  console.log(`📝 Open your browser and navigate to http://localhost:${PORT}`);
});
