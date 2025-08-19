import { useState } from "react";
import { useAuth } from "../../../Context";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser } from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa";
import { crearVideo } from "../../../api/videosApi";
import { urlApi } from "../../../api/url";

const Videos = () => {
  const { token, usuario, saveToken, saveUsuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    imagen: null,
    url: "",
    fecha: "",
    activo: true // Por defecto, los videos se crean como activos
  });
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  // Verificar autenticación
  if (!token || !usuario) {
    navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`, { replace: true });
    return null;
  }

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
      
      // Crear preview de la imagen
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
      if (!formData.imagen || !formData.url || !formData.fecha) {
        setError("Por favor, completa todos los campos requeridos.");
        setCargando(false);
        return;
      }

      // Crear FormData para enviar archivos - todos los campos del modelo
      const formDataToSend = new FormData();
      formDataToSend.append('imagen', formData.imagen);
      formDataToSend.append('url', formData.url);
      formDataToSend.append('fecha', formData.fecha);
      formDataToSend.append('activo', formData.activo); // Agregar el campo activo

      console.log('=== DEBUG FORMULARIO ===');
      console.log('Token:', token ? 'Presente' : 'Ausente');
      console.log('Usuario:', usuario);
      console.log('URL API:', `${urlApi}api/video`);
      console.log('FormData a enviar:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      // Llamar a la API real para crear el video
      console.log('Iniciando llamada a API...');
      const resultado = await crearVideo(formDataToSend, token);
      
      console.log("Video creado exitosamente:", resultado);
      
      // Éxito - mostrar mensaje y redirigir
      alert("¡Video agregado exitosamente!");
      
      // Limpiar el formulario
      setFormData({
        imagen: null,
        url: "",
        fecha: "",
        activo: true // Mantener el valor por defecto
      });
      setImagenPreview(null);
      
      // Redirigir a la lista de notas
      navigate("/notas");
      
    } catch (err) {
      console.error("Error completo al crear video:", err);
      console.error("Stack trace:", err.stack);
      setError(err.message || "Error al agregar el video. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    saveToken(null);
    saveUsuario(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Formulario */}
      <div className="w-full max-w-[600px] px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200 px-8 py-8 space-y-8">
          {/* Botón de regreso */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => navigate("/notas")}
              className="inline-flex items-center px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Regresar
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 text-center mb-3">
            Nuevo Video
          </h1>
          <p className="text-lg text-gray-600 text-center mb-6">
            Llena los datos para crear un nuevo video.
          </p>
          
          {error && (
            <div className="bg-red-100 text-red-800 px-4 py-3 rounded mb-4 text-center text-base">
              {error}
            </div>
          )}

          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Imagen del Video</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
                className="hidden"
                id="imagen"
                required
              />
              {imagenPreview ? (
                <div className="space-y-3">
                  <img
                    src={imagenPreview}
                    alt="Preview"
                    className="mx-auto h-32 w-auto rounded-lg object-cover"
                  />
                  <p className="text-sm text-gray-600 mb-3">Imagen seleccionada</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => document.getElementById('imagen').click()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Cambiar Imagen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImagenPreview(null);
                        setFormData(prev => ({ ...prev, imagen: null }));
                        document.getElementById('imagen').value = '';
                      }}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="text-base text-gray-600 mb-2">
                      Haz clic para seleccionar una imagen
                    </p>
                    <button
                      type="button"
                      onClick={() => document.getElementById('imagen').click()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Elegir Imagen
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">URL del Video</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://ejemplo.com/video"
              className="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Fecha de Publicación</label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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

          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-3 px-6 font-bold rounded text-lg text-white bg-blue-600 hover:bg-blue-700 transition ${cargando ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {cargando ? "Guardando..." : "Agregar Video"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Videos;
