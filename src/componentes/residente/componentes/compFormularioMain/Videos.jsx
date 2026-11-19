import { useState, useEffect } from "react";
import { useAuth } from "../../../Context";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { crearVideo, obtenerVideoPorId, editarVideo } from "../../../api/videosApi";
import {
  comprimirVideoCliente,
  UMBRAL_COMPRESION_BYTES,
} from "../../../api/comprimirVideoCliente";

const Videos = () => {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // Obtener el ID de la URL si existe

  // Determinar si estamos en modo edición
  const esModoEdicion = !!id;

  const [formData, setFormData] = useState({
    imagen: null,
    video: null,
    titulo: "",
    fecha: new Date().toISOString().split("T")[0],
    activo: true, // Por defecto, los videos se crean como activos
    tipo: 'editorial', // Por defecto, los videos se crean como editoriales
    mandar_b2b: false,
    crisis_restaurantera: false,
    revista_digital: false,
  });

  const [cargando, setCargando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(esModoEdicion);
  const [error, setError] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenActual, setImagenActual] = useState(null); // Para mostrar la imagen actual en modo edición
  const [tieneArchivo, setTieneArchivo] = useState(false);
  const [nombreVideo, setNombreVideo] = useState("");
  const [progresoSubida, setProgresoSubida] = useState(0);
  const [bytesSubidos, setBytesSubidos] = useState(0);
  const [bytesTotales, setBytesTotales] = useState(0);
  const [faseProceso, setFaseProceso] = useState(""); // "comprimiendo_local" | "subiendo" | "comprimiendo" | "guardando" | ""
  const [infoCompresion, setInfoCompresion] = useState(null);
  const [comprimiendoLocal, setComprimiendoLocal] = useState(false);

  const formatearMB = (bytes) => {
    if (!bytes || bytes <= 0) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Verificar autenticación
  if (!token || !usuario) {
    navigate(`/registro`, { replace: true });
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
        video: null,
        titulo: video.titulo || "",
        fecha: fechaFormateada,
        activo: video.activo !== undefined ? video.activo : video.estado,
        tipo: video.tipo || 'editorial',
        mandar_b2b: Boolean(video.mandar_b2b),
        crisis_restaurantera: Boolean(video.crisis_restaurantera),
        revista_digital: Boolean(video.revista_digital),
      });
      setTieneArchivo(Boolean(video.archivo));

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

  const handleVideoChange = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    const maxBytes = 300 * 1024 * 1024;
    if (file.size > maxBytes) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      setError(`El video pesa ${mb} MB. El máximo permitido es 300 MB.`);
      input.value = "";
      setFormData((prev) => ({ ...prev, video: null }));
      setNombreVideo("");
      setInfoCompresion(null);
      return;
    }

    setError(null);
    setInfoCompresion(null);

    // Archivos livianos: se usan tal cual
    if (file.size <= UMBRAL_COMPRESION_BYTES) {
      setFormData((prev) => ({ ...prev, video: file }));
      setNombreVideo(`${file.name} (${formatearMB(file.size)})`);
      return;
    }

    setComprimiendoLocal(true);
    setFaseProceso("comprimiendo_local");
    setProgresoSubida(0);
    setCargando(true);

    try {
      const resultado = await comprimirVideoCliente(file, {
        onProgress: (pct) => setProgresoSubida(pct),
      });
      setFormData((prev) => ({ ...prev, video: resultado.file }));
      setNombreVideo(
        `${resultado.file.name} (${formatearMB(resultado.file.size)})`,
      );
      if (resultado.comprimido) {
        setInfoCompresion({
          original: resultado.originalBytes,
          nuevo: resultado.nuevoBytes,
        });
      } else {
        setInfoCompresion(null);
      }
    } catch (err) {
      console.error("Compresión local de video:", err);
      setError(
        err.message ||
          "No se pudo comprimir el video en el navegador. Prueba con un MP4 más liviano.",
      );
      input.value = "";
      setFormData((prev) => ({ ...prev, video: null }));
      setNombreVideo("");
      setInfoCompresion(null);
    } finally {
      setComprimiendoLocal(false);
      setCargando(false);
      setFaseProceso("");
      setProgresoSubida(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setProgresoSubida(0);
    setBytesSubidos(0);
    setBytesTotales(0);
    setFaseProceso(formData.video ? "subiendo" : "guardando");

    try {
      if (!formData.titulo.trim() || !formData.fecha || !formData.tipo) {
        setError("El título, la fecha y el tipo son obligatorios.");
        setCargando(false);
        setFaseProceso("");
        return;
      }

      if (!esModoEdicion && !formData.video) {
        setError("Sube el archivo de video.");
        setCargando(false);
        setFaseProceso("");
        return;
      }

      const formDataToSend = new FormData();

      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }
      if (formData.video) {
        formDataToSend.append('video', formData.video);
      }

      formDataToSend.append('titulo', formData.titulo.trim());
      formDataToSend.append('fecha', formData.fecha);
      formDataToSend.append('tipo', formData.tipo);
      formDataToSend.append('estado', formData.activo.toString());
      formDataToSend.append('mandar_b2b', formData.mandar_b2b.toString());
      formDataToSend.append('crisis_restaurantera', formData.crisis_restaurantera.toString());
      formDataToSend.append('revista_digital', formData.revista_digital.toString());

      const onProgress = (info) => {
        const pct = typeof info === "number" ? info : info?.pct || 0;
        const loaded = typeof info === "number" ? 0 : info?.loaded || 0;
        const total = typeof info === "number" ? 0 : info?.total || 0;
        setProgresoSubida(pct);
        setBytesSubidos(loaded);
        setBytesTotales(total);
        if (pct >= 100 && formData.video) {
          setFaseProceso("comprimiendo");
        }
      };

      if (esModoEdicion) {
        await editarVideo(id, formDataToSend, token, onProgress);
        alert("¡Video editado exitosamente!");
      } else {
        await crearVideo(formDataToSend, token, onProgress);
        alert("¡Video agregado exitosamente!");
      }

      setFormData({
        imagen: null,
        video: null,
        titulo: "",
        fecha: new Date().toISOString().split("T")[0],
        tipo: 'editorial',
        activo: true,
        mandar_b2b: false,
        crisis_restaurantera: false,
        revista_digital: false,
      });
      setImagenPreview(null);
      setImagenActual(null);
      setNombreVideo("");
      setTieneArchivo(false);
      setProgresoSubida(0);
      setFaseProceso("");
      setInfoCompresion(null);

      navigate("/videosDashboard");

    } catch (err) {
      console.error('Error en el formulario:', err);
      setError(err.message || "Error al procesar el video");
      setFaseProceso("");
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
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Título que aparece debajo del video"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                {esModoEdicion ? "Reemplazar video (opcional)" : "Archivo de video *"}
              </label>
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                onChange={handleVideoChange}
                disabled={comprimiendoLocal || cargando}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-60"
              />
              <p className="mt-2 text-sm text-gray-500">
                MP4, MOV o WEBM, hasta 300 MB. Si pesa más de{" "}
                {formatearMB(UMBRAL_COMPRESION_BYTES)}, se comprime aquí en el
                navegador (~720p) antes de subir.
                {nombreVideo ? ` Seleccionado: ${nombreVideo}` : ""}
              </p>
              {infoCompresion && (
                <p className="mt-1 text-sm text-green-700">
                  Comprimido: {formatearMB(infoCompresion.original)} →{" "}
                  {formatearMB(infoCompresion.nuevo)}. Ya puedes guardar.
                </p>
              )}
              {esModoEdicion && tieneArchivo && !formData.video && (
                <p className="mt-1 text-sm text-gray-500">
                  Este video ya tiene un archivo. Súbelo de nuevo solo si quieres reemplazarlo.
                </p>
              )}
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Portada (opcional)
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
              <p className="mt-2 text-sm text-gray-500">
                Si no subes portada, se toma un frame del video.
              </p>
              {esModoEdicion && imagenActual && !formData.imagen && (
                <p className="mt-2 text-sm text-gray-500">
                  Imagen actual: {imagenActual.split('/').pop()}
                </p>
              )}
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

            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-base font-medium text-gray-700">Revista Digital (main)</p>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="revista_digital"
                  checked={formData.revista_digital}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-base text-gray-700">
                  Mostrar en la Revista Digital del main
                </label>
              </div>
              <p className="text-sm text-gray-500">
                Si lo marcas, este video aparece como la primera diapositiva del carrusel de la Revista Digital en el home. Si hay varios marcados, se usa el más reciente.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-base font-medium text-gray-700">Publicar en B2B</p>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="mandar_b2b"
                  checked={formData.mandar_b2b}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-base text-gray-700">
                  Mandar a B2B
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="crisis_restaurantera"
                  checked={formData.crisis_restaurantera}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-base text-gray-700">
                  Crisis restaurantera
                </label>
              </div>
              <p className="text-sm text-gray-500">
                Si marcas Crisis restaurantera, el video aparece en esa tira de B2B como una nota. Al abrirlo se reproduce el video.
              </p>
            </div>

            {/* Mensajes de error y éxito */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {(cargando || comprimiendoLocal) && (
              <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center justify-between text-sm font-medium text-blue-900">
                  <span>
                    {faseProceso === "comprimiendo_local"
                      ? "Comprimiendo en tu navegador…"
                      : faseProceso === "comprimiendo"
                        ? "Subida completa. Comprimiendo en el servidor…"
                        : faseProceso === "guardando"
                          ? "Guardando cambios…"
                          : "Subiendo video…"}
                  </span>
                  <span>
                    {faseProceso === "comprimiendo"
                      ? "100%"
                      : faseProceso === "comprimiendo_local"
                        ? `${progresoSubida}%`
                        : `${progresoSubida}% (${formatearMB(bytesSubidos)} / ${formatearMB(bytesTotales)})`}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-blue-100">
                  <div
                    className={`h-full rounded-full bg-blue-600 transition-all duration-200 ${
                      faseProceso === "comprimiendo" ? "animate-pulse" : ""
                    }`}
                    style={{
                      width: `${faseProceso === "comprimiendo" ? 100 : progresoSubida}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-blue-800">
                  {faseProceso === "comprimiendo_local"
                    ? "Baja a ~720p para que la subida no se atasque. No cierres esta pestaña."
                    : faseProceso === "comprimiendo"
                      ? "Esto puede tardar varios minutos según el tamaño del archivo. No cierres esta ventana."
                      : "El porcentaje es de la subida al servidor. Después viene la compresión."}
                </p>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={cargando || comprimiendoLocal || (!formData.video && !esModoEdicion)}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                cargando || comprimiendoLocal
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {cargando || comprimiendoLocal ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {faseProceso === "comprimiendo_local"
                    ? `Comprimiendo… ${progresoSubida}%`
                    : faseProceso === "comprimiendo"
                      ? "Comprimiendo en servidor…"
                      : esModoEdicion
                        ? `Guardando… ${progresoSubida}%`
                        : `Subiendo… ${progresoSubida}%`}
                </div>
              ) : (
                esModoEdicion ? "Guardar Cambios" : "Crear Video"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Videos;
