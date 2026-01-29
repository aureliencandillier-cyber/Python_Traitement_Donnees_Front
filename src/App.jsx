import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tickets, setTickets] = useState([]);
  // État pour la sélection actuelle dans les menus de filtre
  const [tempFilter, setTempFilter] = useState({ criterion: 'status', value: 'Open' });
  // Liste cumulée des filtres actifs
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortKey, setSortKey] = useState('id');
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Low' });

  const priorityWeights = { 'High': 1, 'Medium': 2, 'Low': 3 };
  const statusWeights = { 'Open': 1, 'In progress': 2, 'Closed': 3 };

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/tickets');
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Erreur backend :", error);
    }
  };

  // --- GESTION DES FILTRES ---

  // Quand on change le type de critère (ex: passer de Status à Description)
  const handleCriterionChange = (e) => {
    const newCriterion = e.target.value;
    let defaultValue = '';
    // On réinitialise la valeur par défaut pour éviter des incohérences
    if (newCriterion === 'status') defaultValue = 'Open';
    else if (newCriterion === 'priority') defaultValue = 'Low';
    // else description, defaultValue reste vide

    setTempFilter({ criterion: newCriterion, value: defaultValue });
  };

  // Ajouter le filtre courant à la liste
  const addFilter = () => {
    if (tempFilter.value.trim() === '') return; // Ne pas ajouter de filtre vide

    // Éviter les doublons exacts
    const isDuplicate = activeFilters.some(f => f.criterion === tempFilter.criterion && f.value.toLowerCase() === tempFilter.value.toLowerCase());
    if (!isDuplicate) {
      setActiveFilters([...activeFilters, { ...tempFilter }]);
      // Reset description field after adding if that was selected
      if (tempFilter.criterion === 'description') {
          setTempFilter({ ...tempFilter, value: '' });
      }
    }
  };

  const clearFilters = () => setActiveFilters([]);

  // --- GESTION DU FORMULAIRE ET ACTIONS ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTicket = { ...formData, status: 'Open', tags: [] };
    const response = await fetch('http://127.0.0.1:8000/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicket),
    });
    if (response.ok) {
      fetchTickets();
      setFormData({ title: '', description: '', priority: 'Low' });
    }
  };

  const updateStatus = async (id, newStatus) => {
    const response = await fetch(`http://127.0.0.1:8000/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (response.ok) fetchTickets();
  };

  const deleteTicket = async (id) => {
    const response = await fetch(`http://127.0.0.1:8000/tickets/${id}`, { method: 'DELETE' });
    if (response.ok) setTickets(tickets.filter(t => t.id !== id));
  };

  // --- LOGIQUE DE FILTRAGE ET TRI ---
  const displayedTickets = tickets
    .filter(t => {
      if (activeFilters.length === 0) return true;
      // Le ticket doit correspondre à TOUS les filtres actifs (Logique AND)
      return activeFilters.every(f => {
        const ticketValue = String(t[f.criterion]).toLowerCase();
        const filterValue = f.value.toLowerCase();

        // Si c'est une description, on cherche si ça CONTIENT le mot
        if (f.criterion === 'description') {
            return ticketValue.includes(filterValue);
        }
        // Sinon (Statut, Priorité), on cherche une correspondance EXACTE
        return ticketValue === filterValue;
      });
    })
    .sort((a, b) => {
      if (sortKey === 'priority') return priorityWeights[a.priority] - priorityWeights[b.priority];
      if (sortKey === 'status') return (statusWeights[a.status] || 99) - (statusWeights[b.status] || 99);
      if (sortKey === 'id') return a.id - b.id;
      return String(a[sortKey]).localeCompare(String(b[sortKey]));
    });

  return (
    <div className="App">
      <h1>🎟️ Ticketing System Fullstack</h1>

      <div className="main-layout">
        <aside className="sidebar">
          <section className="form-container">
            <h2>➕ Nouveau Ticket</h2>
            <form onSubmit={handleSubmit}>
              <input name="title" placeholder="Titre" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              <textarea name="description" placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
              <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <button type="submit" className="btn-primary">Créer</button>
            </form>
          </section>

          <section className="controls">
            <h2>🔍 Ajouter un filtre</h2>
            <div className="filter-builder">
              {/* 1. Choix du critère */}
              <select value={tempFilter.criterion} onChange={handleCriterionChange}>
                <option value="status">Statut</option>
                <option value="priority">Priorité</option>
                {/* Nouvel ajout : */}
                <option value="description">Description</option>
              </select>
              
              {/* 2. Choix de la valeur (Interface dynamique) */}
              {tempFilter.criterion === 'description' ? (
                  // Si Description : Afficher un champ texte
                  <input 
                    type="text" 
                    placeholder="Contient le mot..."
                    value={tempFilter.value}
                    onChange={(e) => setTempFilter({ ...tempFilter, value: e.target.value })}
                  />
              ) : (
                  // Sinon (Statut/Priorité) : Afficher le menu déroulant approprié
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
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                <option value="id">ID</option>
                <option value="priority">Priorité</option>
                <option value="status">Statut</option>
              </select>
            </div>
          </section>

          {/* LISTE DES FILTRES ACTIFS (En bas à gauche) */}
          <section className="active-filters-area">
            <div className="active-filters-header">
              <h3>Filtres actifs</h3>
              {activeFilters.length > 0 && (
                 <button onClick={clearFilters} className="btn-broom" title="Vider les filtres">🧹</button>
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

        <main className="ticket-display">
          <h2>Liste des tickets ({displayedTickets.length})</h2>
          <div className="ticket-grid">
            {displayedTickets.map(ticket => {
              const isClosed = ticket.status === 'Closed';
              return (
                <div key={ticket.id} className={`ticket-card priority-${ticket.priority.toLowerCase()} ${isClosed ? 'card-closed' : ''}`}>
                  <div className="card-header">
                    <span className={`status-pill ${ticket.status.replace(/\s+/g, '-').toLowerCase()}`}>{ticket.status}</span>
                    <span className={`priority-tag ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                    <span className="ticket-id">#{ticket.id}</span>
                  </div>
                  <div className="card-body">
                    <h3>{ticket.title}</h3>
                    <p>{ticket.description}</p>
                  </div>
                  <div className="card-actions">
                    <select value={ticket.status} onChange={(e) => updateStatus(ticket.id, e.target.value)} disabled={isClosed}>
                      <option value="Open">Open</option>
                      <option value="In progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <button className={isClosed ? "btn-solder" : "btn-danger"} onClick={() => deleteTicket(ticket.id)}>
                      {isClosed ? "SOLDER" : "Supprimer"}
                    </button>
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