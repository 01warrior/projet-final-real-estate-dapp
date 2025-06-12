# Backend du Projet ImmoChain - Gestion de Propriétés Immobilières

Ce dossier contient le smart contract Solidity et les scripts Hardhat pour la DApp de gestion de propriétés immobilières ImmoChain.

## Table des Matières

- [Description](#description)
- [Technologies Utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation des Dépendances](#installation-des-dépendances)
- [Configuration](#configuration)
- [Compilation du Contrat](#compilation-du-contrat)
- [Exécution des Tests (Optionnel)](#exécution-des-tests-optionnel)
- [Lancement du Nœud Hardhat Local](#lancement-du-nœud-hardhat-local)
- [Déploiement du Contrat](#déploiement-du-contrat)
- [Structure du Dossier](#structure-du-dossier)
- [Détails du Smart Contract (`PropertyRegistry.sol`)](#détails-du-smart-contract-propertyregistrysol)

## Description

Le backend est responsable de la logique métier immuable de l'application, gérée par le smart contract `PropertyRegistry.sol`. Ce contrat permet d'enregistrer des propriétés, de transférer leur propriété et de consulter leurs informations et leur historique.

## Technologies Utilisées

- **Solidity (`^0.8.9`)**: Langage de programmation pour les smart contracts.
- **Hardhat**: Environnement de développement Ethereum pour la compilation, le déploiement, les tests et l'exécution d'un nœud local.
- **Ethers.js**: Utilisé dans les scripts Hardhat pour interagir avec les contrats.
- **OpenZeppelin Contracts (`v5.x`)**: Pour des composants de contrat sécurisés et standardisés (ex: `Ownable.sol`).

## Prérequis

- [Node.js](https://nodejs.org/) (version 18.x ou supérieure recommandée)
- [npm](https://www.npmjs.com/) (généralement installé avec Node.js)

## Installation des Dépendances

Naviguez à la racine de ce dossier `backend/` et exécutez :

```bash
npm install

Compilation du Contrat
Pour compiler le smart contract PropertyRegistry.sol et générer les artefacts (ABI et bytecode) :

npx hardhat compile

Déploiement du Contrat
Pour déployer le contrat PropertyRegistry.sol sur le nœud Hardhat local (ou un autre réseau configuré) :
Assurez-vous que le nœud Hardhat local est en cours d'exécution (voir étape précédente).
Ouvrez un nouveau terminal et exécutez le script de déploiement :

npx hardhat node

npx hardhat run scripts/deploy.js --network localhost

npm run dev
```
