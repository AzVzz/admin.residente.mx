import { useEffect, useState } from "react";
import { cuponesGet } from "../../../../api/cuponesGet";
import TicketPromo from "../../../../promociones/componentes/TicketPromo";
import { Iconografia } from "../../../../utils/Iconografia.jsx";
import { cuponesGetFiltrados } from "../../../../api/cuponesGet";

const CUPORES_POR_VISTA = 4;

const CuponesCarrusel = ({ seccion, categoria }) => {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startIdx, setStartIdx] = useState(0);
  const [selectedCupon, setSelectedCupon] = useState(null);

  useEffect(() => {
    setLoading(true);
    cuponesGetFiltrados(seccion, categoria)
      .then((data) => setCupones(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [seccion, categoria]);

  // 🔒 Scroll lock cuando el modal está abierto
  useEffect(() => {
    if (selectedCupon) {
      const scrollY = window.scrollY;
      const { body } = document;

      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";

      const onKey = (e) => { if (e.key === "Escape") setSelectedCupon(null); };
      window.addEventListener("keydown", onKey);

      return () => {
        window.removeEventListener("keydown", onKey);
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.width = "";
        body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedCupon]);

  const getStickerUrl = (clave) => {
    const allStickers = [
      ...Iconografia.categorias,
      ...Iconografia.ocasiones,
      ...Iconografia.zonas,
    ];
    const found = allStickers.find((item) => item.clave === clave);
    return found ? found.icono : null;
  };

  const goPrev = () => { if (startIdx > 0) setStartIdx((idx) => Math.max(idx - 1, 0)); };
  const goNext = () => {
    if (startIdx + CUPORES_POR_VISTA < cupones.length) {
      setStartIdx((idx) => Math.min(idx + 1, cupones.length - CUPORES_POR_VISTA));
    }
  };

  return (
    // Wrapper exterior permite que las flechas salgan por fuera
    <div className="w-full relative" style={{overflow: "visible"}}>
      {loading && <div className="text-gray-500">Cargando cupones...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      {/* Contenedor limitado a 1080 centrado */}
      <div className="relative mx-auto max-w-[1080px] w-full" style={{overflow: "visible"}}>
        {/* Flecha izquierda - por fuera del max-w con posiciones negativas en md+ */}
        <button
          onClick={goPrev}
          disabled={startIdx === 0}
          className="
            hidden md:flex
            items-center justify-center
            absolute top-1/2 -translate-y-1/2 
            left-[-4rem]   /* fuera del límite de 1080 */
            bg-[#fff300]/90 hover:bg-[#fff300]/100
            text-black rounded-full w-12 h-12 shadow-lg
            cursor-pointer z-20"
          aria-label="Anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none"
               viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
               className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
          </svg>
        </button>

        {/* Flechas dentro en mobile para no salirse de la pantalla */}
        <button
          onClick={goPrev}
          disabled={startIdx === 0}
          className="
            md:hidden
            absolute left-1 top-1/2 -translate-y-1/2
            bg-[#fff300]/90 hover:bg-[#fff300]/100
            text-black rounded-full w-10 h-10 shadow-lg
            cursor-pointer z-20"
          aria-label="Anterior móvil"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none"
               viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
               className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
          </svg>
        </button>

        {/* Carrusel */}
        <div className="overflow-hidden w-full px-0">
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${startIdx * 25}%)` }}
          >
            {cupones.map((cupon) => (
              <div
                key={cupon.id}
                className="min-w-[19.5%] flex-shrink-0 cursor-pointer"
                onClick={() => setSelectedCupon(cupon)}
              >
                <TicketPromo
                  nombreRestaurante={cupon.nombre_restaurante}
                  nombrePromo={cupon.titulo}
                  subPromo={cupon.subtitulo}
                  descripcionPromo={cupon.descripcion}
                  validezPromo={cupon.fecha_validez || "Sin validez"}
                  stickerUrl={getStickerUrl(cupon.icon)}
                  size="small"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Flecha derecha - por fuera del límite de 1080 */}
        <button
          onClick={goNext}
          disabled={startIdx + CUPORES_POR_VISTA >= cupones.length}
          className="
            hidden md:flex
            items-center justify-center
            absolute top-1/2 -translate-y-1/2 
            right-[-4rem]  /* fuera del límite de 1080 */
            bg-[#fff300]/70 hover:bg-[#fff300]/85
            text-black rounded-full w-12 h-12 shadow-lg
            cursor-pointer z-20
            disabled:opacity-40
          "
          aria-label="Siguiente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none"
               viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
               className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
          </svg>
        </button>

        {/* Flecha derecha móvil (dentro) */}
        <button
          onClick={goNext}
          disabled={startIdx + CUPORES_POR_VISTA >= cupones.length}
          className="
            md:hidden
            absolute right-1 top-1/2 -translate-y-1/2
            bg-[#fff300]/70 hover:bg-[#fff300]/85
            text-black rounded-full w-10 h-10 shadow-lg
            cursor-pointer z-20
            disabled:opacity-40
          "
          aria-label="Siguiente móvil"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none"
               viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
               className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
          </svg>
        </button>
      </div>

      {/* Modal para cupón grande */}
      {selectedCupon && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedCupon(null); }}
        >
          <div className="bg-transparent rounded-lg shadow-lg relative max-w-md w-full">
            <button
              className="absolute top-2 right-5 text-black text-2xl bg-white/40 w-10 h-10 rounded-full cursor-pointer hover:bg-white/60 z-20"
              onClick={() => setSelectedCupon(null)}
              aria-label="Cerrar"
            >
              &times;
            </button>
            <TicketPromo
              nombreRestaurante={selectedCupon.nombre_restaurante}
              nombrePromo={selectedCupon.titulo}
              subPromo={selectedCupon.subtitulo}
              descripcionPromo={selectedCupon.descripcion}
              validezPromo={selectedCupon.fecha_validez || "Sin validez"}
              stickerUrl={getStickerUrl(selectedCupon.icon)}
              size="large"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CuponesCarrusel;
