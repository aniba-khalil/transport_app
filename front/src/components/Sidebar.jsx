import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ user, setPage }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("user");
    
    // Clear session storage
    sessionStorage.clear();
    
    // Redirect to login page
    navigate("/", { replace: true });
    
    // Prevent back button navigation
    window.history.pushState(null, "", window.location.href);
    
    // Add event listener to prevent back navigation
    window.onpopstate = function() {
      window.history.go(1);
    };
  };

  return (
    <aside className="sidebar always-open">
      <h2 className="sidebar-title"> Dashboard </h2>

      <nav className="sidebar-nav">

        {user.role === "admin" && (
          <>
            <button className="nav-item" onClick={() => setPage("gestion_users")}>🛠 Gestion role</button>
            <button className="nav-item" onClick={() => setPage("gestion_bus")}>🚌 Gestion bus</button>
            <button className="nav-item" onClick={() => setPage("gestion_reservations")}>📋 Gestion réservations</button>
            <button className="nav-item" onClick={() => setPage("reclamations")}>📢 Réclamations</button>
            <button className="nav-item" onClick={() => setPage("scanner")}>📷 Scanner le code </button>
          </>
        )}

        {user.role === "client" && (
          <>
            <p className="sidebar-title">solde: {user.sold} Dt</p>
            <button className="nav-item" onClick={() => setPage("reserver")}> Réserver</button>
            <button className="nav-item" onClick={() => setPage("add_reclamation")}> Ajouter Réclamation</button>
            <button className="nav-item" onClick={() => setPage("recharger")}> Recharger Compte</button>
          </>
        )}

        {user.role === "chauffeur" && (
          <>
            <button className="nav-item" onClick={() => setPage("trajets")}>🚌 Mes Trajets</button>
          </>
        )}

        <button className="nav-item logout" onClick={handleLogout}>
          ➤ Déconnexion
        </button>
      </nav>
    </aside>
  );
}