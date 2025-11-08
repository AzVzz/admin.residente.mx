import { useEffect, useMemo, useRef, useState } from "react";
import { urlApi, imgApi } from "../../../api/url";
import { Link } from "react-router-dom";

const INTERVAL_MS = 4000; // tiempo entre slides
const SLIDE_MS = 600;     // duración de transición

const CarruselPosts = ({ restaurantes = [] }) => {
  const total = restaurantes.length;

  if (total === 0) return <div>No hay imágenes</div>;
  if (total === 1) {
    const rest = restaurantes[0];
    const src = rest?.imagenes?.length
      ? urlApi.replace(/\/$/, "") + rest.imagenes[0].src
      : "https://via.placeholder.com/800x440?text=Sin+Imagen";
    return (
      <Link to={`/restaurante/${rest.slug}`} className="block h-[400px] relative">
        <img src={src} alt={rest?.nombre_restaurante ?? "Restaurante"} className="w-full h-full object-cover" />
      </Link>
    );
  }

  // Clones para loop infinito
  const slides = useMemo(() => {
    const first = restaurantes[0];
    const last = restaurantes[total - 1];
    return [last, ...restaurantes, first];
  }, [restaurantes, total]);

  // Comenzamos en 1 (primer slide real)
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  const next = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIndex((i) => i + 1);
  };
  const prev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIndex((i) => i - 1);
  };

  // Autoplay
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(next, INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [paused, isTransitioning]); // Añade isTransitioning

  // Salto sin transición al pasar a clones
  const onTransitionEnd = () => {
    setIsTransitioning(false);
    if (index === slides.length - 1) {
      setAnimate(false);
      setIndex(1);
    } else if (index === 0) {
      setAnimate(false);
      setIndex(slides.length - 2);
    }
  };

  // Rehabilitar transición justo después del “teletransporte”
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animate]);

  const logicalIndex = (index - 1 + total) % total;

  const getSrc = (rest) =>
    rest?.imagenes?.length
      ? urlApi.replace(/\/$/, "") + rest.imagenes[0].src
      : "https://via.placeholder.com/800x440?text=Sin+Imagen";

  const getName = (rest) => {
    const base = rest?.nombre_restaurante || "Restaurante";
    return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
  };

  // Pre-carga imágenes adyacentes
  useEffect(() => {
    const preload = (rest) => {
      if (rest?.imagenes?.length) {
        const img = new window.Image();
        img.src = getSrc(rest);
      }
    };
    preload(slides[index - 1]);
    preload(slides[index + 1]);
  }, [index, slides]);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden h-[400px] w-full">
        {/* Track horizontal */}
        <div
          className="flex h-full"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: animate ? `transform ${SLIDE_MS}ms ease-in-out` : "none",
            willChange: "transform",
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {slides.map((rest, i) => (
            <div key={(rest?.id ?? `s-${i}`) + "-" + i} className="min-w-full flex-none h-full relative">
              <Link to={`/restaurante/${rest.slug}`} className="block h-full w-full">
                <img
                  src={getSrc(rest)}
                  alt={getName(rest)}
                  className="h-full w-full object-cover block"
                  loading={i === index ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center">
                  <span className="max-w-[100%] text-center rounded bg-black/60 text-[#fff300] text-[50px] px-6 mb-3">
                    {getName(rest)}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Flecha izquierda */}
        <button
          onClick={prev}
          disabled={isTransitioning}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#fff300]/70 cursor-pointer text-black rounded-full p-2 hover:bg-[#fff300]/85 z-20"
          aria-label="Anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none"
               viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
               className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
          </svg>
        </button>

        {/* Flecha derecha */}
        <button
          onClick={next}
          disabled={isTransitioning}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#fff300]/70 cursor-pointer text-black rounded-full p-2 hover:bg-[#fff300]/85 z-20"
          aria-label="Siguiente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none"
               viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
               className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
          </svg>
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
          {restaurantes.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i + 1)} // +1 por el clon inicial
              aria-label={`Ir a la imagen ${i + 1}`}
              className={[
                "h-2 rounded-full transition-all",
                i === logicalIndex ? "w-6 bg-[#fff300]" : "w-2 bg-white/60 hover:bg-white/80"
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarruselPosts;
