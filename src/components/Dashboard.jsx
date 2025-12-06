import React, { useState } from "react";
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
import "../css/style.css";

export default function Dashboard() {
  const [page, setPage] = useState("GestionUsers");
  const user = JSON.parse(localStorage.getItem("user"));

  const renderContent = () => {
    switch (page) {
      case "gestion_users": return <GestionUsers />;
      case "gestion_bus": return <GestionBus />;
      case "gestion_reservation": return <GestionReservations />;
      case "reclamations": return <GestionReclamations />;
      case "recharger": return <Recharge />;
      case "trajets": return <TrajetsChauffeur />;
      case "scanner": return <Scanner />;
      case "add_reclamation": return <Addreclamations />;
      case "reserver": return <Reserver />;
      default: return <GestionUsers user={user} />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        <Sidebar user={user} setPage={setPage} />
        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
