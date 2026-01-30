import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // ---------------------------------------------------------
  // 1. ÉTATS (STATES) : La mémoire réactive de l'application
  // ---------------------------------------------------------
  
  // Stocke la liste complète des tickets reçus du serveur. 
  // On ne modifie jamais cette liste directement pour le filtrage afin de ne pas perdre de données.
  const [tickets, setTickets] = useState([]);

  // État temporaire pour le constructeur de filtre (ce que l'utilisateur choisit avant de cliquer sur +).
  const [tempFilter, setTempFilter] = useState({ criterion: 'status', value: 'Open' });
  
  // Liste des filtres appliqués. C'est une liste d'objets pour permettre le filtrage cumulatif.
  const [activeFilters, setActiveFilters] = useState([]);

  // Gestion du tri : la clé (quel champ ?) et l'ordre (croissant/décroissant).
  const [sortKey, setSortKey] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');

  // État lié aux champs du formulaire de création de ticket.
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Low' });

  // ÉTATS D'ÉDITION : Utilisés pour transformer une carte de ticket en formulaire d'édition.
  const [editingId, setEditingId] = useState(null); // Contient l'ID du ticket en cours de modif, sinon null.
  const [editData, setEditData] = useState({ title: '', description: '' }); 
  const [editError, setEditError] = useState(''); 

  // RÉFÉRENTIELS DE POIDS : 
  // Pourquoi ? Parce qu'alphabétiquement, "High" vient après "Closed". 
  // Ces poids permettent un tri "logique" (High > Medium > Low).
  const priorityWeights = { High: 1, Medium: 2, Low: 3 };
  const statusWeights = { Open: 1, 'In progress': 2, Closed: 3 };

  // ---------------------------------------------------------
  // 2. CYCLES DE VIE : Synchronisation avec le monde extérieur
  // ---------------------------------------------------------

  // useEffect s'exécute au chargement du composant. 
  // Le tableau vide [] signifie : "ne l'exécute qu'une seule fois au démarrage".
  useEffect(() => {
    fetchTickets();
  }, []);

  // Fonction asynchrone pour récupérer les données. 
  // On utilise async/await pour éviter l'enfer des "callbacks" et rendre le code lisible.
  const fetchTickets = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/tickets');
      const data = await response.json();
      setTickets(data); // Met à jour l'interface avec les données fraîches.
    } catch (error) {
      console.error('Erreur backend :', error);
    }
  };

  // ---------------------------------------------------------
  // 3. LOGIQUE DES FILTRES : Préparation de la vue
  // ---------------------------------------------------------

  // Gère le changement de type de filtre. 
  // Pourquoi ? Pour réinitialiser la valeur par défaut (ex: si on passe à Status, on met 'Open').
  const handleCriterionChange = (e) => {
    const newCriterion = e.target.value;
    let defaultValue = '';
    if (newCriterion === 'status') defaultValue = 'Open';
    else if (newCriterion === 'priority') defaultValue = 'Low';
    setTempFilter({ criterion: newCriterion, value: defaultValue });
  };

  // Ajoute un filtre à la liste des filtres actifs.
  const addFilter = () => {
    if (tempFilter.value.trim() === '') return;

    // Empêche d'ajouter deux fois exactement le même filtre.
    const isDuplicate = activeFilters.some(
      (f) =>
        f.criterion === tempFilter.criterion &&
        f.value.toLowerCase() === tempFilter.value.toLowerCase()
    );

    if (!isDuplicate) {
      // Syntaxe [...spread] : On crée une NOUVELLE liste avec les anciens filtres + le nouveau.
      // C'est crucial en React pour que le composant détecte le changement et se re-dessine.
      setActiveFilters([...activeFilters, { ...tempFilter }]);
      
      // Si c'était une recherche texte, on vide le champ pour la prochaine saisie.
      if (tempFilter.criterion === 'description') {
        setTempFilter({ ...tempFilter, value: '' });
      }
    }
  };

  const clearFilters = () => setActiveFilters([]);

  // ---------------------------------------------------------
  // 4. ACTIONS API (MUTATIONS) : Modifier les données au serveur
  // ---------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page (comportement par défaut des formulaires).
    const newTicket = { ...formData, status: 'Open', tags: [] };

    const response = await fetch('http://127.0.0.1:8000/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicket),
    });

    if (response.ok) {
      fetchTickets(); // Re-télécharge la liste pour avoir l'ID généré par le serveur.
      setFormData({ title: '', description: '', priority: 'Low' }); // Vide le formulaire.
    }
  };

  // Mise à jour rapide du statut via le menu déroulant de la carte.
  const updateStatus = async (id, newStatus) => {
    const response = await fetch(`http://127.0.0.1:8000/tickets/${id}`, {
      method: 'PATCH', // PATCH car on ne modifie que le champ 'status'.
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) fetchTickets();
  };

  const deleteTicket = async (id) => {
    const response = await fetch(`http://127.0.0.1:8000/tickets/${id}`, { method: 'DELETE' });
    // Optimisation : au lieu de re-fetch, on retire localement le ticket pour un ressenti instantané.
    if (response.ok) setTickets(tickets.filter((t) => t.id !== id));
  };

  // ---------------------------------------------------------
  // 5. LOGIQUE D'ÉDITION (UI)
  // ---------------------------------------------------------

  // Prépare les données pour le mode édition. 
  // On copie les valeurs actuelles du ticket dans editData.
  const startEdit = (ticket) => {
    setEditError('');
    setEditingId(ticket.id);
    setEditData({
      title: ticket.title || '',
      description: ticket.description || '',
    });
  };

  const cancelEdit = () => {
    setEditError('');
    setEditingId(null);
  };

  // Sauvegarde les modifications de titre/description.
  const saveEdit = async (id) => {
    setEditError('');
    const payload = {
      title: editData.title.trim(),
      description: editData.description.trim(),
    };

    // Validation côté client (UX) pour éviter une requête inutile si c'est vide.
    if (!payload.title || !payload.description) {
      setEditError('Titre et description sont requis.');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchTickets(); // Synchronisation
        cancelEdit(); // Fermeture du mode édition
      } else {
        const errorDetail = await response.json();
        setEditError(`Erreur : ${errorDetail.detail}`);
      }
    } catch (e) {
      setEditError("Erreur réseau : impossible de contacter le serveur.");
    }
  };

  // ---------------------------------------------------------
  // 6. LE MOTEUR DE CALCUL (Le coeur de la vue)
  // POURQUOI ? On ne modifie pas 'tickets'. On crée une variable dérivée.
  // Cela permet de changer les filtres ou le tri sans jamais perdre l'accès à la liste originale.
  // ---------------------------------------------------------
  
  const displayedTickets = tickets
    // FILTRAGE : Un ticket doit passer TOUS les filtres (logique "ET").
    .filter((t) => {
      if (activeFilters.length === 0) return true;
      return activeFilters.every((f) => {
        const ticketValue = String(t[f.criterion] || '').toLowerCase();
        const filterValue = f.value.toLowerCase();
        // Recherche partielle pour la description (ex: "bug" trouve "Gros bug login")
        if (f.criterion === 'description') return ticketValue.includes(filterValue);
        // Correspondance exacte pour le reste (status, priority)
        return ticketValue === filterValue;
      });
    })
    // TRI : On compare deux tickets (a et b).
    .sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'priority') {
        comparison = priorityWeights[a.priority] - priorityWeights[b.priority];
      } else if (sortKey === 'status') {
        comparison = (statusWeights[a.status] || 99) - (statusWeights[b.status] || 99);
      } else if (sortKey === 'id') {
        comparison = a.id - b.id;
      } else {
        // localeCompare : meilleure façon de trier l'alphabet avec des accents.
        comparison = String(a[sortKey]).localeCompare(String(b[sortKey]));
      }
      // Si sortOrder est 'desc', on inverse le résultat du calcul.
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // ---------------------------------------------------------
  // 7. RENDU (JSX) : La structure HTML réactive
  // ---------------------------------------------------------
  return (
    <div className="App">
      <h1>🎟️ Ticketing System Fullstack</h1>

      <div className="main-layout">
        {/* BARRE LATÉRALE : Contrôles et Formulaires */}
        <aside className="sidebar">
          {/* Section Création */}
          <section className="form-container">
            <h2>➕ Nouveau Ticket</h2>
            <form onSubmit={handleSubmit}>
              <input
                placeholder="Titre"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <button type="submit" className="btn-primary">Créer</button>
            </form>
          </section>

          {/* Section Filtre & Tri */}
          <section className="controls">
            <h2>🔍 Ajouter un filtre</h2>
            <div className="filter-builder">
              <select value={tempFilter.criterion} onChange={handleCriterionChange}>
                <option value="status">Statut</option>
                <option value="priority">Priorité</option>
                <option value="description">Description</option>
              </select>

              {/* Rendu conditionnel : on affiche un texte ou un select selon le critère */}
              {tempFilter.criterion === 'description' ? (
                <input
                  type="text"
                  placeholder="Contient..."
                  value={tempFilter.value}
                  onChange={(e) => setTempFilter({ ...tempFilter, value: e.target.value })}
                />
              ) : (
                <select value={tempFilter.value} onChange={(e) => setTempFilter({ ...tempFilter, value: e.target.value })}>
                  {tempFilter.criterion === 'status' ? (
                    <>
                      <option value="Open">Open</option>
                      <option value="In progress">In progress</option>
                      <option value="Closed">Closed</option>
                    </>
                  ) : (
                    <>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </>
                  )}
                </select>
              )}

              <button onClick={addFilter} className="btn-add-filter" disabled={!tempFilter.value}>＋</button>
            </div>

            <div className="sort-box">
              <label>Trier par :</label>
              <div className="sort-controls">
                <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                  <option value="id">ID</option>
                  <option value="priority">Priorité</option>
                  <option value="status">Statut</option>
                  <option value="title">Titre</option>
                </select>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="asc">Croissant (↑)</option>
                  <option value="desc">Décroissant (↓)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Liste visuelle des filtres appliqués */}
          <section className="active-filters-area">
            <div className="active-filters-header">
              <h3>Filtres actifs</h3>
              {activeFilters.length > 0 && (
                <button onClick={clearFilters} className="btn-broom">🧹</button>
              )}
            </div>
            <div className="filter-tags-list">
              {activeFilters.length === 0 && <p className="no-filter">Aucun filtre</p>}
              {activeFilters.map((f, index) => (
                <div key={index} className="filter-tag">
                  <span className="tag-label">{f.criterion === 'description' ? 'Desc.' : f.criterion}:</span>
                  <span className="tag-value">"{f.value}"</span>
                </div>
              ))}
            </div>
          </section>
        </aside>

        {/* ZONE PRINCIPALE : Grille de Tickets */}
        <main className="ticket-display">
          <h2>Liste des tickets ({displayedTickets.length})</h2>
          <div className="ticket-grid">
            {displayedTickets.map((ticket) => {
              const isClosed = ticket.status === 'Closed';
              const isEditing = editingId === ticket.id;

              return (
                /* Template literals (``) pour ajouter des classes CSS dynamiques selon la priorité et l'état */
                <div key={ticket.id} className={`ticket-card priority-${ticket.priority.toLowerCase()} ${isClosed ? 'card-closed' : ''}`}>
                  <div className="card-header">
                    <span className={`status-pill ${ticket.status.replace(/\s+/g, '-').toLowerCase()}`}>{ticket.status}</span>
                    <span className={`priority-tag ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                    <span className="ticket-id">#{ticket.id}</span>
                  </div>

                  <div className="card-body">
                    {/* MODE ÉDITION vs MODE LECTURE */}
                    {isEditing ? (
                      <div className="edit-form">
                        <input
                          className="edit-input"
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        />
                        <textarea
                          className="edit-textarea"
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        />
                        {editError && <p className="edit-error">{editError}</p>}
                      </div>
                    ) : (
                      <>
                        <h3>{ticket.title}</h3>
                        <p>{ticket.description}</p>
                      </>
                    )}
                  </div>

                  <div className="card-actions">
                    {/* Désactivé si le ticket est fermé ou en cours d'édition */}
                    <select
                      value={ticket.status}
                      onChange={(e) => updateStatus(ticket.id, e.target.value)}
                      disabled={isClosed || isEditing}
                    >
                      <option value="Open">Open</option>
                      <option value="In progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <div className="card-actions-right">
                      {isEditing ? (
                        <>
                          <button className="btn-save" onClick={() => saveEdit(ticket.id)}>✅</button>
                          <button className="btn-cancel" onClick={cancelEdit}>❌</button>
                        </>
                      ) : (
                        <>
                          {/* On cache le bouton d'édition si le ticket est clos */}
                          <button className="btn-icon" onClick={() => startEdit(ticket)} disabled={isClosed}>✏️</button>
                          <button className={isClosed ? 'btn-solder' : 'btn-danger'} onClick={() => deleteTicket(ticket.id)}>
                            {isClosed ? 'SOLDER' : 'Supprimer'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;