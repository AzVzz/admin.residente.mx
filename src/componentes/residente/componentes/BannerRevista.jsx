import { useState, useEffect, useRef } from 'react';
import Banner from '../../../imagenes/bannerRevista/Banner-Jun-Jul-2025.png'
import BotonesAnunciateSuscribirme from './componentesColumna1/BotonesAnunciateSuscribirme';
import MiniaturasVideos from './componentesColumna1/MiniaturasVideos';
import CarruselPosts from './componentesColumna2/CarruselPosts';
import TarjetaHorizontalPost from './componentesColumna2/TarjetaHorizontalPost';
import TresTarjetas from './componentesColumna2/TresTarjetas';
import OpcionesExtra from './componentesColumna3/OpcionesExtra';
import DetallePost from './DetallePost';
import imagenPrueba from '../../../imagenes/cola-de-caballo.jpg'
import PostPrincipal from './componentesColumna2/PostPrincipal';
import VideosHorizontal from './componentesColumna2/VideosHorizontal';
import MainLateralPostTarjetas from './componentesColumna2/MainLateralPostTarjetas';
import { catalogoNotasGet, notasDestacadasTopGet } from '../../api/notasPublicadasGet';


const BannerRevista = () => {
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [posts, setPosts] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
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

    const handleCardClick = (post) => {
        setSelectedPost(post);
        setShowDetail(true);
    };

    const handleVolver = () => {
        setShowDetail(false);
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

    return (
        <div ref={topRef} className="pt-4">
            <img src={Banner} alt="Banner Revista" className="w-full" />
            <div className="flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] py-5 gap-5">
                    {/* Columna Principal */}
                    <div>
                        {showDetail ? (
                            <DetallePost post={selectedPost} onVolver={handleVolver} />
                        ) : (
                            <>
                                {posts[0] && (
                                    <PostPrincipal
                                        post={posts[0]}
                                        onClick={() => handleCardClick(posts[0])}
                                    />
                                )}
                                <TresTarjetas
                                    posts={posts.slice(1, 4)}
                                    onCardClick={handleCardClick}
                                />
                            </>
                        )}
                    </div>

                    {/* Columna lateral */}
                    <div className="space-y-6">
                        <MainLateralPostTarjetas
                            //posts={posts}
                            notasDestacadas={notasDestacadas}
                            onCardClick={handleCardClick}
                        />
                        <BotonesAnunciateSuscribirme />
                        <OpcionesExtra />
                    </div>
                </div>
                <VideosHorizontal />
            </div>
        </div>
    );
};

export default BannerRevista;