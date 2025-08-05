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

const ListaNotas = () => {
  const { token, usuario, saveToken, saveUsuario } = useAuth(); // ← SOLO AQUÍ
  const location = useLocation();
  const navigate = useNavigate();
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalNotas, setTotalNotas] = useState(0);
  const pageSize = 0;

  // Si expiro el token(error 403) o lo borra(401) se borra el token y el ususario
  useEffect(() => {
    // Si hay error 403/401, borra token y usuario y redirige a login
    if (error && (error.status === 403 || error.status === 401)) {
      saveToken(null);
      saveUsuario(null);
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }
    // Si no hay token o usuario, redirige a login
    if (!token || !usuario) {
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [token, usuario, error, saveToken, saveUsuario, location, navigate]);

  // Traer notas
  const fetchNotas = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await notasTodasGet(token); // Ya no mandes pagina ni pageSize
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

  // Mostrar estado de carga
  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Mostrar errores
  if (error) {
    return <ErrorNotas error={error} onRetry={fetchNotas} />;
  }

  // Mostrar mensaje si no hay notas
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
              {/* ...icono... */}
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

  // Mostrar la lista de notas
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
          <Link
            to="/revistas/nueva"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notas.map((nota) => (
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