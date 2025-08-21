import { useEffect, useState } from "react";
import { useAuth } from "../../../Context";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Login from "../../../login";
import { notasTodasGet } from "../../../api/notasCompletasGet";
import { notaDelete } from "../../../api/notaDelete";
import { FaUser } from "react-icons/fa6";
import SinNotas from "./componentesListaNotas/SinNotas";
import ErrorNotas from "./componentesListaNotas/ErrorNotas";
import NotaCard from "./componentesListaNotas/NotaCard";
import { RiQuestionnaireFill } from "react-icons/ri";
import FiltroEstadoNota from './FiltroEstadoNota';
import FiltroTipoCliente from './FiltroTipoCliente';


const ListaNotas = () => {
  const { token, usuario, saveToken, saveUsuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalNotas, setTotalNotas] = useState(0);
  const [estado, setEstado] = useState(''); // Estado del filtro
  const [tipoCliente, setTipoCliente] = useState(''); // Estado del filtro de tipo de cliente
  const pageSize = 0;

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

  // Traer notas
  const fetchNotas = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await notasTodasGet(token);
      setNotas(data.notas);
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

  // Eliminar nota
  const eliminarNota = async (id) => {
    setEliminando(id);
    try {
      await notaDelete(id);
      await fetchNotas();
    } catch (error) {
      alert("Error al eliminar la nota");
    } finally {
      setEliminando(null);
    }
  };

  // Mapeo dinámico de permisos a nombres de tipo de nota
  const mapeoPermisosATipoNota = {
    'mama-de-rocco': 'Mamá de Rocco',
    'barrio-antiguo': 'Barrio Antiguo',
    'otrocliente': 'Otro Cliente',
    // Se pueden agregar más mapeos aquí si es necesario
  };

  // Filtrar notas por estado y tipo de cliente
  const notasFiltradas = notas.filter(nota => {
    // Filtro por estado
    const cumpleEstado = !estado || (nota.estatus || '').toLowerCase().trim() === estado.toLowerCase().trim();
    
    // Filtro por tipo de cliente (más flexible)
    let cumpleTipoCliente = true;
    if (tipoCliente) {
      // Primero intentar con el mapeo predefinido
      const tipoNotaEsperado = mapeoPermisosATipoNota[tipoCliente];
      if (tipoNotaEsperado) {
        cumpleTipoCliente = (nota.tipo_nota || '') === tipoNotaEsperado;
      } else {
        // Si no hay mapeo, intentar comparar directamente
        // Convertir el tipoCliente a formato legible para comparar
        const tipoClienteFormateado = tipoCliente
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        cumpleTipoCliente = (nota.tipo_nota || '').toLowerCase().includes(tipoClienteFormateado.toLowerCase()) ||
                           (nota.tipo_nota || '').toLowerCase().includes(tipoCliente.toLowerCase());
      }
    }
    
    return cumpleEstado && cumpleTipoCliente;
  });

  // Para depuración: muestra los estados en consola
  // console.log(notas.map(n => n.estado));

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

  if (!notas || notas.length === 0) {
    return (
      <div className="space-y-6 py-5">
        <div className="flex flex-row gap-0 justify-between">
          <div className="bg-black flex items-center">
            <h1 className="text-2xl font-bold text-white px-5">Lista de Notas</h1>
          </div>
          <div className="flex gap-5">
            <Link
              to="/notas/nueva"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Nueva Nota
            </Link>
            {usuario && (
              <div className="flex items-center gap-5">
                <button
                  onClick={() => {
                    saveToken(null);
                    saveUsuario(null);
                    navigate("/");
                  }}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white shadow hover:bg-red-700 transition text-sm font-bold cursor-pointer"
                  title="Cerrar sesión"
                >
                  Cerrar sesión
                </button>
                <span className="inline-flex items-center px-4 py-2 shadow-sm text-sm font-bold text-white bg-black">
                  <FaUser className="text-sm -mt-0.5 mr-2" />
                  <span className="flex items-center">{usuario?.nombre_usuario}</span>
                </span>
              </div>
            )}
          </div>
        </div>
        <SinNotas />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-5">
      {/* Primer div: título */}
      <div className="flex flex-row gap-0 justify-between">
        <div className="bg-black flex items-center">
          <h1 className="text-2xl font-bold text-white px-5">Lista de Notas</h1>
        </div>
        <div className="flex gap-5 items-center">
          {/* Botón Preguntas de las semanas - Solo para usuarios con permisos 'todos' */}
          {usuario?.permisos === 'todos' && (
            <Link
              to="/preguntassemanales"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 rounded-xl"
            >
              <RiQuestionnaireFill className="mr-3" />
              Preguntas de las semanas
            </Link>
          )}
          <Link
            to="/notas/nueva"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl"
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
          {/* Botón Nueva Revista - Solo para usuarios con permisos 'todos' */}
          {usuario?.permisos === 'todos' && (
            <Link
              to="/revistas/nueva"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl"
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
              Nueva Revista
            </Link>
          )}
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
              {/* Nombre de usuario - Visible para todos los usuarios */}
              <span className="inline-flex items-center px-4 py-2 shadow-sm text-sm font-bold text-white bg-black rounded-xl">
                <FaUser className="text-sm -mt-0.5 mr-2" />
                <span className="flex items-center">{usuario?.nombre_usuario}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Segundo div: lista de notas */}
      <div className="flex justify-end mb-2 gap-2 items-center">
<<<<<<< HEAD
=======
       
>>>>>>> brayan
        {/* Botón Dashboard de Videos - Solo para usuarios con permisos 'todos' */}
        {usuario?.permisos === 'todos' && (
          <Link
            to="/videosDashboard"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl ml-2"
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
            Dashboard de Videos
          </Link>
        )}
        {/* Botón Nuevo Newsletter - Solo para usuarios con permisos 'todos' */}
        {usuario?.permisos === 'todos' && (
          <Link
            to="/formnewsletter"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl ml-2"
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
            Nuevo Newsletter
          </Link>
        )}
        {/* Filtro Estado Nota (incluye "Todas") - Solo para usuarios con permisos 'todos' */}
        {usuario?.permisos === 'todos' && (
          <FiltroEstadoNota estado={estado} setEstado={setEstado} />
        )}
        {/* Filtro Tipo de Cliente - Solo para usuarios con permisos 'todos' */}
        {usuario?.permisos === 'todos' && (
          <FiltroTipoCliente tipoCliente={tipoCliente} setTipoCliente={setTipoCliente} />
        )}
      </div>

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
    </div>
  );
};

export default ListaNotas;