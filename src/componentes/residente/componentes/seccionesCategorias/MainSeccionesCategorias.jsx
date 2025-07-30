import { urlApi } from '../../../api/url';
import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { notasPorSeccionCategoriaGet, notasTopPorSeccionCategoriaGet } from '../../../api/notasPorSeccionCategoriaGet';
import { restaurantesPorSeccionCategoriaGet } from '../../../api/restaurantesPorSeccionCategoriaGet';

import CarruselPosts from '../../../../componentes/residente/componentes/componentesColumna2/CarruselPosts.jsx';
import TarjetaHorizontalPost from '../../../../componentes/residente/componentes/componentesColumna2/TarjetaHorizontalPost.jsx'
import DirectorioVertical from '../componentesColumna2/DirectorioVertical.jsx';
import OpcionesExtra from '../componentesColumna3/OpcionesExtra.jsx';
import DetallePost from '../DetallePost.jsx';
import Banner from '../../../../imagenes/bannerRevista/Banner-Jun-Jul-2025.png';
import BarraMarquee from './componentes/BarraMarquee.jsx';
import RecomendacionesRestaurantes from './componentes/RecomendacionesRestaurantes.jsx';
import ImagenesRestaurantesDestacados from './componentes/ImagenesRestaurantesDestacados.jsx';
import CategoriaHeader from './componentes/CateogoriaHeader.jsx';
import TicketPromo from '../../../promociones/componentes/TicketPromo.jsx';
import Cupones from './componentes/Cupones.jsx';
import SeccionesPrincipales from '../SeccionesPrincipales.jsx';
import MainLateralPostTarjetas from '../../componentes/componentesColumna2/MainLateralPostTarjetas';

const NOTAS_POR_PAGINA = 12;

const MainSeccionesCategorias = () => {
    const location = useLocation();
    const params = useParams();
    const seccion = location.state?.seccion || params.seccion;
    const categoria = location.state?.categoria || params.categoria;
    const [notas, setNotas] = useState([]);
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const categoriaH1Ref = useRef(null);
    const categoriaH1ContainerRef = useRef(null);
    const [categoriaFontSize, setCategoriaFontSize] = useState(150);
    const [selectedNota, setSelectedNota] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const notasRef = useRef(null);
    const notaRefs = useRef({});
    const [notasTop, setNotasTop] = useState([]);

    const totalPaginas = Math.ceil(notas.length / NOTAS_POR_PAGINA);
    const notasPagina = notas.slice(
        (paginaActual - 1) * NOTAS_POR_PAGINA,
        paginaActual * NOTAS_POR_PAGINA
    );

    const handleNotaClick = (nota) => {
        setSelectedNota(nota);
    };
    const handleVolver = () => {
        setSelectedNota(null);
        setTimeout(() => {
            if (selectedNota && notaRefs.current[selectedNota.id]) {
                notaRefs.current[selectedNota.id].scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            } else if (notasRef.current) {
                notasRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
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

    return (
        <div className="mb-5 mt-9">
            <div className="grid grid-cols-6 gap-5">
                {/* Contenedor del H1 de categoría */}
                <CategoriaHeader
                    categoriaH1ContainerRef={categoriaH1ContainerRef}
                    categoriaH1Ref={categoriaH1Ref}
                    categoriaFontSize={categoriaFontSize}
                    renderCategoriaH1={renderCategoriaH1}
                    categoria={categoria}
                />
                <div className="col-span-4">
                    <CarruselPosts restaurantes={restaurantes.slice(0, 5)} />
                </div>
            </div>


            {/* Los 5 restaurantes destacados en imagenes */}
            <ImagenesRestaurantesDestacados restaurantes={restaurantes} />

            {/* Barra negra que se mueve Barra marquee
            <BarraMarquee categoria={categoria} /> */}

            {/* Recomendaciones de restaurantes 
            <RecomendacionesRestaurantes categoria={categoria} restaurantes={restaurantes} />*/}

            {/* Body con 3 columnas, Cuponera, Notas y Directorio con cosas extra */}
            <div
                className="grid gap-5"
                style={{ gridTemplateColumns: '2.9fr 1.1fr' }}
                ref={notasRef}
            >


                {/* Notas y bloques extendidos */}
                <div className="flex flex-col items-center justify-start">

                    <div className="w-full gap-4 flex flex-col">
                        <div className="flex flex-col gap-4">
                            <img
                                src={Banner}
                                alt="Banner Revista"
                                className="w-full"
                            />
                            <div className="w-192.5">
                                <BarraMarquee categoria={categoria} />
                            </div>
                        </div>

                        {selectedNota ? (
                            <DetallePost
                                post={selectedNota}
                                onVolver={handleVolver}
                                sinFecha
                            />
                        ) : (
                            <>
                                {/* Primer bloque de 8 notas con Banner en medio */}
                                {notasPagina.slice(0, 8).map((nota, idx) => (
                                    <React.Fragment key={nota.id}>
                                        {/* Mostrar Banner después de la cuarta nota */}
                                        {idx === 4 && (
                                            <img
                                                src={Banner}
                                                alt="Banner Revista"
                                                className="w-full"
                                            />
                                        )}
                                        <div ref={el => notaRefs.current[nota.id] = el}>
                                            <TarjetaHorizontalPost
                                                post={nota}
                                                onClick={() => handleNotaClick(nota)}
                                                sinFecha
                                            />
                                        </div>
                                    </React.Fragment>
                                ))}
                            </>
                        )}
                    </div>

                </div>

                {/* OpcionesExtra */}
                <div className="flex flex-col items-end justify-start gap-10">
                    <DirectorioVertical
                        categoria={categoria}
                        restaurantes={restaurantes}
                    />

                    {/* Top 5 más vistas */}
                    <MainLateralPostTarjetas
                        notasDestacadas={notasTop}
                        onCardClick={handleNotaClick}
                        cantidadNotas={5}
                        sinFecha
                    />

                    {/*<OpcionesExtra />*/}
                </div>
            </div>

            {/* Botones de paginación */}
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
            )}


            {/* Barra horizontal extendida */}
            <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-5">
                <div className="max-w-[1080px] mx-auto w-full my-3">
                    <h3 className="text-[22px]">Más recomendaciones de restaurantes por {categoria} {">"}</h3>
                    <ImagenesRestaurantesDestacados restaurantes={restaurantes} small cantidad={6} />
                    <ImagenesRestaurantesDestacados restaurantes={restaurantes} small cantidad={6} />
                </div>
            </div>

            {/* Barra horizontal extendida */}
            <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black py-5">
                <div className="max-w-[1080px] mx-auto flex flex-col items-left">
                    <h3 className="text-white text-[22px]">Descuentos y promociones de restaurantes entre {categoria} {">"} </h3>

                    <div className="flex flex-wrap justify-center gap-6 w-full py-1">
                        <Cupones />
                    </div>
                </div>
            </div>




        </div>
    );
};

export default MainSeccionesCategorias;