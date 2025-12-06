import React, { useState } from "react";

export default function Recharge() {
  const [code, setCode] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const Recharge = async () => {
    if (!code) {
      alert("Veuillez entrer le code de recharge.");
      return;
    }
    const r = {
      code,
      user_id: user.id,
    };
  const res = await fetch("http://10.128.179.175:5000/api/recharges/code", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(r),
}).catch(() => {
  alert("Le serveur est inaccessible !");
  return;
});

if (!res) return;

const data = await res.json();

if (!data.success) alert(data.message);
else alert("Recharge réussie !");
  };
  return (
    <div className="gestion-container">
      <h2>💳 Recharger le Compte</h2>
      <input type="text" className="search-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Entrez le code de recharge" />

      <button className="auth-btn" style={{ marginTop: "10px" }} onClick={Recharge}>
        Recharger
      </button>
    </div>
  );
}
