import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Erreur de parsing du user:', error);
      localStorage.removeItem('user');
      return null;
    }
  });

  // Synchroniser avec localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Mettre à jour le solde
  const updateUserBalance = (newBalance) => {
    if (user) {
      const updatedUser = { ...user, sold: parseFloat(newBalance) };
      setUser(updatedUser);
    }
  };

  // Mettre à jour complètement l'utilisateur
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Déconnexion sécurisée
  const logout = () => {
    // Vider toutes les données utilisateur
    setUser(null);
    
    // Nettoyer tout le stockage
    localStorage.clear();
    sessionStorage.clear();
    
    // Nettoyer les cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Forcer le rechargement de la page pour nettoyer l'état React
    window.location.href = '/';
    window.location.reload();
  };

  // Vérifier si l'utilisateur est encore valide
  const validateUser = () => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser && user) {
      // L'utilisateur a été supprimé du localStorage mais pas du contexte
      logout();
      return false;
    }
    return true;
  };

  // Vérifier périodiquement la validité de la session
  useEffect(() => {
    const checkSession = () => {
      if (user && !validateUser()) {
        logout();
      }
    };

    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkSession, 30000);
    
    // Vérifier au changement d'onglet/fenêtre
    window.addEventListener('focus', checkSession);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkSession);
    };
  }, [user]);

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUserBalance, 
      updateUser, 
      logout,
      validateUser 
    }}>
      {children}
    </UserContext.Provider>
  );
};