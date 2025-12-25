import React, { useState } from "react";
import {API_URL} from '../../constants/constant';
export default function GestionBus() {
  const [searchBus, setSearchBus] = useState("");
  const [buses, setBuses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [matricule, setMatricule] = useState("");
  const [marque, setMarque] = useState("");
  const [nbPlaces, setNbPlaces] = useState("");
  const [message, setMessage] = useState("");
   

  const handleSearchBus = async () => {
    const res = await fetch(`${API_URL}/api/bus/search?q=` + searchBus);
    const data = await res.json();
    if (data.success) setBuses(data.buses);
    else setMessage("Aucun bus trouvé !");
  };
  const updateBus = async (b) => {
  const res = await fetch(`${API_URL}/api/bus/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(b),
  });

  const data = await res.json();
  if (data.success) alert("Bus mis à jour !");
  else alert(data.message);
};


  const ajoutbus = async () => {
    if (!matricule || !marque || !nbPlaces) {
      setMessage("Veuillez remplir tous les champs !");
      return;
    }

    const u = {
      matricule,
      marque,
      nb_places: Number(nbPlaces),
      status: "en_service",
    };

    try {
      const res = await fetch(`${API_URL}/api/bus/ajouter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u),
      });

      const data = await res.json();

      // ⚡ Affichage du message
      setMessage(data.message);

      if (data.success) {
        // ⚡ Vider les champs si succès
        setMatricule("");
        setMarque("");
        setNbPlaces("");
      }
    } catch (error) {
      console.log(error);
      setMessage("Erreur lors de la communication avec le serveur");
    }
  };

  return (
    <div className="gestion-container">
      <h2>🚌 Gestion des Bus</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px", width: "200px" }}>
        <button className="auth-btn" onClick={() => { setShowForm("modifier"); setMessage(""); }}>
          ✏️ Modifier Bus
        </button>
        <button className="auth-btn" onClick={() => { setShowForm("ajouter"); setMessage(""); }}>
          ➕ Ajouter Bus
        </button>
      </div>

      {/* 🔹 Message */}
      {message && <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>}

      {/* 🔍 Formulaire de recherche */}
      {showForm === "modifier" && (
        <>
          <input
            className="search-input"
            type="text"
            placeholder="Rechercher un bus…"
            value={searchBus}
            onChange={(e) => setSearchBus(e.target.value)}
          />
          <button className="auth-btn" onClick={handleSearchBus}>Rechercher</button>
        </>
      )}

      {/* ➕ Formulaire d'ajout */}
      {showForm === "ajouter" && (
        <div>
          <input
            className="search-input"
            type="text"
            placeholder="matricule"
            value={matricule}
            onChange={(e) => setMatricule(e.target.value)}
          />
          <input
            className="search-input"
            type="text"
            placeholder="marque"
            value={marque}
            onChange={(e) => setMarque(e.target.value)}
          />
          <input
            className="search-input"
            type="number"
            placeholder="nombre de places"
            value={nbPlaces}
            onChange={(e) => setNbPlaces(e.target.value)}
          />
          <button className="auth-btn" onClick={ajoutbus}>
            Ajouter
          </button>
        </div>
      )}

      {/* Résultats */}
      {showForm === "modifier" && buses.length > 0 && (
  <table className="user-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Matricule</th>
        <th>Marque</th>
        <th>Places</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {buses.map((b) => (
        <tr key={b.id_bus}>
          <td>{b.id_bus}</td>

          <td>
            <input
              type="text"
              defaultValue={b.matricule}
              onChange={(e) => (b.matricule = e.target.value)}
            />
          </td>

          <td>
            <input
              type="text"
              defaultValue={b.marque}
              onChange={(e) => (b.marque = e.target.value)}
            />
          </td>

          <td>
            <input
              type="number"
              defaultValue={b.nb_places}
              onChange={(e) => (b.nb_places = Number(e.target.value))}
            />
          </td>

          <td>
            <select
              defaultValue={b.status}
              onChange={(e) => (b.status = e.target.value)}
            >
              <option value="en_service">En service</option>
              <option value="en_panne">En panne</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </td>

          <td>
            <button className="update-btn" onClick={() => updateBus(b)}>
              Mettre à jour
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}

    </div>
  );
}
