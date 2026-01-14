import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context";
import { obtenerPermisosInvitado, actualizarPerfilInvitado } from "../../api/invitadosApi";
import { urlApi } from "../../api/url";

const EditarPerfilInvitado = () => {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  
  const [formData, setFormData] = useState({
    nombre_institucion: "",
    correo: "",
    permiso_notas: false,
    permiso_recetas: false,
  });
  
  // Estados para verificación de correo
  const [emailExists, setEmailExists] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailDebounceRef = useRef(null);
  const correoOriginal = useRef(null);
  
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoActual, setLogoActual] = useState(null);
  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [imagenOriginal, setImagenOriginal] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [posicion, setPosicion] = useState({ x: 0, y: 0 });
  const [arrastrando, setArrastrando] = useState(false);
  const [inicioArrastre, setInicioArrastre] = useState({ x: 0, y: 0 });

  // Cargar datos del invitado
  useEffect(() => {
    const cargarDatosInvitado = async () => {
      if (!usuario?.id || !token) {
        setMensaje({ tipo: "error", texto: "No hay usuario autenticado" });
        setCargando(false);
        return;
      }

      try {
        const datos = await obtenerPermisosInvitado(usuario.id, token);
        
        console.log("Datos del invitado:", datos);
        
        if (!datos || !datos.usuario) {
          setMensaje({ tipo: "error", texto: "No se encontró tu perfil de invitado. Contacta al administrador." });
          setCargando(false);
          return;
        }

        setFormData({
          nombre_institucion: datos.usuario.nombre_usuario || "",
          correo: datos.usuario.correo || "",
          permiso_notas: datos.permiso_notas === 1 || datos.permiso_notas === true,
          permiso_recetas: datos.permiso_recetas === 1 || datos.permiso_recetas === true,
        });
        
        // Guardar correo original para comparar después
        correoOriginal.current = datos.usuario.correo || "";
        
        if (datos.usuario.logo_url) {
          setLogoActual(datos.usuario.logo_url);
          setLogoPreview(datos.usuario.logo_url);
        }
      } catch (error) {
        console.error("Error cargando datos del invitado:", error);
        setMensaje({ tipo: "error", texto: "Error al cargar tus datos" });
      } finally {
        setCargando(false);
      }
    };

    cargarDatosInvitado();
  }, [usuario, token]);

  // Verificar si el correo ya existe (con debounce) - solo si cambió
  useEffect(() => {
    if (emailDebounceRef.current) {
      clearTimeout(emailDebounceRef.current);
    }

    const correo = formData.correo.trim();

    // Si no hay correo o es el mismo que el original, resetear estado
    if (!correo || correo === correoOriginal.current) {
      setEmailExists(false);
      setEmailValid(true);
      setCheckingEmail(false);
      return;
    }

    // Validar formato básico antes de hacer petición
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setEmailExists(false);
      setEmailValid(false);
      setCheckingEmail(false);
      return;
    }

    setCheckingEmail(true);
    setEmailValid(true);

    emailDebounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${urlApi}api/usuarios/verificar-correo`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo }),
          }
        );

        const data = await response.json();
        setEmailExists(data.exists === true);
        setEmailValid(data.valid !== false);
      } catch (error) {
        console.error("Error verificando correo:", error);
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);

    return () => {
      if (emailDebounceRef.current) {
        clearTimeout(emailDebounceRef.current);
      }
    };
  }, [formData.correo]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

      // Intentar convertir a blob
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'logo-institucion.webp', { type: 'image/webp' });
            setLogo(file);
            setLogoPreview(canvas.toDataURL('image/webp'));
            setMostrarEditor(false);
            setMensaje({ tipo: "success", texto: "Imagen ajustada correctamente" });
          }
        }, 'image/webp', 0.95);
      } catch (blobError) {
        console.warn("No se pudo exportar como blob (canvas tainted), usando dataURL:", blobError);
        const dataUrl = canvas.toDataURL('image/webp', 0.9);
        
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'logo-institucion.webp', { type: 'image/webp' });
            setLogo(file);
            setLogoPreview(dataUrl);
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
    console.log("abrirEditorConImagenActual llamado, logoPreview:", logoPreview);
    
    if (!logoPreview) {
      setMensaje({ tipo: "error", texto: "No hay logo para editar" });
      return;
    }
    
    try {
      let imageUrl = logoPreview;
      
      // Si es una data URL, usarla directamente
      if (logoPreview.startsWith('data:image/')) {
        console.log("Es una data URL, cargando directamente");
        imageUrl = logoPreview;
      }
      // Si es una URL remota (http/https), intentar usar proxy del backend
      else if (logoPreview.startsWith('http://') || logoPreview.startsWith('https://')) {
        console.log("Es una URL remota, intentando usar proxy del backend...");
        
        try {
          const proxyUrl = `${urlApi}api/img?url=${encodeURIComponent(logoPreview)}`;
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
              imageUrl = logoPreview;
            }
          } else {
            console.log("Proxy no disponible (status:", response.status, "), cargando directamente");
            imageUrl = logoPreview;
          }
        } catch (proxyError) {
          console.warn("Error usando proxy, cargando directamente:", proxyError);
          imageUrl = logoPreview;
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
    
    if (!usuario?.id) {
      setMensaje({ tipo: "error", texto: "No se encontró tu perfil de invitado" });
      return;
    }

    if (!formData.nombre_institucion) {
      setMensaje({ tipo: "error", texto: "Por favor completa el nombre de institución" });
      return;
    }

    if (!formData.correo) {
      setMensaje({ tipo: "error", texto: "Por favor completa el correo electrónico" });
      return;
    }

    // Validar que el correo no exista (si cambió)
    if (formData.correo !== correoOriginal.current) {
      if (emailExists) {
        setMensaje({ tipo: "error", texto: "Este correo ya está registrado. Por favor usa otro." });
        return;
      }

      if (!emailValid) {
        setMensaje({ tipo: "error", texto: "Por favor ingresa un correo electrónico válido." });
        return;
      }

      if (checkingEmail) {
        setMensaje({ tipo: "error", texto: "Por favor espera mientras verificamos el correo." });
        return;
      }
    }

    if (!formData.permiso_notas && !formData.permiso_recetas) {
      setMensaje({ tipo: "error", texto: "Debes seleccionar al menos un permiso: Notas o Recetas." });
      return;
    }

    setGuardando(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      let logoBase64 = null;

      // Si hay un nuevo logo, convertirlo a base64
      if (logo) {
        const reader = new FileReader();
        logoBase64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const base64String = reader.result.split(",")[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(logo);
        });
      }

      // Actualizar perfil
      await actualizarPerfilInvitado(usuario.id, {
        nombre_institucion: formData.nombre_institucion,
        correo: formData.correo,
        logo_base64: logoBase64,
        logo_url: logoActual, // Mantener el actual si no hay nuevo
        permiso_notas: formData.permiso_notas,
        permiso_recetas: formData.permiso_recetas
      }, token);
      
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Editar Perfil de Invitado</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre de Institución */}
        <div>
          <label className="block mb-2 font-bold">
            Nombre de Invitado
          </label>
          <input
            type="text"
            name="nombre_institucion"
            value={formData.nombre_institucion}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border-white bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Correo Electrónico */}
        <div>
          <label className="block mb-2 font-bold ">
            Correo electrónico 
          </label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleInputChange}
            placeholder="correo@ejemplo.com"
            className={`w-full px-4 py-2 border bg-white rounded-lg focus:outline-none focus:ring-2 ${
              emailExists || !emailValid
                ? "border-red-500 focus:ring-red-500"
                : "border-white focus:ring-blue-500"
            }`}
            required
          />
          {checkingEmail && <p className="text-gray-500 text-xs mt-1">Verificando correo...</p>}
          {!emailValid && !checkingEmail && formData.correo && (
            <p className="text-red-500 text-sm mt-1 font-bold">⚠️ El formato del correo no es válido</p>
          )}
          {emailExists && emailValid && !checkingEmail && formData.correo !== correoOriginal.current && (
            <p className="text-red-500 text-sm mt-1 font-bold">⚠️ Este correo ya está registrado. Por favor, usa otro o mantén el actual.</p>
          )}
          {!emailExists && emailValid && !checkingEmail && formData.correo && formData.correo.includes("@") && formData.correo !== correoOriginal.current && (
            <p className="text-green-500 text-xs mt-1">✓ Correo disponible</p>
          )}
        </div>

        {/* Logo actual y nuevo */}
        <div className="flex flex-col items-center mb-6">
          {logoPreview && (
            <div className="w-32 h-32  overflow-hidden mb-4 border-4 border-gray-300">
              <img src={logoPreview} alt="Logo de institución" className="w-full h-full object-cover" style={{ display: 'block' }}/>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-2"
          />
          <p className="text-xs text-blue-600 mt-1">💡 Puedes ajustar la posición y zoom después de seleccionar o editar el logo actual</p>
          {logoPreview && (
            <button 
              type="button" 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                console.log("Botón editar logo clickeado"); 
                abrirEditorConImagenActual(); 
              }}
              className="mt-2 px-4 py-2 bg-[#fff200] text-black text-sm font-bold rounded-lg hover:bg-[#fff200] shadow-md transition cursor-pointer"
              title="Ajustar posición y zoom del logo actual"
            >
              ✏️ Editar logo
            </button>
          )}
        </div>

        {/* Permisos */}
        <div className="bg-white p-4 border border-gray-300 rounded-md">
          <label className="block mb-3 font-bold">
            ¿Qué contenido publicarás? *
          </label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="permiso_notas"
                checked={formData.permiso_notas}
                onChange={handleInputChange}
                className="w-5 h-5 accent-[#fff200]"
              />
              <span className="font-roman">Publicar Notas</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="permiso_recetas"
                checked={formData.permiso_recetas}
                onChange={handleInputChange}
                className="w-5 h-5 accent-[#fff200]"
              />
              <span className="font-roman">Publicar Recetas</span>
            </label>
          </div>
          <p className="text-red-600 text-xs mt-2">
            Debes seleccionar al menos una opción.
          </p>
        </div>

        {/* Mensajes */}
        {mensaje.texto && (
          <div className={`p-4 rounded-lg ${
            mensaje.tipo === "error" 
              ? "bg-red-50 text-red-600 border border-red-200" 
              : "bg-green-50 text-green-600 border border-green-200"
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={guardando}
            className="px-6 py-3 bg-[#fff200] text-black font-bold rounded-lg hover:bg-[#fff200] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Modal Editor de Imagen - Renderizado con Portal para estar sobre todo */}
      {mostrarEditor && imagenOriginal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ zIndex: 99999 }}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Ajustar Logo</h2>
            
            {/* Área de visualización */}
            <div className="relative w-full h-96 mb-4 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="absolute inset-0 flex items-center justify-center"
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
            </div>

            {/* Botones */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => {
                  setMostrarEditor(false);
                  setImagenOriginal(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={recortarImagen}
                className="px-4 py-2 bg-[#fff200] text-black font-bold rounded-lg hover:bg-[#e6d900]"
              >
                Aplicar Ajustes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EditarPerfilInvitado;
