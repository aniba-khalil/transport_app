import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/stylerecharge.css";
import {API_URL} from './constants/constant.js';
import { useUser } from "../context/UserContext"; 

export default function LoginSignup() {
  const [isSignup, setIsSignup] = useState(false);

  // Champs login
  const [loginUser, setLoginUser] = useState("");
  const [loginPswd, setLoginPswd] = useState("");

  // Champs signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [pswd, setPswd] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // nav 
  const navigate = useNavigate();
  const { updateUser } = useUser(); 


  // ========================= LOGIN =========================
  const handleLogin = async () => {
    setError("");
    setSuccess("");

    const res = await fetch(`${API_URL}/api/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ user: loginUser, pswd: loginPswd }),
});


    const data = await res.json();

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard")
    } else {
      setError("Email ou mot de passe incorrect !");
    }
  };

  // ========================= SIGNUP =========================
  const handleSignup = async () => {
    setError("");
    setSuccess("");

    const res = await fetch(`${API_URL}/api/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, tel, pswd }),
});


    const data = await res.json();

    if (data.success) {
      setSuccess("Compte créé avec succès !");
      setIsSignup(false);
    } else {
      setError(data.message || "Erreur lors de la création.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* LOGIN */}
        {!isSignup && (
          <div className="auth-panel left">
            <h2>Se connecter</h2>

            <input 
              type="text" 
              placeholder="Email"
              value={loginUser}
              onChange={(e) => setLoginUser(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Mot de passe"
              value={loginPswd}
              onChange={(e) => setLoginPswd(e.target.value)}
            />

            <button className="auth-btn" onClick={handleLogin}>
              Se connecter
            </button>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <p className="auth-switch">
              Vous n'avez pas de compte ?{" "}
              <button onClick={() => setIsSignup(true)}>Créer un compte</button>
            </p>
          </div>
        )}

        {/* SIGNUP */}
        {isSignup && (
          <div className="auth-panel right">
            <h2>Créer un compte</h2>

            <input 
              type="text" 
              placeholder="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Numéro téléphone"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Mot de passe"
              value={pswd}
              onChange={(e) => setPswd(e.target.value)}
            />

            <button className="auth-btn" onClick={handleSignup}>
              Créer le compte
            </button>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <p className="auth-switch">
              Vous avez déjà un compte ?{" "}
              <button onClick={() => setIsSignup(false)}>Se connecter</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
