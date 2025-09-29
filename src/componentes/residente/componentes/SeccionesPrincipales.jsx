import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogoSeccionesGet } from '../../../componentes/api/CatalogoSeccionesGet.js';
import { urlApi } from '../../../componentes/api/url.js';
import { obtenerNotasTodasCategorias } from '../../../componentes/api/notasCategoriasBuscador.js';
import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const SeccionesPrincipales = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notas, setNotas] = useState([]);
  const [notasBusqueda, setNotasBusqueda] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [buscando, setBuscando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    catalogoSeccionesGet()
      .then((result) => {
        setData(result || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error al cargar secciones');
        setLoading(false);
      });
  }, []);

  // Ejecutar cuando data esté disponible
  useEffect(() => {
    if (data.length > 0) {
      // Obtener solo notas del tipo "Antojos"
      obtenerNotasTodasCategorias().then(notas => {
        //console.log('Notas obtenidas para autocompletado:', notas);
        if (notas.length > 0) {
          //console.log('Primera nota:', notas[0]);
          //console.log('Campo imagen de la primera nota:', notas[0].imagen);
        }
        setNotas(notas);
      });
    }
  }, [data]);

  // Función para buscar en todas las notas
  const buscarNotas = async (query) => {
    if (query.length < 3) {
      setNotasBusqueda([]);
      setBuscando(false);
      return;
    }

    setBuscando(true);

    try {
      //console.log('Buscando notas con query:', query);
      const url = `${urlApi}api/notas`;
      //console.log('URL de búsqueda:', url);

      const response = await fetch(url);
      //console.log('Response status:', response.status);

      if (response.ok) {
        const todasLasNotas = await response.json();
        //console.log('Total de notas obtenidas:', todasLasNotas.length);

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

        const notasFiltradas = todasLasNotas.filter(nota => {
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

        //console.log('Notas que coinciden con la búsqueda:', notasFiltradas.length);
        if (notasFiltradas.length > 0) {
          //console.log('Primera nota filtrada:', notasFiltradas[0]);
        }

        // Limitar a 20 resultados
        const notasLimitadas = notasFiltradas.slice(0, 20);
        setNotasBusqueda(notasLimitadas);
        //console.log('Notas limitadas mostradas:', notasLimitadas.length);
      } else {
        console.error('Error en la respuesta:', response.status, response.statusText);
        setNotasBusqueda([]);
      }
    } catch (error) {
      console.error('Error al buscar notas:', error);
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

  // Combinar notas del autocompletado con notas de búsqueda
  const opcionesCombinadas = inputValue.length >= 3 ? notasBusqueda : notas;

  if (loading) return <p>Cargando opciones...</p>;
  if (error) return <p>Error: {error}</p>;

  // ====== Config editable: ancho por columna (md y arriba) y layout interno ======
  // Cambia colWidth a tu gusto (usa fr, px, %, minmax, etc.)
  const seccionesConfig = {
    "Nivel de gasto": {
      colWidth: "0.5fr",                         // <- ancho de esta columna
      listTemplate: "1fr",                       // <- layout interno de la lista
      gap: "gap-x-0 gap-y-1",
    },
    "Tipo de comida": {
      colWidth: "0.8fr",
      listTemplate: "0.8fr 1fr",
      gap: "gap-x-0 gap-y-1",
    },
    "Zona": {
      colWidth: "1.4fr",
      listTemplate: "1.2fr 1fr",
      gap: "gap-x-0 gap-y-1",
    },
    "Experiencia": {
      colWidth: "1.3fr",
      listTemplate: "0.8fr 0.7fr 1fr",           // p.ej. central más angosta
      gap: "gap-x-0 gap-y-1",
    },
    // Default para cualquier sección no listada arriba
    "default": {
      colWidth: "1fr",
      listTemplate: "1fr",
      gap: "gap-y-1",
    }
  };

  // Construye el template de columnas dinámico en el orden de `data`
  // (solo se aplica en md+ con la clase md:[grid-template-columns:var(--cols)])
  const colsTemplate = data
    .map(s => (seccionesConfig[s.seccion]?.colWidth) || seccionesConfig.default.colWidth)
    .join(' ');

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#fff300] py-8">
      <div className="flex max-w-[1080px] mb-5 w-full mx-auto py-0 gap-4 items-end">
        <img
          src={`${urlApi}/fotos/fotos-estaticas/residente-logos/negros/logo-guia-nl.webp`}
          className="flex-[0_0_20%] w-55 h-auto object-contain"
          alt="Guía logo"
        />

        <p className="flex flex-[0_0_25%] text-xl leading-5.5 text-black items-end">
          Tu concierge restaurantero.
        </p>

        <div className="flex-[0_0_20%] flex items-center justify-end ml-auto">
          <Autocomplete
            disablePortal
            options={opcionesCombinadas}
            getOptionLabel={(option) => option.titulo || ''}
            sx={{
              width: 400,
              '& .MuiOutlinedInput-root': {
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
              // buscarNotas(newInputValue); // This is now handled by the useEffect hook
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
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {inputValue.length >= 3 ? (
                        // Para búsqueda: mostrar fecha, tipo de nota y vistas
                        <>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            {option.fecha || 'Sin fecha'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                            {option.tipo_nota || 'Sin tipo'}
                          </span>
                          {/*
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {option.vistas || 0} vistas
                            </span>
                          */}
                        </>
                      ) : (
                        // Para autocompletado: mostrar tipo, sección y categoría
                        <>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mr-2">
                            {option.tipoNota ? option.tipoNota.replace('-', ' ').toUpperCase() : ''}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                            {option.seccion}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                            {option.categoria}
                          </span>
                        </>
                      )}
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
      </div>
      <div
        className="grid grid-cols-1 md:[grid-template-columns:var(--cols)] max-w-[1080px] mx-auto py-0 gap-10"
        style={{ '--cols': colsTemplate }}
      >
        {data.map((seccion, i) => {
          const cfg = seccionesConfig[seccion.seccion] || seccionesConfig.default;
          const listTemplate = cfg.listTemplate || '1fr';
          const gapClasses = cfg.gap || 'gap-y-1';

          return (
            <div key={`${seccion.seccion}-${i}`}>
              <h3 className="font-bold mb-2 text-md border-b-1 border-black border-dotted text-black">
                {seccion.seccion}
              </h3>

              {/* Grid interno de cada sección controlado por listTemplate */}
              <ul
                className={`text-base text-black font-roman leading-tight grid ${gapClasses}`}
                style={{ gridTemplateColumns: listTemplate }}
              >
                {(seccion.categorias || []).map((categoria, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="cursor-pointer hover:underline text-xs md:text-sm bg-transparent border-none p-0 w-full text-left"
                      onClick={() =>
                        navigate(
                          `/seccion/${seccion.seccion.replace(/\s+/g, '').toLowerCase()}/categoria/${(categoria?.nombre || '').replace(/\s+/g, '').toLowerCase()}`,
                          { state: { seccion: seccion.seccion, categoria: categoria?.nombre } }
                        )
                      }
                    >
                      {categoria?.nombre ?? '—'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeccionesPrincipales;
