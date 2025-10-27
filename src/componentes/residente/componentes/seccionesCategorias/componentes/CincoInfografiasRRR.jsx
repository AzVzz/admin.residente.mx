import { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { infografiasGet } from "../../../../../componentes/api/infografiasGet.js";
import { urlApi } from "../../../../../componentes/api/url.js";
import { HiArrowDownTray, HiMiniArrowTopRightOnSquare } from "react-icons/hi2";

const INFOGRAFIAS_POR_VISTA_DESKTOP = 5; // como la foto 2
const GAP_PX = 20; // Tailwind gap-5 ≈ 20px

const TarjetaVerticalInfografia = ({ infografia, onClick }) => (
  <div
    className="group relative bg-transparent transition-all duration-300 overflow-hidden cursor-pointer"
    onClick={() => onClick && onClick(infografia)}
  >
    <div className="flex flex-col">
      {/* Nombre de la infografía */}
      <div className="mb-0 px-0 py-0">
        <p className="text-[16px] font-semibold text-gray-800 text-center leading-tight line-clamp-1">
          {infografia.nombre || infografia.titulo || 'Sin nombre'}
        </p>
      </div>
      
      {/* Imagen de la infografía */}
      <div className="h-804w-full flex justify-center items-center bg-gray-55 rounded-lg p-1">
        <img
          src={infografia.info_imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
          alt="Infografía"
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 shadow-[3px_3px_6px_rgba(0,0,0,0.2)]"
        />
      </div>
    </div>
  </div>
);

const CincoInfografiasRRR = () => {
  const navigate = useNavigate();
  const [infografias, setInfografias] = useState([]);
  const [startIdx, setStartIdx] = useState(0);
  const [perView, setPerView] = useState(INFOGRAFIAS_POR_VISTA_DESKTOP);
  const [itemWidth, setItemWidth] = useState(0);
  const [infografiaExpandida, setInfografiaExpandida] = useState(null);
  const viewportRef = useRef(null);

  useEffect(() => {
    infografiasGet()
      .then((data) => {
        const infografiasData = data || [];
        // Mezclar las infografías de forma aleatoria
        const infografiasMezcladas = [...infografiasData].sort(() => Math.random() - 0.5);
        setInfografias(infografiasMezcladas);
      })
      .catch(() => setInfografias([]));
  }, []);

  // Efecto adicional para mezclar las infografías cada vez que el componente se monte
  useEffect(() => {
    if (infografias.length > 0) {
      const infografiasMezcladas = [...infografias].sort(() => Math.random() - 0.5);
      setInfografias(infografiasMezcladas);
    }
  }, []); // Solo se ejecuta al montar el componente

  // Responsivo simple (ajústalo si quieres otros cortes)
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 640) setPerView(3);
      else if (w < 1024) setPerView(4);
      else if (w < 1280) setPerView(5);
      else setPerView(INFOGRAFIAS_POR_VISTA_DESKTOP);
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
    setStartIdx((i) => Math.min(i, Math.max(0, (infografias.length - perView))));
  }, [perView, infografias.length]);

  const maxStart = Math.max(0, infografias.length - perView);
  const canPrev = startIdx > 0;
  const canNext = startIdx < maxStart;

  const goPrev = () => { if (canPrev) setStartIdx((i) => i - 1); };
  const goNext = () => { if (canNext) setStartIdx((i) => i + 1); };

  const handleInfografiaClick = (infografia) => {
    // Mostrar la infografía en vista expandida
    setInfografiaExpandida(infografia);

    // Scroll hacia abajo para mostrar la infografía expandida
    setTimeout(() => {
      const modal = document.querySelector('.infografia-modal-content');
      if (modal) {
        modal.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  const cerrarInfografiaExpandida = () => {
    setInfografiaExpandida(null);
  };

  const handleLogoClick = () => {
    navigate('/infografia');
  };

  return (
    // Wrapper exterior permite que las flechas salgan por fuera
    <div className="w-full relative" style={{ overflow: "visible" }}>
      {/* Header con logo de INFOGRAFÍAS */}
      <div className="relative flex justify-center items-center mb-8 mt-8">
        <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
        <div className="relative z-10 px-4 bg-[#DDDDDE]">
          <div className="flex flex-row justify-center items-center gap-3">
            <img 
              src={`${urlApi}fotos/fotos-estaticas/residente-logos/negros/LOGO%20INFOGRAFI%CC%81AS.webp`} 
              className="w-full h-7 object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200" 
              onClick={handleLogoClick}
              alt="Logo Infografías - Click para ver todas las infografías"
            />
          </div>
        </div>
      </div>

      {/* Contenedor limitado a 1200 centrado */}
      <div className="relative mx-auto max-w-[1200px] w-full" style={{ overflow: "visible" }}>

        {/* Flecha izquierda */}
        {infografias.length > perView && (
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
            WebkitOverflowScrolling: "touch", // Mejora el scroll en dispositivos táctiles
            msOverflowStyle: "none", // IE and Edge
            scrollbarWidth: "none", // Firefox
          }}
        >
          {/* Track */}
          <div
            className="flex"
            style={{
              gap: `${GAP_PX}px`,
              scrollSnapAlign: "start",
            }}
          >
            {infografias.map((infografia) => (
              <div
                key={infografia.id}
                className="flex-shrink-0"
                style={{
                  width: `${itemWidth}px`,
                  scrollSnapAlign: "start",
                }}
              >
                <TarjetaVerticalInfografia infografia={infografia} onClick={handleInfografiaClick} />
              </div>
            ))}
          </div>
        </div>

        {/* Flecha derecha */}
        {infografias.length > perView && (
          <button
            onClick={() => viewportRef.current.scrollBy({ left: itemWidth + GAP_PX, behavior: "smooth" })}
            disabled={!canNext}
            className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-[-4rem] bg-transparent hover:bg-transparent text-black rounded-full w-12 h-12 cursor-pointer z-20 disabled:opacity-40"
            aria-label="Siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
          </button>
        )}
      </div>

      {/* Modal de infografía expandida */}
      {infografiaExpandida && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={cerrarInfografiaExpandida}>
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{infografiaExpandida.titulo || "Infografía"}</h3>
              <div className="flex gap-2">
                <button
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Infografía Residente',
                        text: 'Mira esta infografía de Residente',
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('URL copiada al portapapeles');
                    }
                  }}
                  title="Compartir infografía"
                >
                  <HiMiniArrowTopRightOnSquare className="w-5 h-5" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => {
                    if (infografiaExpandida.pdf) {
                      window.open(infografiaExpandida.pdf, '_blank');
                    } else {
                      const link = document.createElement('a');
                      link.href = infografiaExpandida.info_imagen;
                      link.download = `infografia-${infografiaExpandida.id}.jpg`;
                      link.click();
                    }
                  }}
                  title={infografiaExpandida.pdf ? "Descargar PDF" : "Descargar Imagen"}
                >
                  <HiArrowDownTray className="w-5 h-5" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full text-2xl"
                  onClick={cerrarInfografiaExpandida}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[70vh]">
              <img
                src={infografiaExpandida.info_imagen}
                alt={infografiaExpandida.titulo || "Infografía expandida"}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CincoInfografiasRRR;
