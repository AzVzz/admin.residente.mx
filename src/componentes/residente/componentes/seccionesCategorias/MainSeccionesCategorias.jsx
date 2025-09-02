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
import { catalogoSeccionesGet } from '../../../api/CatalogoSeccionesGet.js';
import HeaderSecciones from './componentes/HeaderSecciones.jsx';

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
        //Buscara la informacion de la categoria seleccionada
        catalogoSeccionesGet().then(secciones => {
            let found = null;
            for (const seccionObj of secciones) {
                const cat = seccionObj.categorias.find(
                    c => c.nombre === categoria || c.nombreCompleto === categoria
                );
                if (cat) {
                    found = cat;
                    break;
                }
            }
            setCategoriaInfo(found);
        });
    }, [categoria]);

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

            <HeaderSecciones />

            <div className="grid grid-cols-6 gap-5">
                {/* Contenedor del H1 de categoría */}


                <CategoriaHeader
                    categoriaH1ContainerRef={categoriaH1ContainerRef}
                    categoriaH1Ref={categoriaH1Ref}
                    categoriaFontSize={categoriaFontSize}
                    renderCategoriaH1={renderCategoriaH1}
                    //Para el directorio vertical
                    categoria={
                        categoriaInfo?.nombreCompleto?.trim()
                            ? categoriaInfo.nombreCompleto
                            : categoriaInfo?.nombre || categoria
                    }
                    descripcion={categoriaInfo?.descripcion}
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
                <div className="flex-1 min-w-0 md:max-w-[70%]"> {/* min-w-0 previene desbordamientos */}
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
                                {/* SECCIÓN PRINCIPAL: Nota Grande + Notas Medianas + Notas Pequeñas */}
                                {notasPagina.length > 0 && (
                                    <div className="mb-8">
                                        <div className="flex flex-col lg:flex-row gap-6 text-center">
                                            {/* NOTA PRINCIPAL - GRANDE (IZQUIERDA) */}
                                            <div className="lg:w-2/3">
                                                <div ref={el => notaRefs.current[notasPagina[0].id] = el} className="w-full">
                                                    <TarjetaHorizontalPost
                                                        post={notasPagina[0]}
                                                        onClick={() => handleNotaClick(notasPagina[0])}
                                                        sinFecha
                                                        destacada={true}
                                                    />
                                                </div>
                                                    {/* NOTAS PEQUEÑAS - DEBAJO DE LA GRANDE */}
                                                    {notasPagina.length > 5 && (
                                                    <div className="mt-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {notasPagina.slice(5, 9).map((nota, idx) => {
                                                        const textosPersonalizados = [
                                                        "¡Por fin! Arte y gastronomía se juntan. Frida Kahlo Casa Restaurant abre sus puertas en San Pedro.",
                                                        "5 razones para visitar Parrilla 111: tradición, sabor y buena compañía",
                                                        "El secreto mejor guardado de Monterrey",
                                                        "Vernáculo: Un homenaje culinario al noreste mexicano"
                                                        ]

                                                        return (
                                                        <div
                                                            key={idx}
                                                            ref={el => (notaRefs.current[idx] = el)}
                                                            className="col-span-1 flex flex-col items-center text-center"
                                                        >
                                                            {/* Imagen con tamaño fijo */}
                                                            <img
                                                            src={nota.imagen} // ajusta si tu objeto usa otra propiedad
                                                            alt={textosPersonalizados[idx]}
                                                            className="w-50 h-30 object-cover"
                                                            />

                                                            {/* Texto debajo */}
                                                            <p className="mt-2 text-sm font-medium text-gray-800">
                                                            {textosPersonalizados[idx]}
                                                            </p>
                                                        </div>
                                                        )
                                                    })}
                                                    </div>
                                                </div>
                                                )}
                                            </div>

                                            {/* NOTAS RECIENTES - MEDIANAS (DERECHA, EN COLUMNA) */}
                                            {notasPagina.length > 1 && (
                                                <div className="lg:w-1/3">
                                                    <div className="flex flex-col gap-4 text-center">
                                                        {notasPagina.slice(1, 5).map((nota, idx) => (
                                                            <div key={nota.id} ref={el => notaRefs.current[nota.id] = el}>
                                                                <TarjetaHorizontalPost
                                                                    post={nota}
                                                                    onClick={() => handleNotaClick(nota)}
                                                                    sinFecha
                                                                    mediana={true}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>


                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Columna derecha - OpcionesExtra */}
                <div className="md:w-[30%] flex flex-col gap-10">
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