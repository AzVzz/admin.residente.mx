import React from 'react';
import { urlApi, imgApi } from '../../../componentes/api/url.js';

const Colaboraciones = ({
  colaboracion_coca_cola,
  colaboracion_modelo,
  colaboracion_heineken,
  colaboracion_descuentosx6
}) => {
  // Si no hay colaboraciones, no mostrar nada
  if (
    !colaboracion_coca_cola &&
    !colaboracion_modelo &&
    !colaboracion_heineken &&
    !colaboracion_descuentosx6
  ) {
    return null;
  }

  return (
    <div className="py-1 my-1 text-center">
      <h3 className="text-categoria">Bebidas</h3>
      <div className="flex flex-col items-center gap-0">
        {colaboracion_coca_cola && (
          <div className="w-full max-w-2xl">
            <img
              src={`${imgApi}fotos/fotos-estaticas/componente-restaurante/colaboracion-coca-cola.webp`}
              alt="Coca Cola"
              className="w-full h-auto max-h-40 object-contain mx-auto"
            />
          </div>
        )}

        {colaboracion_modelo && (
          <div className="w-full max-w-2xl">
            <img
              src={`${imgApi}fotos/fotos-estaticas/componente-restaurante/colaboracion-modelo.webp`}
              alt="Modelo"
              className="w-full h-auto max-h-40 object-contain mx-auto"
            />
          </div>
        )}

        {colaboracion_heineken && (
          <div className="w-full max-w-2xl">
            <img
              src={`${imgApi}fotos/fotos-estaticas/componente-restaurante/colaboracion-heineken.png`}
              alt="Heineken"
              className="w-full h-auto max-h-40 object-contain mx-auto"
            />
          </div>
        )}

        {colaboracion_descuentosx6 && (
          <div className="w-full max-w-2xl">
            <img
              src={`${imgApi}fotos/fotos-estaticas/componente-restaurante/colaboracion-descuentosx6.webp`}
              alt="Descuentos x6"
              className="w-full h-auto max-h-40 object-contain mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Colaboraciones;