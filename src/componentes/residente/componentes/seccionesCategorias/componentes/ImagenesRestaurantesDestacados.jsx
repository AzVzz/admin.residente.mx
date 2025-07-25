import React from "react";
import { Link } from "react-router-dom";
import { urlApi } from "../../../../api/url";

const ImagenesRestaurantesDestacados = ({ restaurantes }) => (
  <div className="grid grid-cols-5 gap-5 mt-5 mb-5">
    {restaurantes.length > 0 ? (
      restaurantes.slice(0, 5).map(rest => (
        <Link
          key={rest.id}
          to={`/restaurante/${rest.slug}`}
          className="relative items-center block group"
        >
          <div className="relative h-60">
            {/* Etiqueta flotante con el nombre */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-[#FFF400] text-black text-[18px] font-semibold px-2 py-1 shadow-md whitespace-nowrap group-hover:bg-yellow-400 group-hover:text-black transition">
              {rest.nombre_restaurante.charAt(0).toUpperCase() +
                rest.nombre_restaurante.slice(1).toLowerCase()}
            </div>
            <img
              src={
                rest.imagenes && rest.imagenes.length > 0
                  ? urlApi.replace(/\/$/, "") + rest.imagenes[0].src
                  : "https://via.placeholder.com/180x120?text=Sin+Imagen"
              }
              className="w-full h-full object-cover transition-all duration-500 ease-in-out"
              alt={rest.nombre_restaurante}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent"></div>
          </div>
        </Link>
      ))
    ) : (
      <span>No hay restaurantes</span>
    )}
  </div>
);

export default ImagenesRestaurantesDestacados;