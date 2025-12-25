import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/stylerecharge.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card auth-home">
        <h1>Transport App</h1>

        <p className="home-description">
          Transport App vous permet de :
          <br />• Réserver vos trajets facilement
          <br />• Gérer votre compte
          <br />• Suivre vos voyages en temps réel
        </p>

        <button
          className="auth-btn"
          onClick={() => navigate("/auth")}
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}
