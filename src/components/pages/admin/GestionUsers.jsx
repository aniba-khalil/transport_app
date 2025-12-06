import React, { useState } from "react";

export default function GestionUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);

  const handleSearch = async () => {
    const res = await fetch("http://10.128.179.175:5000/api/users/search?q=" + search);
    const data = await res.json();
    if (data.success) setUsers(data.users);
  };

  const updateUser = async (u) => {
    const res = await fetch("http://10.128.179.175:5000/api/users/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(u),
    });

    const data = await res.json();
    if (data.success) alert("Mis à jour !");
  };

  return (
    <div className="gestion-container">
      <h2>🔎 Gestion des utilisateurs</h2>

      <input
        type="text"
        placeholder="Rechercher par nom ou email"
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button className="auth-btn" onClick={handleSearch}>Rechercher</button>

      {users.length > 0 && (
        <table className="user-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Solde</th>
              <th>Rôle</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.nom_complete}</td>
                <td>{u.email}</td>

                <td>
                  <input
                    type="number"
                    defaultValue={u.sold}
                    onChange={(e) => (u.sold = e.target.value)}
                  />
                </td>

                <td>
                  <select
                    defaultValue={u.role}
                    onChange={(e) => (u.role = e.target.value)}
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                    <option value="chauffeur">Chauffeur</option>
                  </select>
                </td>

                <td>
                  <button className="update-btn" onClick={() => updateUser(u)}>
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
