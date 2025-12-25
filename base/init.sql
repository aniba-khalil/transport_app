/* =========================
   DATABASE
   ========================= */
CREATE DATABASE IF NOT EXISTS bus_tn
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bus_tn;

/* =========================
   TABLE: users
   ========================= */
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(30) NOT NULL UNIQUE,
  password VARCHAR(30) NOT NULL,
  role ENUM('admin','chauffeur','client') NOT NULL,
  nom_complete VARCHAR(40) NOT NULL,
  n_tel INT NOT NULL UNIQUE,
  sold DECIMAL(10,2) NOT NULL
);
insert into users (email, password, role, nom_complete, n_tel, sold) values ('admin12345', 'admin12345', 'admin', 'Admin User', 1234567890, 100.00);

/* =========================
   TABLE: bus
   ========================= */
CREATE TABLE bus (
  id_bus INT AUTO_INCREMENT PRIMARY KEY,
  matricule VARCHAR(20) NOT NULL UNIQUE,
  marque VARCHAR(50) NOT NULL,
  nb_places INT NOT NULL,
  status ENUM('en_service','en_panne','maintenance') DEFAULT 'en_service'
);

/* =========================
   TABLE: voyages
   ========================= */
CREATE TABLE voyages (
  id_voyage INT AUTO_INCREMENT PRIMARY KEY,
  depart VARCHAR(50) NOT NULL,
  destination VARCHAR(50) NOT NULL,
  prix DECIMAL(10,2) NOT NULL,
  chauffeur_id INT NOT NULL,
  bus_id INT NOT NULL,
  h_depart TIME,
  CONSTRAINT fk_voyage_chauffeur
    FOREIGN KEY (chauffeur_id) REFERENCES users(id),
  CONSTRAINT fk_voyage_bus
    FOREIGN KEY (bus_id) REFERENCES bus(id_bus)
);

/* =========================
   TABLE: reservations
   ========================= */
CREATE TABLE reservations (
  id_reservation INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  voyage_id INT NOT NULL,
  h_depart TIME,
  date_depart DATE,
  qr_data TEXT,
  reference VARCHAR(100),
  statut VARCHAR(20) DEFAULT 'confirmée',
  date_reservation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservation_client
    FOREIGN KEY (client_id) REFERENCES users(id),
  CONSTRAINT fk_reservation_voyage
    FOREIGN KEY (voyage_id) REFERENCES voyages(id_voyage)
);

/* =========================
   TABLE: paiements
   ========================= */
CREATE TABLE paiements (
  id_paiement INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_paiement_reservation
    FOREIGN KEY (reservation_id) REFERENCES reservations(id_reservation)
);

/* =========================
   TABLE: recharges
   ========================= */
CREATE TABLE recharges (
  code VARCHAR(50) PRIMARY KEY,
  montant DECIMAL(10,2),
  used TINYINT DEFAULT 0
);

/* =========================
   TABLE: reclamation
   ========================= */
CREATE TABLE reclamation (
  id_reclamation INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('client','chauffeur') NOT NULL,
  message TEXT NOT NULL,
  status ENUM('en_attente','en_cours','résolue') DEFAULT 'en_attente',
  date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reclamation_user
    FOREIGN KEY (user_id) REFERENCES users(id)
);
