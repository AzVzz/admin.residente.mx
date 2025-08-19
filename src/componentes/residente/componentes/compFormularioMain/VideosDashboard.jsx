import { useState, useEffect } from "react";
import { useAuth } from "../../../Context";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaEye, FaEyeSlash, FaTrash, FaEdit } from "react-icons/fa";
import { obtenerVideos, eliminarVideo, toggleVideoEstado } from "../../../api/videosApi";
import { urlApi } from "../../../api/url";

const VideosDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);

  // Cargar videos
  useEffect(() => {
    cargarVideos();
  }, []);

  const cargarVideos = async () => {
    try {
      setCargando(true);
      const videosData = await obtenerVideos(token);
      setVideos(videosData);
    } catch (err) {
      setError('Error al cargar los videos');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // Cambiar estado activo/inactivo
  const toggleEstado = async (id) => {
    try {
      await toggleVideoEstado(id, token);
      
      // Actualizar estado local
      setVideos(prev => prev.map(video => 
        video.id === id 
          ? { ...video, activo: !video.activo }
          : video
      ));
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  // Eliminar video
  const eliminarVideoHandler = async (id) => {
    try {
      await eliminarVideo(id, token);
      setVideos(prev => prev.filter(video => video.id !== id));
      setConfirmarEliminar(null);
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/notas")}
              className="inline-flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5 mr-2" />
              Regresar
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Videos</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={cargarVideos}
              className="inline-flex items-center px-4 py-2 text-gray-600 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              🔄 Recargar
            </button>
            <button
              onClick={async () => {
                if (videos.length > 0) {
                  const videosInactivos = videos.filter(v => !v.activo);
                  
                  for (const video of videosInactivos) {
                    try {
                      await toggleVideoEstado(video.id, token);
                    } catch (err) {
                      console.error(`Error activando video ${video.id}:`, err);
                    }
                  }
                  
                  // Recargar videos después de activarlos
                  setTimeout(cargarVideos, 1000);
                }
              }}
              className="inline-flex items-center px-4 py-2 text-green-600 bg-green-100 border border-green-300 rounded-lg hover:bg-green-200 transition-colors"
            >
              ✅ Activar Todos
            </button>
            <button
              onClick={async () => {
                if (videos.length > 0) {
                  const videosActivos = videos.filter(v => v.activo);
                  
                  for (const video of videosActivos) {
                    try {
                      await toggleVideoEstado(video.id, token);
                    } catch (err) {
                      console.error(`Error desactivando video ${video.id}:`, err);
                    }
                  }
                  
                  // Recargar videos después de desactivarlos
                  setTimeout(cargarVideos, 1000);
                }
              }}
              className="inline-flex items-center px-4 py-2 text-red-600 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
            >
              ❌ Desactivar Todos
            </button>
            <button
              onClick={() => navigate("/videosFormulario")}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="w-5 h-5 mr-2" />
              Nuevo Video
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaEye className="w-8 h-8" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Videos Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {videos.filter(v => v.activo).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FaEyeSlash className="w-8 h-8" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Videos Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {videos.filter(v => !v.activo).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Videos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Lista de Videos</h3>
          </div>
          
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {videos.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay videos</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer video.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/videosFormulario")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Crear Video
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-16 w-16">
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={video.imagen}
                            alt="Miniatura del video"
                            onError={(e) => {
                              e.target.src = '/fotos/fotos-estaticas/fotodeprueba.png';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-xs truncate">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {video.url}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatearFecha(video.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          video.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {video.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => toggleEstado(video.id)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                            video.activo
                              ? 'text-red-700 bg-red-100 hover:bg-red-200'
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          }`}
                          title={video.activo ? 'Desactivar' : 'Activar'}
                        >
                          {video.activo ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => navigate(`/videosFormulario/${video.id}`)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
                          title="Editar"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => setConfirmarEliminar(video)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200"
                          title="Eliminar"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {confirmarEliminar && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Confirmar eliminación</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que quieres eliminar este video? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setConfirmarEliminar(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => eliminarVideoHandler(confirmarEliminar.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosDashboard;