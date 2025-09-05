import React, { useState, useEffect } from 'react';
import DirectorioVertical from '../componentes/componentesColumna2/DirectorioVertical';
import MainLateralPostTarjetas from '../componentes/componentesColumna2/MainLateralPostTarjetas';
import BotonesAnunciateSuscribirme from '../componentes/componentesColumna1/BotonesAnunciateSuscribirme';
import PortadaRevista from '../componentes/componentesColumna2/PortadaRevista';
import InfografiaCard from './InfografiaCard';
import { useData } from '../../DataContext';
import { infografiasGet } from '../../api/infografiasGet.js';
import './InfografiaMain.css';

const InfografiaMain = () => {
  const { revistaActual } = useData();

  // Estados para manejar las infografías desde la base de datos
  const [infografias, setInfografias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar infografías desde la base de datos
  useEffect(() => {
    const cargarInfografias = async () => {
      try {
        setCargando(true);
        setError(null);
        
        // Llamada real a la API
        const data = await infografiasGet();
        setInfografias(data);
      } catch (err) {
        setError(err);
        console.error('Error al cargar infografías:', err);
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
            Infografías
          </span>
        </div>
      </div>

      {/* Contenido principal con grid de 2 columnas */}
      <div className="infografia-grid transparent">
        {/* Columna Principal - Infografías */}
        <div className="infografia-main-column">
         

          {/* Grid de infografías */}
          <div className="infografias-grid">
            {cargando ? (
              <div className="cargando-infografias">
                <p>Cargando infografías...</p>
              </div>
            ) : error ? (
              <div className="error-infografias">
                <p>Error al cargar las infografías: {error.message}</p>
              </div>
            ) : infografias.length === 0 ? (
              <div className="sin-infografias">
                <p>No hay infografías disponibles</p>
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

        {/* Columna lateral derecha - Componentes existentes */}
        <div className="infografia-sidebar">
          <DirectorioVertical />
          <PortadaRevista />
          <MainLateralPostTarjetas
            notasDestacadas={[]}
            onCardClick={() => {}}
            sinCategoria
            sinFecha
            cantidadNotas={5}
          />

          <div className="pt-3">
            <BotonesAnunciateSuscribirme />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfografiaMain;
