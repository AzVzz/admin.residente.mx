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
import FiltroEstadoNota from './FiltroEstadoNota';
import FiltroTipoCliente from './FiltroTipoCliente';
import PreguntasSemanales from "./componentesPrincipales/PreguntasSemanales.jsx";
import FormularioRevistaBannerNueva from "./FormularioRevistaBanner.jsx";
import VideosDashboard from "./VideosDashboard.jsx";
import FormNewsletter from "./FormNewsletter.jsx";
import InfografiaForm from "./InfografiaForm.jsx";

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

  const mapeoPermisosATipoNota = {
    'mama-de-rocco': 'Mamá de Rocco',
    'barrio-antiguo': 'Barrio Antiguo',
    'otrocliente': 'Otro Cliente',
  };

  const notasFiltradas = notas.filter(nota => {
    const cumpleEstado = !estado || (nota.estatus || '').toLowerCase().trim() === estado.toLowerCase().trim();

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

    return cumpleEstado && cumpleTipoCliente;
  });

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
            className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "notas" ? "bg-white text-gray-900" : "text-gray-400"
              }`}
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
            Notas
          </button>

          {usuario?.permisos === 'todos' && (
            <button
              onClick={() => setVistaActiva("preguntas")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "preguntas" ? "bg-white text-gray-900" : "text-gray-400"
                }`}
            >
              <RiQuestionnaireFill className="mr-3" />
              Preguntas
            </button>
          )}

          {usuario?.permisos === 'todos' && (
            <button
              onClick={() => setVistaActiva("revistas")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "revistas" ? "bg-white text-gray-900" : "text-gray-400"
                }`}
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
              Revistas
            </button>
          )}

          {usuario?.permisos === 'todos' && (
            <button
              onClick={() => setVistaActiva("videos")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "videos" ? "bg-white text-gray-900" : "text-gray-400"
                }`}
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
              Videos
            </button>
          )}

          {usuario?.permisos === 'todos' && (
            <button
              onClick={() => setVistaActiva("newsletter")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "newsletter" ? "bg-white text-gray-900" : "text-gray-400"
                }`}
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
              Newsletter
            </button>
          )}

          {usuario?.permisos === 'todos' && (
            <button
              onClick={() => setVistaActiva("infografias")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium ${vistaActiva === "infografias" ? "bg-white text-gray-900" : "text-gray-400"
                }`}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
              </svg>
              Infografías
            </button>
          )}
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div>
        {vistaActiva === "notas" && (
          <>
            {/* Filtros solo para vista de notas */}
            <div className="flex justify-end mb-5 gap-2 items-center">
              {usuario?.permisos === 'todos' && (
                <FiltroEstadoNota estado={estado} setEstado={setEstado} />
              )}
              {usuario?.permisos === 'todos' && (
                <FiltroTipoCliente tipoCliente={tipoCliente} setTipoCliente={setTipoCliente} />
              )}
              <Link
                to="/notas/nueva"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Nueva Nota
              </Link>
            </div>

            {!notas || notas.length === 0 ? (
              <SinNotas />
            ) : (
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