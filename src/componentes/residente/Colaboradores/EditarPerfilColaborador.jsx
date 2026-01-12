import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context";
import { getColaboradores } from "../../api/temaSemanaApi";
import { consejerosPut } from "../../api/consejerosApi";

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

    setFotografia(file);
    setFotoPreview(URL.createObjectURL(file));
    setMensaje({ tipo: "", texto: "" });
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
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#fff300] mb-4">
                <img
                  src={fotoPreview}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
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
          </div>

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
