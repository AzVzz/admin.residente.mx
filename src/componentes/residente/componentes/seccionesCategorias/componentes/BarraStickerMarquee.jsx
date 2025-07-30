import React from "react";

const BarraStickerMarquee = ({ repeticiones = 7 }) => {
    // Junta todos los stickers en un solo array
    const allStickers = [
        ...Iconografia.categorias,
        ...Iconografia.ocasiones,
        ...Iconografia.zonas
    ];

    return (
        <div className="max-w-[1080px] bg-black text-[#fff300] px-3 py-2 overflow-hidden relative w-full">
            <div className="flex flex-nowrap animate-marquee items-end">
                {Array.from({ length: repeticiones }).map((_, idx) => (
                    <div key={idx} className={`flex items-end whitespace-nowrap${idx > 0 ? " ml-[80px]" : ""}`}>
                        {allStickers.map((sticker) => (
                            <div key={sticker.clave} className="flex flex-col items-center mx-3">
                                <img
                                    src={sticker.icono}
                                    alt={sticker.nombre}
                                    className="h-8 w-8 object-contain mb-1"
                                />
                                <span className="text-xs text-[#fff300]">{sticker.nombre}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BarraStickerMarquee;