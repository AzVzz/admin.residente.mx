import React, { useEffect, useState } from "react";
import { useAuth } from "../../../Context";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Login from "../../../login";
import { notasTodasGet } from "../../../api/notasCompletasGet";
import { notaDelete } from "../../../api/notaDelete";
import { FaUser } from "react-icons/fa6";
import SinNotas from "./componentesListaNotas/SinNotas";
import ErrorNotas from "./componentesListaNotas/ErrorNotas";

const ListaNotas = () => {
  const { token, usuario, saveToken, saveUsuario } = useAuth(); // ← SOLO AQUÍ
  const location = useLocation();
  const navigate = useNavigate();
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);

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
      const data = await notasTodasGet(token);

      // Si el usuario tiene permisos "todos", muestra todas las notas
      if (usuario?.permisos === "todos") {
        setNotas(data);
        return;
      }
      const tipoNotaPorPermiso = {
        "barrio-antiguo": "Barrio Antiguo",
        "mama-de-rocco": "Mamá de Rocco",
        "todos": null,
        // ...otros permisos
      };
      const tipoNotaFiltro = tipoNotaPorPermiso[usuario?.permisos];
      const notasFiltradas = tipoNotaFiltro
        ? data.filter(nota => nota.tipo_nota === tipoNotaFiltro)
        : [];
      setNotas(notasFiltradas);
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
    return <SinNotas />;
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
          {usuario && (
            <div className="flex items-center gap-5">
              <button
                onClick={() => {
                  saveToken(null);
                  saveUsuario(null);
                  navigate("/");
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white shadow hover:bg-red-700 transition text-sm font-bold "
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
          <div
            key={nota.id}
            className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    {nota.titulo}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    {nota.autor} • {nota.fecha}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${nota.estatus === "publicada"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                    }`}
                >
                  {nota.estatus === "publicada" ? "Publicada" : "Borrador"}
                </span>
              </div>

              <h3 className="text-md text-gray-700 font-medium mb-3">
                {nota.subtitulo}
              </h3>

              <p className="text-gray-600 mb-4">
                {nota.descripcion?.substring(0, 100)}
                {nota.descripcion?.length > 100 ? "..." : ""}
              </p>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Link
                    to={`/notas/editar/${nota.id}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg
                      className="h-5 w-5 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Editar
                  </Link>

                  <button
                    onClick={() => eliminarNota(nota.id)}
                    disabled={eliminando === nota.id}
                    className="text-red-600 hover:text-red-800 flex items-center disabled:opacity-50"
                  >
                    {eliminando === nota.id ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-1"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-5 w-5 mr-1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Eliminar
                      </>
                    )}
                  </button>
                </div>

                {nota.programar_publicacion && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    Programada
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaNotas;