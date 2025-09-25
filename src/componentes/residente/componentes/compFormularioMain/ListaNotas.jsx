import { useEffect, useState } from "react";
import { useAuth } from "../../../Context";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { notasTodasGet } from "../../../api/notasCompletasGet";
import { notaDelete } from "../../../api/notaDelete";
import { FaUser } from "react-icons/fa6";
import SinNotas from "./componentesListaNotas/SinNotas";
import ErrorNotas from "./componentesListaNotas/ErrorNotas";
import NotaCard from "./componentesListaNotas/NotaCard";
import { RiQuestionnaireFill } from "react-icons/ri";
import { IoMdPlay } from "react-icons/io";
import { FaBookOpen } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa";
import { GoNote } from "react-icons/go";
import { IoNewspaper } from "react-icons/io5";
import { RiStickyNoteFill } from "react-icons/ri";
import { LuUnderline } from "react-icons/lu";

import FiltroEstadoNota from './FiltroEstadoNota';
import FiltroTipoCliente from './FiltroTipoCliente';
import FiltroAutor from './FiltroAutor';
import SearchNotasLocal from './SearchNotasLocal';
import PreguntasSemanales from "./componentesPrincipales/PreguntasSemanales.jsx";
import FormularioRevistaBannerNueva from "./FormularioRevistaBanner.jsx";
import VideosDashboard from "./VideosDashboard.jsx";
import FormNewsletter from "./FormNewsletter.jsx";
import InfografiaForm from "../../infografia/InfografiaForm.jsx";
import ListaNotasUanl from "./ListaNotasUanl.jsx";

const ListaNotas = () => {
  const { token, usuario, saveToken, saveUsuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("notas");
  const [estado, setEstado] = useState('');
  const [tipoCliente, setTipoCliente] = useState('');
  const [autor, setAutor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [todasLasNotas, setTodasLasNotas] = useState([]);

  // Estados para paginación local
  const [paginaActual, setPaginaActual] = useState(1);
  const notasPorPagina = 15;

  useEffect(() => {
    if (error && (error.status === 403 || error.status === 401)) {
      saveToken(null);
      saveUsuario(null);
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }
    if (!token || !usuario) {
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [token, usuario, error, saveToken, saveUsuario, location, navigate]);

  const fetchTodasLasNotas = async () => {
    setCargando(true);
    setError(null);
    try {
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('Cargando todas las notas...');
      console.log('Token:', token ? 'Presente' : 'Ausente');
      console.log('Usuario:', usuario);

      // Cargar todas las notas sin paginación
      const data = await notasTodasGet(token, 1, 'all');
      console.log('Respuesta:', data);

      // Validar respuesta del servidor
      if (!data) {
        throw new Error('El servidor no devolvió datos');
      }

      if (!Array.isArray(data.notas)) {
        throw new Error('Formato de respuesta inválido del servidor');
      }

      setTodasLasNotas(data.notas);
      setNotas(data.notas);
      setPaginaActual(1); // Resetear a página 1 al cargar
    } catch (err) {
      console.error('Error detallado:', err);
      console.error('Mensaje del error:', err.message);
      console.error('Status del error:', err.status);
      console.error('Stack trace:', err.stack);

      // Manejo específico de errores 403
      if (err.status === 403) {
        console.error('Error 403: Acceso denegado. Verificar permisos del usuario o token expirado');
        // Limpiar token y usuario si es 403
        saveToken(null);
        saveUsuario(null);
        navigate('/login', { replace: true });
        return;
      }

      setError(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchTodasLasNotas();
    // eslint-disable-next-line
  }, [token, usuario]);


  const eliminarNota = async (id) => {
    setEliminando(id);
    try {
      await notaDelete(id);
      await fetchTodasLasNotas();
    } catch (error) {
      alert("Error al eliminar la nota");
    } finally {
      setEliminando(null);
    }
  };

  const mapeoPermisosATipoNota = {
    'mama-de-rocco': 'Mamá de Rocco',
    'barrio-antiguo': 'Barrio Antiguo',
    'otrocliente': 'Otro Cliente',
  };

  // Función para normalizar texto para búsqueda
  const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[¿?¡!.,]/g, '') // Quitar signos de puntuación
      .trim();
  };

  const notasFiltradas = todasLasNotas.filter(nota => {
    const cumpleEstado = !estado || (nota.estatus || '').toLowerCase().trim() === estado.toLowerCase().trim();
    const cumpleAutor = !autor || (nota.autor || '').toLowerCase().trim() === autor.toLowerCase().trim();

    let cumpleTipoCliente = true;
    if (tipoCliente) {
      const tipoNotaEsperado = mapeoPermisosATipoNota[tipoCliente];
      if (tipoNotaEsperado) {
        cumpleTipoCliente = (nota.tipo_nota || '') === tipoNotaEsperado;
      } else {
        const tipoClienteFormateado = tipoCliente
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        cumpleTipoCliente = (nota.tipo_nota || '').toLowerCase().includes(tipoClienteFormateado.toLowerCase()) ||
          (nota.tipo_nota || '').toLowerCase().includes(tipoCliente.toLowerCase());
      }
    }

    // Filtro de búsqueda local
    let cumpleBusqueda = true;
    if (searchTerm.trim()) {
      const queryNormalizado = normalizarTexto(searchTerm);
      const tituloNormalizado = normalizarTexto(nota.titulo);
      const subtituloNormalizado = normalizarTexto(nota.subtitulo);
      const autorNormalizado = normalizarTexto(nota.autor);
      const tipoNotaNormalizado = normalizarTexto(nota.tipo_nota);

      // Búsqueda exacta
      if (tituloNormalizado.includes(queryNormalizado) ||
        subtituloNormalizado.includes(queryNormalizado) ||
        autorNormalizado.includes(queryNormalizado) ||
        tipoNotaNormalizado.includes(queryNormalizado)) {
        cumpleBusqueda = true;
      } else {
        // Búsqueda por palabras individuales
        const palabrasQuery = queryNormalizado.split(/\s+/).filter(p => p.length > 2);
        if (palabrasQuery.length > 0) {
          let coincidencias = 0;
          for (const palabraQuery of palabrasQuery) {
            if (tituloNormalizado.includes(palabraQuery) ||
              subtituloNormalizado.includes(palabraQuery) ||
              autorNormalizado.includes(palabraQuery) ||
              tipoNotaNormalizado.includes(palabraQuery)) {
              coincidencias++;
            }
          }
          cumpleBusqueda = coincidencias >= Math.ceil(palabrasQuery.length * 0.5); // Al menos 50% de coincidencia
        } else {
          cumpleBusqueda = false;
        }
      }
    }

    return cumpleEstado && cumpleTipoCliente && cumpleAutor && cumpleBusqueda;
  });

  // Calcular paginación local
  const totalNotasFiltradas = notasFiltradas.length;
  const totalPaginas = Math.ceil(totalNotasFiltradas / notasPorPagina);
  const inicioIndice = (paginaActual - 1) * notasPorPagina;
  const finIndice = Math.min(inicioIndice + notasPorPagina, totalNotasFiltradas);

  // Obtener notas para la página actual
  const notasPaginaActual = notasFiltradas.slice(inicioIndice, finIndice);


  // Resetear a página 1 cuando cambien los filtros o búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [estado, tipoCliente, autor, searchTerm]);

  // Funciones de navegación local
  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorNotas error={error} onRetry={fetchTodasLasNotas} />;
  }

  return (
    <div className="space-y-6 py-5">
      {/* Encabezado */}
      <div className="flex flex-col gap-5 justify-between">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black rounded-2xl py-1">Panel de Administración</h1>
          {usuario && (
            <div className="flex items-center gap-5">
              <button
                onClick={() => {
                  saveToken(null);
                  saveUsuario(null);
                  navigate("/");
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white shadow hover:bg-red-700 transition text-sm font-bold cursor-pointer rounded-xl"
                title="Cerrar sesión"
              >
                Cerrar sesión
              </button>
              <span className="inline-flex items-center px-4 py-2 shadow-sm text-sm font-bold text-white bg-black rounded-xl">
                <FaUser className="text-sm -mt-0.5 mr-2" />
                <span className="flex items-center">{usuario?.nombre_usuario}</span>
              </span>
            </div>
          )}
        </div>

        {/* Menú de pestañas */}
        <div className="flex gap-5 items-center bg-gray-200 py-2 justify-center rounded-md">
          <button
            onClick={() => setVistaActiva("notas")}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "notas" ? "bg-white text-gray-900" : "text-gray-400 cursor-pointer"
              }`}
          >
            <RiStickyNoteFill className="mr-3" />
            Notas
          </button>

          {usuario?.permisos === 'todos' && (
            <button
              onClick={() => setVistaActiva("preguntas")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "preguntas" ? "bg-white text-gray-900" : "text-gray-400 cursor-pointer"
                }`}
            >
              <RiQuestionnaireFill className="mr-3" />
              Preguntas
            </button>
          )}

          {usuario?.permisos === 'todos' && (
            <button
              onClick={() => setVistaActiva("revistas")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "revistas" ? "bg-white text-gray-900" : "text-gray-400 cursor-pointer"
                }`}
            >
              <FaBookOpen className="mr-3" />
              Revistas
            </button>
          )}

          {usuario?.permisos === 'todos' && (
            <button
              onClick={() => setVistaActiva("videos")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "videos" ? "bg-white text-gray-900" : "text-gray-400 cursor-pointer"
                }`}
            >
              {/* <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>*/}
              <IoMdPlay className="mr-3" />
              Videos
            </button>
          )}

          {usuario?.permisos === 'todos' && (
            <button
              onClick={() => setVistaActiva("newsletter")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "newsletter" ? "bg-white text-gray-900" : "text-gray-400 cursor-pointer"
                }`}
            >
              <IoNewspaper className="mr-3" />
              Newsletter
            </button>
          )}

          {usuario?.permisos === 'todos' && (
            <button
              onClick={() => setVistaActiva("infografias")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "infografias" ? "bg-white text-gray-900" : "text-gray-400 cursor-pointer"
                }`}
            >
              <FaLightbulb className="mr-3" />
              Infografías
            </button>
          )}

          {usuario?.permisos === 'todos' && (
            <button
              onClick={() => setVistaActiva("uanl")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "uanl" ? "bg-white text-gray-900" : "text-gray-400 cursor-pointer"}`}
            >
              <LuUnderline className="mr-3" />
              UANL
            </button>
          )}
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div>
        {vistaActiva === "notas" && (
          <>
            {/* Barra de búsqueda y filtros para vista de notas */}
            <div className="flex justify-between mb-5 gap-4 items-center">
              {/* Barra de búsqueda */}
              <div className="flex-1 max-w-md">
                <SearchNotasLocal searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              </div>

              {/* Filtros */}
              <div className="flex gap-2 items-center">
                {usuario?.permisos === 'todos' && (
                  <FiltroEstadoNota estado={estado} setEstado={setEstado} />
                )}
                {usuario?.permisos === 'todos' && (
                  <FiltroTipoCliente tipoCliente={tipoCliente} setTipoCliente={setTipoCliente} />
                )}
                {usuario?.permisos === 'todos' && (
                  <FiltroAutor autor={autor} setAutor={setAutor} />
                )}
                <Link
                  to="/notas/nueva"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Nueva Nota
                </Link>
              </div>
            </div>

            {!notas || notas.length === 0 ? (
              <SinNotas />
            ) : notasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  {searchTerm ? `No se encontraron notas que coincidan con "${searchTerm}"` : 'No hay notas que coincidan con los filtros seleccionados'}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notasPaginaActual.map((nota) => (
                    <NotaCard
                      key={nota.id}
                      nota={nota}
                      onEliminar={eliminarNota}
                      eliminando={eliminando}
                    />
                  ))}
                </div>

                {/* Información de resultados y paginación */}
                <div className="flex flex-col items-center mt-8 space-y-4">
                  {/* Información de paginación */}
                  <div className="text-sm text-gray-600">
                    Mostrando {inicioIndice + 1} - {finIndice} de {totalNotasFiltradas} notas
                    {searchTerm && ` (filtradas por "${searchTerm}")`}
                  </div>

                  {/* Navegación de páginas */}
                  {totalPaginas > 1 && (
                    <div className="flex items-center space-x-2">
                      {/* Botón anterior */}
                      <button
                        onClick={irAPaginaAnterior}
                        disabled={paginaActual === 1}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${paginaActual === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                      >
                        ← Anterior
                      </button>

                      {/* Números de página */}
                      <div className="flex space-x-1">
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
                          // Mostrar solo un rango de páginas alrededor de la actual
                          const mostrarPagina =
                            numero === 1 ||
                            numero === totalPaginas ||
                            (numero >= paginaActual - 2 && numero <= paginaActual + 2);

                          if (!mostrarPagina) {
                            // Mostrar puntos suspensivos
                            if (numero === paginaActual - 3 || numero === paginaActual + 3) {
                              return <span key={numero} className="px-2 py-2 text-gray-400">...</span>;
                            }
                            return null;
                          }

                          return (
                            <button
                              key={numero}
                              onClick={() => irAPagina(numero)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${numero === paginaActual
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                              {numero}
                            </button>
                          );
                        })}
                      </div>

                      {/* Botón siguiente */}
                      <button
                        onClick={irAPaginaSiguiente}
                        disabled={paginaActual === totalPaginas}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${paginaActual === totalPaginas
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {vistaActiva === "preguntas" && (
          <div className="text-center py-10 text-lg"><PreguntasSemanales /></div>
        )}

        {vistaActiva === "revistas" && (
          <div className="text-center py-10 text-lg"><FormularioRevistaBannerNueva /></div>
        )}

        {vistaActiva === "videos" && (
          <div className="text-center py-10 text-lg"><VideosDashboard /></div>
        )}

        {vistaActiva === "newsletter" && (
          <div className="text-center py-10 text-lg"><FormNewsletter /></div>
        )}
        {vistaActiva === "infografias" && (
          <div className="text-center py-10 text-lg"><InfografiaForm /></div>
        )}
        {vistaActiva === "uanl" && (
          <div className="text-center py-10 text-lg"><ListaNotasUanl /></div>
        )}
      </div>
    </div>
  );
};

export default ListaNotas;