import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import BotonesAnunciateSuscribirme from './componentesColumna1/BotonesAnunciateSuscribirme';
import CarruselPosts from './componentesColumna2/CarruselPosts';
import TresTarjetas from './componentesColumna2/TresTarjetas';
import PostPrincipal from './componentesColumna2/PostPrincipal';
import VideosHorizontal from './componentesColumna2/VideosHorizontal';
import MainLateralPostTarjetas from './componentesColumna2/MainLateralPostTarjetas';
import { catalogoNotasGet, notasDestacadasTopGet } from '../../api/notasPublicadasGet';
import { catalogoTipoNotaGet } from '../../../componentes/api/CatalogoSeccionesGet.js';
import EnPortada from './componentesColumna2/EnPortada';
import SeccionesPrincipales from './SeccionesPrincipales';
import DirectorioVertical from './componentesColumna2/DirectorioVertical';
import BarraMarquee from './seccionesCategorias/componentes/BarraMarquee.jsx';
import CincoNotasRRR from './seccionesCategorias/componentes/CincoNotasRRR.jsx';
import { revistaGetUltima } from '../../api/revistasGet.js';
import { urlApi } from '../../../componentes/api/url.js';

const ResidenteHome = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [notasDestacadas, setNotasDestacadas] = useState([]);
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

    // Cargar datos de revista
    useEffect(() => {
        revistaGetUltima()
            .then(data => setRevistaActual(data))
            .catch(() => setRevistaActual(null));
    }, []);

    // Cargar notas destacadas
    useEffect(() => {
        const fetchDestacadas = async () => {
            try {
                const data = await notasDestacadasTopGet();
                setNotasDestacadas(data);
            } catch (err) {
                console.error("Error cargando notas destacadas:", err);
            }
        };
        fetchDestacadas();
    }, []);

    // Cargar todas las notas
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

    // Cargar tipos de notas
    useEffect(() => {
        const cargarTiposNotas = async () => {
            try {
                const data = await catalogoTipoNotaGet();
                if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
                    setTiposNotas(data.data);
                }
            } catch (error) {
                console.error("Error al cargar tipos de notas:", error);
            }
        };
        
        cargarTiposNotas();
    }, []);

    const handleCardClick = (id) => {
        navigate(`/notas/${id}`);
    };

    const filtrarPostsPorTipoNota = (tipo) => {
        return posts.filter(post => post.tipo_nota === tipo);
    };

    const filtrarDestacadasPorTipoNota = (tipo) => {
        return notasDestacadas.filter(post => post.tipo_nota === tipo);
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

    return (
        <div className="flex flex-col">
            {["Restaurantes", "Food & Drink", "Antojos"].map((tipo) => {
                const postsFiltrados = filtrarPostsPorTipoNota(tipo);
                const destacadasFiltradas = filtrarDestacadasPorTipoNota(tipo);

                if (postsFiltrados.length === 0) return null;

                // Buscar la configuración del tipo actual en los datos disponibles
                const tipoConfig = tiposNotas.find(t => t.nombre === tipo) || 
                    { tipoLogo: "", marqueeTexto: "" };
                    
                const tipoLogo = tipoConfig.tipoLogo ? `${urlApi}${tipoConfig.tipoLogo}` : null;
                const marqueeTexto = tipoConfig.marqueeTexto || "";

                return (
                    <div key={tipo} className="flex flex-col pt-9"> {/* Pantalla main */}
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-9">
                            {/* Columna Principal */}
                            <div>
                                <div className="relative flex justify-center items-center mb-4">
                                    <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
                                    <div className="relative z-10 px-4 bg-[#fff300]">

                                    </div>
                                </div>

                                <div className="w-176.5 mb-3">
                                    <BarraMarquee categoria={marqueeTexto} />
                                </div>

                                {postsFiltrados[0] && (
                                    <PostPrincipal
                                        post={postsFiltrados[0]}
                                        onClick={() => handleCardClick(postsFiltrados[0].id)}
                                    />
                                )}
                                {revistaActual && revistaActual.pdf ? (
                                    <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
                                        <img
                                            src={revistaActual.imagen_banner}
                                            alt="Banner Revista"
                                            className="w-full mb-4 cursor-pointer"
                                            title="Descargar Revista"
                                        />
                                    </a>
                                ) : (
                                    <img
                                        src={revistaActual?.imagen_banner}
                                        alt="Banner Revista"
                                        className="w-full mb-4"
                                    />
                                )}

                                <TresTarjetas
                                    posts={postsFiltrados.slice(1, 7)}
                                    onCardClick={(post) => handleCardClick(post.id)}
                                />
                            </div>

                            {/* Columna lateral */}
                            <div>
                                <div className="flex flex-col items-end justify-start gap-10">
                                    <DirectorioVertical />
                                    <MainLateralPostTarjetas
                                        notasDestacadas={destacadasFiltradas}
                                        onCardClick={(post) => handleCardClick(post.id)}
                                        sinCategoria
                                        cantidadNotas={5}
                                    />
                                </div>
                                <hr className="border-t border-gray-800/80 my-5 border-dotted" />
                                <BotonesAnunciateSuscribirme />
                                <hr className="border-t border-gray-800/80 my-5 border-dotted" />
                            </div>
                        </div>
                        {tipo === "Restaurantes" && (
                            <>
                                <div className="relative flex justify-center items-center mb-4">
                                    <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
                                    <div className="relative z-10 px-4 bg-[#fff300]">
                                        <div className="flex flex-row justify-center items-center gap-2">
                                            <img src={`https://residente.mx/fotos/fotos-estaticas/listado-iconos-100estrellas/favoritsdelpublico.avif`} className="w-7.5 h-full object-contain rounded-full" />
                                            <h3 className="text-4xl">Favoritos Residente</h3>
                                            <img src={`https://residente.mx/fotos/fotos-estaticas/listado-iconos-100estrellas/favoritsdelpublico.avif`} className="w-7.5 h-full object-contain rounded-full" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pb-5">
                                    <CincoNotasRRR tipoNota="Restaurantes" onCardClick={(nota) => handleCardClick(nota.id)} />
                                </div>
                                <EnPortada
                                    onCardClick={(nota) => handleCardClick(nota.id)}
                                />
                            </>
                        )}
                        {tipo === "Antojos" && (
                            <>
                                <VideosHorizontal />
                            </>
                        )}
                        {tipo === "Food & Drink" && (
                            <>
                                <div className="relative flex justify-center items-center mb-4">
                                    <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
                                    <div className="relative z-10 px-4 bg-[#fff300]">
                                        <div className="flex flex-row justify-center items-center gap-3">
                                            <img src={`https://residente.mx/fotos/fotos-estaticas/residente-logos/grises/platillos-iconicos.webp`} className="w-full h-8 object-contain" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pb-5">
                                    <CincoNotasRRR tipoNota="Food & Drink" onCardClick={(nota) => handleCardClick(nota.id)} />
                                </div>
                                <SeccionesPrincipales />
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ResidenteHome;