require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Connexion à MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) console.error("❌ Erreur de connexion DB:", err);
  else console.log("✅ Connecté à MySQL");
});

// 🔹 Route de connexion (login)
app.post("/api/login", (req, res) => {
  const { user, pswd } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [user, pswd], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }

    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false });
    }
  });
});

// 🔹 Route de création de compte (signup)
app.post("/api/signup", (req, res) => {
  const { name, email, tel, pswd } = req.body;

  // Vérifier si l'email existe déjà
  const checkSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkSql, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }

    if (results.length > 0) {
      return res.json({ success: false, message: "Cet email est déjà utilisé." });
    }

    // Insérer le nouvel utilisateur
    const insertSql = "INSERT INTO users (email, password, role, nom_complete, n_tel, sold) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(insertSql, [email, pswd, "client", name, tel, 0], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Erreur lors de la création du compte." });
      }

      res.json({ success: true });
    });
  });
});
// 🔹 Récupérer toutes les réservations groupées par voyage (pour l'admin)
app.get("/api/reservations/all", (req, res) => {
  const sql = `
    SELECT 
      v.id_voyage,
      v.depart,
      v.destination,
      v.prix,
      v.h_depart as heure_depart,
      COUNT(r.id_reservation) as total_reservations,
      GROUP_CONCAT(
        CONCAT(
          'ID:', r.id_reservation,
          ',Client:', u.nom_complete,
          ',Date:', DATE(r.date_depart),
          ',Statut:', r.statut
        ) SEPARATOR '|'
      ) as details_reservations
    FROM voyages v
    LEFT JOIN reservations r ON v.id_voyage = r.voyage_id
    LEFT JOIN users u ON r.client_id = u.id
    GROUP BY v.id_voyage
    ORDER BY v.depart, v.destination
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur SQL:", err);
      return res.json({ 
        success: false, 
        message: "Erreur SQL: " + err.message 
      });
    }
    
    // Parser les détails des réservations
    const formattedResults = results.map(row => {
      const reservations = row.details_reservations ? 
        row.details_reservations.split('|').map(res => {
          const parts = res.split(',');
          const reservationObj = {};
          parts.forEach(part => {
            const [key, value] = part.split(':');
            reservationObj[key] = value;
          });
          return reservationObj;
        }) : [];
      
      return {
        ...row,
        reservations: reservations,
        total_reservations: row.total_reservations || 0
      };
    });
    // 🔹 Récupérer les détails détaillés d'un voyage spécifique
app.get("/api/reservations/voyage/:voyage_id", (req, res) => {
  const voyage_id = req.params.voyage_id;
  
  const sql = `
    SELECT 
      r.id_reservation,
      r.reference,
      r.date_reservation,
      r.statut,
      r.h_depart,
      r.date_depart,
      r.qr_data,
      u.id as client_id,
      u.nom_complete as client_nom,
      u.email as client_email,
      u.n_tel as client_tel,
      u.sold as client_solde,
      v.depart,
      v.destination,
      v.prix,
      v.h_depart as voyage_heure_depart
    FROM reservations r
    JOIN users u ON r.client_id = u.id
    JOIN voyages v ON r.voyage_id = v.id_voyage
    WHERE r.voyage_id = ?
    ORDER BY r.date_reservation DESC
  `;
  
  db.query(sql, [voyage_id], (err, results) => {
    if (err) {
      console.error("Erreur SQL:", err);
      return res.json({ 
        success: false, 
        message: "Erreur SQL: " + err.message 
      });
    }
    
    res.json({ 
      success: true, 
      reservations: results,
      total: results.length
    });
  });
});
    res.json({ 
      success: true, 
      voyages: formattedResults 
    });
  });
});
// 🔹 Recherche de bus
app.get("/api/bus/search", (req, res) => {
  const { q } = req.query;
  const sql = `SELECT id_bus, matricule, marque, nb_places, status
              FROM bus
              WHERE marque LIKE ? OR id_bus LIKE ? OR matricule LIKE ? OR nb_places LIKE ? OR status LIKE ?`;
  db.query(sql, [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`], (err, results) => {
    if (err) return res.json({ success: false, message: "Erreur SQL" });
    res.json({ success: true, buses: results });
  });
});

// 🔹 Recherche d'utilisateurs
app.get("/api/users/search", (req, res) => {
  const { q } = req.query;

  const sql = `
    SELECT id, nom_complete, email, sold, role 
    FROM users 
    WHERE nom_complete LIKE ? OR email LIKE ?
  `;

  db.query(sql, [`%${q}%`, `%${q}%`], (err, results) => {
    if (err) return res.json({ success: false, message: "Erreur SQL" });
    res.json({ success: true, users: results });
  });
});

// 🔹 Mise à jour d'utilisateur
app.post("/api/users/update", (req, res) => {
  const { id, role, sold } = req.body;

  const sql = "UPDATE users SET role = ?, sold = ? WHERE id = ?";

  db.query(sql, [role, sold, id], (err, result) => {
    if (err) return res.json({ success: false, message: "Erreur SQL" });
    res.json({ success: true });
  });
});

// 🔹 Ajouter un bus
app.post("/api/bus/ajouter", (req, res) => {
  const { matricule, marque, nb_places } = req.body;

  // Vérifier que les champs existent
  if (!matricule || !marque || !nb_places) {
    return res.json({ success: false, message: "Champs manquants !" });
  }

  // 🔍 Vérifier si le matricule existe déjà
  const checkSql = "SELECT * FROM bus WHERE matricule = ?";
  db.query(checkSql, [matricule], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Erreur SQL" });
    }

    if (results.length > 0) {
      // Matricule déjà existant
      return res.json({ success: false, message: "Ce matricule existe déjà !" });
    }
 // 🔹 Si non existant, on ajoute
    const insertSql = `
      INSERT INTO bus (matricule, marque, nb_places, status)
      VALUES (?, ?, ?, 'en_service')
    `;
    db.query(insertSql, [matricule, marque, nb_places], (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, message: "Erreur lors de l'insertion" });
      }

      return res.json({
        success: true,
        message: "Bus ajouté avec succès",
        id_bus: result.insertId
      });
    });
  });
});

// 🔹 Mettre à jour un bus
app.post("/api/bus/update", (req, res) => {
  const { id_bus, matricule, marque, nb_places, status } = req.body;

  // 🔍 Vérifier si le matricule existe déjà pour un autre bus
  const checkSql = "SELECT * FROM bus WHERE matricule = ? AND id_bus != ?";
  db.query(checkSql, [matricule, id_bus], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Erreur SQL" });
    }

    if (results.length > 0) {
      return res.json({ success: false, message: "Ce matricule existe déjà !" });
    }

    // 🔹 Mise à jour
    const updateSql = `
      UPDATE bus 
      SET matricule = ?, marque = ?, nb_places = ?, status = ?
      WHERE id_bus = ?
    `;
    db.query(updateSql, [matricule, marque, nb_places, status, id_bus], (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, message: "Erreur lors de la mise à jour" });
      }

      res.json({ success: true, message: "Bus mis à jour avec succès" });
    });
  });
});

// 🔹 Ajouter une réclamation (CORRIGÉ)
app.post("/api/reclamations/ajouter", (req, res) => {
  const { user_id, type, texte } = req.body;
  
  if (!user_id || !type || !texte) {
    return res.json({ 
      success: false, 
      message: "Tous les champs sont obligatoires" 
    });
  }
  
  const sql = "INSERT INTO reclamation (user_id, type, message, status) VALUES (?, ?, ?, 'en_attente')";
  db.query(sql, [user_id, type, texte], (err, result) => {

if (err) {
      console.log(err);
      return res.json({ 
        success: false, 
        message: "Erreur lors de l'ajout de la réclamation." 
      });
    }
    res.json({ 
      success: true, 
      message: "Réclamation ajoutée avec succès", 
      id_reclamation: result.insertId 
    });
  });
});

// 🔹 Récupérer toutes les réclamations (pour l'admin)
// 🔹 Récupérer toutes les réclamations (CORRIGÉ avec date_envoi)
app.get("/api/reclamations/all", (req, res) => {
  const sql = `
    SELECT 
      r.id_reclamation,
      r.user_id,
      r.type,
      r.message,
      r.status,
      r.date_envoi,
      u.nom_complete,
      u.email
    FROM reclamation r
    LEFT JOIN users u ON r.user_id = u.id
    ORDER BY r.date_envoi DESC
  `;
  
  console.log("Exécution de la requête SQL pour récupérer les réclamations");
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Erreur SQL:", err);
      return res.json({ 
        success: false, 
        message: "Erreur SQL: " + err.message 
      });
    }
    
    console.log(`✅ ${results.length} réclamations récupérées`);
    
    res.json({ 
      success: true, 
      reclamations: results 
    });
  });
});

// 🔹 Ajouter une réclamation (CORRIGÉ)
app.post("/api/reclamations/ajouter", (req, res) => {
  const { user_id, type, texte } = req.body;
  
  console.log("Données reçues pour ajout de réclamation:", req.body);
  
  if (!user_id || !type || !texte) {
    return res.json({ 
      success: false, 
      message: "Tous les champs sont obligatoires" 
    });
  }
 const sql = "INSERT INTO reclamation (user_id, type, message, status) VALUES (?, ?, ?, 'en_attente')";
  
  db.query(sql, [user_id, type, texte], (err, result) => {
    if (err) {
      console.error("❌ Erreur SQL lors de l'ajout:", err);
      return res.json({ 
        success: false, 
        message: "Erreur SQL: " + err.message 
      });
    }
    
    console.log("✅ Réclamation ajoutée avec ID:", result.insertId);
    
    res.json({ 
      success: true, 
      message: "Réclamation ajoutée avec succès", 
      id_reclamation: result.insertId 
    });
  });
});

// 🔹 Route de test pour les réclamations (CORRIGÉ)
app.get("/api/reclamations/test", (req, res) => {
  // Test 1: Vérifier les données existantes
  const testSql = `
    SELECT 
      COUNT(*) as count,
      GROUP_CONCAT(status) as statuses
    FROM reclamation
  `;
  
  db.query(testSql, (err, result) => {
    if (err) {
      console.error("Erreur:", err);
      return res.json({ 
        error: err.message,
        sqlState: err.sqlState,
        errno: err.errno 
      });
    }
    
    // Test 2: Voir quelques enregistrements
    const sampleSql = `
      SELECT 
        r.*,
        u.nom_complete,
        u.email
      FROM reclamation r
      LEFT JOIN users u ON r.user_id = u.id
      LIMIT 5
    `;
    
    db.query(sampleSql, (sampleErr, sampleResult) => {
      if (sampleErr) {
        return res.json({ 
          count: result[0].count,
          statuses: result[0].statuses,
          sampleError: sampleErr.message
        });
      }

      res.json({
        count: result[0].count,
        statuses: result[0].statuses,
        samples: sampleResult,
tableInfo: {
          name: "reclamation",
          autoIncrement: "AUTO_INCREMENT=2",
          columns: ["id_reclamation", "user_id", "type", "message", "status", "date_envoi"]
        }
      });
    });
  });
});
/////
app.post("/api/reclamations/update", (req, res) => {
  const { id_reclamation, status } = req.body;
  
  if (!id_reclamation || !status) {
    return res.json({ 
      success: false, 
      message: "ID et statut sont obligatoires" 
    });
  }
  
  const sql = "UPDATE reclamation SET status = ? WHERE id_reclamation = ?";
  
  db.query(sql, [status, id_reclamation], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ 
        success: false, 
        message: "Erreur lors de la mise à jour" 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.json({ 
        success: false, 
        message: "Réclamation non trouvée" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Statut mis à jour avec succès" 
    });
  });
});

// 🔹 Récupérer les réclamations d'un utilisateur spécifique
app.get("/api/reclamations/user/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  
  const sql = `
    SELECT 
      id_reclamation,
      type,
      message,
      status,
      date_envol
    FROM reclamation 
    WHERE user_id = ?
    ORDER BY date_envol DESC
  `;
  
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ 
success: false, 
        message: "Erreur lors de la récupération" 
      });
    }
    
    res.json({ 
      success: true, 
      reclamations: results 
    });
  });
});
// ree
app.post("/api/recharges/code", (req, res) => {
  const { code, user_id } = req.body;

  // Vérifier si le code existe
  const sqlCheck = "SELECT montant FROM recharges WHERE code = ? AND used = 0 LIMIT 1";

  db.query(sqlCheck, [code], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Erreur SQL" });
    }

    if (result.length === 0) {
      return res.json({ success: false, message: "Code invalide ou déjà utilisé." });
    }

    const montant = result[0].montant;

    // Crédite l'utilisateur
    const sqlRecharge = `UPDATE users SET sold = sold + ? WHERE id = ?`;

    db.query(sqlRecharge, [montant, user_id], (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Erreur lors de la recharge" });
      }

      // Marquer le code comme utilisé
      db.query("UPDATE recharges SET used = 1 WHERE code = ?", [code]);

      return res.json({ success: true, message: "Compte rechargé avec succès", montant });
    });
  });
});

// 🔹 Rechercher des voyages
app.get("/api/voyages/recherche", (req, res) => {
  const { depart, destination } = req.query;

  const sql = `
    SELECT 
      id_voyage as id,
      depart, 
      destination, 
      prix, 
      h_depart 
    FROM voyages 
    WHERE depart LIKE ? AND destination LIKE ?
  `;

  db.query(sql, [`%${depart}%`, `%${destination}%`], (err, results) => {
    if (err) return res.json({ success: false, message: "Erreur SQL" });

    res.json({ success: true, voyages: results });});
});
//////////
app.post("/api/voyages/reserver", (req, res) => {
  const { client_id, voyage_id, h_depart, date_depart, qr_data } = req.body;

  console.log("Données de réservation reçues:", req.body);

  if (!client_id || !voyage_id) {
    return res.json({
      success: false,
      message: "client_id et voyage_id sont obligatoires"
    });
  }

  // Démarrer une transaction pour assurer l'intégrité des données
  db.beginTransaction(async (err) => {
    if (err) {
      console.log("Erreur début transaction:", err);
      return res.json({
        success: false,
        message: "Erreur système"
      });
    }

    try {
      // 1. Récupérer le prix du voyage et vérifier qu'il existe
      const voyageSql = `
        SELECT prix, depart, destination, h_depart as voyage_h_depart
        FROM voyages 
        WHERE id_voyage = ?
        FOR UPDATE
      `;

      const [voyageResult] = await db.promise().query(voyageSql, [voyage_id]);

      if (voyageResult.length === 0) {
        await db.promise().rollback();
        return res.json({
          success: false,
          message: "Voyage non trouvé"
        });
      }

      const voyage = voyageResult[0];
      const prixVoyage = parseFloat(voyage.prix);

      // 2. Vérifier le solde du client
      const clientSql = `
        SELECT sold, nom_complete, email 
        FROM users 
        WHERE id = ?
        FOR UPDATE
      `;

      const [clientResult] = await db.promise().query(clientSql, [client_id]);

      if (clientResult.length === 0) {
        await db.promise().rollback();
        return res.json({
          success: false,
          message: "Client non trouvé"
        });
      }

      const client = clientResult[0];
 const soldeClient = parseFloat(client.sold);

      // 3. Vérifier si le solde est suffisant
      if (soldeClient < prixVoyage) {
        await db.promise().rollback();
        return res.json({
          success: false,
          message: `Solde insuffisant. Vous avez ${soldeClient} Dt, le voyage coûte ${prixVoyage} Dt`
        });
      }

      // 4. Vérifier si l'utilisateur n'a pas déjà réservé ce voyage
      const reservationCheckSql = `
        SELECT id_reservation FROM reservations 
        WHERE client_id = ? AND voyage_id = ?
      `;

      const [existingReservations] = await db.promise().query(reservationCheckSql, [client_id, voyage_id]);

      if (existingReservations.length > 0) {
        await db.promise().rollback();
        return res.json({
          success: false,
          message: "Vous avez déjà réservé ce voyage"
        });
      }

      // 5. Générer une référence unique
      const reference = `RES-${voyage_id}-${Date.now()}`;

      // 6. Convertir la date au format MySQL
      let mysqlDate = null;
      if (date_depart) {
        const parts = date_depart.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2];
          mysqlDate = `${year}-${month}-${day}`;
        }
      }

      // 7. Déduire le prix du solde du client
      const nouveauSolde = soldeClient - prixVoyage;
      const updateSoldeSql = `UPDATE users SET sold = ? WHERE id = ?`;
      await db.promise().query(updateSoldeSql, [nouveauSolde, client_id]);

      console.log(`Solde mis à jour: ${soldeClient} -> ${nouveauSolde} Dt pour client ${client_id}`);

      // 8. Insérer la réservation
      const insertReservationSql = `
        INSERT INTO reservations 
        (client_id, voyage_id, h_depart, date_depart, qr_data, reference, statut)
        VALUES (?, ?, ?, ?, ?, ?, 'confirmée')
      `;

      const [insertResult] = await db.promise().query(insertReservationSql, [
        client_id,
        voyage_id,
        h_depart || voyage.voyage_h_depart,
        mysqlDate,
        qr_data,
        reference
      ]);

      // 9. Enregistrer le paiement (optionnel mais recommandé)
  const insertPaiementSql = `
        INSERT INTO paiements (reservation_id, montant, date_paiement)
        VALUES (?, ?, NOW())
      `;

      await db.promise().query(insertPaiementSql, [insertResult.insertId, prixVoyage]);

      // 10. Valider la transaction
      await db.promise().commit();

      // 11. Récupérer les détails complets
      const detailsSql = `
        SELECT 
          r.id_reservation,
          r.reference,
          r.date_reservation,
          r.statut,
          r.h_depart,
          r.date_depart,
          r.qr_data,
          v.depart,
          v.destination,
          v.prix,
          v.h_depart as voyage_heure_depart,
          u.sold as nouveau_solde
        FROM reservations r
        JOIN voyages v ON r.voyage_id = v.id_voyage
        JOIN users u ON r.client_id = u.id
        WHERE r.id_reservation = ?
      `;

      const [detailsResult] = await db.promise().query(detailsSql, [insertResult.insertId]);

      const reservationDetails = detailsResult.length > 0 ? detailsResult[0] : null;

      // 12. Retourner la réponse
      res.json({
        success: true,
        message: `Réservation réussie ! ${prixVoyage} Dt déduits de votre compte`,
        reservation_id: insertResult.insertId,
        reference: reference,
        reservation: reservationDetails,
        nouveau_solde: nouveauSolde,
        montant_debite: prixVoyage,
        qr_data: JSON.parse(qr_data)
      });

    } catch (error) {
      // En cas d'erreur, annuler la transaction
      await db.promise().rollback();
      console.log("Erreur transaction:", error);

      res.json({
        success: false,
        message: "Erreur lors de la réservation: " + error.message
      });
    }
  });
});
/////////////////////
app.post("/api/voyages/mes-reservations", (req, res) => {
  const client_id = req.query.client_id;

  if (!client_id) {
    return res.json({
      success: false,
success: false,
      message: "client_id est obligatoire"
    });
  }

  const sql = `
    SELECT 
      r.id_reservation as id,
      r.reference,
      r.date_reservation,
      r.statut,
      r.h_depart,
      r.date_depart,
      r.qr_data,
      v.depart,
      v.destination,
      v.prix,
      v.h_depart as heure_depart
    FROM reservations r
    JOIN voyages v ON r.voyage_id = v.id_voyage
    WHERE r.client_id = ?
    ORDER BY r.date_reservation DESC
  `;

  db.query(sql, [client_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Erreur lors de la récupération des réservations"
      });
    }

    res.json({
      success: true,
      reservations: result
    });
  });
});

// 🔹 Annuler une réservation (CORRIGÉ)
app.post("/api/voyages/annuler-reservation", (req, res) => {
  const { reservation_id, client_id } = req.body;

  if (!reservation_id || !client_id) {
    return res.json({
      success: false,
      message: "reservation_id et client_id sont obligatoires"
    });
  }

  // Vérifier que la réservation appartient bien au client
  const checkSql = `
    SELECT voyage_id FROM reservations 
    WHERE id_reservation = ? AND client_id = ?
  `;

  db.query(checkSql, [reservation_id, client_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Erreur lors de la vérification"
      });
    }
 if (result.length === 0) {
      return res.json({
        success: false,
        message: "Réservation non trouvée ou non autorisée"
      });
    }

    const voyage_id = result[0].voyage_id;

    // Annuler la réservation
    const cancelSql = `
      UPDATE reservations 
      SET statut = 'annulée' 
      WHERE id_reservation = ? AND client_id = ?
    `;

    db.query(cancelSql, [reservation_id, client_id], (cancelErr, cancelResult) => {
      if (cancelErr) {
        console.log(cancelErr);
        return res.json({
          success: false,
          message: "Erreur lors de l'annulation"
        });
      }

      res.json({
        success: true,
        message: "Réservation annulée avec succès"
      });
    });
  });
});

// 🔹 Vérifier un QR Code (pour le chauffeur) (CORRIGÉ)
app.post("/api/voyages/verifier-qr", (req, res) => {
  const { qr_data } = req.body;

  if (!qr_data) {
    return res.json({
      success: false,
      message: "Données QR requises"
    });
  }

  try {
    const parsedData = typeof qr_data === 'string' ? JSON.parse(qr_data) : qr_data;
    
    const sql = `
      SELECT 
        r.*,
        v.depart,
        v.destination,
        v.h_depart as heure_depart,
        v.prix,
        u.nom_complete as client_nom,
        u.email as client_email
      FROM reservations r
      JOIN voyages v ON r.voyage_id = v.id_voyage
      JOIN users u ON r.client_id = u.id
      WHERE r.reference = ? OR r.voyage_id = ?
    `;

    db.query(sql, [parsedData.reference || parsedData.voyageId, parsedData.voyageId], (err, result) => {
      if (err) {
        console.log(err);
        return res.json({
          success: false,
          message: "Erreur lors de la vérification"
        });
      }

      if (result.length === 0) {
        return res.json({
          success: false,
          valid: false,
          message: "QR Code invalide"
        });
      }

      const reservation = result[0];

      // Vérifier si la réservation est confirmée
      if (reservation.statut !== 'confirmée') {
        return res.json({
          success: false,
          valid: false,
          message: `Réservation ${reservation.statut}`
        });
      }

      // Vérifier la date et l'heure
      const now = new Date();
      const reservationDate = new Date(reservation.date_depart);
      const isValidDate = reservationDate.toDateString() === now.toDateString();

      res.json({
        success: true,
        valid: true,
        message: "QR Code valide",
        reservation: reservation,
        isValidDate: isValidDate
      });
    });
  } catch (error) {
    console.log("Erreur parsing QR:", error);
    return res.json({
      success: false,
      message: "Format QR invalide"
    });
  }
});

// 🔹 Lancer le serveur
app.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Backend disponible sur toutes les IP (0.0.0.0:5000)");
});








