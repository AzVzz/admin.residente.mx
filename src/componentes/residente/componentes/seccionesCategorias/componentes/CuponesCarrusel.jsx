import { useEffect, useState } from "react";
import { cuponesGet } from "../../../../api/cuponesGet";
import TicketPromo from "../../../../promociones/componentes/TicketPromo";
import { Iconografia } from "../../../../utils/Iconografia.jsx";
const CUPORES_POR_VISTA = 4;

const CuponesCarrusel = () => {
    const [cupones, setCupones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startIdx, setStartIdx] = useState(0);
    const [selectedCupon, setSelectedCupon] = useState(null);

    useEffect(() => {
        cuponesGet()
            .then(data => setCupones(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const getStickerUrl = (clave) => {
        const allStickers = [
            ...Iconografia.categorias,
            ...Iconografia.ocasiones,
            ...Iconografia.zonas,
        ];
        const found = allStickers.find(item => item.clave === clave);
        return found ? found.icono : null;
    };

    const goPrev = () => {
        if (startIdx > 0) {
            setStartIdx(idx => Math.max(idx - 1, 0));
        }
    };

    const goNext = () => {
        if (startIdx + CUPORES_POR_VISTA < cupones.length) {
            setStartIdx(idx => Math.min(idx + 1, cupones.length - CUPORES_POR_VISTA));
        }
    };

    return (
        <div className="w-full relative flex items-center">
            {loading && <div className="text-gray-500">Cargando cupones...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}

            {/* Flecha izquierda */}
            <button
                onClick={goPrev}
                disabled={startIdx === 0}
                className="absolute left-0 z-10 bg-[#fff300] cursor-pointer text-black rounded-full w-10 h-10 flex items-center justify-center shadow-lg disabled:opacity-50"
                aria-label="Anterior"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                </svg>
            </button>

            {/* Cupones visibles */}
            <div className="overflow-hidden w-full px-12">
                <div
                    className="flex transition-transform duration-300"
                    style={{
                        transform: `translateX(-${startIdx * 25}%)`
                    }}
                >
                    {cupones.map((cupon, idx) => (
                        <div
                            key={cupon.id}
                            className="min-w-[25%] flex-shrink-0 cursor-pointer"
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

            {/* Flecha derecha */}
            <button
                onClick={goNext}
                disabled={startIdx + CUPORES_POR_VISTA >= cupones.length}
                className="absolute right-0 z-10 bg-[#fff300] cursor-pointer text-black rounded-full w-10 h-10 flex items-center justify-center shadow-lg disabled:opacity-50"
                aria-label="Siguiente"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
            </button>

            {/* Modal para cupón grande */}
            {selectedCupon && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-transparent rounded-lg shadow-lg p-6 relative max-w-md w-full">
                        <button
                            className="absolute top-2 right-2 text-black text-2xl"
                            onClick={() => setSelectedCupon(null)}
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