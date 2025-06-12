# ImmoChain : DApp de Gestion de Propriétés Immobilières Décentralisée

ImmoChain est une application décentralisée (DApp) de bout en bout conçue pour la gestion transparente, sécurisée et traçable des titres de propriété immobilière. Elle s'appuie sur la blockchain Ethereum pour l'enregistrement et le transfert des droits de propriété, et sur IPFS pour le stockage immuable des documents associés. L'interface utilisateur est construite avec React (via Vite) et intègre la librairie de composants shadcn/ui pour une expérience moderne.

## Table des Matières

- [Aperçu du Projet](#aperçu-du-projet)
- [Fonctionnalités Clés](#fonctionnalités-clés)
- [Architecture Technologique](#architecture-technologique)
- [Prérequis](#prérequis)
- [Structure du Projet](#structure-du-projet)
- [Guide d'Installation et de Lancement](#guide-dinstallation-et-de-lancement)
  - [1. Backend (Smart Contract & Nœud Local)](#1-backend-smart-contract--nœud-local)
  - [2. IPFS (Nœud de Stockage Local)](#2-ipfs-nœud-de-stockage-local)
  - [3. Frontend (Application React)](#3-frontend-application-react)
- [Utilisation de la DApp](#utilisation-de-la-dapp)

## Aperçu du Projet

Face aux défis de la gestion immobilière traditionnelle (manque de transparence, complexité des transferts, risques de fraude documentaire), ImmoChain propose une solution Web3. En utilisant un smart contract sur Ethereum, chaque propriété devient un actif numérique dont l'historique de propriété est publiquement vérifiable et immuable. Les documents essentiels (actes, plans, images) sont stockés sur IPFS, garantissant leur intégrité et leur pérennité, avec uniquement leur identifiant (CID) enregistré sur la blockchain.

## Fonctionnalités Clés

*   **Administrateur :**
    *   Enregistrement de nouvelles propriétés avec description et documents associés (uploadés sur IPFS).
*   **Utilisateurs (Propriétaires de biens) :**
    *   Transfert de la propriété de leurs biens à d'autres adresses Ethereum.
*   **Tous les Utilisateurs :**
    *   Connexion sécurisée via le portefeuille MetaMask.
    *   Consultation de la liste des propriétés enregistrées et de leurs détails.
    *   Visualisation des documents associés à une propriété via la gateway IPFS.
    *   Consultation de l'historique des propriétaires d'un bien.
*   **Interface Utilisateur :**
    *   Dashboard moderne avec navigation par sidebar.
    *   Notifications (toasts) pour les actions et les feedbacks.

## Architecture Technologique

L'application est composée de trois couches principales :

1.  **Smart Contract (Backend Logique) :**
    *   Écrit en **Solidity (`^0.8.9`)**.
    *   Développé et déployé avec **Hardhat**.
    *   Utilise **OpenZeppelin Contracts** (pour `Ownable`).
    *   Sert de registre de vérité pour les titres de propriété.
2.  **IPFS (Stockage Décentralisé) :**
    *   Nœud **Kubo (go-ipfs)** exécuté localement via **Docker**.
    *   Stocke les documents (images, PDF, etc.) associés aux propriétés.
    *   Interaction depuis le frontend via **`ipfs-http-client`**.
3.  **Frontend (Interface Utilisateur) :**
    *   Construit avec **React (`v19.x`)** et initialisé avec **Vite**.
    *   Stylisé avec **Tailwind CSS (`v4.x alpha`)**.
    *   Composants UI fournis par **shadcn/ui** (utilisant Radix UI et Lucide Icons).
    *   Notifications gérées par **`sonner`** (via shadcn/ui).
    *   Interaction avec la blockchain via **Ethers.js (`v6.x`)** et **MetaMask**.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

*   [Node.js](https://nodejs.org/) (v18.x ou LTM recommandée)
*   [npm](https://www.npmjs.com/) (généralement inclus avec Node.js)
*   [Docker](https://www.docker.com/products/docker-desktop/) et Docker Compose
*   L'extension de navigateur [MetaMask](https://metamask.io/)

## Guide d'Installation et de Lancement

Suivez ces étapes dans l'ordre pour lancer l'application complète localement.

### 1. Backend (Smart Contract & Nœud Local)

Détaillé dans `backend/README.md`. Étapes principales :

1.  **Naviguer vers le dossier backend :**
    ```bash
    cd backend
    ```
2.  **Installer les dépendances :**
    ```bash
    npm install
    ```
3.  **Compiler le smart contract :**
    ```bash
    npx hardhat compile
    ```
4.  **Lancer le nœud Hardhat local (dans un terminal séparé) :**
    ```bash
    npx hardhat node
    ```
    Gardez ce terminal ouvert.
5.  **Déployer le smart contract (dans un autre terminal, toujours dans `backend/`) :**
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```

### 2. IPFS (Nœud de Stockage Local)

Un nœud IPFS doit être en cours d'exécution pour que l'upload et la récupération de documents fonctionnent.

1.  Assurez-vous que Docker Desktop est lancé.
2.  Si vous avez un fichier `docker-compose.yml` à la racine du projet global (ou dans un dossier dédié à IPFS) configuré pour Kubo/IPFS :
    ```bash
    # À la racine du projet où se trouve docker-compose.yml
    docker-compose up -d
    ```
    Sinon, lancez votre conteneur IPFS manuellement.
3.  Vérifiez que le nœud est accessible :
    *   API : `http://localhost:5001/webui`
    *   Gateway : `http://localhost:8080`

### 3. Frontend (Application React)

Détaillé dans `frontend/README.md` (ou `d_frontend/README.md`). Étapes principales :

1.  **Naviguer vers le dossier frontend :**
    ```bash
    cd d_frontend
    ```
2.  **Installer les dépendances :**
    ```bash
    npm install
    ```
3.  **Configurer l'application :**
    *   Ouvrez `frontend/src/config.js`.
    *   Mettez à jour `PROPERTY_REGISTRY_CONTRACT_ADDRESS` avec l'adresse de votre contrat déployé à l'étape 1.5.
    *   Vérifiez que `IPFS_API_URL` (ex: `http://localhost:5001`) et `IPFS_GATEWAY_URL` (ex: `http://localhost:8080/ipfs/`) sont corrects.
4.  **Configurer MetaMask :**
    *   Ajoutez un réseau personnalisé pointant vers votre nœud Hardhat local :
        *   Nom : `Hardhat Local` (ou similaire)
        *   URL RPC : `http://127.0.0.1:8545`
        *   ID de Chaîne : `31337`
        *   Symbole : `ETH`
    *   Importez au moins un ou deux comptes depuis ceux listés par la console `npx hardhat node` (utilisez leurs clés privées). Le premier compte est généralement celui qui a déployé le contrat et en est donc l'administrateur.
5.  **Lancer le serveur de développement Vite :**
    ```bash
    npm run dev
    ```
    L'application devrait s'ouvrir dans votre navigateur (généralement `http://localhost:5173`).

## Utilisation de la DApp

1.  Ouvrez l'application dans votre navigateur.
2.  Connectez-vous avec MetaMask en utilisant un compte importé depuis votre nœud Hardhat.
3.  Si vous êtes connecté avec le compte administrateur (celui qui a déployé le contrat), vous pourrez ajouter de nouvelles propriétés via la sidebar ou le bouton dédié.
4.  Toutes les propriétés enregistrées peuvent être consultées.
5.  Si vous êtes le propriétaire actuel d'un bien, vous aurez l'option de le transférer à une autre adresse.
6.  L'historique des propriétaires et les documents IPFS sont accessibles pour chaque propriété.
