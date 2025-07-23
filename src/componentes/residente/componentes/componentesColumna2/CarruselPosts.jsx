import { useState, useEffect, useRef } from "react";
import { urlApi } from '../../../api/url';
import { Link } from "react-router-dom";

const CarruselPosts = ({ restaurantes }) => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  const total = restaurantes.length;

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 8000);
    return () => clearTimeout(timeoutRef.current);
  }, [index, total]);

  if (!restaurantes || restaurantes.length === 0) {
    return <div>No hay imágenes</div>;
  }

  const goPrev = () => setIndex((prev) => (prev - 1 + total) % total);
  const goNext = () => setIndex((prev) => (prev + 1) % total);

  return (
    <div className="relative mb-3 group">
      <div className="relative overflow-hidden h-[440px] w-full">
        {restaurantes.map((rest, i) => (
          <div
            key={rest.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <Link to={`/restaurante/${rest.slug}`} className="block h-full">
            <img
              src={
                rest.imagenes && rest.imagenes.length > 0
                  ? urlApi.replace(/\/$/, '') + rest.imagenes[0].src
                  : "https://via.placeholder.com/800x440?text=Sin+Imagen"
              }
              className="h-[440px] w-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
              alt={rest.nombre_restaurante}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center overflow-hidden">
              <span className="inline-block bg-white/60 px-4 py-2 rounded font-bold text-center text-6xl tracking-tight">
                {rest.nombre_restaurante.charAt(0).toUpperCase() + rest.nombre_restaurante.slice(1).toLowerCase()}
              </span>
            </div>
            </Link>
          </div>
        ))}

        {/* Flecha izquierda */}
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 z-20"
          aria-label="Anterior"
        >
          &#8592;
        </button>
        {/* Flecha derecha */}
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 z-20"
          aria-label="Siguiente"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default CarruselPosts;