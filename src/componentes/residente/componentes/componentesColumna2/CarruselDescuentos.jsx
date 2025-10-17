//src/componentes/residente/componentes/componentesColumna2/CarruselDescuentos.jsx
import React, { useState } from "react";
import TicketPromo from "../../../promociones/componentes/TicketPromo";
import TicketPromoMini from "../seccionesCategorias/componentes/TicketPromoMini";

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
        <div className="py-4 px-0 bg-[black] w-full flex items-center relative overflow-visible">
            {/* Flecha izquierda */}
            <button
                onClick={handlePrev}
                disabled={startIdx === 0}
                className="p-2 bg-white rounded-full shadow transition disabled:opacity-50 absolute left-[-32px] z-10 self-center cursor-pointer"
                aria-label="Anterior"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 6L9 12L15 18" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            <div
                className="relative overflow-hidden ml-auto"
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
                            className="min-w-[195px] max-w-[195px] flex-shrink-0 mx-0"
                        >
                            <TicketPromoMini size="small" {...cupon} />
                        </div>
                    ))}
                </div>
            </div>
            {/* Flecha derecha */}
            <button
                onClick={handleNext}
                disabled={startIdx >= cupones.length - VISIBLE_COUNT}
                className="p-2 bg-white rounded-full shadow transition disabled:opacity-50 absolute right-[-32px] z-10 self-center cursor-pointer"
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