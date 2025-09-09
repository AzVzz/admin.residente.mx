import React, { useState, useEffect } from 'react';
import { HiArrowDownTray, HiMiniArrowTopRightOnSquare } from "react-icons/hi2";
import DirectorioVertical from '../componentes/componentesColumna2/DirectorioVertical';
import MainLateralPostTarjetas from '../componentes/componentesColumna2/MainLateralPostTarjetas';
import BotonesAnunciateSuscribirme from '../componentes/componentesColumna1/BotonesAnunciateSuscribirme';
import PortadaRevista from '../componentes/componentesColumna2/PortadaRevista';
import InfografiaCard from './InfografiaCard';
import { useData } from '../../DataContext';
import { infografiasGet } from '../../api/infografiasGet.js';
import './InfografiaMain.css';
import Infografia from '../componentes/componentesColumna1/Infografia';

const InfografiaMain = () => {
  const { revistaActual } = useData();

  // Estados para manejar las infografías desde la base de datos
  const [infografias, setInfografias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [destacadasFiltradas, setDestacadasFiltradas] = useState([]);
  const [infografiaExpandida, setInfografiaExpandida] = useState(null);

  // Función para manejar clicks en las tarjetas
  const handleCardClick = (id) => {
    //console.log('Card clicked:', id);
  };

  // Cargar infografías desde la base de datos
  useEffect(() => {
    const cargarInfografias = async () => {
      try {
        setCargando(true);
        setError(null);
        
        // Llamada real a la API
        const data = await infografiasGet();
        //console.log('Infografías cargadas:', data);
        setInfografias(data);
      } catch (err) {
        setError(err);
        console.error('Error al cargar infografías:', err);
        console.error('Detalles del error:', err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarInfografias();
  }, []);

  const handleInfografiaClick = (infografia) => {
    // Mostrar la infografía en vista expandida
    setInfografiaExpandida(infografia);
    
    // Scroll hacia abajo para mostrar la infografía expandida
    setTimeout(() => {
      const modal = document.querySelector('.infografia-modal-content');
      if (modal) {
        modal.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  const cerrarInfografiaExpandida = () => {
    setInfografiaExpandida(null);
  };

  return (
    <div className="infografia-container">
      {/* Header de la sección */}
      <div className="infografia-header">
        <div className="infografia-title">
          <span className="infografia-title-text">
            
          </span>
        </div>
      </div>

      {/* Contenido principal con grid de 2 columnas */}
      <div className="infografia-grid">
        {/* Columna Principal - Infografías */}
        <div className="infografia-main-column">
          {/* Header de la sección */}
      <div className="infografia-header">
        <div className="infografia-title">
          <span className="infografia-title-text">
            Infografías
          </span>
        </div>
      </div>

          {/* Grid de infografías */}
          <div className="infografias-grid">
            {cargando ? (
              <div className="cargando-infografias">
                <p>Cargando infografías...</p>
              </div>
            ) : error ? (
              <div className="error-infografias">
                <p>Error al cargar las infografías:</p>
                <p className="text-sm text-gray-600 mt-2">{error.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Revisa la consola del navegador para más detalles.
                </p>
              </div>
            ) : infografias.length === 0 ? (
              <div className="sin-infografias">
                <p>No hay infografías disponibles</p>
                <p className="text-sm text-gray-600 mt-2">
                  Es posible que las infografías no tengan la estructura correcta o estén incompletas.
                </p>
              </div>
            ) : (
              infografias.map((infografia) => (
                <InfografiaCard
                  key={infografia.id}
                  imagen={infografia.info_imagen}
                  pdfUrl={infografia.pdf}
                  onClick={() => handleInfografiaClick(infografia)}
                />
              ))
            )}
          </div>
        </div>

      
                            {/* Columna lateral */}
                            <div className="flex flex-col items-end justify-start gap-10">
                                <DirectorioVertical />
                                <PortadaRevista />
                                {/*<MainLateralPostTarjetas
                                    notasDestacadas={destacadasFiltradas}
                                    onCardClick={handleCardClick}
                                    sinCategoria
                                    sinFecha
                                    cantidadNotas={5}
                                />*/}

                                
                                <div className="pt-3">
                                    <BotonesAnunciateSuscribirme />
                                </div>

                                <Infografia />

                                {/*<div className="flex justify-end items-end mb-4">
                                    <img src="https://i.pinimg.com/originals/4d/ee/83/4dee83472ffd5a8ca24d26a050cf5454.gif"
                                        className="h-auto w-75" />
                                </div>*/}


                          

          <div className="pt-3">
            <BotonesAnunciateSuscribirme />
          </div>
        </div>
      </div>

      {/* Modal de infografía expandida */}
      {infografiaExpandida && (
        <div className="infografia-modal-overlay" onClick={cerrarInfografiaExpandida}>
          <div className="infografia-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="infografia-modal-top-actions">
              <button 
                className="infografia-modal-close"
                onClick={cerrarInfografiaExpandida}
              >
                ×
              </button>
              <button 
                className="infografia-share-icon-btn"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Infografía Residente',
                      text: 'Mira esta infografía de Residente',
                      url: window.location.href
                    });
                  } else {
                    // Fallback: copiar URL al portapapeles
                    navigator.clipboard.writeText(window.location.href);
                    alert('URL copiada al portapapeles');
                  }
                }}
                title="Compartir infografía"
              >
                <HiMiniArrowTopRightOnSquare />
              </button>
              <button 
                className="infografia-download-icon-btn"
                onClick={() => {
                  if (infografiaExpandida.pdf) {
                    window.open(infografiaExpandida.pdf, '_blank');
                  } else {
                    const link = document.createElement('a');
                    link.href = infografiaExpandida.info_imagen;
                    link.download = `infografia-${infografiaExpandida.id}.jpg`;
                    link.click();
                  }
                }}
                title={infografiaExpandida.pdf ? "Descargar PDF" : "Descargar Imagen"}
              >
                <HiArrowDownTray />
              </button>
            </div>
            <img 
              src={infografiaExpandida.info_imagen} 
              alt="Infografía expandida"
              className="infografia-modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InfografiaMain;
