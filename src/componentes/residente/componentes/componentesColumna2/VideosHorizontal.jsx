import { useEffect, useRef, useState } from "react";
import { urlApi, imgApi } from "../../../api/url";
import { obtenerVideos } from "../../../api/videosApi";
import { useAuth } from "../../../Context";

const VIDEOS_POR_VISTA_DESKTOP = 7;
const GAP_PX = 24;

// Tarjeta de video (vertical, alargada)
const VideoCard = ({ video, onClick }) => (
    <div
        className="group relative overflow-hidden rounded-xl cursor-pointer bg-neutral-900"
        onClick={() => {
            if (video?.url) {
                window.open(video.url, '_blank');
            }
        }}
    >
        <div className="aspect-[7/13] w-full overflow-hidden">
            <img
                src={video.imagen || `${urlApi}fotos/fotos-estaticas/fotodeprueba.png`}
                alt={video.url || "video"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
            />
        </div>
    </div>
);

const VideosHorizontalCarrusel = () => {
    const [videos, setVideos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [perView, setPerView] = useState(VIDEOS_POR_VISTA_DESKTOP);
    const [itemWidth, setItemWidth] = useState(0);
    const viewportRef = useRef(null);
    const { token } = useAuth();

    // Obtener videos desde la API
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setCargando(true);
                setError(null);

                const videosData = await obtenerVideos(token);
                const videosActivos = videosData.filter(video => video.activo);

                if (Array.isArray(videosActivos) && videosActivos.length > 0) {
                    setVideos(videosActivos);
                } else {
                    setVideos([]);
                }
            } catch (err) {
                console.error('Error al obtener videos:', err);
                setError('Error al cargar los videos');
                setVideos([]);
            } finally {
                setCargando(false);
            }
        };

        fetchVideos();
    }, [token]);

    // Responsivo ajustado para 7 tarjetas
    useEffect(() => {
        const onResize = () => {
            const w = window.innerWidth;
            if (w < 640) setPerView(2);
            else if (w < 768) setPerView(3);
            else if (w < 1024) setPerView(4);
            else if (w < 1280) setPerView(5);
            else if (w < 1536) setPerView(6);
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
    }, [perView, videos.length]);

    // Función para calcular si hay elementos anteriores/siguientes
    const getScrollState = () => {
        const el = viewportRef.current;
        if (!el) return { canPrev: false, canNext: false };

        const { scrollLeft, scrollWidth, clientWidth } = el;
        const canPrev = scrollLeft > 0;
        const canNext = scrollLeft < scrollWidth - clientWidth - 10; // Margen de error

        return { canPrev, canNext };
    };

    const [scrollState, setScrollState] = useState({ canPrev: false, canNext: false });

    // Actualizar estado del scroll
    const updateScrollState = () => {
        setScrollState(getScrollState());
    };

    // Efecto para actualizar el estado del scroll cuando cambian los videos o el tamaño
    useEffect(() => {
        updateScrollState();
    }, [videos.length, perView, itemWidth]);

    // Scroll suave con snap
    const scrollBy = (distance) => {
        if (viewportRef.current) {
            viewportRef.current.scrollBy({
                left: distance,
                behavior: 'smooth'
            });

            // Actualizar estado después de la animación
            setTimeout(updateScrollState, 300);
        }
    };

    const goPrev = () => scrollBy(-(itemWidth + GAP_PX));
    const goNext = () => scrollBy(itemWidth + GAP_PX);

    // Manejar el scroll manual
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;

        const handleScroll = () => {
            updateScrollState();
        };

        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, []);

    const handleVideoClick = (video) => {
        if (video.url) {
            window.open(video.url, '_blank');
        }
    };

    // Mostrar loading mientras se cargan los videos
    if (cargando) {
        return (
            <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-transparent">
                <div className="relative mx-auto max-w-[1080px] w-full my-5">
                    <div className="relative flex justify-center items-center pt-2">
                        <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
                        <div className="relative flex justify-center items-center mb-8 mt-8">
                            <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
                            <div className="relative z-10 px-4 bg-[#DDDDDE]">
                                <div className="flex flex-row justify-center items-center gap-3">
<<<<<<< HEAD
                                    <img src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/RESIDENTE%20RESTAURANT%20VIDEO.webp" className="w-full h-6 object-contain" />
=======
                                    <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/negros/RESIDENTE%20RESTAURANT%20VIDEO.webp`} className="w-full h-6 object-contain" />
>>>>>>> 16712c598860b1bd60907ec30a037ddbadcabed9
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Si no hay videos, no mostrar nada
    if (videos.length === 0) {
        return null;
    }

    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-transparent">
            <div className="relative mx-auto max-w-[1080px] w-full my-5">
                <div className="relative flex justify-center items-center pt-2">
                    <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />

                    <div className="relative flex justify-center items-center mb-3 mt-3">
                        <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
                        <div className="relative z-10 px-4 bg-[#DDDDDE]">
                            <div className="flex flex-row justify-center items-center gap-3">
<<<<<<< HEAD
                                <img src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/RESIDENTE%20RESTAURANT%20VIDEO.webp" className="w-full h-6 object-contain" />
=======
                                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/negros/RESIDENTE%20RESTAURANT%20VIDEO.webp`} className="w-full h-6 object-contain" />
>>>>>>> 16712c598860b1bd60907ec30a037ddbadcabed9
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative mx-auto max-w-[1080px] w-full my-5">


                    {/* Flechas de navegación */}
                    {videos.length > perView && (
                        <>
                            {/* Flecha izquierda */}
                            <button
                                onClick={goPrev}
                                disabled={!scrollState.canPrev}
                                className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-[-4rem] bg-[#fff300] hover:bg-[#fff300]/55 text-black rounded-full w-12 h-12 shadow-lg cursor-pointer z-20"
                                aria-label="Anterior"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                    className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                                </svg>
                            </button>

                            {/* Flecha derecha */}
                            <button
                                onClick={goNext}
                                disabled={!scrollState.canNext}
                                className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-[-4rem] bg-[#fff300]/95 hover:bg-[#fff300]/55 text-black rounded-full w-12 h-12 shadow-lg z-20 cursor-pointer"
                                aria-label="Siguiente"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                    className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Viewport con scroll suave y snap */}
                    <div
                        ref={viewportRef}
                        className="overflow-x-auto w-full"
                        style={{
                            scrollSnapType: "x mandatory",
                            WebkitOverflowScrolling: "touch",
                            msOverflowStyle: "none",
                            scrollbarWidth: "none",
                        }}
                    >
                        {/* Ocultar scrollbar para Chrome, Safari y Edge */}
                        <style jsx>{`
                        .overflow-x-auto::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>

                        {/* Track de videos */}
                        <div
                            className="flex"
                            style={{
                                gap: `${GAP_PX}px`,
                            }}
                        >
                            {videos.map((video, idx) => (
                                <div
                                    key={video.id || idx}
                                    className="flex-shrink-0"
                                    style={{
                                        width: `${itemWidth}px`,
                                        scrollSnapAlign: "start",
                                    }}
                                >
                                    <VideoCard
                                        video={video}
                                        onClick={() => handleVideoClick(video)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideosHorizontalCarrusel;