// BannerRevista.jsx es un nombre equivocado es el main de tda la página de residente.

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import BotonesAnunciateSuscribirme from './componentesColumna1/BotonesAnunciateSuscribirme';
import MiniaturasVideos from './componentesColumna1/MiniaturasVideos';
import CarruselPosts from './componentesColumna2/CarruselPosts';
import TarjetaHorizontalPost from './componentesColumna2/TarjetaHorizontalPost';
import TresTarjetas from './componentesColumna2/TresTarjetas';
import DetallePost from './DetallePost';
import PostPrincipal from './componentesColumna2/PostPrincipal';
import VideosHorizontal from './componentesColumna2/VideosHorizontal';
import MainLateralPostTarjetas from './componentesColumna2/MainLateralPostTarjetas';
import { catalogoNotasGet, notasDestacadasTopGet, notasPublicadasPorId, notasResidenteGet } from '../../api/notasPublicadasGet';
import { catalogoTipoNotaGet } from '../../../componentes/api/CatalogoSeccionesGet.js';
import EnPortada from './componentesColumna2/EnPortada';
import SeccionesPrincipales from './SeccionesPrincipales';
import DirectorioVertical from './componentesColumna2/DirectorioVertical';
import BarraMarquee from '../../../componentes/residente/componentes/seccionesCategorias/componentes/BarraMarquee.jsx';
import CincoNotasRRR from './seccionesCategorias/componentes/CincoNotasRRR.jsx';
import { revistaGetUltima } from '../../api/revistasGet.js';
import { urlApi } from '../../../componentes/api/url.js';
import DetalleBannerRevista from './DetalleBannerRevista';
import ListadoBannerRevista from './ListadoBannerRevista';

const BannerRevista = () => {
    const { id } = useParams();
    const [selectedPost, setSelectedPost] = useState(null);
    const [posts, setPosts] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [detalleCargando, setDetalleCargando] = useState(false);
    const [errorDetalle, setErrorDetalle] = useState(null);
    const topRef = useRef(null);

    const navigate = useNavigate();

    const [notasDestacadas, setNotasDestacadas] = useState([]);
    const [cargandoDestacadas, setCargandoDestacadas] = useState(true);
    const [errorDestacadas, setErrorDestacadas] = useState(null);
    const [revistaActual, setRevistaActual] = useState(null);
    const [tiposNotas, setTiposNotas] = useState([
        {
            nombre: "Restaurantes",
            tipoLogo: "fotos/fotos-estaticas/residente-logos/grises/residente-restaurant-media.webp",
            marqueeTexto: "Encuentra aqui la información al momento de los mejores restaurantes de Nuevo León"
        },
        {
            nombre: "Food & Drink",
            tipoLogo: "fotos/fotos-estaticas/residente-logos/grises/food-&-drink-media.webp",
            marqueeTexto: "Postres, Snacks, Café, Cerveza, Vino, Té, Mixología, Recetas, Platillos y Alimentos"
        },
        {
            nombre: "Antojos",
            tipoLogo: "fotos/fotos-estaticas/residente-logos/grises/antojos.webp",
            marqueeTexto: "Taquerias iconicas de Nuevo León, comida callejera, puestos, carritos, changarros y similares"
        },
        {
            nombre: "Residente",
            tipoLogo: "fotos/fotos-estaticas/residente-logos/grises/food-&-drink-media.webp",
            marqueeTexto: "Residente - Lo mejor de la gastronomía de Nuevo León"
        }
    ]);

    useEffect(() => {
        revistaGetUltima()
            .then(data => setRevistaActual(data))
            .catch(() => setRevistaActual(null));
    }, []);

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

    // Si hay id en la URL, carga el detalle
    useEffect(() => {
        if (id) {
            setDetalleCargando(true);
            setErrorDetalle(null);
            setSelectedPost(null);
            notasPublicadasPorId(id)
                .then(post => setSelectedPost(post))
                .catch(err => setErrorDetalle(err))
                .finally(() => setDetalleCargando(false));
        }
    }, [id]);

    // Añade este useEffect para cargar los tipos de notas al iniciar
    useEffect(() => {
        const cargarTiposNotas = async () => {
            try {
                const data = await catalogoTipoNotaGet();
                if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
                    setTiposNotas(data.data);
                }
            } catch (error) {
                console.error("Error al cargar tipos de notas:", error);
                // Mantiene los valores por defecto en caso de error
            }
        };

        cargarTiposNotas();
    }, []);

    const handleCardClick = async (id) => {
        navigate(`/notas/${id}`);
    };

    const handleVolver = () => {
        navigate('/notas');
        setSelectedPost(null);
        setErrorDetalle(null);
    };

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
        <div ref={topRef} className="">
            {id ? (
                <div className="flex flex-col">
                    <DetalleBannerRevista
                        detalleCargando={detalleCargando}
                        errorDetalle={errorDetalle}
                        handleVolver={handleVolver}
                        selectedPost={selectedPost}
                        tiposNotas={tiposNotas}
                        notasDestacadas={notasDestacadas}
                        handleCardClick={handleCardClick}
                    />
                </div>
            ) : (
                <ListadoBannerRevista
                    tiposNotas={tiposNotas}
                    filtrarPostsPorTipoNota={filtrarPostsPorTipoNota}
                    filtrarDestacadasPorTipoNota={filtrarDestacadasPorTipoNota}
                    handleCardClick={handleCardClick}
                    revistaActual={revistaActual}
                    notasResidenteGet={notasResidenteGet}
                />
            )}
        </div>
    );
};

export default BannerRevista;