import React, { useState } from "react";
import {API_URL} from '../../constants/constant.js';
import { useUser } from '../../../context/UserContext.jsx'; // Ajouter cette ligne

export default function Recharge({ updateBalance }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useUser(); // Récupérer l'utilisateur du contexte

  const handleRecharge = async () => {
    if (!code.trim()) {
      setMessage({
        type: "error",
        text: "Veuillez entrer le code de recharge."
      });
      return;
    }

    setLoading(true);
    
    const rechargeData = {
      code: code.trim(),
      user_id: user.id,
    };

    try {
      const res = await fetch(`${API_URL}/api/recharges/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rechargeData),
      });

      if (!res.ok) {
        throw new Error("Erreur serveur");
      }

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `✅ Recharge réussie ! ${data.montant} Dt ajoutés à votre compte.`
        });
        
        // Mettre à jour le solde dans le contexte
        const newBalance = parseFloat(user.sold) + parseFloat(data.montant);
        updateBalance(newBalance);
        
        // Vider le champ de code
        setCode("");
        
        // Cacher le message après 5 secondes
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 5000);
      } else {
        setMessage({
          type: "error",
          text: `❌ ${data.message || "Erreur lors de la recharge"}`
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({
        type: "error",
        text: "❌ Erreur de connexion au serveur"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gestion-container">
      <h2 className="page-title">💳 Recharger le Compte</h2>
      
      <div className="recharge-form">
        {/* Informations du compte */}
        <div className="account-info-card">
          <div className="info-row">
            <div className="info-label">Solde actuel:</div>
            <div className="info-value balance">{user?.sold || 0} Dt</div>
          </div>
          <div className="info-row">
            <div className="info-label">Nom:</div>
            <div className="info-value">{user?.nom_complete}</div>
          </div>
        </div>

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

        {/* Formulaire de recharge */}
        <div className="form-group">
          <label className="form-label">
            Code de recharge
            <span className="required">*</span>
          </label>
          <input
            type="text"
            className="recharge-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Entrez votre code de recharge"
            disabled={loading}
          />
          <div className="input-hint">
            Codes de test disponibles: RECHARGE100, RECHARGE50, RECHARGE20, TESTCODE10
          </div>
        </div>

        {/* Bouton de recharge */}
        <div className="form-actions">
          <button
            className="recharge-btn"
            onClick={handleRecharge}
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Recharge en cours...
              </>
            ) : (
              "💳 Recharger le compte"
            )}
          </button>
        </div>

        {/* Informations */}
        <div className="info-card">
          <h4 className="info-title">ℹ️ Comment obtenir un code de recharge ?</h4>
          <ul className="info-list">
            <li>Dans les agences de transport partenaires</li>
            <li>Par carte prépayée dans les points de vente</li>
            <li>Via les distributeurs automatiques</li>
            <li>En ligne sur notre site web</li>
          </ul>
        </div>
      </div>
    </div>
  );
}