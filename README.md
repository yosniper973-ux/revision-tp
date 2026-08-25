# Révision TP

Application de bureau pour la révision des **titres professionnels**, conçue pour les apprenants en préparation de leur passage devant le jury.

Deux formations sont proposées au démarrage :

| Formation | Intitulé | Contenu |
|---|---|---|
| **MSADS** | Médiateur Social Accès aux Droits et Services (RNCP36241, niveau 4) | 150 questions, 6 modules thématiques |
| **ADVF** | Assistant De Vie aux Familles (niveau 3) | 3 CCP — questions en préparation |

Chaque formation a **ses propres profils, scores et badges**.

## Fonctionnalités

- **6 types de questions** : QCM simple, QCM multi-réponses, Vrai/Faux, question ouverte, glisser-déposer, texte à trous
- **Mode Examen** : 20 questions, navigation libre, note sur 20 avec corrections détaillées
- **Mode Quiz Chronométré** : 35 secondes par question, système de points et combos
- **Multi-profils** avec avatars personnalisés
- **Tableau de bord** avec graphiques de progression (radar, historique)
- **Badges et niveaux** (gamification)
- **Classement local** entre profils
- **Export PDF** des résultats et partage par mail
- **100% offline** après installation

## Prérequis pour le développement

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://rustup.rs/) (via rustup)
- Tauri CLI (inclus dans les devDependencies)

## Installation

```bash
git clone https://github.com/yosniper973-ux/revision-tp.git
cd revision-tp
npm install
```

## Développement

```bash
# Lancer en mode développement (navigateur)
npm run dev

# Lancer en mode développement (fenêtre Tauri)
npm run tauri:dev
```

## Build de l'exécutable Windows

```bash
# Générer l'installateur .exe NSIS
npm run tauri:build
```

L'installateur se trouve dans `src-tauri/target/release/bundle/nsis/`.

## Ajouter une formation

Une formation = un fichier dans `src/data/formations/`, déclaré dans `formations/index.ts`. Il décrit l'identité de la formation (sigle, intitulé, RNCP, niveau, couleurs, icônes) et ses modules, et importe son fichier de questions :

```ts
export const advf: Formation = {
  id: 'advf',                    // ne jamais changer : sert de clé de stockage
  shortName: 'ADVF',
  appTitle: 'ADVF Révision',
  fullName: 'Assistant De Vie aux Familles',
  rncp: '',
  level: 'Niveau 3',
  moduleSectionTitle: 'Blocs de compétences (CCP)',
  modulePrefix: 'CCP',           // affiché dans les graphiques : CCP1, CCP2…
  allModulesLabel: 'Tous les CCP',
  splashGradient: 'from-teal-950 via-emerald-900 to-teal-950',
  splashIcons: ['House', 'HandHeart', 'Baby'],
  pdfAccent: [16, 185, 129],
  modules: [ /* { id, name, color, icon } */ ],
  questions: questions as Question[],
};
```

Les icônes disponibles sont listées dans `src/lib/icons.ts`.

## Ajouter ou modifier des questions

Éditez le fichier de questions de la formation, par exemple `src/data/formations/msads.questions.json`. Chaque question suit ce schéma :

```json
{
  "id": "M1-Q001",
  "module": 1,
  "type": "qcm_single | qcm_multi | true_false | open_text | drag_drop | fill_blank",
  "difficulty": 1,
  "question": "Texte de la question",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": [0],
  "keywords": [],
  "explanation": "Explication pédagogique affichée après réponse"
}
```

Le champ `module` renvoie à l'`id` d'un module déclaré par la formation.

## Modules MSADS

| # | Module | Contenu |
|---|--------|---------|
| 1 | Fondamentaux & Déontologie | Charte 2001, norme AFNOR, cadre déontologique |
| 2 | Posture du médiateur | Tiers neutre, écoute active, juste distance |
| 3 | Processus & Techniques | Navette, table ronde, gestion de conflits |
| 4 | Accès aux droits & Numérique | Dématérialisation, non-recours, fracture numérique |
| 5 | Veille sociale & Territoire | Diagnostic territorial, réseaux, partenariats |
| 6 | Inclusion & Handicap | Loi 2005, CIDPH, MDPH, FALC, accessibilité |

## Stack technique

- **Tauri 2** (backend Rust minimal)
- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS 4** + **Framer Motion** + **Lucide React** + **Recharts**
- Stockage local via `localStorage`, cloisonné par formation (`revision-data-<id>`)

## Prérequis côté apprenant

- Windows 10 ou 11
- WebView2 (installé automatiquement si absent)
