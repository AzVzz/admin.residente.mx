import { useEffect, useRef, useState } from "react";
import { buscar } from "../../../../../componentes/api/buscadorGet.js";
import { urlApi, imgApi } from "../../../../../componentes/api/url.js";

const NOTAS_POR_VISTA_DESKTOP = 6;
const GAP_PX = 20;

const TarjetaVerticalPost = ({ nota, onClick }) => (
  <div
    className="group relative bg-transparent transition-all duration-300 overflow-hidden cursor-pointer"
    onClick={() => onClick && onClick(nota)}
  >
    <div className="flex flex-col">
      <div className="text-md font-bold text-gray-900 leading-[1.2] mb-1 group-hover:text-gray-700 transition-colors duration-200 text-center text-[15px]">
        {nota.nombre_restaurante?.trim() || ""}
      </div>
      <div className="h-30 w-full overflow-hidden">
        <img
          src={nota.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
          alt={nota.titulo}
          className="h-30 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      {/*<div className="text-lg font-roman text-black leading-[1.2] mb-2 group-hover:text-gray-700 transition-colors duration-200 mt-2 text-center">
        {nota.titulo}
      </div>*/}
    </div>
  </div>
);

export default function CincoNotasBuscador({
  keywords = null,   // string "cantinas" | "a,b,c" | ['a','b']
  label = null,      // opcional: texto a mostrar encima (ej. 'Cantinas')
  notas: notasProp = null, // fallback si ya pasas notas desde padre
  limit = 6,
  onCardClick
}) {
  const [notas, setNotas] = useState(Array.isArray(notasProp) ? [...notasProp] : []);
  const [perView, setPerView] = useState(NOTAS_POR_VISTA_DESKTOP);
  const [itemWidth, setItemWidth] = useState(0);
  const viewportRef = useRef(null);

  // Normalizar y fetch si no recibes notas prop
  useEffect(() => {
    let mounted = true;
    if (Array.isArray(notasProp) && notasProp.length > 0) {
      setNotas([...notasProp]);
      return () => { mounted = false; };
    }

    // if no keywords provided, nothing to fetch
    const hasKeywords = Array.isArray(keywords)
      ? keywords.length > 0
      : (typeof keywords === "string" && keywords.trim().length > 0);

    if (!hasKeywords) {
      setNotas([]);
      return () => { mounted = false; };
    }

    (async () => {
      try {
        const result = await buscar(keywords, limit);
        if (!mounted) return;
        const list = Array.isArray(result) ? result : (result.data || []);
        setNotas(list);
      } catch (e) {
        console.error("CincoNotasBuscador fetch error", e);
        if (mounted) setNotas([]);
      }
    })();

    return () => { mounted = false; };
  }, [keywords, limit, notasProp]);

  // responsive perView
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 640) setPerView(3);
      else if (w < 1024) setPerView(4);
      else setPerView(NOTAS_POR_VISTA_DESKTOP);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // calcular itemWidth
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const containerWidth = el.clientWidth;
    const totalGaps = GAP_PX * (perView - 1);
    const w = Math.max(120, (containerWidth - totalGaps) / perView);
    setItemWidth(w);
  }, [perView, notas.length]);

  if (!notas || notas.length === 0) return null;

  // determinar etiqueta a mostrar
  let palabraMostrar = label;
  if (!palabraMostrar) {
    if (Array.isArray(keywords)) palabraMostrar = keywords.join(', ');
    else palabraMostrar = typeof keywords === 'string' ? keywords : '';
  }
  palabraMostrar = (palabraMostrar || '').toString();
  palabraMostrar = palabraMostrar.split(',')[0].trim(); // mostrar la primera palabra si vienen varias
  palabraMostrar = palabraMostrar ? (palabraMostrar.charAt(0).toUpperCase() + palabraMostrar.slice(1)) : '';

  return (
    <div className="w-full relative" style={{ overflow: "visible" }}>
      <div className="relative mx-auto max-w-[1080px] w-full" style={{ overflow: "visible" }}>
        {/* Flecha izquierda */}
        {notas.length > perView && (
          <button
            onClick={() => viewportRef.current.scrollBy({ left: -(itemWidth + GAP_PX), behavior: "smooth" })}
            className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-[-4rem] bg-transparent hover:bg-transparent text-black rounded-full w-12 h-12 cursor-pointer z-20 disabled:opacity-40"
            aria-label="Anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
            </svg>
          </button>
        )}

        {/* Viewport */}
        <div
          ref={viewportRef}
          className="overflow-x-auto w-full"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <div
            className="flex"
            style={{
              gap: `${GAP_PX}px`,
              scrollSnapAlign: "start",
            }}
          >
            {notas.map((nota) => (
              <div
                key={nota.id || nota._id}
                className="flex-shrink-0"
                style={{
                  width: `${itemWidth}px`,
                  scrollSnapAlign: "start",
                }}
              >
                <TarjetaVerticalPost nota={nota} onClick={onCardClick} />
              </div>
            ))}
          </div>
        </div>

        {/* Flecha derecha */}
        {notas.length > perView && (
          <button
            onClick={() => viewportRef.current.scrollBy({ left: itemWidth + GAP_PX, behavior: "smooth" })}
            className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-[-4rem] bg-transparent hover:bg-transparent text-black rounded-full w-12 h-12 cursor-pointer z-20 disabled:opacity-40"
            aria-label="Siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}