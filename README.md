# 🎟️ Système de Gestion de Tickets – Projet Fullstack Python / React

Ce projet est une application **fullstack de gestion de tickets** développée dans un cadre pédagogique.  
Il combine **traitement de données en Python**, **API REST avec FastAPI**, **frontend React**, et une **démarche réflexive d’apprentissage via l’usage d’un LLM**.

L’objectif est de démontrer :
- la manipulation de données structurées (JSON),
- la conception d’une API REST fonctionnelle,
- la connexion frontend ↔ backend,
- et l’adoption de bonnes pratiques professionnelles (Git, documentation, esprit critique).

---

## 🧠 Contexte pédagogique

Projet réalisé dans le cadre d’un exercice de formation visant à :
- automatiser un traitement simple de données en Python,
- créer une API REST avec FastAPI,
- connecter une interface frontend (React),
- utiliser un LLM comme **outil d’assistance au développement**, avec analyse critique.

Travail réalisé en binôme (un développeur / un guide), avec alternance des rôles.

---

## 🏗️ Architecture globale

L’application repose sur une architecture **découplée** :

- **Backend** : API REST FastAPI  
  - Gestion des tickets
  - Validation des données
  - Persistance via fichier JSON
- **Frontend** : Application React (Vite)  
  - Affichage dynamique des tickets
  - Création et mise à jour du statut
  - Règles métier côté interface
- **Communication** : API REST (fetch HTTP)

---

## 📂 Structure du projet

```plaintext
.
├── Backend/
│   ├── main.py                # API FastAPI (routes, CORS, validation)
│   ├── script.py              # Traitement de données & logique métier
│   ├── structure_ticket.json  # Données persistées (≥ 10 tickets)
│   └── README.md              # Documentation technique backend
│
├── Frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── README.md              # Documentation technique frontend
│
├── README.md                  # Documentation globale (ce fichier)
└── LEARNING.md                # Apprentissage, usage du LLM et retours critiques

⚙️ Prérequis

    Python ≥ 3.10

    Node.js ≥ 18

    npm ≥ 9

🚀 Installation et Lancement
1️⃣ Backend (API FastAPI)

cd Backend
pip install fastapi uvicorn pydantic
python -m uvicorn main:app --reload

Le serveur backend est accessible sur :
👉 http://127.0.0.1:8000

👉 Documentation interactive Swagger : http://127.0.0.1:8000/docs
2️⃣ Frontend (React)

cd Frontend
npm install
npm run dev

L’interface utilisateur est accessible sur :
👉 http://localhost:5173
📡 API REST – Endpoints principaux
Méthode	Route	Description
GET	/tickets	Récupère tous les tickets
POST	/tickets	Crée un nouveau ticket
PATCH	/tickets/{id}	Met à jour le statut d’un ticket
DELETE	/tickets/{id}	Supprime (ou solde) un ticket

La gestion des erreurs HTTP (404, 400, etc.) est implémentée côté backend.
🖥️ Fonctionnalités principales
Backend

    Lecture et écriture d’un fichier JSON

    Calcul de statistiques par statut

    Filtrage et tri des tickets

    Ajout et mise à jour de tickets

    Mode API + mode CLI (script.py)

Frontend

    Affichage dynamique des tickets

    Création via formulaire

    Mise à jour du statut

    Filtrage et recherche multicritère

    Tri métier (priorité et statut)

    Règles UI empêchant la réouverture d’un ticket clos

📘 Documentation technique détaillée

Pour une description complète et approfondie de chaque composant :

    🔧 Backend (FastAPI, logique métier, CLI)
    → voir Backend/README.md

    🎨 Frontend (React, règles métier UI, tri, filtres)
    → voir Frontend/README.md

🤖 Apprentissage & usage du LLM

Un LLM a été utilisé comme outil d’assistance au développement pour :

    générer des données de test,

    clarifier des comportements techniques,

    identifier et corriger des erreurs.

L’ensemble de la démarche (prompts utilisés, erreurs rencontrées, vérifications, cas d’erreur du LLM) est documenté dans :

👉 LEARNING.md
🧪 Critères de validation couverts

    API fonctionnelle et accessible

    Frontend connecté au backend

    Création, mise à jour et suppression de tickets

    Code structuré et lisible

    Documentation complète

    Utilisation justifiée et critique d’un LLM

    Utilisation cohérente de Git

📄 Licence

Projet réalisé dans un cadre pédagogique.