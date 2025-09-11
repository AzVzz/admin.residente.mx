import { useEffect, useRef, useState } from "react";
import { notasDestacadasPorTipoGet } from "../../../../../componentes/api/notasPublicadasGet.js";
import { urlApi } from "../../../../../componentes/api/url.js";

const NOTAS_POR_VISTA_DESKTOP = 6; // como la foto 2
const GAP_PX = 20; // Tailwind gap-5 ≈ 20px

const TarjetaVerticalPost = ({ nota, onClick }) => (
  <div
    className="group relative bg-transparent transition-all duration-300 overflow-hidden cursor-pointer"
    onClick={() => onClick && onClick(nota)}
  >
    <div className="flex flex-col">
      <div className="text-md font-bold text-gray-900 leading-[1.2] mb-2 group-hover:text-gray-700 transition-colors duration-200 text-center text-[15px] h-10 items-center justify-center flex">
        {nota.nombre_restaurante?.trim() || ""}
      </div>
      <div className="h-30 w-full overflow-hidden">
        <img
          src={nota.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
          alt={nota.titulo}
          className="h-30 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="text-lg font-roman text-black leading-[1.2] mb-2 group-hover:text-gray-700 transition-colors duration-200 mt-2 text-center">
        {nota.titulo}
      </div>
    </div>
  </div>
);

const CincoNotasRRR = ({ tipoNota, onCardClick }) => {
  const [notas, setNotas] = useState([]);
  const [startIdx, setStartIdx] = useState(0);
  const [perView, setPerView] = useState(NOTAS_POR_VISTA_DESKTOP);
  const [itemWidth, setItemWidth] = useState(0);
  const viewportRef = useRef(null);

  useEffect(() => {
    if (!tipoNota) return;
    notasDestacadasPorTipoGet(tipoNota)
      .then((data) => setNotas(data || []))
      .catch(() => setNotas([]));
  }, [tipoNota]);

  // Responsivo simple (ajústalo si quieres otros cortes)
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 640) setPerView(6);
      else if (w < 1024) setPerView(6);
      else if (w < 1280) setPerView(6);
      else setPerView(NOTAS_POR_VISTA_DESKTOP);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Calcula ancho exacto por tarjeta en px (cuadrando gaps)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const containerWidth = el.clientWidth;
    const totalGaps = GAP_PX * (perView - 1);
    const w = (containerWidth - totalGaps) / perView;
    setItemWidth(w);
    // evita overflow al cambiar perView o cantidad
    setStartIdx((i) => Math.min(i, Math.max(0, (notas.length - perView))));
  }, [perView, notas.length]);

  const maxStart = Math.max(0, notas.length - perView);
  const canPrev = startIdx > 0;
  const canNext = startIdx < maxStart;

  const goPrev = () => { if (canPrev) setStartIdx((i) => i - 1); };
  const goNext = () => { if (canNext) setStartIdx((i) => i + 1); };

  return (
    // Wrapper exterior permite que las flechas salgan por fuera
    <div className="w-full relative" style={{ overflow: "visible" }}>
      {/* Contenedor limitado a 1080 centrado (como en cupones) */}
      <div className="relative mx-auto max-w-[1080px] w-full" style={{ overflow: "visible" }}>

        {/* Flecha izquierda - por fuera del max-w en md+ (MISMA UI QUE CUPONES) */}
        {notas.length > perView && (
          <>
            <button
              onClick={goPrev}
              disabled={!canPrev}
              className="
                hidden md:flex
                items-center justify-center
                absolute top-1/2 -translate-y-1/2 
                left-[-4rem]
                bg-transparent hover:bg-transparent
                text-black rounded-full w-12 h-12
                cursor-pointer z-20 disabled:opacity-40"
              aria-label="Anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={4.5} stroke="currentColor"
                className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
              </svg>
            </button>
          </>
        )}

        {/* Viewport */}
        <div ref={viewportRef} className="overflow-hidden w-full">
          {/* Track */}
          <div
            className="flex"
            style={{
              gap: `${GAP_PX}px`,
              transform: `translateX(-${startIdx * (itemWidth + GAP_PX)}px)`,
              transition: "transform 300ms ease",
              willChange: "transform",
            }}
          >
            {notas.map((nota) => (
              <div key={nota.id} className="flex-shrink-0" style={{ width: `${itemWidth}px` }}>
                <TarjetaVerticalPost nota={nota} onClick={onCardClick} />
              </div>
            ))}
          </div>
        </div>

        {/* Flecha derecha - por fuera del límite de 1080 (MISMA UI QUE CUPONES) */}
        {notas.length > perView && (
          <>
            <button
              onClick={goNext}
              disabled={!canNext}
              className="
                hidden md:flex
                items-center justify-center
                absolute top-1/2 -translate-y-1/2 
                right-[-4rem]
                bg-transparent hover:bg-transparent
                text-black rounded-full w-12 h-12
                cursor-pointer z-20
                disabled:opacity-40"
              aria-label="Siguiente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={4.5} stroke="currentColor"
                className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CincoNotasRRR;
