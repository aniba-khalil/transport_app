import React, { useState } from "react";
import {API_URL} from '../../constants/constant.js';

export default function Addreclamations() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [texte, setTexte] = useState("");
  const [type, setType] = useState("client");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const ajoutReclamation = async () => {
    if (!texte.trim()) {
      setMessage({
        type: "error",
        text: "Veuillez entrer le texte de la réclamation."
      });
      return;
    }

    if (texte.length < 10) {
      setMessage({
        type: "error",
        text: "La réclamation doit contenir au moins 10 caractères."
      });
      return;
    }

    setLoading(true);
    
    const reclamationData = {
      user_id: user.id,
      type: user.role || "client",
      texte: texte.trim()
    };

    try {
      const res = await fetch(`${API_URL}/api/reclamations/ajouter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reclamationData),
      });
      
      const data = await res.json();

      setMessage({
        type: data.success ? "success" : "error",
        text: data.message || (data.success ? "Réclamation envoyée avec succès" : "Erreur lors de l'envoi")
      });

      if (data.success) {
        // Vider les champs si succès
        setTexte("");
        setType("client");
        
        // Cacher le message après 5 secondes
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 5000);
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

  return (
    <div className="gestion-container">
      <h2 className="page-title">📢 Ajouter une réclamation</h2>
      
      <div className="reclamation-form">
        {/* Informations utilisateur */}
        <div className="user-info-card">
          <div className="info-row">
            <div className="info-label">Utilisateur:</div>
            <div className="info-value">{user?.nom_complete || user?.name || "Utilisateur"}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Email:</div>
            <div className="info-value">{user?.email}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Type:</div>
            <div className="info-value badge">{user?.role || "client"}</div>
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

        {/* Formulaire de réclamation */}
        <div className="form-group">
          <label className="form-label">
            Description de la réclamation
            <span className="required">*</span>
          </label>
          <textarea 
            className="reclamation-textarea"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Décrivez votre réclamation en détail..."
            rows="8"
            disabled={loading}
          />
          <div className="char-counter">
            {texte.length} caractères (minimum: 10)
          </div>
        </div>

        {/* Instructions */}
        <div className="instructions-card">
          <h4 className="instructions-title">💡 Conseils pour une bonne réclamation:</h4>
          <ul className="instructions-list">
            <li>Soyez clair et précis dans votre description</li>
            <li>Mentionnez les dates, heures et lieux concernés</li>
            <li>Décrivez le problème de manière objective</li>
            <li>Indiquez ce que vous attendez comme résolution</li>
            <li>Évitez les propos injurieux ou diffamatoires</li>
          </ul>
        </div>

        {/* Boutons */}
        <div className="form-actions">
          <button 
            className="secondary-btn"
            onClick={() => setTexte("")}
            disabled={loading || !texte.trim()}
          >
            Effacer
          </button>
          
          <button 
            className="primary-btn"
            onClick={ajoutReclamation}
            disabled={loading || texte.length < 10}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Envoi en cours...
              </>
            ) : (
              "Envoyer la réclamation"
            )}
          </button>
        </div>

        {/* Informations de suivi */}
        <div className="info-card">
          <p className="info-text">
            <strong>ℹ️ Information:</strong> Votre réclamation sera traitée dans les plus brefs délais. 
            Vous pouvez suivre son statut dans la section "Mes réclamations".
          </p>
        </div>
      </div>
    </div>
  );
}