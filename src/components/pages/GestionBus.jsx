import React, { useState } from "react";

export default function GestionBus() {
  const [searchBus, setSearchBus] = useState("");
  const [buses, setBuses] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const handleSearchBus = async () => {
    const res = await fetch("http://10.128.179.175:5000/api/bus/search?q=" + searchBus);
    const data = await res.json();
    if (data.success) setBuses(data.buses);
  };

  return (
    <div className="gestion-container">
      <h2>🚌 Gestion des Bus</h2>

      <input
        className="search-input"
        type="text"
        placeholder="Rechercher un bus…"
        value={searchBus}
        onChange={(e) => setSearchBus(e.target.value)}
      />

      <button className="auth-btn" onClick={handleSearchBus}>Rechercher</button>

      <button className="add-btn" onClick={() => setShowForm(!showForm)}>➕ Ajouter un Bus</button>

      {showForm && (
        <div>
          <label>Matricule :</label>
          <input className="search-input" type="text" />

          <label>Nombre de places :</label>
          <input className="search-input" type="number" />
          <button className="auth-btn">Ajouter</button>
        </div>
      )}

      {buses.length > 0 && (
        <table className="user-table">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Marque</th>
              <th>Places</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {buses.map((b) => (
              <tr key={b.id_bus}>
                <td>{b.matricule}</td>
                <td>{b.marque}</td>
                <td>{b.nb_places}</td>
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
