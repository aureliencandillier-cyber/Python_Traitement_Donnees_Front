🎟️ Ticketing System - Frontend

Cette interface moderne développée avec React et Vite constitue le "visage" de ton application de gestion de tickets. Elle communique avec une API FastAPI pour offrir une gestion fluide et en temps réel des demandes de support.
🚀 Technologies utilisées

    Framework : React (Hooks : useState, useEffect)

    Outil de build : Vite

    Style : CSS3 personnalisé avec variables (Custom Properties)

    Communication : API Fetch (Requêtes asynchrones vers le backend)

✨ Fonctionnalités clés

    Tableau de bord de Statistiques : Visualisation immédiate du nombre total de tickets et répartition par statut (Open, In Progress, Closed).

    Création dynamique : Formulaire intuitif pour ajouter des tickets avec titre, description et niveau de priorité.

    Filtrage & Recherche : Moteur de recherche multicritère (Statut, Priorité, Titre) pour retrouver rapidement une information.

    Tri Intelligent : Logique de tri personnalisée respectant la priorité métier (High > Medium > Low) et le flux de travail (Open > In Progress > Closed).

    Gestion du cycle de vie : Mise à jour instantanée du statut via des requêtes PATCH.

🛠️ Installation et Lancement

    Accéder au dossier :
    PowerShell

    cd Frontend

    Installer les dépendances :
    PowerShell

    npm install

    Lancer le serveur de développement :
    PowerShell

    npm run dev

    L'interface sera accessible par défaut sur http://localhost:5173.

📋 Règles Métier Implémentées

Le frontend applique des contrôles stricts pour garantir l'intégrité des données :

    Verrouillage des dossiers clos : Lorsqu'un ticket passe au statut Closed, le sélecteur de changement de statut est automatiquement désactivé (disabled) pour empêcher toute réouverture non autorisée.

    Sémantique de suppression : Pour un ticket ouvert, le bouton affiche Supprimer. Pour un ticket clos, il se transforme en SOLDER, indiquant la finalisation administrative du dossier.

    Hiérarchie visuelle : Les cartes de tickets utilisent des codes couleurs basés sur la priorité et le statut pour une lecture rapide.

📂 Structure du projet
Plaintext

Frontend/
├── src/
│   ├── App.jsx     # Logique principale, calculs de tri et fetch API
│   ├── App.css     # Design des composants, grille et cartes
│   ├── main.jsx    # Point d'entrée React
│   └── index.css   # Styles globaux et reset
├── index.html      # Structure HTML de base
└── package.json    # Dépendances et scripts

🌐 Configuration API

Par défaut, l'interface pointe vers l'adresse locale du backend : http://127.0.0.1:8000/tickets.