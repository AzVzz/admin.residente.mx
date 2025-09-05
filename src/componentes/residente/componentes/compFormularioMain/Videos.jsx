import { useState, useEffect } from "react";
import { useAuth } from "../../../Context";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FaUser } from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa";
import { crearVideo, obtenerVideoPorId, editarVideo } from "../../../api/videosApi";
import { urlApi } from "../../../api/url";

const Videos = () => {
  const { token, usuario, saveToken, saveUsuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Obtener el ID de la URL si existe
  
  // Determinar si estamos en modo edición
  const esModoEdicion = !!id;
  
  const [formData, setFormData] = useState({
    imagen: null,
    url: "",
    fecha: "",
    activo: true, // Por defecto, los videos se crean como activos
    tipo: 'editorial' // Por defecto, los videos se crean como editoriales
  });
  
  const [cargando, setCargando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(esModoEdicion);
  const [error, setError] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenActual, setImagenActual] = useState(null); // Para mostrar la imagen actual en modo edición

  // Verificar autenticación
  if (!token || !usuario) {
    navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`, { replace: true });
    return null;
  }

  // Cargar datos del video si estamos en modo edición
  useEffect(() => {
    if (esModoEdicion && id) {
      cargarVideoParaEditar();
    }
  }, [id, token]);

  const cargarVideoParaEditar = async () => {
    try {
      setCargandoInicial(true);
      setError(null);
      
      const video = await obtenerVideoPorId(id, token);
      //console.log('Video cargado para editar:', video);
      
      // Formatear la fecha para el input de tipo date
      const fechaFormateada = video.fecha ? new Date(video.fecha).toISOString().split('T')[0] : '';
      
      setFormData({
        imagen: null, // No cargar imagen en el input, solo mostrar preview
        url: video.url || "",
        fecha: fechaFormateada,
        activo: video.activo !== undefined ? video.activo : video.estado,
        tipo: video.tipo || 'editorial'
      });
      
      // Mostrar la imagen actual
      setImagenActual(video.imagen);
      setImagenPreview(video.imagen);
      
    } catch (err) {
      console.error('Error al cargar video para editar:', err);
      setError('Error al cargar el video para editar');
    } finally {
      setCargandoInicial(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen: file
      }));
      
      // Crear preview de la nueva imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      // Validar que todos los campos estén llenos
      if (!formData.url || !formData.fecha || !formData.tipo) {
        setError("Por favor, completa todos los campos requeridos.");
        setCargando(false);
        return;
      }

      // En modo edición, la imagen no es obligatoria si no se cambia
      if (!esModoEdicion && !formData.imagen) {
        setError("La imagen es obligatoria para crear un nuevo video.");
        setCargando(false);
        return;
      }

      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }
      
      formDataToSend.append('url', formData.url);
      formDataToSend.append('fecha', formData.fecha);
      formDataToSend.append('tipo', formData.tipo);
      formDataToSend.append('estado', formData.activo.toString());

      //console.log('=== DEBUG FORMULARIO ===');
      //console.log('Modo:', esModoEdicion ? 'EDICIÓN' : 'CREACIÓN');
      //console.log('Token:', token ? 'Presente' : 'Ausente');
      //console.log('Usuario:', usuario);
      //console.log('FormData a enviar:');
      for (let [key, value] of formDataToSend.entries()) {
        //console.log(`${key}:`, value);
      }

      let resultado;
      
      if (esModoEdicion) {
        // Modo edición
        //console.log('Iniciando edición de video...');
        resultado = await editarVideo(id, formDataToSend, token);
        //console.log("Video editado exitosamente:", resultado);
        alert("¡Video editado exitosamente!");
      } else {
        // Modo creación
        //console.log('Iniciando creación de video...');
        resultado = await crearVideo(formDataToSend, token);
        //console.log("Video creado exitosamente:", resultado);
        alert("¡Video agregado exitosamente!");
      }
      
      // Éxito - limpiar el formulario
      setFormData({
        imagen: null,
        url: "",
        fecha: "",
        tipo: 'editorial',
        activo: true
      });
      setImagenPreview(null);
      setImagenActual(null);
      
      // Redirigir a la lista de videos
      navigate("/videosDashboard");
      
    } catch (err) {
      console.error('Error en el formulario:', err);
      setError(err.message || "Error al procesar el video");
    } finally {
      setCargando(false);
    }
  };

  // Mostrar loading inicial si estamos cargando datos para editar
  if (cargandoInicial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando video para editar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/videosDashboard")}
              className="inline-flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5 mr-2" />
              Regresar
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {esModoEdicion ? 'Editar Video' : 'Crear Nuevo Video'}
            </h1>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Imagen */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                {esModoEdicion ? 'Nueva Imagen (opcional)' : 'Imagen del Video *'}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imagenPreview && (
                  <div className="flex-shrink-0">
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
              {esModoEdicion && imagenActual && !formData.imagen && (
                <p className="mt-2 text-sm text-gray-500">
                  Imagen actual: {imagenActual.split('/').pop()}
                </p>
              )}
            </div>

            {/* URL */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                URL del Video *
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Fecha del Video *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Tipo de Video */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Tipo de Video *</label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tipo"
                    value="editorial"
                    checked={formData.tipo === 'editorial'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-base text-gray-700">Editorial</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tipo"
                    value="comercial"
                    checked={formData.tipo === 'comercial'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-base text-gray-700">Comercial</span>
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Selecciona si es contenido editorial (periodístico) o comercial (publicidad)
              </p>
            </div>

            {/* Campo para marcar el video como activo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-base font-medium text-gray-700">
                Marcar video como activo (visible en la página principal)
              </label>
            </div>

            {/* Mensajes de error y éxito */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={cargando}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                cargando
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {cargando ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {esModoEdicion ? 'Editando...' : 'Creando...'}
                </div>
              ) : (
                esModoEdicion ? 'Guardar Cambios' : 'Crear Video'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Videos;
