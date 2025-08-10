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
    <div className="relative group">
      <div className="relative overflow-hidden h-[400px] w-full">
        {restaurantes.map((rest, i) => (
          <div
            key={rest.id}
            className={`absolute inset-0 transition-transform duration-300 ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <Link to={`/restaurante/${rest.slug}`} className="block h-full">
              <img
                src={
                  rest.imagenes && rest.imagenes.length > 0
                    ? urlApi.replace(/\/$/, '') + rest.imagenes[0].src
                    : "https://via.placeholder.com/800x440?text=Sin+Imagen"
                }
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                alt={rest.nombre_restaurante}
              />
              <div className="absolute inset-0 bg-black/0 transition-all duration-700 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center overflow-hidden">
                <span className="max-w-[100%] text-center rounded bg-black/60 text-[#fff300] text-[50px] px-6 mb-3">
                  {rest.nombre_restaurante.charAt(0).toUpperCase() + rest.nombre_restaurante.slice(1).toLowerCase()}
                </span>
              </div>
            </Link>
          </div>
        ))}

        {/* Flecha izquierda */}
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#fff300] cursor-pointer text-black rounded-full p-2 hover:bg-yellow-400 z-20"
          aria-label="Anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
          </svg>
        </button>
        {/* Flecha derecha */}
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#fff300] cursor-pointer text-black rounded-full p-2 hover:bg-yellow-400 z-20"
          aria-label="Siguiente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CarruselPosts;