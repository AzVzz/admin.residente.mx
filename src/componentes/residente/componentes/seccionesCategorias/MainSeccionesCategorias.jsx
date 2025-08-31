import React from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { notasPorSeccionCategoriaGet, notasTopPorSeccionCategoriaGet } from '../../../api/notasPorSeccionCategoriaGet';
import { restaurantesPorSeccionCategoriaGet } from '../../../api/restaurantesPorSeccionCategoriaGet';
import { revistaGetUltima } from "../../../../componentes/api/revistasGet";
import { cuponesGetFiltrados } from '../../../api/cuponesGet';

import CarruselPosts from '../../../../componentes/residente/componentes/componentesColumna2/CarruselPosts.jsx';
import TarjetaHorizontalPost from '../../../../componentes/residente/componentes/componentesColumna2/TarjetaHorizontalPost.jsx'
import DirectorioVertical from '../componentesColumna2/DirectorioVertical.jsx';
import DetallePost from '../DetallePost.jsx'; ``
import BarraMarquee from './componentes/BarraMarquee.jsx';
import ImagenesRestaurantesDestacados from './componentes/ImagenesRestaurantesDestacados.jsx';
import CategoriaHeader from './componentes/CateogoriaHeader.jsx';
import CuponesCarrusel from './componentes/CuponesCarrusel.jsx';
import { urlApi } from '../../../api/url.js';

const NOTAS_POR_PAGINA = 12;

const MainSeccionesCategorias = () => {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();

    const seccion = location.state?.seccion || params.seccion;
    const categoria = location.state?.categoria || params.categoria;

    const { id } = params;
    const [notas, setNotas] = useState([]);
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const categoriaH1Ref = useRef(null);
    const categoriaH1ContainerRef = useRef(null);
    const [categoriaFontSize, setCategoriaFontSize] = useState(150);
    const [selectedNota, setSelectedNota] = useState(null);
    const [detalleCargando, setDetalleCargando] = useState(false);
    const [errorDetalle, setErrorDetalle] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [categoriaInfo, setCategoriaInfo] = useState(null);
    const notasRef = useRef(null);
    const notaRefs = useRef({});
    const [notasTop, setNotasTop] = useState([]);
    const [cupones, setCupones] = useState([]);
    const [loadingCupones, setLoadingCupones] = useState(true);

    const [revistaActual, setRevistaActual] = useState(null);


    useEffect(() => {
        setLoadingCupones(true);
        cuponesGetFiltrados(seccion, categoria)
            .then(data => setCupones(Array.isArray(data) ? data : []))
            .catch(() => setCupones([]))
            .finally(() => setLoadingCupones(false));
    }, [seccion, categoria]);

    useEffect(() => {
        revistaGetUltima()
            .then(data => setRevistaActual(data))
            .catch(() => setRevistaActual(null));
    }, []);

    const totalPaginas = Math.ceil(notas.length / NOTAS_POR_PAGINA);
    const notasPagina = notas.slice(
        (paginaActual - 1) * NOTAS_POR_PAGINA,
        paginaActual * NOTAS_POR_PAGINA
    );

    // Cuando hay id en la URL, carga la nota
    useEffect(() => {
        if (id) {
            setDetalleCargando(true);
            setErrorDetalle(null);
            // Busca la nota en las ya cargadas o en el top
            const notaExistente =
                notas.find(n => String(n.id) === String(id)) ||
                notasTop.find(n => String(n.id) === String(id));
            if (notaExistente) {
                setSelectedNota(notaExistente);
                setDetalleCargando(false);
            } else {
                // Si no está, podrías pedirla a la API (agrega tu función si la tienes)
                setDetalleCargando(false);
            }
        } else {
            setSelectedNota(null);
        }
    }, [id, notas, notasTop]);

    // Cuando el usuario hace click en una nota, navega a la URL
    const handleNotaClick = (nota) => {
        navigate(`/seccion/${seccion}/categoria/${categoria}/nota/${nota.id}`);
    };

    // Cuando el usuario quiere volver al listado
    const handleVolver = () => {
        navigate(`/seccion/${seccion}/categoria/${categoria}`);
        setSelectedNota(null);
    };

    useEffect(() => {
        if (selectedNota && notasRef.current) {
            notasRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [selectedNota]);

    useEffect(() => {
        if (!seccion || !categoria) return;
        setLoading(true);
        Promise.all([
            notasPorSeccionCategoriaGet(seccion, categoria),
            restaurantesPorSeccionCategoriaGet(seccion, categoria),
            notasTopPorSeccionCategoriaGet(seccion, categoria)
        ])
            .then(([notasData, restaurantesData, notasTopData]) => {
                setNotas(Array.isArray(notasData) ? notasData : []);
                setRestaurantes(Array.isArray(restaurantesData) ? restaurantesData : []);
                setNotasTop(Array.isArray(notasTopData) ? notasTopData : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [seccion, categoria]);

    function renderCategoriaH1(texto) {
        const palabras = texto.trim().split(/\s+/);
        if (palabras.length === 2) {
            return (
                <>
                    {palabras[0]}<br />{palabras[1]}
                </>
            );
        }
        return texto;
    }

    useLayoutEffect(() => {
        const adjustFontSizeForH1 = () => {
            const ref = categoriaH1Ref;
            const containerRef = categoriaH1ContainerRef;
            const initialSize = 150;
            const minSize = 20;
            const step = 2;
            const paddingCompensation = 0; //antes 40

            if (!ref.current || !containerRef.current) return;

            const container = containerRef.current;
            const textElement = ref.current;
            const containerWidth = container.offsetWidth - paddingCompensation;

            // Guardar estilos originales
            const originalDisplay = textElement.style.display;
            const originalVisibility = textElement.style.visibility;
            const originalWhiteSpace = textElement.style.whiteSpace;

            // Hacer el elemento invisible y en una sola línea para el cálculo
            textElement.style.display = 'inline-block';
            textElement.style.visibility = 'hidden';
            textElement.style.whiteSpace = 'nowrap';

            let currentSize = initialSize;
            textElement.style.fontSize = `${currentSize}px`;

            // Reducir el tamaño hasta que quepa o se alcance el mínimo
            while (textElement.scrollWidth > containerWidth && currentSize > minSize) {
                currentSize -= step;
                textElement.style.fontSize = `${currentSize}px`;
            }

            setCategoriaFontSize(currentSize);

            // Restaurar estilos
            textElement.style.display = originalDisplay;
            textElement.style.visibility = originalVisibility;
            textElement.style.whiteSpace = originalWhiteSpace;
        };

        adjustFontSizeForH1();

        // Usar ResizeObserver para detectar cambios de tamaño en el contenedor
        let resizeObserver = null;
        if (categoriaH1ContainerRef.current) {
            resizeObserver = new window.ResizeObserver(adjustFontSizeForH1);
            resizeObserver.observe(categoriaH1ContainerRef.current);
        }

        window.addEventListener('resize', adjustFontSizeForH1);

        return () => {
            window.removeEventListener('resize', adjustFontSizeForH1);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [categoria, restaurantes]);

    useEffect(() => {
        if (notasRef.current) {
            notasRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [paginaActual]);

    if (loading) return <div>Cargando...</div>;

    //Borrar despues:
    const categorias = [
        {
            titulo: "Restaurantes",
            items: ["Comida Mexicana", "Comida Italiana", "Comida Asiática", "Comida Rápida", "Comida Rápida", "Comida Rápida"]
        },
        {
            titulo: "Entretenimiento",
            items: ["Comida Mexicana", "Comida Italiana", "Comida Asiática", "Comida Rápida", "Comida Rápida", "Comida Rápida"]
        },
        {
            titulo: "Servicios",
            items: ["Comida Mexicana", "Comida Italiana", "Comida Asiática", "Comida Rápida", "Comida Rápida", "Comida Rápida"]
        },
        {
            titulo: "Hoteles",
            items: ["Comida Mexicana", "Comida Italiana", "Comida Asiática", "Comida Rápida", "Comida Rápida", "Comida Rápida"]
        },
        {
            titulo: "Eventos",
            items: ["Comida Mexicana", "Comida Italiana", "Comida Asiática", "Comida Rápida", "Comida Rápida", "Comida Rápida"]
        },
        {
            titulo: "Educación",
            items: ["Comida Mexicana", "Comida Italiana", "Comida Asiática", "Comida Rápida", "Comida Rápida", "Comida Rápida"]
        }
    ];

    return (
        <div className="mb-5 mt-9 max-w-[1080px] mx-auto w-full"> {/* Contenedor principal con ancho máximo */}
            {revistaActual && revistaActual.pdf ? (
                <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
                    <img
                        src={revistaActual.imagen_banner}
                        alt="Banner Revista"
                        className="w-full mb-4 cursor-pointer pt-5"
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

            <div className="flex items-center justify-between w-full mb-3 h-23">
                {/**
                 * 
                 *                <h1 className="text-[60px] leading-15 tracking-tight flex-shrink-0">
                    {categoria}
                </h1>
                 * 
                 */}

                <div className="overflow-hidden flex flex-col h-full w-full justify-center items-center">
                    <img
                        src={`${urlApi}fotos/fotos-estaticas/residente-logos/negros/logo-guia-nl.webp`}
                        className="w-55 h-auto "
                        alt="Logo Guía NL"
                    />
                    <span className="text-[25px]">Tu concierge restaurantero</span>
                </div>



            </div>

            <div className="grid grid-cols-6 gap-5">
                {/* Contenedor del H1 de categoría */}


                <CategoriaHeader
                    categoriaH1ContainerRef={categoriaH1ContainerRef}
                    categoriaH1Ref={categoriaH1Ref}
                    categoriaFontSize={categoriaFontSize}
                    renderCategoriaH1={renderCategoriaH1}
                    //Para el directorio vertical
                    categoria={categoria}
                    restaurantes={restaurantes}
                />



                <div className="col-span-4">
                    <CarruselPosts restaurantes={restaurantes.slice(0, 5)} />
                </div>
            </div>

            {/* Los 5 restaurantes destacados en imagenes */}
            <ImagenesRestaurantesDestacados restaurantes={restaurantes} />

            {/* CONTENEDOR PRINCIPAL MODIFICADO - clave para solucionar el problema */}
            <div className="flex flex-col md:flex-row gap-5" ref={notasRef}>
                {/*
                <div className="md:w-[20%] flex flex-col gap-10">
                    <div className="bg-gray-100 p-4 h-100">
                        <h3 className="font-bold mb-3">Nueva Columna</h3>
                        <p>Contenido adicional aquí...</p>
                    </div>
                </div>*/}

                {/* Columna Central - Notas */}
                <div className="flex-1 min-w-0 md:max-w-[80%]"> {/* min-w-0 previene desbordamientos */}
                    <div className="flex flex-col gap-4">


                        {/*revistaActual && revistaActual.pdf ? (
                            <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
                                <img
                                    src={revistaActual.imagen_banner}
                                    alt="Banner Revista"
                                    className="w-full cursor-pointer"
                                    title="Descargar PDF"
                                />
                            </a>
                        ) : (
                            <img
                                src={revistaActual?.imagen_banner}
                                alt="Banner Revista"
                                className="w-full"
                            />
                        )*/}

                        {/* Resto del contenido... */}
                        {/* === LISTADO DE NOTAS === */}
                        {id ? (
                            detalleCargando ? (
                                <div className="flex justify-center py-12 ">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : errorDetalle ? (
                                <div className="text-red-500 p-4">Error al cargar la nota: {errorDetalle?.message}</div>
                            ) : (
                                <DetallePost
                                    post={selectedNota}
                                    onVolver={handleVolver}
                                    sinFecha
                                />
                            )
                        ) : (
                            <>
                                {/* ===== PRIMERA NOTA: DESTACADA (imagen full width + texto abajo) ===== */}
                                {notasPagina[0] && (
                                    <article className="mb-6">
                                        <button
                                            onClick={() => handleNotaClick(notasPagina[0])}
                                            className="block w-full text-left group"
                                        >
                                            <div className="relative overflow-hidden rounded-md">
                                                {/* Imagen a todo el ancho del contenedor de notas */}
                                                <img
                                                    src={notasPagina[0].foto_portada || notasPagina[0].imagen || notasPagina[0].foto}
                                                    alt={notasPagina[0].titulo}
                                                    className="w-full h-auto object-cover aspect-[16/9] group-hover:scale-[1.02] transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            </div>

                                            {/* Texto debajo */}
                                            <div className="mt-3 px-1">
                                                <h2 className="text-[28px] leading-tight font-extrabold hover:underline">
                                                    {notasPagina[0].titulo}
                                                </h2>
                                                {/* si quieres mostrar resumen */}
                                                {notasPagina[0].resumen && (
                                                    <p className="mt-2 text-[15px] text-gray-700">
                                                        {notasPagina[0].resumen}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    </article>
                                )}

                                {/* ===== RESTO DE NOTAS: GRILLA 2 COLS (de la 2 a la 9, ajusta a tu gusto) ===== */}
                                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                    {notasPagina.slice(1, 9).map((nota) => (
                                        <div
                                            key={nota.id}
                                            ref={(el) => (notaRefs.current[nota.id] = el)}
                                            className="col-span-1"
                                        >
                                            <TarjetaHorizontalPost
                                                post={nota}
                                                onClick={() => handleNotaClick(nota)}
                                                sinFecha
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                    </div>
                </div>

                {/* Columna derecha - OpcionesExtra */}
                <div className="md:w-[20%] flex flex-col gap-10">
                    {/*
                    <MainLateralPostTarjetas
                        notasDestacadas={notasTop}
                        onCardClick={handleNotaClick}
                        cantidadNotas={5}
                        sinFecha
                        pasarObjeto={true}
                    />
                        */}
                    <DirectorioVertical />
                </div>
            </div>

            {/* Resto del código permanece igual... */}
            {/* Botones de paginación 
            {!selectedNota && totalPaginas > 1 && (
                <div className="flex gap-2 mt-6 justify-center">
                    {Array.from({ length: totalPaginas }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPaginaActual(i + 1)}
                            className={`w-8 h-8 items-center justify-center ${paginaActual === i + 1
                                ? 'bg-black text-white' // Página actual
                                : 'bg-gray-200 text-black hover:bg-gray-300' // Botón por seleccionar
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}*/}


            <div className="overflow-hidden w-full pt-4">
                <BarraMarquee categoria={`Más recomendaciones de restaurantes ${categoria}`} />
            </div>

            <div className="col-span-2 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-5">
                <div className="max-w-[1080px] mx-auto w-full">

                    <ImagenesRestaurantesDestacados restaurantes={restaurantes.slice(0, 6)} small cantidad={6} />
                    <div className="mt-5">
                        <ImagenesRestaurantesDestacados restaurantes={restaurantes.slice(6, 12)} small cantidad={6} />
                    </div>

                    <div className="bg-[#fff300] mt-4 h-66 px-6 py-6">
                        <div className="flex flex-row items-center mb-6">
                            <img
                                className="w-36 h-auto mr-4"
                                src="https://estrellasdenuevoleon.com.mx/fotos/fotos-estaticas/residente-logos/negros/logo-guia-nl.webp"
                                alt="Logo Guía NL"
                            />
                            <p className="text-lg font-medium self-center">
                                {`Más recomendaciones de restaurantes ${categoria}`}
                            </p>
                        </div>

                        <ul className="grid grid-cols-6">
                            {categorias.map((categoria, index) => (
                                <li key={index} className="">
                                    <ul className="space-y-1">
                                        {categoria.items.map((item, itemIndex) => (
                                            <li key={itemIndex} className="text-black cursor-pointer hover:underline">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>

                    </div>
                </div>
            </div>


            {!loadingCupones && cupones.length > 0 && (
                <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black py-5">
                    <div className="max-w-[1080px] mx-auto flex flex-col items-left">
                        <h3 className="text-white text-[22px]">
                            Descuentos y promociones de restaurantes entre {categoria} {">"}
                        </h3>
                        <div className="flex flex-wrap justify-center gap-6 w-full py-4">
                            <CuponesCarrusel cupones={cupones} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainSeccionesCategorias;