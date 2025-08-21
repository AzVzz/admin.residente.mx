import { useEffect, useRef, useState } from "react";
import { urlApi } from "../../../api/url";
import { obtenerVideos } from "../../../api/videosApi";
import { useAuth } from "../../../Context";

const VIDEOS_POR_VISTA_DESKTOP = 6;
const GAP_PX = 32;

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
        <div className="aspect-[9/16] w-full overflow-hidden">
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
    const [startIdx, setStartIdx] = useState(0);
    const [perView, setPerView] = useState(VIDEOS_POR_VISTA_DESKTOP);
    const [itemWidth, setItemWidth] = useState(0);
    const [videos, setVideos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const viewportRef = useRef(null);
    const { token } = useAuth();

    // Obtener videos desde la API
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setCargando(true);
                setError(null);
                
                const videosData = await obtenerVideos(token);
                console.log('Videos cargados:', videosData);
                
                // Filtrar solo videos activos para el carrusel público
                const videosActivos = videosData.filter(video => video.activo);

                if (Array.isArray(videosActivos) && videosActivos.length > 0) {
                    setVideos(videosActivos);
                } else {
                    console.log('No hay videos activos');
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
        setStartIdx((i) => Math.min(i, Math.max(0, videos.length - perView)));
    }, [perView, videos.length]);

    const maxStart = Math.max(0, videos.length - perView);
    const canPrev = startIdx > 0;
    const canNext = startIdx < maxStart;

    const goPrev = () => canPrev && setStartIdx((i) => i - 1);
    const goNext = () => canNext && setStartIdx((i) => i + 1);

    const handleVideoClick = (video) => {
        console.log('Video clickeado:', video);
        if (video.url) {
            window.open(video.url, '_blank');
        }
    };

    // Mostrar loading mientras se cargan los videos
    if (cargando) {
        return (
            <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-transparent">
                <div className="relative mx-auto max-w-[1080px] w-full my-5">
                    <h3 className="text-black text-[35px] pb-2 mb-2">Videos</h3>
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
                <h3 className="text-black text-[35px] pb-2 mb-2">Videos</h3>

                {/* Flechas fuera del max-w en md+ (como cupones) */}
                {videos.length > perView && (
                    <>
                        {/* Izquierda desktop */}
                        <button
                            onClick={goPrev}
                            disabled={!canPrev}
                            className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-[-4rem] bg-[#fff300]/95 hover:bg-[#fff300]/85 text-black rounded-full w-12 h-12 shadow-lg disabled:opacity-40 cursor-pointer z-20"
                            aria-label="Anterior"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                                className="w-7 h-7">
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
                        {videos.map((video, idx) => (
                            <div key={video.id || idx} className="flex-shrink-0" style={{ width: `${itemWidth}px` }}>
                                <VideoCard 
                                    video={video} 
                                    onClick={() => handleVideoClick(video)} 
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Derecha desktop y móvil */}
                {videos.length > perView && (
                    <>
                        <button
                            onClick={goNext}
                            disabled={!canNext}
                            className="hidden md:flex items-center justify-center absolute top-[calc(50%+16px)] -translate-y-1/2 right-[-4rem] bg-[#fff300]/95 hover:bg-[#fff300]/85 text-black rounded-full w-12 h-12 shadow-lg z-20 disabled:opacity-40 cursor-pointer"
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
            </div>
        </div>
    );
};

export default VideosHorizontalCarrusel;