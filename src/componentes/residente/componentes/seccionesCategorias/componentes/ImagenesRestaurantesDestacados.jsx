import React from "react";
import { Link } from "react-router-dom";
import { urlApi, imgApi } from "../../../../api/url";

const ImagenesRestaurantesDestacados = ({ restaurantes, small = false, cantidad = 4 }) => (
  <div className={`grid grid-cols-${cantidad} gap-5 ${small ? 'max-w-[1080px]' : 'mt-5 mb-5'}`}>
    {restaurantes.length > 0 ? (
      restaurantes.slice(0, cantidad).map(rest => (
        <Link
          key={rest.id}
          to={`/restaurantes/${rest.slug}`}
          className="relative items-center block group"
        >
          <div className={`relative ${small ? 'h-28' : 'h-40'} overflow-hidden bg-black`}>
            {rest.imagenes && rest.imagenes.length > 0 ? (
              <img
                src={urlApi.replace(/\/$/, "") + rest.imagenes[0].src}
                className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                alt={rest.nombre_restaurante}
              />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <span className="text-gray-400 text-xs">Sin imagen</span>
              </div>
            )}
            {/* Nombre dentro de la foto, parte inferior */}
            <div
              className={`
                absolute bottom-3 left-1/2 transform -translate-x-1/2
                max-w-[90%] text-center rounded
                bg-black/70 text-[#fff300]
                ${small ? 'text-[12px] px-2 py-0.5' : 'text-[15px] px-3 py-1'}
                whitespace-nowrap group-hover:bg-[#FFF300] group-hover:text-black
                group-hover:shadow-2xl
                transition leading-5
              `}
              style={{ backdropFilter: 'blur(2px)' }}
            >
              {rest.nombre_restaurante.charAt(0).toUpperCase() +
                rest.nombre_restaurante.slice(1).toLowerCase()}
            </div>
          </div>
        </Link>
      ))
    ) : (
      <span>No hay restaurantes</span>
    )}
  </div>
);

export default ImagenesRestaurantesDestacados;