import React from "react";

import {API_URL} from './constants/constant.js';

export default function Recharge() {
    const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div className="gestion-container">
        <h2>Bienvenue sur votre tableau de bord, {user.nom_complete}!</h2>
    </div>
  );
}
