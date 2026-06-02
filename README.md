# Magic Converter 🪄

Une application web moderne et performante pour la conversion et le redimensionnement d'images par lots. Conçue pour être rapide, intuitive et accessible partout grâce à son support PWA.

## ✨ Fonctionnalités

- **Traitement par lots** : Ajoutez plusieurs images et convertissez-les toutes en un seul clic.
- **Multi-formats** : Supporte l'export vers JPEG, PNG, WebP, AVIF et GIF.
- **Redimensionnement intelligent** : 
  - Présélections (Mobile, Tablette, Bureau) en portrait ou paysage.
  - Saisie manuelle des dimensions.
  - Conservation du ratio d'aspect (recadrage intelligent "cover").
- **Optimisation de la qualité** : Ajustez la qualité de compression pour réduire le poids des fichiers.
- **Estimation en temps réel** : Visualisez le poids estimé du fichier final avant même la conversion.
- **Interface responsive** : Une expérience fluide sur mobile, tablette et ordinateur.
- **PWA (Progressive Web App)** : Installez l'application sur votre appareil pour une utilisation hors ligne et un accès rapide.

## 🚀 Technologies

- **Framework** : [Next.js 15+](https://nextjs.org/) (App Router)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Style** : [Tailwind CSS 4](https://tailwindcss.com/)
- **Composants UI** : [shadcn/ui](https://ui.shadcn.com/)
- **Animations** : [Framer Motion](https://www.framer.com/motion/)
- **Traitement d'image** : [Sharp](https://sharp.pixelplumbing.com/) (Haute performance)
- **PWA** : [Serwist](https://serwist.js.org/) / [Next-PWA](https://github.com/shadowwalker/next-pwa)
- **Icônes** : [Lucide React](https://lucide.dev/)

## 🛠️ Installation

### Prérequis

- [Node.js](https://nodejs.org/) (version 20 ou supérieure recommandée)
- [pnpm](https://pnpm.io/) (ou npm/yarn)

### Étapes

1. **Cloner le projet**
   ```bash
   git clone <url-du-depot>
   cd magick-converter
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Lancer le serveur de développement**
   ```bash
   pnpm dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

4. **Build pour la production**
   ```bash
   pnpm build
   pnpm start
   ```

## 📱 Utilisation

1. **Ajouter des images** : Glissez-déposez vos fichiers dans la zone centrale ou cliquez pour parcourir votre explorateur.
2. **Configurer les réglages** :
   - Choisissez le format de sortie.
   - Réglez la qualité souhaitée.
   - Définissez les dimensions (optionnel).
3. **Convertir** : Cliquez sur "Tout convertir" pour lancer le traitement de la file d'attente.
4. **Télécharger** : Récupérez vos images individuellement ou téléchargez-les toutes d'un coup.

## 📄 Licence

Ce projet est sous licence MIT.
