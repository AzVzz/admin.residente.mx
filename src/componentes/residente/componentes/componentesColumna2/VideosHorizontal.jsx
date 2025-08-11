import { useEffect, useRef, useState } from "react";
import { urlApi } from "../../../api/url";

const VIDEOS_POR_VISTA_DESKTOP = 6; // Igual que tu referencia
const GAP_PX = 32; // Tailwind gap-8 ≈ 32px (tu grid original tenía gap-8)

// Tarjeta de video (vertical, alargada)
const VideoCard = ({ src, onClick }) => (
    <div
        className="group relative overflow-hidden rounded-xl cursor-pointer bg-neutral-900"
        onClick={onClick}
    >
        {/* Mantén razón 9:16 para que se vea “alargado” */}
        <div className="aspect-[9/16] w-full overflow-hidden">
            <img
                src={src}
                alt="video"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
            />
        </div>
    </div>
);

const VideosHorizontalCarrusel = () => {
    const [startIdx, setStartIdx] = useState(0);
    const [perView, setPerView] = useState(VIDEOS_POR_VISTA_DESKTOP);
    const [itemWidth, setItemWidth] = useState(0);
    const viewportRef = useRef(null);

    // Demo: imágenes estáticas (puedes reemplazar con props o fetch)
    const IMÁGENES = [
        `${urlApi}fotos/fotos-estaticas/fotodeprueba.png`,
        `${urlApi}fotos/fotos-estaticas/fotodeprueba.png`,
        `${urlApi}fotos/fotos-estaticas/fotodeprueba.png`,
        `${urlApi}fotos/fotos-estaticas/fotodeprueba.png`,
        `${urlApi}fotos/fotos-estaticas/fotodeprueba.png`,
        `${urlApi}fotos/fotos-estaticas/fotodeprueba.png`,
        `${urlApi}fotos/fotos-estaticas/fotodeprueba.png`,
        `${urlApi}fotos/fotos-estaticas/fotodeprueba.png`,
        `${urlApi}fotos/fotos-estaticas/fotodeprueba.png`,
        `${urlApi}fotos/fotos-estaticas/fotodeprueba.png`,
        `${urlApi}fotos/fotos-estaticas/fotodeprueba.png`,
    ];

    // Responsivo similar al otro carrusel
    useEffect(() => {
        const onResize = () => {
            const w = window.innerWidth;
            if (w < 640) setPerView(2);
            else if (w < 1024) setPerView(3);
            else if (w < 1280) setPerView(4);
            else if (w < 1536) setPerView(5);
            else setPerView(VIDEOS_POR_VISTA_DESKTOP);
        };
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Calcula ancho exacto por tarjeta (respetando gaps)
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const containerWidth = el.clientWidth;
        const totalGaps = GAP_PX * (perView - 1);
        const w = (containerWidth - totalGaps) / perView;
        setItemWidth(w);
        // Evita overflow al cambiar perView o cantidad
        setStartIdx((i) => Math.min(i, Math.max(0, IMÁGENES.length - perView)));
    }, [perView, IMÁGENES.length]);

    const maxStart = Math.max(0, IMÁGENES.length - perView);
    const canPrev = startIdx > 0;
    const canNext = startIdx < maxStart;

    const goPrev = () => canPrev && setStartIdx((i) => i - 1);
    const goNext = () => canNext && setStartIdx((i) => i + 1);

    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black">
            <div className="relative mx-auto max-w-[1080px] w-full my-5">
                <h3 className="text-white text-[35px] pb-2 mb-2">Videos</h3>

                {/* Flechas fuera del max-w en md+ (como cupones) */}
                {IMÁGENES.length > perView && (
                    <>
                        {/* Izquierda desktop */}
                        <button
                            onClick={goPrev}
                            disabled={!canPrev}
                            className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-[-4rem] bg-[#fff300]/90 hover:bg-[#fff300]/65 text-black rounded-full w-12 h-12 shadow-lg cursor-pointer z-20"
                            aria-label="Anterior"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                className="w-7 h-7">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                            </svg>
                        </button>

                        {/* Izquierda móvil (dentro) */}
                        <button
                            onClick={goPrev}
                            disabled={!canPrev}
                            className="
                md:hidden
                absolute left-1 top-[calc(50%+16px)] -translate-y-1/2
                bg-[#fff300]/90 hover:bg-[#fff300]/100
                text-black rounded-full w-10 h-10 shadow-lg
                z-20 disabled:opacity-40
              "
                            aria-label="Anterior móvil"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                className="w-6 h-6">
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
                        {IMÁGENES.map((src, idx) => (
                            <div key={idx} className="flex-shrink-0" style={{ width: `${itemWidth}px` }}>
                                <VideoCard src={src} onClick={() => {/* abre modal / navega */ }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Derecha desktop y móvil */}
                {IMÁGENES.length > perView && (
                    <>
                        <button
                            onClick={goNext}
                            disabled={!canNext}
                            className="
                hidden md:flex
                items-center justify-center
                absolute top-[calc(50%+16px)] -translate-y-1/2
                right-[-4rem]
                bg-[#fff300]/90 hover:bg-[#fff300]/65
            text-black rounded-full w-12 h-12 shadow-lg
                z-20 disabled:opacity-40 cursor-pointer
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

                        <button
                            onClick={goNext}
                            disabled={!canNext}
                            className="
                md:hidden
                absolute right-1 top-[calc(50%+16px)] -translate-y-1/2
                bg-[#fff300]/70 hover:bg-[#fff300]/85
                text-black rounded-full w-10 h-10 shadow-lg
                z-20 disabled:opacity-40
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
                    </>
                )}
            </div>
        </div>
    );
};

export default VideosHorizontalCarrusel;
