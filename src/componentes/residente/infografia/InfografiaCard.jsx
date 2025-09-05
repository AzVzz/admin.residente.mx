import React, { useState } from 'react';

const InfografiaCard = ({ imagen, pdfUrl, onClick }) => {
  const [imagenError, setImagenError] = useState(false);

  const handleImageError = () => {
    setImagenError(true);
  };

  const handleCardClick = () => {
    onClick();
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
