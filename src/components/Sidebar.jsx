export default function Sidebar({ user, setPage }) {
  return (
    <aside className="sidebar always-open">
      <h2 className="sidebar-title">Bienvenue {user.nom_complete}</h2>

      <nav className="sidebar-nav">

        {user.role === "admin" && (
          <>
            <button className="nav-item" onClick={() => setPage("gestion_users")}>🛠 Gestion role</button>
            <button className="nav-item" onClick={() => setPage("gestion_bus")}>🚌 Gestion bus</button>
            <button className="nav-item" onClick={() => setPage("gestion_reservation")}>📋 Réservations</button>
            <button className="nav-item" onClick={() => setPage("reclamations")}>📢 Réclamations</button>
          </>
        )}

        {user.role === "client" && (
          <>
            <button className="nav-item" onClick={() => setPage("trajets")}>📦 Réserver</button>
            <button className="nav-item" onClick={() => setPage("solde")}>💳 Solde</button>
            <button className="nav-item" onClick={() => setPage("recharger")}>➕ Recharger Compte</button>
          </>
        )}

        {user.role === "chauffeur" && (
          <>
            <button className="nav-item" onClick={() => setPage("trajets")}>🚌 Mes Trajets</button>
          </>
        )}

        <a href="/" className="nav-item logout">➤ Déconnexion</a>
      </nav>
    </aside>
  );
}
