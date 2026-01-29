import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tickets, setTickets] = useState([]);
  
  // États pour le filtrage
  const [tempFilter, setTempFilter] = useState({ criterion: 'status', value: 'Open' });
  const [activeFilters, setActiveFilters] = useState([]);
  
  // États pour le tri
  const [sortKey, setSortKey] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' ou 'desc'

  // État pour le formulaire
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Low' });

  // Référentiels de poids pour le tri logique
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

  // --- LOGIQUE DES FILTRES ---

  const handleCriterionChange = (e) => {
    const newCriterion = e.target.value;
    let defaultValue = '';
    if (newCriterion === 'status') defaultValue = 'Open';
    else if (newCriterion === 'priority') defaultValue = 'Low';
    setTempFilter({ criterion: newCriterion, value: defaultValue });
  };

  const addFilter = () => {
    if (tempFilter.value.trim() === '') return;
    const isDuplicate = activeFilters.some(f => 
      f.criterion === tempFilter.criterion && 
      f.value.toLowerCase() === tempFilter.value.toLowerCase()
    );
    if (!isDuplicate) {
      setActiveFilters([...activeFilters, { ...tempFilter }]);
      if (tempFilter.criterion === 'description') {
        setTempFilter({ ...tempFilter, value: '' });
      }
    }
  };

  const clearFilters = () => setActiveFilters([]);

  // --- ACTIONS API ---

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

  // --- LOGIQUE DE TRAITEMENT DES DONNÉES (FILTRE + TRI) ---

  const displayedTickets = tickets
    .filter(t => {
      if (activeFilters.length === 0) return true;
      return activeFilters.every(f => {
        const ticketValue = String(t[f.criterion] || "").toLowerCase();
        const filterValue = f.value.toLowerCase();
        if (f.criterion === 'description') return ticketValue.includes(filterValue);
        return ticketValue === filterValue;
      });
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'priority') {
        comparison = priorityWeights[a.priority] - priorityWeights[b.priority];
      } else if (sortKey === 'status') {
        comparison = (statusWeights[a.status] || 99) - (statusWeights[b.status] || 99);
      } else if (sortKey === 'id') {
        comparison = a.id - b.id;
      } else {
        comparison = String(a[sortKey]).localeCompare(String(b[sortKey]));
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="App">
      <h1>🎟️ Ticketing System Fullstack</h1>

      <div className="main-layout">
        <aside className="sidebar">
          <section className="form-container">
            <h2>➕ Nouveau Ticket</h2>
            <form onSubmit={handleSubmit}>
              <input 
                placeholder="Titre" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
              />
              <textarea 
                placeholder="Description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                required 
              />
              <select 
                value={formData.priority} 
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
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
              <select value={tempFilter.criterion} onChange={handleCriterionChange}>
                <option value="status">Statut</option>
                <option value="priority">Priorité</option>
                <option value="description">Description</option>
              </select>
              
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