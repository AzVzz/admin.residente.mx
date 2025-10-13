import { useEffect, useState, useLayoutEffect } from "react";
import { getColaboradores } from "../../../api/temaSemanaApi";
import { useNavigate } from "react-router-dom";
import { urlApi } from "../../../api/url.js";

const CANTIDAD_COLABORADORES = 4;

const CarruselColaboradores = ({ colaboradores, indiceCarrusel, setIndiceCarrusel }) => {
    const [animando, setAnimando] = useState(false);
    const navigate = useNavigate();

    const maxIndiceCarrusel = colaboradores.length <= CANTIDAD_COLABORADORES
        ? 0
        : colaboradores.length - CANTIDAD_COLABORADORES;

    const handleClick = (nuevoIndice) => {
        if (animando) return;
        setAnimando(true);
        setIndiceCarrusel(nuevoIndice);
        setTimeout(() => setAnimando(false), 300);
    };

    const handleColaboradorClick = (id) => {
        sessionStorage.setItem("colaboradorLastId", id);
        navigate(`/colaborador/${id}`);
    };

    return (
        <div className="relative flex gap-4 ml-auto items-center">
            {/* Flecha izquierda */}
            <button
                className={`text-black px-2 py-1 self-center cursor-pointer
                    ${indiceCarrusel === 0 || animando ? 'opacity-50 pointer-events-none' : 'hover:opacity-100 opacity-80'}`}
                onClick={() => handleClick(Math.max(indiceCarrusel - 1, 0))}
                disabled={indiceCarrusel === 0 || animando}
                aria-label="Anterior"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor"
                    className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                </svg>
            </button>
            {/* Carrusel de colaboradores */}
            <div className="overflow-hidden w-[690px]">
                <div
                    className="flex gap-4 transition-transform duration-500 ease-in-out"
                    style={{
                        transform: `translateX(-${indiceCarrusel * 176}px)`
                    }}
                >
                    {colaboradores.map((colaborador) => (
                        <div
                            id={`colaborador-${colaborador.id}`}
                            key={colaborador.id}
                            className="w-40 cursor-pointer flex-shrink-0 flex flex-col items-center"
                            onClick={() => handleColaboradorClick(colaborador.id)}
                        >
                            <h2 className="text-black text-[14px] leading-4.5 text-center mb-1">
                                {colaborador.nombre}
                            </h2>
                            <img
                                src={colaborador.fotografia}
                                alt={colaborador.nombre}
                                className="w-full h-28 object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
            {/* Flecha derecha */}
            <button
                className={`text-black px-2 py-1 self-center cursor-pointer absolute right-[-2.5rem] top-1/2 -translate-y-1/2
                    ${indiceCarrusel >= maxIndiceCarrusel || animando ? 'opacity-50 pointer-events-none' : 'hover:opacity-100 opacity-80'}`}
                onClick={() => handleClick(Math.min(indiceCarrusel + 1, maxIndiceCarrusel))}
                disabled={indiceCarrusel >= maxIndiceCarrusel || animando}
                aria-label="Siguiente"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor"
                    className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
            </button>
        </div>
    );
};

const MiComponente = () => {
    const [colaboradores, setColaboradores] = useState([]);
    const [indiceCarrusel, setIndiceCarrusel] = useState(0);

    useEffect(() => {
        getColaboradores()
            .then(data => setColaboradores(data))
            .catch(() => setColaboradores([]));
    }, []);

    useLayoutEffect(() => {
        setTimeout(() => {
            const lastId = sessionStorage.getItem("colaboradorLastId");
            if (lastId) {
                const el = document.getElementById(`colaborador-${lastId}`);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    const idx = colaboradores.findIndex(c => String(c.id) === String(lastId));
                    if (idx >= 0) {
                        setIndiceCarrusel(Math.min(idx, colaboradores.length - CANTIDAD_COLABORADORES));
                    }
                }
                // Borra el valor después de 2 segundos
                setTimeout(() => {
                    sessionStorage.removeItem("colaboradorLastId");
                }, 2000);
            }
        }, 100);
    }, [colaboradores]);

    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#fff300] mb-4">
            <div className="max-w-[1080px] mx-auto py-8">
                {/* Imagen arriba del texto */}
                <img
                    src={`${urlApi}fotos/fotos-estaticas/residente-logos/negros/comunidad-residente.webp`}
                    alt="Colaboradores"
                    className="h-[35px] mb-6"
                />
                <div className="flex flex-row gap-4">
                    <div className="flex justify-start items-start min-w-[200px] max-w-[200px]">
                        <span className="text-[22px] text-white leading-5">
                            Descubre a los colaboradores que enriquecen el contenido de Residente con su experiencia y pasión.
                        </span>
                    </div>
                    <CarruselColaboradores
                        colaboradores={colaboradores}
                        indiceCarrusel={indiceCarrusel}
                        setIndiceCarrusel={setIndiceCarrusel}
                    />
                </div>
            </div>
        </div>
    );
};


export default MiComponente;