//src/componentes/residente/componentes/componentesColumna2/GiveawayDescuentos.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CarruselDescuentos from "./CarruselDescuentos";
import { giveawayDescuentosGet } from '../../../api/giveawayDescuentosGet.js';

const GiveawayDescuentos = ({ cupones }) => {
    const [giveaway, setGiveaway] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        giveawayDescuentosGet()
            .then(data => setGiveaway(data))
            .catch(() => setGiveaway(null));
    }, []);

    // Mapea los cupones para asegurar que tengan las props correctas
    const cuponesFormateados = Array.isArray(cupones)
        ? cupones.map(c => ({
            nombreRestaurante: c.nombre_restaurante || "",
            nombrePromo: c.titulo || "",
            subPromo: c.subtitulo || "",
            descripcionPromo: c.descripcion || "",
            validezPromo: c.validez || "",
            stickerUrl: c.stickerUrl || ""
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
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#fff300] mb-4 mt-8">
            <div className="max-w-[1080px] w-full mx-auto flex flex-row gap-10 items-center">
                <div className="grid grid-cols-[1.2fr_1.8fr] gap-10 items-center">
                    {/* Columna Izquierda: Giveaway */}
                    <div className="flex flex-row w-full mt-4 mb-4 items-center">
                        <div className="flex-shrink-0 w-[180px] h-full flex items-center justify-center">
                            <img
                                src={giveaway.imagen}
                                alt={giveaway.titulo}
                                className="w-full h-full object-cover shadow-[4px_3px_2px_rgba(0,0,0,0.3)] cursor-pointer"
                                onClick={() => navigate(`/notas/${giveaway.id}`)}
                            />
                        </div>
                        <div className="flex flex-col flex-1 ml-6 justify-center">
                            <h2
                                className="text-black text-[22px] leading-6.5 whitespace-pre-line cursor-pointer"
                                onClick={() => navigate(`/notas/${giveaway.id}`)}
                            >
                                {giveaway.titulo}
                            </h2>
                        </div>
                    </div>
                    {/* Columna Derecha: Carrusel de cupones */}
                    <CarruselDescuentos cupones={cuponesFormateados} />
                </div>
            </div>
        </div>
    );
};

export default GiveawayDescuentos;