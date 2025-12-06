import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "../../../css/style2.css"; // Import du fichier CSS

export default function Reserver() {
  const [depart, setDepart] = useState("");
  const [destination, setDestination] = useState("");
  const [voyages, setVoyages] = useState([]);
  const [message, setMessage] = useState("");
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [reservationMessage, setReservationMessage] = useState("");

  // Fonction pour déterminer la date
  const determineDate = (departureTime) => {
    const now = new Date();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [hours, minutes] = departureTime.split(':').map(Number);
    const departureToday = new Date(today);
    departureToday.setHours(hours, minutes, 0, 0);
    
    const timeDifference = (departureToday - now) / (1000 * 60);
    
    if (timeDifference > 0 && timeDifference <= 30) {
      return formatDate(today);
    } else {
      return formatDate(tomorrow);
    }
  };

  // Fonction pour formater la date
  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // 🔍 Recherche dans la base de données
  const handleSearch = async () => {
    if (!depart || !destination) {
      setMessage("Veuillez remplir départ ET destination !");
      return;
    }

    const res = await fetch(
      `http://10.128.179.175:5000/api/voyages/recherche?depart=${depart}&destination=${destination}`
    );

    const data = await res.json();

    if (data.success && data.voyages.length > 0) {
      const voyagesAvecDate = data.voyages.map(voyage => ({
        ...voyage,
        date_depart_calculee: determineDate(voyage.h_depart)
      }));
      setVoyages(voyagesAvecDate);
      setMessage("");
    } else {
      setVoyages([]);
      setMessage("Aucun voyage trouvé !");
    }
  };

  // Fonction pour générer les données du QR Code
// Fonction pour générer les données du QR Code
const generateQRData = (voyage) => {
  const dateDepart = voyage.date_depart_calculee || determineDate(voyage.h_depart);
  const user = JSON.parse(localStorage.getItem("user"));
  
  // CORRECTION ICI : Utiliser le bon ID
  const voyageId = voyage.id_voyage || voyage.id;
  
  const qrInfo = {
    voyageId: voyageId, // CORRECTION ICI
    depart: voyage.depart,
    destination: voyage.destination,
    heureDepart: voyage.h_depart,
    dateDepart: dateDepart,
    prix: voyage.prix,
    clientId: user.id,
    clientNom: user.nom || user.name || user.username,
    dateReservation: new Date().toLocaleString(),
    reference: `RES-${voyageId}-${Date.now()}`
  };
  
  return JSON.stringify(qrInfo);
};

  // Fonction de réservation avec QR Code
// Fonction de réservation avec QR Code
const reserverVoyage = async (voyage) => {
  const dateDepart = voyage.date_depart_calculee || determineDate(voyage.h_depart);
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Générer les données pour le QR Code
  const qrData = generateQRData(voyage);
  const reference = `RES-${voyage.id_voyage || voyage.id}-${Date.now()}`;
  
  // Mettre à jour le voyageId dans les données QR
  const qrDataObj = JSON.parse(qrData);
  qrDataObj.voyageId = voyage.id_voyage || voyage.id;
  
  try {
    // Envoyer la réservation au serveur
    const res = await fetch("http://10.128.179.175:5000/api/voyages/reserver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        voyage_id: voyage.id_voyage || voyage.id,
        client_id: user.id, 
        h_depart: voyage.h_depart,
        date_depart: dateDepart,
        qr_data: JSON.stringify(qrDataObj)
      }),
    });

    const data = await res.json();
    
    if (data.success) {
      // Utiliser les données renvoyées par le serveur
      const serverQrData = data.qr_data || qrDataObj;
      const serverReference = data.reference || reference;
      
      // Afficher le message de succès
      setReservationMessage({
        type: "success",
        text: `✅ Réservation réussie ! ${data.message || "Votre ticket a été généré."}`,
        voyage: voyage
      });
      
      // Afficher le QR Code avec les données du serveur
      setQrCodeData({
        data: JSON.stringify(serverQrData),
        voyageInfo: {
          depart: voyage.depart,
          destination: voyage.destination,
          heure: voyage.h_depart,
          date: dateDepart,
          prix: voyage.prix,
          reference: serverReference,
          reservationId: data.reservation_id
        }
      });
      setShowQRCode(true);
      
      // Cacher le message après 5 secondes
      setTimeout(() => {
        setReservationMessage("");
      }, 5000);
    } else {
      setReservationMessage({
        type: "error",
        text: `❌ Erreur : ${data.message || "Veuillez réessayer."}`
      });
    }
  } catch (error) {
    console.error("Erreur lors de la réservation:", error);
    setReservationMessage({
      type: "error",
      text: "❌ Erreur de connexion au serveur"
    });
  }
};

  // Fonction pour télécharger le QR Code
  const downloadQRCode = () => {
    const svg = document.getElementById("qr-code-svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `ticket-${qrCodeData.voyageInfo.reference}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="gestion-container">
      <h2 className="page-title">🚍 Rechercher un voyage</h2>

      <div className="search-form">
        <input
          type="text"
          placeholder="Départ"
          className="search-input"
          value={depart}
          onChange={(e) => setDepart(e.target.value)}
        />

        <input
          type="text"
          placeholder="Destination"
          className="search-input"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <button className="search-btn" onClick={handleSearch}>
          Rechercher
        </button>
      </div>

      {message && (
        <p className="error-message">{message}</p>
      )}

      {/* Message de confirmation de réservation */}
      {reservationMessage && (
        <div className={`reservation-message ${reservationMessage.type}`}>
          <p className="message-text">{reservationMessage.text}</p>
          {reservationMessage.type === "success" && reservationMessage.voyage && (
            <div className="voyage-details">
              <p>Départ: {reservationMessage.voyage.depart} → {reservationMessage.voyage.destination}</p>
              <p>Prix: {reservationMessage.voyage.prix} Dt</p>
            </div>
          )}
        </div>
      )}

      {/* Modal QR Code */}
      {showQRCode && qrCodeData && (
        <div className="qr-modal-overlay">
          <div className="qr-modal-container">
            <div className="qr-modal-header">
              <h3 className="qr-modal-title">🎫 Ticket de Voyage</h3>
              <span className="confirmation-badge">
                Confirmé
              </span>
            </div>
            
            {/* Informations du voyage */}
            <div className="voyage-info-card">
              <div className="info-row">
                <div className="info-column">
                  <p className="info-label">Référence:</p>
                  <p className="info-value">{qrCodeData.voyageInfo.reference}</p>
                </div>
                <div className="info-column align-right">
                  <p className="info-label">Prix:</p>
                  <p className="price-value">{qrCodeData.voyageInfo.prix} Dt</p>
                </div>
              </div>
              
              <div className="route-info">
                <div className="location-column">
                  <p className="location-label">Départ</p>
                  <p className="location-value">{qrCodeData.voyageInfo.depart}</p>
                </div>
                <div className="arrow-column">
                  <div className="arrow">→</div>
                </div>
                <div className="location-column">
                  <p className="location-label">Destination</p>
                  <p className="location-value">{qrCodeData.voyageInfo.destination}</p>
                </div>
              </div>
              
              <div className="datetime-info">
                <div className="datetime-column">
                  <p className="datetime-label">Date</p>
                  <p className="datetime-value">{qrCodeData.voyageInfo.date}</p>
                </div>
                <div className="datetime-column">
                  <p className="datetime-label">Heure</p>
                  <p className="datetime-value">{qrCodeData.voyageInfo.heure}</p>
                </div>
              </div>
            </div>
            
            {/* QR Code SVG */}
            <div className="qr-code-container">
              <p className="qr-instruction">
                Présentez ce QR Code au conducteur
              </p>
              <QRCodeSVG 
                id="qr-code-svg"
                value={qrCodeData.data}
                size={200}
                level="H"
                includeMargin={true}
                className="qr-code"
              />
            </div>
            
            <p className="validity-text">
              ⏱️ Valable pour le {qrCodeData.voyageInfo.date} à {qrCodeData.voyageInfo.heure}
            </p>
            
            <div className="modal-buttons">
              <button 
                className="close-btn"
                onClick={() => {
                  setShowQRCode(false);
                  setQrCodeData(null);
                }}
              >
                Fermer
              </button>
              
              <button 
                className="download-btn"
                onClick={downloadQRCode}
              >
                <span className="download-icon">📥</span> Télécharger le ticket
              </button>
            </div>
            
            <p className="disclaimer-text">
              Ce ticket est personnel et non transférable
            </p>
          </div>
        </div>
      )}

      {voyages.length > 0 && (
        <div className="voyages-table-container">
          <table className="voyages-table">
            <thead>
              <tr>
                <th>Départ</th>
                <th>Arrivée</th>
                <th>Heure</th>
                <th>Date</th>
                <th>Prix</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {voyages.map((v) => (
                <tr key={v.id}>
                  <td className="price-cell">{v.depart}</td>
                  <td className="price-cell">{v.destination}</td>
                  <td className="price-cell">{v.h_depart}</td>
                  <td  className="price-cell">{v.date_depart_calculee}</td>
                  <td className="price-cell">{v.prix} Dt</td>
                  <td>
                    <button
                      className="reserve-btn"
                      onClick={() => reserverVoyage(v)}
                    >
                      Réserver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}