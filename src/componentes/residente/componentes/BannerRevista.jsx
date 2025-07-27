import { useState, useEffect, useRef } from 'react';
import 
Banner from '../../../imagenes/bannerRevista/Banner-Jun-Jul-2025.png';
import BotonesAnunciateSuscribirme from './componentesColumna1/BotonesAnunciateSuscribirme';
import MiniaturasVideos from './componentesColumna1/MiniaturasVideos';
import CarruselPosts from './componentesColumna2/CarruselPosts';
import TarjetaHorizontalPost from './componentesColumna2/TarjetaHorizontalPost';
import TresTarjetas from './componentesColumna2/TresTarjetas';
import OpcionesExtra from './componentesColumna3/OpcionesExtra';
import DetallePost from './DetallePost';
import PostPrincipal from './componentesColumna2/PostPrincipal';
import VideosHorizontal from './componentesColumna2/VideosHorizontal';
import MainLateralPostTarjetas from './componentesColumna2/MainLateralPostTarjetas';
import { catalogoNotasGet, notasDestacadasTopGet, notasPublicadasPorId } from '../../api/notasPublicadasGet';
import EnPortada from './componentesColumna2/EnPortada';
import SeccionesPrincipales from './SeccionesPrincipales';
import DirectorioVertical from './componentesColumna2/DirectorioVertical';

const BannerRevista = () => {
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [posts, setPosts] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [detalleCargando, setDetalleCargando] = useState(false);
    const [errorDetalle, setErrorDetalle] = useState(null);
    const topRef = useRef(null);

    const [notasDestacadas, setNotasDestacadas] = useState([]);
    const [cargandoDestacadas, setCargandoDestacadas] = useState(true);
    const [errorDestacadas, setErrorDestacadas] = useState(null);

    useEffect(() => {
        const fetchDestacadas = async () => {
            setCargandoDestacadas(true);
            setErrorDestacadas(null);
            try {
                const data = await notasDestacadasTopGet();
                setNotasDestacadas(data);
            } catch (err) {
                setErrorDestacadas(err);
            } finally {
                setCargandoDestacadas(false);
            }
        };
        fetchDestacadas();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            setCargando(true);
            setError(null);
            try {
                const data = await catalogoNotasGet();
                setPosts(data);
            } catch (err) {
                setError(err);
            } finally {
                setCargando(false);
            }
        };
        fetchPosts();
    }, []);

    const handleCardClick = async (id) => {
        setDetalleCargando(true);
        setErrorDetalle(null);
        setShowDetail(true);

        try {
            const postCompleto = await notasPublicadasPorId(id);
            setSelectedPost(postCompleto);
        } catch (err) {
            setErrorDetalle(err);
            console.error("Error al cargar el detalle de la nota:", err);
        } finally {
            setDetalleCargando(false);
        }
    };

    const handleVolver = () => {
        setShowDetail(false);
        setSelectedPost(null);
        setErrorDetalle(null);
    };

    useEffect(() => {
        if (showDetail && topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [showDetail]);

    if (cargando) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">
                            Error: {error.message}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const filtrarPostsPorTipoNota = (tipo) => {
        return posts.filter(post => post.tipo_nota === tipo);
    }

    const filtrarDestacadasPorTipoNota = (tipo) => {
        return notasDestacadas.filter(post => post.tipo_nota === tipo);
    };

    return (
        <div ref={topRef} className="pt-4">
            {showDetail ? (
                <div className="flex flex-col">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] py-5 gap-5">
                        {/* Columna Principal - Solo DetallePost */}
                        <div>
                            {detalleCargando ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : errorDetalle ? (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">
                                                Error al cargar el detalle: {errorDetalle.message}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleVolver}
                                        className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        Volver
                                    </button>
                                </div>
                            ) : (
                                <DetallePost post={selectedPost} onVolver={handleVolver} />
                            )}
                        </div>

                        {/* Columna lateral - Mantenemos igual */}
                        <div className="space-y-6">
                            {/* Como no tenemos contexto de categoría, mostramos todas las destacadas */}
                            <MainLateralPostTarjetas
                                notasDestacadas={notasDestacadas}
                                onCardClick={(post) => handleCardClick(post.id)}
                            />
                            <BotonesAnunciateSuscribirme />
                            <OpcionesExtra />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col">
                    {["Restaurantes", "Food & Drink", "Experiencias", "Antojos"].map((tipo) => {
                        const postsFiltrados = filtrarPostsPorTipoNota(tipo);
                        const destacadasFiltradas = filtrarDestacadasPorTipoNota(tipo);

                        if (postsFiltrados.length === 0) return null;

                        return (
                            <div key={tipo} className="flex flex-col">
                                <h2 className="text-2xl font-bold mb-4">{tipo}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] py-5 gap-5">
                                    {/* Columna Principal */}
                                    <div>
                                        <img src={Banner} alt="Banner Revista" className="w-full pb-5" />
                                        {postsFiltrados[0] && (
                                            <PostPrincipal
                                                post={postsFiltrados[0]}
                                                onClick={() => handleCardClick(postsFiltrados[0].id)}
                                            />
                                        )}
                                        <TresTarjetas
                                            posts={postsFiltrados.slice(1, 7)}
                                            onCardClick={(post) => handleCardClick(post.id)}
                                        />
                                    </div>

                                    {/* Columna lateral */}
                                    <div className="space-y-6 relative -top-16.5">
                                        <DirectorioVertical />
                                        <MainLateralPostTarjetas
                                            notasDestacadas={destacadasFiltradas}
                                            onCardClick={(post) => handleCardClick(post.id)}
                                        />
                                        <BotonesAnunciateSuscribirme />
                                        <OpcionesExtra />
                                    </div>
                                </div>
                                {tipo === "Food & Drink" && <VideosHorizontal />}
                                {tipo === "Restaurantes" && <EnPortada />}
                                {tipo === "Experiencias" && <SeccionesPrincipales />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BannerRevista;