import React from 'react';
import { urlApi, imgApi } from '../../../componentes/api/url.js';

const Colaboraciones = ({ colaboracion_coca_cola, colaboracion_modelo }) => {
  // Si no hay colaboraciones, no mostrar nada
  if (!colaboracion_coca_cola && !colaboracion_modelo) {
    return null;
  }

  return (
    <div className="py-1 my-1 text-center">
      <div className="flex flex-col items-center gap-0"> {/* Cambio clave: flex-col y gap vertical */}
        {colaboracion_coca_cola && (
          <div className="w-full max-w-2xl"> {/* Contenedor ancho para la imagen */}
            <img
              src={`${imgApi}fotos/fotos-estaticas/componente-restaurante/colaboracion-coca-cola.webp`}
              alt="Coca Cola"
              className="w-full h-auto max-h-40 object-contain mx-auto" /* Imagen responsiva */
            />
          </div>
        )}

        {colaboracion_modelo && (
          <div className="w-full max-w-2xl"> {/* Contenedor ancho para la imagen */}
            <img
              src={`${imgApi}fotos/fotos-estaticas/componente-restaurante/colaboracion-modelo.webp`}
              alt="Modelo"
              className="w-full h-auto max-h-40 object-contain mx-auto" /* Imagen responsiva */
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Colaboraciones;