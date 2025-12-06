import React, { useState } from "react";

export default function GestionReservations() {
  const [reservations, setReservations] = useState([]);

  const adminGererVoyage = (r) => {
    alert(
      r.total_clients < 10
        ? "🚗 Petite voiture"
        : r.total_clients <= 40
        ? "🚌 1 Bus"
        : r.total_clients <= 100
        ? "🚌🚌 2 Bus"
        : "❗ Trop de clients"
    );
  };

  return (
    <div className="gestion-container">
      <h2>📋 Gestion des Réservations</h2>

      {reservations.length > 0 ? (
        <table className="user-table">
          <thead>
            <tr>
              <th>Voyage</th>
              <th>Clients</th>
              <th>Véhicule</th>
              <th>Gérer</th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((r) => (
              <tr key={r.voyage_id}>
                <td>{r.depart} → {r.destination}</td>
                <td>{r.total_clients}</td>
                <td>{r.vehicule}</td>

                <td>
                  <button className="update-btn" onClick={() => adminGererVoyage(r)}>
                    Gérer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aucune réservation trouvée.</p>
      )}

    </div>
  );
}
