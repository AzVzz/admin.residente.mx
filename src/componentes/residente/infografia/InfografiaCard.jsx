import React, { useState } from 'react';

const InfografiaCard = ({ imagen, pdfUrl, onClick }) => {
  const [imagenError, setImagenError] = useState(false);

  const handleImageError = () => {
    setImagenError(true);
  };

  const handleCardClick = () => {
    if (pdfUrl) {
      onClick();
    } else {
      console.log('Esta infografía no tiene PDF disponible para descargar');
    }
  };

  return (
    <div 
      className={`infografia-card ${!pdfUrl ? 'no-pdf' : ''}`}
      onClick={handleCardClick}
    >
      <div className="card-container">
        {imagenError ? (
          <div className="imagen-error">
            <p>Error al cargar la imagen</p>
          </div>
        ) : (
          <img
            src={imagen}
            alt="Infografía"
            className="card-image"
            loading="lazy"
            onError={handleImageError}
          />
        )}
        
      </div>
    </div>
  );
};

export default InfografiaCard;
