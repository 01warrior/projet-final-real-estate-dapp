
---

```markdown
# Frontend du Projet ImmoChain - Gestion de Propriétés Immobilières

Ce dossier contient l'application frontend React (construite avec Vite) pour interagir avec la DApp de gestion de propriétés immobilières ImmoChain.

## Table des Matières

- [Description](#description)
- [Technologies Utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Configuration Initiale](#configuration-initiale)
- [Installation des Dépendances](#installation-des-dépendances)
- [Configuration des Variables d'Environnement (Smart Contract & IPFS)](#configuration-des-variables-denvironnement-smart-contract--ipfs)
- [Lancement du Serveur de Développement](#lancement-du-serveur-de-développement)
- [Build pour la Production](#build-pour-la-production)
- [Structure du Dossier](#structure-du-dossier)
- [Fonctionnalités](#fonctionnalités)

## Description

Le frontend fournit une interface utilisateur moderne et intuitive pour :
- Se connecter via MetaMask.
- Visualiser les propriétés immobilières enregistrées sur la blockchain.
- Pour l'administrateur (propriétaire du contrat) : ajouter de nouvelles propriétés, y compris l'upload des documents associés sur IPFS.
- Pour les propriétaires de biens : initier le transfert de leurs propriétés.
- Consulter l'historique des propriétaires d'un bien.

## Technologies Utilisées

- **Vite**: Outil de build frontend rapide et moderne.
- **React (`v19.x`)**: Bibliothèque JavaScript pour construire des interfaces utilisateur.
- **Ethers.js (`v6.x`)**: Pour l'interaction avec la blockchain Ethereum et le smart contract.
- **`ipfs-http-client`**: Pour l'interaction avec un nœud IPFS (upload de fichiers).
- **Tailwind CSS (`v4.x alpha`)**: Framework CSS utility-first pour le design.
- **shadcn/ui**: Collection de composants React accessibles et personnalisables, basés sur Radix UI et Tailwind CSS.
  - **`sonner`**: Utilisé via shadcn/ui pour les notifications (toasts).
- **`lucide-react`**: Bibliothèque d'icônes SVG.

## Prérequis

- [Node.js](https://nodejs.org/) (version 18.x ou supérieure recommandée)
- [npm](https://www.npmjs.com/) (généralement installé avec Node.js)
- Extension de navigateur [MetaMask](https://metamask.io/) installée et configurée.
- Un nœud IPFS local en cours d'exécution (par exemple, via Docker, accessible sur `http://localhost:5001` pour l'API et `http://localhost:8080` pour la gateway).
- Le smart contract `PropertyRegistry` doit être déployé sur un réseau Ethereum accessible (par exemple, le nœud Hardhat local).

## Configuration Initiale (si Tailwind et shadcn/ui ne sont pas déjà configurés)

Si vous partez d'un projet Vite frais :
1.  **Installer Tailwind CSS**: Suivez les instructions pour [Vite sur le site de Tailwind CSS](https://tailwindcss.com/docs/installation/framework-guides/vite), y compris l'installation de `@tailwindcss/postcss` pour Tailwind v4.
2.  **Initialiser shadcn/ui**:
    ```bash
    npx shadcn@latest init
    ```
    Répondez aux questions de configuration (choisissez JavaScript, style, couleur de base, chemin vers `src/index.css`, variables CSS, alias `@/components` et `@/lib/utils`). Configurez l'alias `@/` dans `vite.config.js`.
3.  **Ajouter les composants shadcn/ui nécessaires**:
    ```bash
    npx shadcn@latest add button input textarea label dialog card sonner sheet # et autres...
    ```

## Installation des Dépendances

Si les dépendances ne sont pas déjà installées (par exemple, après avoir cloné le projet), naviguez à la racine de ce dossier `frontend/` et exécutez :

```bash
npm install

Annexe : Commandes Clés Utilisées (Exemples)
Backend (Hardhat) :
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
npm install @openzeppelin/contracts
Frontend (Vite & npm) :
npm create vite@latest nom-du-projet -- --template react
npm install ethers ipfs-http-client
npm install -D tailwindcss@next postcss autoprefixer @tailwindcss/postcss (pour TWv4)
npx shadcn@latest init
npx shadcn@latest add <nom-composant> (ex: button, dialog, card, sonner)
npm run dev (pour lancer le serveur Vite)

Docker (pour IPFS) :
docker-compose up -d (si docker-compose.yml est utilisé)
docker ps (pour voir les conteneurs actifs)
docker logs <nom_conteneur_ipfs>
