import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { urlApi } from "../../../api/url.js";

const CANTIDAD_NOTAS = 4;

const NotasAcervo = ({ onCardClick }) => {
    const [notas, setNotas] = useState([]);
    const [notasBusqueda, setNotasBusqueda] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [buscando, setBuscando] = useState(false);
    const [loading, setLoading] = useState(true);
    const [itemWidth, setItemWidth] = useState(0);
    const viewportRef = useRef(null);
    const navigate = useNavigate();
    const [animando, setAnimando] = useState(false);

    const handleClick = (nuevoIndice) => {
        if (animando) return;

        setAnimando(true);
        setIndiceCarrusel(nuevoIndice);

        setTimeout(() => {
            setAnimando(false);
        }, 300); //
    };

    useEffect(() => {
        const fetchNotas = async () => {
            try {
                setLoading(true);
                // Obtener todas las notas de acervo sin límite
                const response = await fetch(`${urlApi}api/notas`);
                if (response.ok) {
                    const todasLasNotas = await response.json();

                    // Filtrar solo las notas de tipo "acervo" (case-insensitive)
                    const notasAcervo = todasLasNotas.filter(nota => {
                        const tipoNota = (nota.tipo_nota || '').toLowerCase();
                        const tipoNota2 = (nota.tipo_nota2 || '').toLowerCase();
                        return tipoNota === 'acervo' || tipoNota2 === 'acervo';
                    });

                    //console.log('Total de notas de acervo encontradas:', notasAcervo.length);
                    setNotas(notasAcervo);
                }
            } catch (error) {
                console.error("Error cargando notas de acervo:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotas();
    }, []);

    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const containerWidth = el.clientWidth;
        const totalGaps = 20 * (CANTIDAD_NOTAS - 1);
        const w = (containerWidth - totalGaps) / CANTIDAD_NOTAS;
        setItemWidth(w);
    }, [notas.length]);

    // Función para buscar solo en las notas de acervo
    const buscarNotas = async (query) => {
        if (query.length < 3) {
            setNotasBusqueda([]);
            setBuscando(false);
            return;
        }

        setBuscando(true);

        try {
            //console.log('Buscando en notas de acervo con query:', query);

            // Usar las notas de acervo que ya tenemos cargadas
            const notasAcervo = notas;
            //console.log('Total de notas de acervo disponibles:', notasAcervo.length);

            // Normalizar el query (quitar acentos, convertir a minúsculas)
            const normalizarTexto = (texto) => {
                return texto
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
                    .replace(/[¿?¡!.,]/g, '') // Quitar signos de puntuación
                    .trim();
            };

            const queryNormalizado = normalizarTexto(query);
            //console.log('Query normalizado:', queryNormalizado);

            const notasFiltradas = notasAcervo.filter(nota => {
                if (!nota.titulo) return false;

                const tituloNormalizado = normalizarTexto(nota.titulo);
                const subtituloNormalizado = nota.subtitulo ? normalizarTexto(nota.subtitulo) : '';

                // Búsqueda exacta en título o subtítulo
                if (tituloNormalizado.includes(queryNormalizado) || subtituloNormalizado.includes(queryNormalizado)) {
                    return true;
                }

                // Búsqueda por palabras individuales
                const palabrasQuery = queryNormalizado.split(/\s+/).filter(p => p.length > 2);
                if (palabrasQuery.length === 0) return false;

                // Buscar en título
                let coincidenciasTitulo = 0;
                for (const palabraQuery of palabrasQuery) {
                    if (tituloNormalizado.includes(palabraQuery)) {
                        coincidenciasTitulo++;
                    }
                }

                // Buscar en subtítulo
                let coincidenciasSubtitulo = 0;
                if (subtituloNormalizado) {
                    for (const palabraQuery of palabrasQuery) {
                        if (subtituloNormalizado.includes(palabraQuery)) {
                            coincidenciasSubtitulo++;
                        }
                    }
                }

                // Si al menos la mitad de las palabras del query están en título o subtítulo
                const totalCoincidencias = Math.max(coincidenciasTitulo, coincidenciasSubtitulo);
                const porcentajeCoincidencia = totalCoincidencias / palabrasQuery.length;

                return porcentajeCoincidencia >= 0.5; // Al menos 50% de coincidencia
            });

            //console.log('Notas de acervo que coinciden con la búsqueda:', notasFiltradas.length);
            if (notasFiltradas.length > 0) {
                //console.log('Primera nota filtrada:', notasFiltradas[0]);
            }

            // Mostrar todos los resultados de búsqueda sin límite
            setNotasBusqueda(notasFiltradas);
            //console.log('Notas de búsqueda mostradas:', notasFiltradas.length);
        } catch (error) {
            console.error('Error al buscar notas de acervo:', error);
            setNotasBusqueda([]);
        } finally {
            setBuscando(false);
        }
    };

    // Debounce para la búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (inputValue.length >= 3) {
                buscarNotas(inputValue);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    // Mostrar resultados de búsqueda en notas de acervo o solo 5 notas de acervo
    const opcionesCombinadas = inputValue.length >= 3 ? notasBusqueda : notas.slice(0, 5);

    const maxIndiceCarrusel = notas.length <= CANTIDAD_NOTAS
        ? 0
        : notas.length - CANTIDAD_NOTAS;

    if (loading) return <p>Cargando notas de acervo...</p>;

    // Flechas scroll
    const scrollLeft = () => {
        if (viewportRef.current) {
            viewportRef.current.scrollBy({ left: -(itemWidth + 20), behavior: "smooth" });
        }
    };
    const scrollRight = () => {
        if (viewportRef.current) {
            viewportRef.current.scrollBy({ left: itemWidth + 20, behavior: "smooth" });
        }
    };

    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#fff200] mb-4">
            <div className="max-w-[1080px] mx-auto h-88 py-10">

                <div className="flex items-end leading-8 mb-6">
                    <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/negros/acervo-residente.webp`} className="w-auto h-6" />
                    <h2 className="text-[20px] font-bold leading-4 mr-auto ml-2">El acervo gastronómico de Nuevo León</h2>
                    {/* Antes 29px el h2 */}
                    {/* 🔍 Buscador avanzado */}
                    <Autocomplete
                        disablePortal
                        options={opcionesCombinadas}
                        getOptionLabel={(option) => option.titulo || ''}
                        sx={{
                            width: 300,
                            height: 40,
                            '& .MuiOutlinedInput-root': {
                                height: 40,
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                '& fieldset': {
                                    borderColor: '#FFF',
                                    borderWidth: '2px',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#FFF',
                                    borderWidth: '2px',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#FFF',
                                    borderWidth: '2px',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: '#6B7280',
                                fontSize: '13px',
                                fontWeight: '500',
                            },
                            '& .MuiInputBase-input': {
                                color: '#000000',
                                fontSize: '9px',
                                padding: '6px 6px',
                            },
                            '& .MuiAutocomplete-paper': {
                                backgroundColor: 'white',
                                border: '2px solid #E5E7EB',
                                borderRadius: '12px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                marginTop: '8px',
                                maxHeight: '400px',
                            },
                            '& .MuiAutocomplete-listbox': {
                                padding: '8px 0',
                                '& li': {
                                    padding: '16px 20px',
                                    borderBottom: '1px solid #F3F4F6',
                                    transition: 'all 0.2s ease',
                                    '&:last-child': {
                                        borderBottom: 'none',
                                    },
                                    '&:hover': {
                                        backgroundColor: '#F8FAFC',
                                        transform: 'translateX(4px)',
                                    },
                                    '&[aria-selected="true"]': {
                                        backgroundColor: '#EFF6FF',
                                        borderLeft: '4px solid #FFF',
                                    },
                                },
                            },
                            '& .MuiAutocomplete-endAdornment': {
                                color: '#6B7280',
                            },
                            '& .MuiAutocomplete-clearIndicator': {
                                color: '#6B7280',
                                '&:hover': {
                                    color: '#EF4444',
                                },
                            },
                            '& .MuiAutocomplete-popupIndicator': {
                                color: '#6B7280',
                                '&:hover': {
                                    color: '#FFF',
                                },
                            }
                        }}
                        renderInput={(params) => <TextField {...params} label="Buscar notas..." />}
                        onChange={(event, newValue) => {
                            if (newValue && newValue.id) {
                                // Navegar directamente a la nota
                                navigate(`/notas/${newValue.id}`);
                            }
                        }}
                        onInputChange={(event, newInputValue) => {
                            setInputValue(newInputValue);
                        }}
                        renderOption={(props, option) => (
                            <li {...props} className="py-4 px-5">
                                <div className="w-full flex items-start gap-4">
                                    {/* Imagen en miniatura */}
                                    <div className="flex-shrink-0">
                                        {option.imagen ? (
                                            <img
                                                src={option.imagen.startsWith('http') ? option.imagen : `${urlApi}${option.imagen}`}
                                                alt={option.titulo}
                                                className="w-14 h-14 object-cover rounded-lg border-2 border-white shadow-sm"
                                                onError={(e) => {
                                                    //console.log('Error cargando imagen:', option.imagen);
                                                    e.target.style.display = 'none';
                                                }}
                                                onLoad={() => {
                                                    //console.log('Imagen cargada exitosamente:', option.imagen);
                                                }}
                                            />
                                        ) : (
                                            <div className="w-14 h-14 bg-gradient-to-br rounded-lg flex items-center justify-center border-2 border-white">
                                                <span className="text-gray-400 text-xs font-medium">Sin img</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contenido de la nota */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-gray-900 text-base mb-2 leading-tight">
                                            {option.titulo}
                                        </div>

                                    </div>
                                </div>
                            </li>
                        )}
                        noOptionsText={
                            inputValue.length >= 3
                                ? buscando
                                    ? 'Buscando...'
                                    : 'No se encontraron notas'
                                : 'Escribe al menos 3 caracteres para buscar'
                        }
                    />
                </div>

                {notas.length > 0 ? (
                    <div className="flex flex-row gap-4">
                        <div className="flex justify-start items-start min-w-[200px] max-w-[200px]">
                            <span className="text-[25px] text-white leading-6.5">
                                Encuentra aqui todo sobre la actualidad y la historia sobre la gastronomía de Nuevo León
                            </span>
                        </div>
                        <div className="relative flex gap-4 ml-auto items-center">
                            {/* Flecha izquierda */}
                            {notas.length > CANTIDAD_NOTAS && (
                                <button
                                    className="hidden md:flex items-center justify-center absolute left-[-2.5rem] top-1/2 -translate-y-1/2 bg-transparent hover:bg-transparent text-black rounded-full w-12 h-12 cursor-pointer z-20"
                                    onClick={scrollLeft}
                                    aria-label="Anterior"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                        viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor"
                                        className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                                    </svg>
                                </button>
                            )}
                            {/* Carrusel de notas con scroll lateral */}
                            <div
                                ref={viewportRef}
                                className="overflow-x-auto w-[690px]"
                                style={{
                                    scrollSnapType: "x mandatory",
                                    WebkitOverflowScrolling: "touch"
                                }}
                            >
                                <div className="flex gap-4" style={{ scrollSnapAlign: "start" }}>
                                    {notas.map((nota) => (
                                        <div
                                            key={nota.id}
                                            className="w-40 cursor-pointer flex-shrink-0"
                                            style={{ scrollSnapAlign: "start", width: `${itemWidth}px` }}
                                            onClick={() => onCardClick && onCardClick(nota)}
                                        >
                                            <img
                                                src={nota.imagen}
                                                alt="Portada Revista"
                                                className="w-full h-28 object-cover"
                                            />
                                            <div className="flex flex-col mt-2 text-right">
                                                <h2 className="text-black text-[14px] leading-4.5 text-wrap">
                                                    {nota.titulo}
                                                </h2>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Flecha derecha */}
                            {notas.length > CANTIDAD_NOTAS && (
                                <button
                                    className="hidden md:flex items-center justify-center absolute right-[-2.5rem] top-1/2 -translate-y-1/2 bg-transparent hover:bg-transparent text-black rounded-full w-12 h-12 cursor-pointer z-20"
                                    onClick={scrollRight}
                                    aria-label="Siguiente"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                        viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor"
                                        className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <p>No hay notas de Acervo disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default NotasAcervo;