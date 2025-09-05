import React, { useState, useEffect } from 'react';
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

  // Función para manejar clicks en las tarjetas
  const handleCardClick = (id) => {
    console.log('Card clicked:', id);
  };

  // Cargar infografías desde la base de datos
  useEffect(() => {
    const cargarInfografias = async () => {
      try {
        setCargando(true);
        setError(null);
        
        // Llamada real a la API
        const data = await infografiasGet();
        console.log('Infografías cargadas:', data);
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
    // Abrir el PDF en una nueva pestaña
    window.open(infografia.pdf, '_blank');
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
    </div>
  );
};

export default InfografiaMain;
