import React, { useState } from 'react';

const InfografiaCard = ({ imagen, pdfUrl, onClick }) => {
  const [imagenError, setImagenError] = useState(false);

  const handleImageError = () => {
    setImagenError(true);
  };

  return (
    <div 
      className="infografia-card"
      onClick={onClick}
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
