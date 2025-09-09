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

import FiltroEstadoNota from './FiltroEstadoNota';
import FiltroTipoCliente from './FiltroTipoCliente';
import FiltroAutor from './FiltroAutor';
import SearchNotas from './SearchNotas';
import PreguntasSemanales from "./componentesPrincipales/PreguntasSemanales.jsx";
import FormularioRevistaBannerNueva from "./FormularioRevistaBanner.jsx";
import VideosDashboard from "./VideosDashboard.jsx";
import FormNewsletter from "./FormNewsletter.jsx";
import InfografiaForm from "../../infografia/InfografiaForm.jsx";

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
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalNotas, setTotalNotas] = useState(0);
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

  const fetchNotas = async (pagina = paginaActual) => {
    setCargando(true);
    setError(null);
    try {
      const data = await notasTodasGet(token, pagina, notasPorPagina);
      console.log('Datos del backend:', data);
      setNotas(data.notas);
      
      // Usar los datos de paginación del backend
      if (data.paginacion) {
        setTotalNotas(data.paginacion.total);
        setTotalPaginas(data.paginacion.paginas);
        setPaginaActual(data.paginacion.actual);
      }
    } catch (err) {
      setError(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchNotas();
    // eslint-disable-next-line
  }, [token, usuario]);

  const eliminarNota = async (id) => {
    setEliminando(id);
    try {
      await notaDelete(id);
      await fetchNotas(paginaActual);
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

  const notasFiltradas = notas.filter(nota => {
    const cumpleEstado = !estado || (nota.estatus || '').toLowerCase().trim() === estado.toLowerCase().trim();
    const cumpleAutor = !autor || (nota.autor || '').toLowerCase().trim() === autor.toLowerCase().trim();

    // Lógica de búsqueda
    const cumpleBusqueda = !searchTerm || (() => {
      const terminoBusqueda = searchTerm.toLowerCase().trim();
      const titulo = (nota.titulo || '').toLowerCase();
      const subtitulo = (nota.subtitulo || '').toLowerCase();
      const contenido = (nota.descripcion || '').toLowerCase();
      const autorNota = (nota.autor || '').toLowerCase();
      const tipoNota = (nota.tipo_nota || '').toLowerCase();
      
      return titulo.includes(terminoBusqueda) ||
             subtitulo.includes(terminoBusqueda) ||
             contenido.includes(terminoBusqueda) ||
             autorNota.includes(terminoBusqueda) ||
             tipoNota.includes(terminoBusqueda);
    })();

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

    return cumpleEstado && cumpleTipoCliente && cumpleAutor && cumpleBusqueda;
  });

  // Calcular índices para mostrar información
  const inicioIndice = (paginaActual - 1) * notasPorPagina;
  const finIndice = inicioIndice + notasFiltradas.length;

  // Debug logs
  console.log('Debug paginación:', {
    totalNotas,
    totalPaginas,
    paginaActual,
    notasPorPagina,
    notasFiltradas: notasFiltradas.length,
    notasDelBackend: notas.length
  });

  // Funciones de navegación
  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      fetchNotas(paginaActual - 1);
    }
  };

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      fetchNotas(paginaActual + 1);
    }
  };

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      fetchNotas(pagina);
    }
  };

  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    if (paginaActual !== 1) {
      fetchNotas(1);
    }
  }, [estado, tipoCliente, autor]);

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorNotas error={error} onRetry={fetchNotas} />;
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
                <SearchNotas searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notasFiltradas.map((nota) => (
                    <NotaCard
                      key={nota.id}
                      nota={nota}
                      onEliminar={eliminarNota}
                      eliminando={eliminando}
                    />
                  ))}
                </div>

                {/* Controles de paginación */}
                {console.log('¿Mostrar paginación?', totalPaginas > 1, 'totalPaginas:', totalPaginas)}
                {totalPaginas > 1 && (
                  <div className="flex flex-col items-center mt-8 space-y-4">
                    {/* Información de paginación */}
                    <div className="text-sm text-gray-600">
                      Mostrando {inicioIndice + 1} - {finIndice} de {totalNotas} notas
                    </div>
                    
                    {/* Navegación de páginas */}
                    <div className="flex items-center space-x-2">
                      {/* Botón anterior */}
                      <button
                        onClick={irAPaginaAnterior}
                        disabled={paginaActual === 1}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          paginaActual === 1
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
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                numero === paginaActual
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
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          paginaActual === totalPaginas
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
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
      </div>
    </div>
  );
};

export default ListaNotas;