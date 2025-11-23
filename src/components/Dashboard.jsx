import React, { useState } from "react";
import Sidebar from "./Sidebar";


import GestionUsers from "./pages/GestionUsers";
import GestionBus from "./pages/GestionBus";
import GestionReservations from "./pages/GestionReservations";
import GestionReclamations from "./pages/GestionReclamations";
import Recharge from "./pages/Recharge";
import TrajetsChauffeur from "./pages/TrajetsChauffeur";
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
