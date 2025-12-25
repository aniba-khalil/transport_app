import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import GestionUsers from "./pages/admin/GestionUsers";
import GestionBus from "./pages/admin/GestionBus";
import GestionReservations from "./pages/admin/GestionReservations";
import GestionReclamations from "./pages/admin/GestionReclamations";
import Recharge from "./pages/user/Recharge";
import TrajetsChauffeur from "./pages/admin/TrajetsChauffeur";
import Scanner from "./pages/admin/Scanner";
import Addreclamations from "./pages/user/Addreclamations";
import Reserver from "./pages/user/Reserver";
import Welcome from "./Welcome";
import "../css/style.css";
import { useUser } from "../context/UserContext";

export default function Dashboard() {
  const [page, setPage] = useState("Welcome");
  const [loading, setLoading] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(0);
  const { user, updateUser, validateUser } = useUser();

  // Vérifier et synchroniser l'utilisateur
  const syncUser = useCallback(() => {
    const savedUser = localStorage.getItem('user');
    
    if (!savedUser && user) {
      // Déconnexion si l'utilisateur a été supprimé
      window.location.href = '/';
      return;
    }

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // Vérifier si l'utilisateur a changé
        if (user && parsedUser.id !== user.id) {
          // Forcer le rechargement complet
          window.location.reload();
          return;
        }
        
        // Mettre à jour si nécessaire
        if (!user || JSON.stringify(parsedUser) !== JSON.stringify(user)) {
          updateUser(parsedUser);
        }
      } catch (error) {
        console.error("Erreur lors du parsing de l'utilisateur:", error);
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    
    setLoading(false);
  }, [user, updateUser]);

  useEffect(() => {
    syncUser();
    
    // Vérifier périodiquement
    const interval = setInterval(syncUser, 5000);
    
    // Écouter les changements de localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === null) {
        syncUser();
        setForceRefresh(prev => prev + 1);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncUser]);

  // Forcer le rechargement lors du changement d'utilisateur
  useEffect(() => {
    setPage("Welcome");
    setForceRefresh(prev => prev + 1);
  }, [user?.id]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="auth-required">
          <h2>Session expirée</h2>
          <p>Veuillez vous reconnecter</p>
          <button 
            className="auth-btn" 
            onClick={() => window.location.href = '/'}
          >
            Se connecter
          </button>
        </div>
      );
    }

    // Ajouter une clé unique pour forcer le remontage des composants
    const key = `${page}_${user.id}_${forceRefresh}`;

    switch (page) {
      case "gestion_users": return <GestionUsers key={key} />;
      case "gestion_bus": return <GestionBus key={key} />;
      case "gestion_reservations": return <GestionReservations key={key} />;
      case "reclamations": return <GestionReclamations key={key} />;
      case "recharger": return <Recharge key={key} />;
      case "trajets": return <TrajetsChauffeur key={key} />;
      case "scanner": return <Scanner key={key} />;
      case "add_reclamation": return <Addreclamations key={key} />;
      case "reserver": return <Reserver key={key} />;
      default: return <Welcome key={key} user={user} />;
    }
  };

  return (
    <div className="dashboard-container" key={forceRefresh}>
      <div className="dashboard-layout">
        {!loading && user && <Sidebar user={user} setPage={setPage} />}
        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}