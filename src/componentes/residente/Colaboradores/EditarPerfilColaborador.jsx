import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context";
import { getColaboradores } from "../../api/temaSemanaApi";
import { consejerosPut } from "../../api/consejerosApi";
import { urlApi } from "../../api/url";

const EditarPerfilColaborador = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [colaboradorId, setColaboradorId] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: "",
    anio_nacimiento: "",
    lugar_nacimiento: "",
    curriculum: "",
    instagram: "",
    facebook: "",
    otras_redes: "",
  });
  
  const [fotografia, setFotografia] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoActual, setFotoActual] = useState(null);
  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [imagenOriginal, setImagenOriginal] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [posicion, setPosicion] = useState({ x: 0, y: 0 });
  const [arrastrando, setArrastrando] = useState(false);
  const [inicioArrastre, setInicioArrastre] = useState({ x: 0, y: 0 });

  // Cargar datos del colaborador
  useEffect(() => {
    const cargarDatosColaborador = async () => {
      if (!usuario?.id) {
        setMensaje({ tipo: "error", texto: "No hay usuario autenticado" });
        setCargando(false);
        return;
      }

      try {
        const colaboradores = await getColaboradores();
        
        // Convertir ambos a número para asegurar comparación correcta
        const usuarioIdNum = parseInt(usuario.id);
        const colaborador = colaboradores.find(c => parseInt(c.usuario_id) === usuarioIdNum);
        
        console.log("Usuario ID:", usuario.id, "Tipo:", typeof usuario.id);
        console.log("Colaboradores encontrados:", colaboradores.length);
        console.log("Buscando colaborador con usuario_id:", usuarioIdNum);
        console.log("Colaborador encontrado:", colaborador);
        
        if (!colaborador) {
          setMensaje({ tipo: "error", texto: "No se encontró tu perfil de colaborador. Contacta al administrador." });
          setCargando(false);
          return;
        }

        setColaboradorId(colaborador.id);
        setFormData({
          nombre: colaborador.nombre || "",
          anio_nacimiento: colaborador.anio_nacimiento || "",
          lugar_nacimiento: colaborador.lugar_nacimiento || "",
          curriculum: colaborador.curriculum || "",
          instagram: colaborador.instagram || "",
          facebook: colaborador.facebook || "",
          otras_redes: colaborador.otras_redes || "",
        });
        
        if (colaborador.fotografia) {
          setFotoActual(colaborador.fotografia);
          setFotoPreview(colaborador.fotografia);
        }
      } catch (error) {
        console.error("Error cargando datos del colaborador:", error);
        setMensaje({ tipo: "error", texto: "Error al cargar tus datos" });
      } finally {
        setCargando(false);
      }
    };

    cargarDatosColaborador();
  }, [usuario]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    const maxBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedMimes.includes(file.type)) {
      setMensaje({ tipo: "error", texto: "Tipo de archivo no permitido. Solo JPG, PNG o WEBP." });
      return;
    }

    if (file.size > maxBytes) {
      setMensaje({ tipo: "error", texto: "La imagen supera el tamaño máximo de 5MB." });
      return;
    }

    // Cargar imagen para el editor
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        console.log("Imagen nueva cargada, dimensiones:", img.width, img.height);
        setImagenOriginal(img);
        setZoom(1);
        setPosicion({ x: 0, y: 0 });
        setMostrarEditor(true);
        setMensaje({ tipo: "", texto: "" });
      };
      img.onerror = (error) => {
        console.error("Error cargando imagen nueva:", error);
        setMensaje({ tipo: "error", texto: "Error al cargar la imagen. Intenta con otra imagen." });
      };
      img.src = event.target.result;
    };
    reader.onerror = (error) => {
      console.error("Error leyendo archivo:", error);
      setMensaje({ tipo: "error", texto: "Error al leer el archivo. Intenta con otra imagen." });
    };
    reader.readAsDataURL(file);
    setMensaje({ tipo: "", texto: "" });
  };

  // Función para recortar la imagen (guardar como cuadrado completo)
  const recortarImagen = () => {
    if (!imagenOriginal) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 400; // Tamaño del cuadrado final
      canvas.width = size;
      canvas.height = size;

      // Calcular dimensiones escaladas
      const escala = zoom;
      const imgWidth = imagenOriginal.width * escala;
      const imgHeight = imagenOriginal.height * escala;

      // Calcular posición centrada (ajustada para que la imagen quede bien posicionada)
      const offsetX = (size - imgWidth) / 2 + posicion.x;
      const offsetY = (size - imgHeight) / 2 + posicion.y;

      // Dibujar imagen escalada y posicionada directamente
      ctx.drawImage(
        imagenOriginal,
        offsetX,
        offsetY,
        imgWidth,
        imgHeight
      );

      // Intentar convertir a blob (sin bordes, solo la imagen)
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'foto-perfil.webp', { type: 'image/webp' });
            setFotografia(file);
            // Preview sin borde - solo la imagen
            setFotoPreview(canvas.toDataURL('image/webp'));
            setMostrarEditor(false);
            setMensaje({ tipo: "success", texto: "Imagen ajustada correctamente" });
          }
        }, 'image/webp', 0.95);
      } catch (blobError) {
        // Si falla por canvas tainted, usar dataURL directamente
        console.warn("No se pudo exportar como blob (canvas tainted), usando dataURL:", blobError);
        const dataUrl = canvas.toDataURL('image/webp', 0.9);
        
        // Convertir dataURL a blob manualmente
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'foto-perfil.webp', { type: 'image/webp' });
            setFotografia(file);
            setFotoPreview(dataUrl);
            setMostrarEditor(false);
            setMensaje({ tipo: "success", texto: "Imagen ajustada correctamente" });
          })
          .catch(error => {
            console.error("Error al convertir dataURL a blob:", error);
            setMensaje({ tipo: "error", texto: "Error al procesar la imagen. La imagen puede venir de otro dominio. Intenta seleccionar una nueva imagen." });
          });
      }
    } catch (error) {
      console.error("Error en recortarImagen:", error);
      setMensaje({ tipo: "error", texto: "Error al procesar la imagen. Intenta seleccionar una nueva imagen." });
    }
  };

  // Manejar arrastre de imagen
  const handleMouseDown = (e) => {
    setArrastrando(true);
    setInicioArrastre({
      x: e.clientX - posicion.x,
      y: e.clientY - posicion.y
    });
  };

  const handleMouseMove = (e) => {
    if (!arrastrando) return;
    setPosicion({
      x: e.clientX - inicioArrastre.x,
      y: e.clientY - inicioArrastre.y
    });
  };

  const handleMouseUp = () => {
    setArrastrando(false);
  };

  // Manejar zoom con rueda del mouse
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.3, Math.min(2, prev + delta)));
  };

  // Función para abrir el editor con la imagen actual
  const abrirEditorConImagenActual = async () => {
    console.log("abrirEditorConImagenActual llamado, fotoPreview:", fotoPreview);
    
    if (!fotoPreview) {
      setMensaje({ tipo: "error", texto: "No hay foto para editar" });
      return;
    }
    
    try {
      let imageUrl = fotoPreview;
      
      // Si es una data URL, usarla directamente
      if (fotoPreview.startsWith('data:image/')) {
        console.log("Es una data URL, cargando directamente");
        imageUrl = fotoPreview;
      }
      // Si es una URL remota (http/https), intentar usar proxy del backend
      else if (fotoPreview.startsWith('http://') || fotoPreview.startsWith('https://')) {
        console.log("Es una URL remota, intentando usar proxy del backend...");
        
        try {
          const proxyUrl = `${urlApi}api/img?url=${encodeURIComponent(fotoPreview)}`;
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'image/*'
            }
          });
          
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.startsWith('image/')) {
              const blob = await response.blob();
              imageUrl = URL.createObjectURL(blob);
              console.log("Imagen cargada a través del proxy del backend");
            } else {
              console.log("Proxy no devolvió una imagen válida, cargando directamente");
              imageUrl = fotoPreview;
            }
          } else {
            console.log("Proxy no disponible (status:", response.status, "), cargando directamente");
            imageUrl = fotoPreview;
          }
        } catch (proxyError) {
          console.warn("Error usando proxy, cargando directamente:", proxyError);
          imageUrl = fotoPreview;
        }
      }
      
      const img = new Image();
      
      img.onload = () => {
        console.log("Imagen cargada exitosamente, dimensiones:", img.width, "x", img.height);
        setImagenOriginal(img);
        setZoom(1);
        setPosicion({ x: 0, y: 0 });
        setMostrarEditor(true);
        setMensaje({ tipo: "", texto: "" });
      };
      
      img.onerror = (error) => {
        console.error("Error cargando imagen:", error, "URL intentada:", imageUrl);
        setMensaje({ tipo: "error", texto: "No se pudo cargar la imagen. Intenta seleccionar una nueva imagen." });
      };
      
      // Cargar la imagen
      img.src = imageUrl;
      
    } catch (error) {
      console.error("Error en abrirEditorConImagenActual:", error);
      setMensaje({ tipo: "error", texto: "Error al abrir el editor. Intenta seleccionar una nueva imagen." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!colaboradorId) {
      setMensaje({ tipo: "error", texto: "No se encontró tu perfil de colaborador" });
      return;
    }

    if (!formData.nombre || !formData.anio_nacimiento || !formData.lugar_nacimiento) {
      setMensaje({ tipo: "error", texto: "Por favor completa los campos obligatorios (Nombre, Año y Lugar de nacimiento)" });
      return;
    }

    setGuardando(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      const dataToSend = { ...formData };
      
      if (fotografia) {
        dataToSend.fotografia = fotografia;
      }

      await consejerosPut(colaboradorId, dataToSend);
      
      setMensaje({ tipo: "success", texto: "¡Perfil actualizado correctamente!" });
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      setMensaje({ tipo: "error", texto: "Error al actualizar el perfil. Intenta de nuevo." });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Editar mi Perfil de Colaborador
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto actual y nueva */}
          <div className="flex flex-col items-center mb-6">
            {fotoPreview && (
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4" style={{ border: '4px solid #fff300' }}>
                <img
                  src={fotoPreview}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                  style={{ display: 'block' }}
                />
              </div>
            )}
            <label className="block mb-1 font-roman font-bold text-sm">
              Cambiar Fotografía
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="bg-white w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 5MB. Formatos: JPG, PNG, WEBP</p>
            <p className="text-xs text-blue-600 mt-1">💡 Puedes ajustar la posición y zoom después de seleccionar o editar la foto actual</p>
            {/* Botón para editar foto actual */}
            {fotoPreview && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Botón editar foto clickeado");
                  abrirEditorConImagenActual();
                }}
                className="mt-2 px-4 py-2 bg-[#fff200] text-black text-sm font-bold rounded-lg hover:bg-[#e6d900] shadow-md transition cursor-pointer"
                title="Ajustar posición y zoom de la foto actual"
              >
                ✏️ Editar foto
              </button>
            )}
          </div>

          {/* Modal Editor de Imagen - Renderizado con Portal para estar sobre todo */}
          {mostrarEditor && imagenOriginal && typeof document !== 'undefined' && createPortal(
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4"
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ zIndex: 99999 }}>
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
                <h2 className="text-xl font-bold mb-4 text-center">Ajustar Imagen de Perfil</h2>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Arrastra la imagen para moverla • Usa la rueda del mouse para hacer zoom
                </p>
                
                {/* Contenedor de la imagen con máscara circular */}
                <div className="relative mx-auto mb-4"
                  style={{ width: '400px', height: '400px' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onWheel={handleWheel}>
                  <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-[#fff300] bg-gray-200">
                    <div
                      className="absolute"
                      style={{
                        transform: `translate(${posicion.x}px, ${posicion.y}px) scale(${zoom})`,
                        transformOrigin: 'center center',
                        width: `${imagenOriginal.width}px`,
                        height: `${imagenOriginal.height}px`,
                        left: '50%',
                        top: '50%',
                        marginLeft: `-${imagenOriginal.width / 2}px`,
                        marginTop: `-${imagenOriginal.height / 2}px`,
                        cursor: arrastrando ? 'grabbing' : 'grab'
                      }}>
                      <img
                        src={imagenOriginal.src}
                        alt="Imagen a ajustar"
                        draggable={false}
                        style={{ display: 'block' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Controles */}
                <div className="flex flex-col gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Zoom: {Math.round(zoom * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="2"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setZoom(1);
                        setPosicion({ x: 0, y: 0 });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold">
                      Resetear
                    </button>
                    <button
                      type="button"
                      onClick={recortarImagen}
                      className="flex-1 px-4 py-2 bg-[#fff200] text-black rounded-lg hover:bg-[#e6d900] font-bold">
                      Aplicar Ajustes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarEditor(false);
                        setImagenOriginal(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Nombre */}
          <div>
            <label className="block mb-1 font-roman font-bold text-sm">
              Nombre Completo*
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              maxLength={50}
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          {/* Año de nacimiento */}
          <div>
            <label className="block mb-1 font-roman font-bold text-sm">
              Año de Nacimiento*
            </label>
            <input
              type="number"
              name="anio_nacimiento"
              value={formData.anio_nacimiento}
              onChange={(e) => {
                const value = e.target.value.slice(0, 4);
                handleInputChange({ target: { name: "anio_nacimiento", value } });
              }}
              placeholder="Ej. 1990"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              maxLength={4}
              required
            />
          </div>

          {/* Lugar de nacimiento */}
          <div>
            <label className="block mb-1 font-roman font-bold text-sm">
              Lugar de Nacimiento*
            </label>
            <input
              type="text"
              name="lugar_nacimiento"
              value={formData.lugar_nacimiento}
              onChange={handleInputChange}
              placeholder="Ej. Monterrey, NL"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          {/* Curriculum */}
          <div>
            <label className="block mb-1 font-roman font-bold text-sm">
              Curriculum / Biografía
            </label>
            <textarea
              name="curriculum"
              value={formData.curriculum}
              onChange={handleInputChange}
              placeholder="Describe tu experiencia y trayectoria"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={4}
            />
          </div>

          {/* Redes sociales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-roman font-bold text-sm">
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="@usuario"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block mb-1 font-roman font-bold text-sm">
                Facebook
              </label>
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder="facebook.com/usuario"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-roman font-bold text-sm">
              Otras Redes Sociales
            </label>
            <input
              type="text"
              name="otras_redes"
              value={formData.otras_redes}
              onChange={handleInputChange}
              placeholder="Enlaces o usuarios de otras redes"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Mensaje de éxito/error */}
          {mensaje.texto && (
            <div
              className={`text-center font-bold p-3 rounded-lg ${
                mensaje.tipo === "success"
                  ? "text-green-600 bg-green-50 border border-green-200"
                  : "text-red-600 bg-red-50 border border-red-200"
              }`}
            >
              {mensaje.texto}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex-1 py-3 px-4 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition cursor-pointer ${
                guardando
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-[#fff200] hover:bg-[#e6d900] text-black"
              }`}
            >
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfilColaborador;
