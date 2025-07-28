import React from "react";
import { Link } from "react-router-dom";
import { urlApi } from "../../../../api/url";

const ImagenesRestaurantesDestacados = ({ restaurantes, small = false, cantidad = 4 }) => (
  <div className={`grid grid-cols-${cantidad} gap-5 ${small ? 'max-w-[1080px] mt-2 mb-2' : 'mt-5 mb-5'}`}>
    {restaurantes.length > 0 ? (
      restaurantes.slice(0, cantidad).map(rest => (
        <Link
          key={rest.id}
          to={`/restaurante/${rest.slug}`}
          className="relative items-center block group"
        >
          <div className={`relative ${small ? 'h-28' : 'h-40'} overflow-hidden`}>
            <img
              src={
                rest.imagenes && rest.imagenes.length > 0
                  ? urlApi.replace(/\/$/, "") + rest.imagenes[0].src
                  : "https://via.placeholder.com/180x120?text=Sin+Imagen"
              }
              className="w-full h-full object-cover transition-all duration-500 ease-in-out"
              alt={rest.nombre_restaurante}
            />
            <div className="absolute inset-0 via-transparent to-transparent"></div>
          </div>
          <div className={`w-full text-center bg-[#fff300] text-black ${small ? 'text-[16px] px-1 py-1' : 'text-[22px] px-2 py-2'} whitespace-nowrap group-hover:bg-[#FFF400] group-hover:text-black transition leading-6`}>
            {rest.nombre_restaurante.charAt(0).toUpperCase() +
              rest.nombre_restaurante.slice(1).toLowerCase()}
          </div>
        </Link>
      ))
    ) : (
      <span>No hay restaurantes</span>
    )}
  </div>
);

export default ImagenesRestaurantesDestacados;