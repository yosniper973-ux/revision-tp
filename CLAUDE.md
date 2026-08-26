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

## Mode formateur

Un interrupteur dans les paramètres, protégé par mot de passe, débloque le suivi de promo :
import des fichiers de résultats envoyés par les apprenants, tableau par apprenant et niveau
moyen de la promo par module. Seule une empreinte du mot de passe figure dans le code
(`src/stores/useTeacherStore.ts`) ; le mot de passe lui-même n'apparaît ni dans les sources ni
dans le build. Ce verrou évite une activation par curiosité — ce n'est pas une barrière de
sécurité, tout le code étant lisible sur le poste.

## Mises à jour

L'app embarque `tauri-plugin-updater`. À chaque tag `v*`, la CI signe l'installateur et publie
un `latest.json` dans la release ; l'app interroge
`https://github.com/yosniper973-ux/revision-tp/releases/latest/download/latest.json` au démarrage.

- La **clé privée de signature** vit hors du dépôt (`~/.tauri/revision-tp.key`) et doit être
  présente dans les secrets GitHub sous `TAURI_SIGNING_PRIVATE_KEY`, sinon le build échoue à
  l'étape `latest.json`. La clé publique correspondante est dans `tauri.conf.json`.
- **Ne jamais régénérer la clé** une fois des versions diffusées : les apprenants ne pourraient
  plus vérifier les mises à jour suivantes.
- `productName` est volontairement **sans accent** (`Revision TP`) : il nomme l'exe, donc l'URL
  de téléchargement du `latest.json`.
- **Ne jamais reconstruire à la main l'URL de l'installateur dans `latest.json`.** GitHub renomme
  les assets à la publication (les espaces deviennent des points) : une URL devinée renvoie 404 et
  la mise à jour échoue au téléchargement, après avoir été détectée. Le workflow lit donc
  `browser_download_url` via l'API après publication, puis vérifie que l'URL répond en 200.

## Pièges connus

- **Ne plus toucher à `identifier`** (`com.educentre.revision-tp` depuis la v1.1.1). Sous Windows il détermine le dossier de données WebView2, donc les profils enregistrés sur le poste, et l'installateur s'en sert pour reconnaître une installation existante. Le changer effacerait les profils des apprenants et ferait cohabiter deux applications au lieu d'en remplacer une. Il a pu être nettoyé en août 2026 uniquement parce qu'aucune promo n'était équipée à ce moment-là.
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
