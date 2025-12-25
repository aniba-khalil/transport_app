import React, { useState, useRef, useEffect } from "react";
import "../../../css/stylescan.css";
import {API_URL} from '../../constants/constant.js';

export default function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [scanning, setScanning] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
   
  // Démarrer/arrêter la caméra
  const toggleCamera = async () => {
    if (cameraActive) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: { 
          facingMode: "environment", // Utiliser la caméra arrière
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setCameraActive(true);
      setMessage({
        type: "info",
        text: "📱 Caméra activée. Pointez vers un QR Code"
      });
    } catch (err) {
      console.error("Erreur caméra:", err);
      setMessage({
        type: "error",
        text: "❌ Impossible d'accéder à la caméra"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
    setScanning(false);
  };

  // Capturer une image de la caméra
  const captureFromCamera = () => {
    if (!cameraActive || !videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Ajuster la taille du canvas à la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dessiner l'image de la vidéo sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir en data URL pour l'aperçu
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setImagePreview(imageDataUrl);
    
    // Arrêter temporairement la caméra
    stopCamera();
    
    setMessage({
      type: "info",
      text: "📸 Image capturée. Cliquez sur 'Scanner' pour analyser"
    });
  };

  // Nettoyer à la destruction du composant
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const processQRCode = async (qrData) => {
    setLoading(true);
    setMessage("");
    setScanResult(null);

    try {
      let parsedData;
      try {
        parsedData = typeof qrData === "string" ? JSON.parse(qrData) : qrData;
      } catch (parseError) {
        parsedData = { rawData: qrData };
      }

      console.log("QR Code à vérifier:", parsedData);

      const response = await fetch(`${API_URL}/api/voyages/verifier-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_data: parsedData }),
      });

      const data = await response.json();
      console.log("Réponse:", data);

      if (data.success && data.valid) {
        setMessage({
          type: "success",
          text: "✅ QR Code valide - Réservation confirmée"
        });

        setScanResult(data.reservation);
        
        // Réinitialiser l'image après scan réussi
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        setMessage({
          type: "error",
          text: data.message || "❌ QR Code invalide"
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({
        type: "error",
        text: "❌ Erreur de connexion au serveur"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processQRCode(JSON.stringify({ reference: manualCode.trim() }));
      setManualCode("");
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setMessage({
        type: "error",
        text: "❌ Veuillez sélectionner une image valide (JPG, PNG)"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "❌ L'image est trop grande (max 5MB)"
      });
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const scanImage = () => {
    if (!imagePreview) {
      setMessage({
        type: "error",
        text: "❌ Veuillez d'abord sélectionner une image"
      });
      return;
    }

    setLoading(true);
    
    // Simulation d'analyse QR Code
    setTimeout(() => {
      const testReference = `RES-${Math.floor(Math.random() * 10) + 1}-${Date.now()}`;
      processQRCode(JSON.stringify({ 
        reference: testReference,
        voyageId: Math.floor(Math.random() * 5) + 1
      }));
    }, 1500);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch (e) {
      return dateString;
    }
  };

  // Données de test
  const testCodes = [
    { label: "Réservation #1", code: 'RES-1-123456789' },
    { label: "Réservation #2", code: 'RES-2-987654321' },
    { label: "Réservation #3", code: 'RES-3-555555555' },
  ];

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <h1 className="page-title">📱 Scanner de Tickets</h1>
        <p className="scanner-subtitle">Vérifiez les tickets des passagers</p>
      </div>

      <div className="scanner-layout">
        {/* Section de scan */}
        <div className="scanner-section">
          {/* Saisie manuelle */}
          <div className="manual-section">
            <h3>⌨️ Saisir la référence</h3>
            
            <form onSubmit={handleManualSubmit} className="manual-form">
              <div className="form-group">
                <input
                  type="text"
                  className="code-input"
                  placeholder="Ex: RES-1-123456789"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  disabled={loading || cameraActive}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="verify-btn"
                disabled={loading || !manualCode.trim() || cameraActive}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Vérification...
                  </>
                ) : (
                  "✅ Vérifier"
                )}
              </button>
            </form>

            {/* Codes de test rapides */}
            <div className="quick-codes">
              <h4>Références de test :</h4>
              <div className="quick-buttons">
                {testCodes.map((test, index) => (
                  <button
                    key={index}
                    className="quick-btn"
                    onClick={() => {
                      processQRCode(JSON.stringify({ reference: test.code }));
                    }}
                    disabled={loading || cameraActive}
                  >
                    {test.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Caméra en direct */}
          <div className="camera-section">
            <h3>📱 Caméra en direct</h3>
            
            <div className="camera-container">
              {cameraActive ? (
                <div className="camera-active">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="camera-video"
                  />
                  <div className="camera-overlay">
                    <div className="scan-frame"></div>
                    <div className="camera-controls">
                      <button 
                        className="capture-btn"
                        onClick={captureFromCamera}
                        disabled={loading}
                      >
                        📸 Capturer
                      </button>
                      <button 
                        className="stop-camera-btn"
                        onClick={toggleCamera}
                      >
                        ❌ Arrêter
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="camera-inactive">
                  <div className="camera-placeholder" onClick={toggleCamera}>
                    <div className="camera-icon">📱</div>
                    <p>Activer la caméra</p>
                    <p className="camera-hint">Utilisez la caméra pour scanner un QR Code</p>
                  </div>
                </div>
              )}
              
              {/* Canvas caché pour la capture */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Scan d'image */}
          <div className="image-section">
            <h3>📷 Scanner une image</h3>
            
            {/* Zone de dépôt d'image */}
            <div 
              className="image-drop-zone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="file-input"
                style={{ display: "none" }}
              />
              
              {imagePreview ? (
                <div className="image-preview-container">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu QR Code" 
                    className="image-preview"
                  />
                  <div className="image-overlay">
                    <button 
                      className="scan-image-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        scanImage();
                      }}
                      disabled={loading || cameraActive}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-small"></span>
                          Analyse...
                        </>
                      ) : (
                        "🔍 Scanner"
                      )}
                    </button>
                    <button 
                      className="clear-image-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImage();
                      }}
                    >
                      ❌ Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="drop-message">
                  <div className="drop-icon">📁</div>
                  <p>Cliquez pour choisir une image</p>
                  <p className="drop-hint">JPG, PNG - Max. 5 MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Message de statut */}
          {message && (
            <div className={`status-message ${message.type}`}>
              <div className="message-content">
                <span className="message-icon">
                  {message.type === "success" ? "✅" : 
                   message.type === "error" ? "❌" : "ℹ️"}
                </span>
                <span className="message-text">{message.text}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section résultats */}
        <div className="results-section">
          {/* Résultat du scan */}
          {scanResult ? (
            <div className="scan-result-card">
              <div className="result-header">
                <h3>🎫 Ticket Validé</h3>
                <span className="result-badge success">VALIDE</span>
              </div>
              
              <div className="result-details">
                <div className="detail-row">
                  <span className="detail-label">Passager :</span>
                  <span className="detail-value">{scanResult.client_nom}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Référence :</span>
                  <span className="detail-value code">{scanResult.reference}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Trajet :</span>
                  <span className="detail-value route">
                    <span className="depart">{scanResult.depart}</span>
                    <span className="arrow">→</span>
                    <span className="destination">{scanResult.destination}</span>
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Date :</span>
                  <span className="detail-value datetime">
                    {formatDate(scanResult.date_depart)}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Heure :</span>
                  <span className="detail-value">{scanResult.heure_depart || scanResult.h_depart}</span>
                </div>
              </div>
              
              <div className="result-actions">
                <button 
                  className="action-btn validate-btn"
                  onClick={() => {
                    alert(`✅ Passage validé pour ${scanResult.client_nom}`);
                    setScanResult(null);
                  }}
                >
                  ✅ Valider l'embarquement
                </button>
              </div>
            </div>
          ) : (
            <div className="no-result-card">
              <div className="no-result-icon">📱</div>
              <h3>Aucun ticket scanné</h3>
              <p>Utilisez le scanner pour vérifier un ticket</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}