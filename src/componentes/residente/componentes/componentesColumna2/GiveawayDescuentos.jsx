//src/componentes/residente/componentes/componentesColumna2/GiveawayDescuentos.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CarruselDescuentos from "./CarruselDescuentos";
import { giveawayDescuentosGet } from '../../../api/giveawayDescuentosGet.js';
import { urlApi } from '../../../api/url';
import { Iconografia } from '../../../utils/Iconografia.jsx'; // Asegúrate de importar esto

const GiveawayDescuentos = ({ cupones }) => {
    const [giveaway, setGiveaway] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        giveawayDescuentosGet()
            .then(data => setGiveaway(data))
            .catch(() => setGiveaway(null));
    }, []);

    const getStickerUrl = (clave) => {
        const allStickers = [
            ...Iconografia.categorias,
            ...Iconografia.ocasiones,
            ...Iconografia.zonas,
        ];
        const found = allStickers.find((item) => item.clave === clave);
        return found ? found.icono : null;
    };

    const cuponesFormateados = Array.isArray(cupones)
        ? cupones.map(c => ({
            nombreRestaurante: c.nombre_restaurante || "",
            nombrePromo: c.titulo || "",
            subPromo: c.subtitulo || "",
            descripcionPromo: c.descripcion || "",
            validezPromo: c.fecha_validez || "", // <-- CAMBIA AQUÍ
            stickerUrl: getStickerUrl(c.icon)
        }))
        : [];

    if (!giveaway) {
        return (
            <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#fff300] py-8 text-center text-gray-700 font-semibold">
                Sin Giveaway semanal disponible.
            </div>
        );
    }

    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[black] mb-4 py-4">
            <div className="max-w-[1080px] w-full mx-auto flex flex-row gap-10 items-center">
                <div className="grid grid-cols-[1.2fr_1.8fr] gap-10 items-start">
                    <div className="flex flex-col items-start">
                        {/* Logo arriba */}
                        <img
                            src={`${urlApi}/fotos/fotos-estaticas/residente-logos/blancos/residente-restaurant-promo-blanco.webp`}
                            alt="Residente Restaurant Promo"
                            className="mb-8 w-[340px] h-auto object-contain"
                        />
                        {/* Imagen y texto lado a lado */}
                        <div className="flex flex-row items-end mt-4">
                            <img
                                src={giveaway.imagen}
                                alt={giveaway.titulo}
                                className="w-[180px] h-[268px] object-cover shadow-[4px_3px_2px_rgba(0,0,0,0.3)] cursor-pointer"
                                onClick={() => navigate(`/notas/${giveaway.id}`)}
                            />
                            <div className="flex flex-col justify-start ml-6">
                                <h2
                                    className="text-white text-[22px] leading-6.5 whitespace-pre-line cursor-pointer max-w-[250px]"
                                    onClick={() => navigate(`/notas/${giveaway.id}`)}
                                >
                                    {giveaway.titulo}
                                </h2>
                            </div>
                        </div>
                    </div>
                    <CarruselDescuentos cupones={cuponesFormateados} />
                </div>
            </div>
        </div>
    );
};

export default GiveawayDescuentos;