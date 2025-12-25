import React, { useState, useEffect } from "react";
import {API_URL} from '../../constants/constant.js';
import "../../../css/res.css";

export default function GestionReservations() {
  const [voyages, setVoyages] = useState([]);
  const [selectedVoyage, setSelectedVoyage] = useState(null);
  const [voyageDetails, setVoyageDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [message, setMessage] = useState("");
  const [view, setView] = useState("list"); // "list" ou "details"

  // Charger tous les voyages avec leurs réservations
  useEffect(() => {
    fetchVoyages();
  }, []);

  const fetchVoyages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/reservations/all`);
      const data = await res.json();
      
      if (data.success) {
        setVoyages(data.voyages);
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

  // Charger les détails d'un voyage spécifique
  const fetchVoyageDetails = async (voyageId) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`${API_URL}/api/reservations/voyage/${voyageId}`);
      const data = await res.json();
      
      if (data.success) {
        setVoyageDetails(data.reservations);
        setView("details");
      } else {
        setMessage({
          type: "error",
          text: data.message || "Erreur lors du chargement des détails"
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({
        type: "error",
        text: "Erreur de connexion au serveur"
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Calculer le type de véhicule nécessaire
  const calculateVehicleNeeded = (totalPassengers) => {
    if (totalPassengers === 0) return "Aucun véhicule";
    if (totalPassengers <= 8) return "🚗 Voiture (8 places)";
    if (totalPassengers <= 20) return "🚐 Minibus (20 places)";
    if (totalPassengers <= 40) return "🚌 Bus (40 places)";
    if (totalPassengers <= 80) return "🚌🚌 2 Bus (80 places)";
    return "🚌🚌🚌 3 Bus ou plus";
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Revenir à la liste
  const backToList = () => {
    setView("list");
    setSelectedVoyage(null);
    setVoyageDetails([]);
  };

  return (
    <div className="gestion-container">
      <h2>📋 Gestion des Réservations par Voyage</h2>

      {/* Message de statut */}
      {message && (
        <div className={`message-${message.type}`}>
          {message.text}
        </div>
      )}

      {view === "list" ? (
        <>
          {/* Statistiques */}
          <div className="stats-summary">
            <div className="stat-card">
              <h3>Total Voyages</h3>
              <p>{voyages.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Réservations</h3>
              <p>{voyages.reduce((sum, v) => sum + (v.total_reservations || 0), 0)}</p>
            </div>
            <div className="stat-card">
              <h3>Voyages avec réservations</h3>
              <p>{voyages.filter(v => v.total_reservations > 0).length}</p>
            </div>
          </div>

          {/* Liste des voyages */}
          {loading ? (
            <div className="loading">
              <p>Chargement des voyages...</p>
            </div>
          ) : voyages.length > 0 ? (
            <div className="table-container">
              <table className="voyage-table">
                <thead>
                  <tr>
                    <th>ID Voyage</th>
                    <th>Trajet</th>
                    <th>Heure</th>
                    <th>Prix</th>
                    <th>Réservations</th>
                    <th>Véhicule</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {voyages.map((voyage) => (
                    <tr key={voyage.id_voyage} className={voyage.total_reservations > 0 ? "has-reservations" : ""}>
                      <td>#{voyage.id_voyage}</td>
                      <td>
                        <strong>{voyage.depart}</strong> → {voyage.destination}
                      </td>
                      <td>{voyage.heure_depart}</td>
                      <td>{voyage.prix} Dt</td>
                      <td>
                        <span className={`reservation-count ${voyage.total_reservations > 0 ? 'active' : ''}`}>
                          {voyage.total_reservations || 0} réservation(s)
                        </span>
                      </td>
                      <td>
                        <span className="vehicle-info">
                          {calculateVehicleNeeded(voyage.total_reservations || 0)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="details-btn"
                          onClick={() => {
                            setSelectedVoyage(voyage);
                            fetchVoyageDetails(voyage.id_voyage);
                          }}
                          disabled={!voyage.total_reservations}
                        >
                          {voyage.total_reservations ? "📋 Voir détails" : "Aucune réservation"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>Aucun voyage trouvé.</p>
            </div>
          )}
        </>
      ) : (
        /* Vue détaillée d'un voyage */
        <div className="voyage-details-view">
          <button className="back-btn" onClick={backToList}>
            ← Retour à la liste
          </button>

          {selectedVoyage && (
            <div className="voyage-header">
              <h3>
                Voyage #{selectedVoyage.id_voyage}: {selectedVoyage.depart} → {selectedVoyage.destination}
              </h3>
              <div className="voyage-info">
                <p><strong>Heure de départ:</strong> {selectedVoyage.heure_depart}</p>
                <p><strong>Prix:</strong> {selectedVoyage.prix} Dt</p>
                <p><strong>Total réservations:</strong> {selectedVoyage.total_reservations}</p>
                <p><strong>Véhicule recommandé:</strong> {calculateVehicleNeeded(selectedVoyage.total_reservations || 0)}</p>
              </div>
            </div>
          )}

          {loadingDetails ? (
            <div className="loading">
              <p>Chargement des détails...</p>
            </div>
          ) : voyageDetails.length > 0 ? (
            <div className="table-container">
              <h4>Détails des réservations</h4>
              <table className="reservations-table">
                <thead>
                  <tr>
                    <th>ID Réservation</th>
                    <th>Client</th>
                    <th>Contact</th>
                    <th>Date Réservation</th>
                    <th>Date Voyage</th>
                    <th>Statut</th>
                    <th>Référence</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {voyageDetails.map((reservation) => (
                    <tr key={reservation.id_reservation}>
                      <td>#{reservation.id_reservation}</td>
                      <td>
                        <strong>{reservation.client_nom}</strong><br />
                        <small>Solde: {reservation.client_solde} Dt</small>
                      </td>
                      <td>
                        {reservation.client_email}<br />
                        {reservation.client_tel}
                      </td>
                      <td>{formatDate(reservation.date_reservation)}</td>
                      <td>
                        {formatDate(reservation.date_depart)}<br />
                        <small>{reservation.h_depart}</small>
                      </td>
                      <td>
                        <span className={`status-badge ${reservation.statut}`}>
                          {reservation.statut}
                        </span>
                      </td>
                      <td>
                        <code>{reservation.reference}</code>
                      </td>
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => alert(`QR Code: ${reservation.qr_data ? 'Disponible' : 'Non disponible'}`)}
                        >
                          Voir QR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>Aucune réservation pour ce voyage.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}