import { urlApi } from '../../../api/url';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { notasPorSeccionCategoriaGet } from '../../../api/notasPorSeccionCategoriaGet';
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
            restaurantesPorSeccionCategoriaGet(seccion, categoria)
        ])
            .then(([notasData, restaurantesData]) => {
                setNotas(Array.isArray(notasData) ? notasData : []);
                setRestaurantes(Array.isArray(restaurantesData) ? restaurantesData : []);
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
            const paddingCompensation = 40;

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
        <div className="mt-5 mb-5">
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

            {/* Recomendaciones de restaurantes */}
            <RecomendacionesRestaurantes categoria={categoria} restaurantes={restaurantes} />

            {/* Barra negra que se mueve Barra marquee*/}
            <BarraMarquee categoria={categoria} />

            {/* Body con 3 columnas, Cuponera, Notas y Directorio con cosas extra */}
            <div
                className="grid gap-5"
                style={{ gridTemplateColumns: '0.9fr 2fr 1.1fr' }}
                ref={notasRef}
            >
                {/* Cuponera */}
                <div className="flex flex-col items-start justify-start">
                    <h2 className="text-xl font-bold mb-2">Cuponera</h2>
                </div>
                
                {/* Notas */}
                <div className="flex flex-col items-center justify-start">
                    <div className="w-full gap-5 flex flex-col">
                        {selectedNota ? (
                            <DetallePost
                                post={selectedNota}
                                onVolver={handleVolver}
                            />
                        ) : (
                            notasPagina.map((nota, idx) => (
                                <div
                                    key={nota.id}
                                    ref={el => notaRefs.current[nota.id] = el}
                                >
                                    <TarjetaHorizontalPost
                                        post={nota}
                                        onClick={() => handleNotaClick(nota)}
                                    />
                                    {([2, 5, 8].includes(idx)) && (
                                        <img
                                            src={Banner}
                                            alt="Banner Revista"
                                            className="w-full mt-5"
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    {/* Botones de paginación */}
                    {!selectedNota && totalPaginas > 1 && (
                        <div className="flex gap-2 mt-6">
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
                </div>
                
                {/* OpcionesExtra */}
                <div className="flex flex-col items-end justify-start gap-5">
                    <DirectorioVertical
                        categoria={categoria}
                        restaurantes={restaurantes}
                    />
                    <OpcionesExtra />
                </div>
            </div>
        </div>
    );
};

export default MainSeccionesCategorias;