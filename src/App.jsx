import React, { useState, useEffect } from 'react';
import './App.css';

function App() {


  // 2. States (Boîtes de données)
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Low' });

  // 3. Effets (Actions au chargement)
  useEffect(() => {
    fetchTickets();
  }, []);

  // 4. Fonctions Logiques (Le "Cerveau")
  // recupérer les tickets
  const fetchTickets = async () => { 
    const response = await fetch('http://127.0.0.1:8000/tickets');
    const data = await response.json();
    setTickets(data); 
  };
  const handleChange = (e) => { /* ... ton code spread ... */ };

  // supprimer le ticket
  const deleteTicket = async (id) => {
    const response = await fetch(`http://127.0.0.1:8000/tickets/${id}`, {
    method: 'DELETE',
    });
    if (response.ok) {
      setTickets(tickets.filter(ticket => ticket.id !== id));
    }
  };

  // Récupération des tickets depuis le backend au chargement du composant
  return (
    <div className="App">
      <h1>Gestionnaire de Tickets</h1>

      {/* Formulaire d'ajout */}
      <section>
        <h2>Ajouter un ticket</h2>
        <form onSubmit={handleSubmit}>
          {/* Champ Titre */}
          <input
            type="text"
            name="title"
            placeholder="Titre du ticket"
            value={formData.title}
            onChange={handleChange}
            required
          />

          {/* Champ Description */}
          <textarea
            name="description"
            placeholder="Description détaillée"
            value={formData.description}
            onChange={handleChange}
            required
          />

          {/* Sélecteur de Priorité */}
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="Low">Basse</option>
            <option value="Medium">Moyenne</option>
            <option value="High">Haute</option>
          </select>

          <button type="submit">➕ Créer le ticket</button>
        </form>
      </section>

      {/* Affichage de la liste */}
      <section>
        <h2>Liste des tickets</h2>
        <div className="ticket-list">
          {tickets.map(ticket => (
            <div key={ticket.id} className="ticket-card">
              <h3>{ticket.title}</h3>
              <p>{ticket.description}</p>
              <span>Statut : {ticket.status}</span>
              <button onClick={() => deleteTicket(ticket.id)}>Supprimer</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
