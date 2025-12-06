import React, { useState, useEffect } from "react";
import "../../../css/stylerec.css";

export default function GestionReclamations() {
  const [recla, setRecla] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("tous");

  // Charger les réclamations
  const fetchReclamations = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://10.128.179.175:5000/api/reclamations/all");
      const data = await res.json();
      
      if (data.success) {
        setRecla(data.reclamations);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Erreur lors du chargement"
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({
        type: "error",
        text: "Erreur de connexion au serveur"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamations();
  }, []);

  const updateRecla = async (r) => {
    try {
      const res = await fetch("http://10.128.179.175:5000/api/reclamations/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_reclamation: r.id_reclamation,
          status: r.status
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage({
          type: "success",
          text: "Statut mis à jour avec succès"
        });
        
        // Rafraîchir la liste
        fetchReclamations();
        
        // Cacher le message après 3 secondes
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Erreur lors de la mise à jour"
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({
        type: "error",
        text: "Erreur de connexion au serveur"
      });
    }
  };

  // Filtrer les réclamations
  const filteredReclamations = filter === "tous" 
    ? recla 
    : recla.filter(r => r.status === filter);

  // Statistiques
  const stats = {
    total: recla.length,
    en_attente: recla.filter(r => r.status === 'en_attente').length,
    en_cours: recla.filter(r => r.status === 'en_cours').length,
    résolue: recla.filter(r => r.status === 'résolue').length
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch(status) {
      case 'en_attente': return '#f39c12';
      case 'en_cours': return '#3498db';
      case 'résolue': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="gestion-container">
      <h2 className="page-title">📢 Gestion des Réclamations</h2>

      {/* Message de statut */}
      {message.text && (
        <div className={`message-card ${message.type}`}>
          <div className="message-content">
            <span className="message-icon">
              {message.type === "success" ? "✅" : "❌"}
            </span>
            <span className="message-text">{message.text}</span>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="stats-container">
        <div className="stat-card total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-number">{stats.en_attente}</div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card in-progress">
          <div className="stat-number">{stats.en_cours}</div>
          <div className="stat-label">En cours</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-number">{stats.résolue}</div>
          <div className="stat-label">Résolues</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="filter-section">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'tous' ? 'active' : ''}`}
            onClick={() => setFilter('tous')}
          >
            Toutes ({stats.total})
          </button>
          <button 
            className={`filter-btn ${filter === 'en_attente' ? 'active' : ''}`}
            onClick={() => setFilter('en_attente')}
          >
            En attente ({stats.en_attente})
          </button>
          <button 
            className={`filter-btn ${filter === 'en_cours' ? 'active' : ''}`}
            onClick={() => setFilter('en_cours')}
          >
            En cours ({stats.en_cours})
          </button>
          <button 
            className={`filter-btn ${filter === 'résolue' ? 'active' : ''}`}
            onClick={() => setFilter('résolue')}
          >
            Résolues ({stats.résolue})
          </button>
        </div>
        
        <button 
          className="refresh-btn"
          onClick={fetchReclamations}
          disabled={loading}
        >
          {loading ? "Chargement..." : "🔄 Actualiser"}
        </button>
      </div>

      {/* Tableau des réclamations */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des réclamations...</p>
        </div>
      ) : filteredReclamations.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Utilisateur</th>
                <th>Type</th>
                <th>Message</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredReclamations.map((r) => (
                <tr key={r.id_reclamation}>
                  <td className="id-cell">#{r.id_reclamation}</td>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{r.nom_complete}</div>
                      <div className="user-email">{r.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge">
                      {r.type === 'client' ? '👤 Client' : '🚌 Chauffeur'}
                    </span>
                  </td>
                  <td className="message-cell">
                    <div className="message-content">
                      {r.message.length > 100 
                        ? r.message.substring(0, 100) + '...' 
                        : r.message}
                    </div>
                  </td>
                  <td className="date-cell">{formatDate(r.date_envol)}</td>
                  <td>
                    <select 
                      className="status-select"
                      style={{ borderColor: getStatusColor(r.status) }}
                      value={r.status}
                      onChange={(e) => {
                        const updatedRecla = [...recla];
                        const index = updatedRecla.findIndex(item => 
                          item.id_reclamation === r.id_reclamation
                        );
                        if (index !== -1) {
                          updatedRecla[index].status = e.target.value;
                          setRecla(updatedRecla);
                        }
                      }}
                    >
                      <option value="en_attente">⏳ En attente</option>
                      <option value="en_cours">🔄 En cours</option>
                      <option value="résolue">✅ Résolue</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      className="update-btn"
                      onClick={() => updateRecla(r)}
                    >
                      Mettre à jour
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Aucune réclamation</h3>
          <p>Il n'y a aucune réclamation {filter !== 'tous' ? `avec le statut "${filter}"` : ''}.</p>
        </div>
      )}
    </div>
  );
}