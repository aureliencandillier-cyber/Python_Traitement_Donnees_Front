Ticketing System - Frontend
Présentation

Ce dépôt contient l'interface utilisateur (UI) du système de gestion de tickets. Développée avec React et Vite, cette application offre un tableau de bord moderne, fluide et réactif pour piloter les demandes de support technique en temps réel.
Technologies utilisées

    React 18 : Utilisation intensive des Hooks (useState, useEffect) pour une gestion d'état performante.

    Vite : Environnement de développement et outil de build ultra-rapide.

    CSS3 Moderne : Architecture basée sur les variables CSS, Flexbox et CSS Grid pour un design cohérent.

    Fetch API : Communication asynchrone avec le backend FastAPI.

Fonctionnalités Avancées

    Système de Filtrage Cumulatif : Permet d'empiler plusieurs critères de recherche (ex: voir uniquement les tickets "High" ET "Open").

    Recherche Textuelle : Filtre dynamique sur la description des tickets pour retrouver rapidement un mot-clé (ex: "Ordinateur").

    Tri Bidirectionnel : Possibilité de trier par ID, Titre, Priorité ou Statut, avec une bascule entre l'ordre Croissant (↑) et Décroissant (↓).

    Tableau de bord Statistique : Calcul automatique et affichage des tickets par état (Open, In Progress, Closed).

    Gestion du cycle de vie :

        Verrouillage "Closed" : Les tickets clos ne peuvent plus être modifiés (sélecteur désactivé).

        Action "SOLDER" : Le bouton de suppression change sémantiquement pour marquer la clôture définitive d'un dossier.

Installation et Lancement

    Cloner le dépôt :
    PowerShell

    git clone https://github.com/aureliencandillier-cyber/Python_Traitement_Donnees_Front.git
    cd Python_Traitement_Donnees_Front

    Installer les dépendances :
    PowerShell

    npm install

    Lancer le serveur de développement :
    PowerShell

    npm run dev

    L'interface sera accessible par défaut sur http://localhost:5173/.

Configuration de l'API

Le Frontend est configuré pour interagir avec un backend FastAPI tournant sur le port 8000.

    URL de base : http://127.0.0.1:8000/tickets

    Endpoints utilisés : GET, POST, PATCH (mise à jour statut), DELETE.

Structure des fichiers
Plaintext

src/
├── App.jsx     # Logique métier, gestion des filtres cumulatifs et du tri
├── App.css     # Styles des composants, animations et grille responsive
├── main.jsx    # Point d'entrée de l'application React

└── index.css   # Styles globaux et variables de thème
