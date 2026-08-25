# Révision TP

Application de bureau **indépendante de FormAssist**. Deux projets distincts, deux dépôts, aucun code partagé :

- **FormAssist** (`~/Projets/formassist`) — outil du formateur : planning, génération de contenus, corrections, facturation.
- **Révision TP** (ce dépôt, `~/Projets/revision-tp`) — app installée chez les **apprenants** pour réviser leur titre professionnel.

Ne jamais travailler sur l'un depuis le dossier de l'autre : lancer Claude Code **depuis ce dossier** pour toute tâche sur cette app.

## Stack

Tauri 2 (Rust) + React 19 + TypeScript + Vite + Tailwind 4 + Zustand. Tout est local, aucune API : les questions sont dans le dépôt, les scores dans le `localStorage`.

## Multi-formation

Une formation = un fichier dans `src/data/formations/` (modules, couleurs, icônes, branding, questions) déclaré dans `formations/index.ts`. Le moteur (types de questions, scoring, badges, PDF) est générique et ne doit contenir aucune référence à une formation précise.

Chaque formation a **ses propres profils et scores** : clé `revision-data-<id>` dans le `localStorage`.

## Pièges connus

- **Ne pas changer `identifier` dans `src-tauri/tauri.conf.json`.** Sous Windows il détermine le dossier de données WebView2, donc les profils déjà enregistrés chez les apprenants. Il vaut historiquement `com.educentre.msads-revision`.
- **Le reset CSS de `src/index.css` doit rester dans `@layer base`.** Hors couche, `* { margin:0; padding:0 }` l'emporte sur les utilitaires Tailwind et annule tous les `p-*` / `m-*`.
- Dans la version de `lucide-react` installée, l'icône `Home` s'appelle `House`.

## Commandes

```bash
npm run dev          # serveur de dev (port 5173)
npm run build        # typecheck + build de prod
npm run lint
npm run tauri:build  # installateur Windows (à faire tourner sous Windows)
```

La release passe par **GitHub Actions** (`.github/workflows/build-windows.yml`), déclenchée par un tag `v*`. Pas de build local pour publier.
