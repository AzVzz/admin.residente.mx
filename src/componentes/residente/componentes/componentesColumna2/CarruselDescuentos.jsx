//src/componentes/residente/componentes/componentesColumna2/CarruselDescuentos.jsx
import { useState } from "react";
import TicketPromo from "../../../promociones/componentes/TicketPromo";

const ITEM_WIDTH = 195; // ancho fijo en px
const VISIBLE_COUNT = 3;

const CarruselDescuentos = ({ cupones }) => {
    const [startIdx, setStartIdx] = useState(0);

    if (!cupones || cupones.length === 0) {
        return (
            <div className="text-gray-500 text-center py-8">
                No hay cupones disponibles.
            </div>
        );
    }

    const handlePrev = () => {
        setStartIdx(Math.max(startIdx - 1, 0));
    };

    const handleNext = () => {
        setStartIdx(Math.min(startIdx + 1, cupones.length - VISIBLE_COUNT));
    };

    return (
        <div className="py-4 px-2 bg-[#fff300] w-full flex items-center overflow-hidden">
            <button
                onClick={handlePrev}
                disabled={startIdx === 0}
                className="p-2 bg-white rounded-full shadow transition disabled:opacity-50 mr-2 self-center"
                aria-label="Anterior"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 6L9 12L15 18" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            <div
                className="relative overflow-hidden"
                style={{ width: `${ITEM_WIDTH * VISIBLE_COUNT}px` }}
            >
                <div
                    className="flex transition-transform duration-700"
                    style={{
                        transform: `translateX(-${startIdx * ITEM_WIDTH}px)`
                    }}
                >
                    {cupones.map((cupon, idx) => (
                        <div
                            key={idx}
                            className="min-w-[190px] max-w-[190px] flex-shrink-0 mx-0"
                        >
                            <TicketPromo size="small" {...cupon} />
                        </div>
                    ))}
                </div>
            </div>
            <button
                onClick={handleNext}
                disabled={startIdx >= cupones.length - VISIBLE_COUNT}
                className="p-2 bg-white rounded-full shadow transition disabled:opacity-50 ml-2 self-center"
                aria-label="Siguiente"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6L15 12L9 18" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
};

export default CarruselDescuentos;