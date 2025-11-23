import React from "react";

export default function Recharge() {
  return (
    <div className="gestion-container">
      <h2>💳 Recharger le Compte</h2>

      <label>Montant :</label>
      <input className="search-input" type="number" />

      <button className="auth-btn" style={{ marginTop: "10px" }}>
        Recharger
      </button>
    </div>
  );
}
