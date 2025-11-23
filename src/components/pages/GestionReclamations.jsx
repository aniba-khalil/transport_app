import React, { useState } from "react";

export default function GestionReclamations() {
  const [recla, setRecla] = useState([]);

  const updateRecla = async (r) => {
    const res = await fetch("http://10.128.179.175:5000/api/reclamations/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(r),
    });
    const data = await res.json();
    if (data.success) alert("Réclamation mise à jour !");
  };

  return (
    <div className="gestion-container">
      <h2>📢 Réclamations</h2>

      {recla.length > 0 ? (
        <table className="user-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Type</th>
              <th>Message</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {recla.map((r) => (
              <tr key={r.id_reclamation}>
                <td>{r.nom_complete}</td>
                <td>{r.type}</td>
                <td>{r.message}</td>

                <td>
                  <select defaultValue={r.status} onChange={(e) => (r.status = e.target.value)}>
                    <option value="en_attente">En attente</option>
                    <option value="en_cours">En cours</option>
                    <option value="résolue">Résolue</option>
                  </select>
                </td>

                <td>
                  <button className="update-btn" onClick={() => updateRecla(r)}>
                    Mettre à jour
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aucune réclamation.</p>
      )}
    </div>
  );
}
