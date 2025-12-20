import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { urlApi } from "../../../api/url";
import { useAuth } from "../../../Context";

// Límites de caracteres según el modelo Recetas.js
const CHAR_LIMITS = {
  titulo: 255,
  descripcion: 3000,
  porciones: 255,
  tiempo: 300,
  creditos: 255,
  instagram: 80,
  seo_alt_text: 255,
  seo_title: 255,
  seo_keyword: 255,
  meta_description: 300,
};

// Componente de contador de caracteres
const CharCounter = ({ value, max }) => {
  const current = value?.length || 0;
  const isNearLimit = current >= max * 0.9;
  const isAtLimit = current >= max;

  return (
    <span
      className={`text-xs ${isAtLimit
        ? "text-red-500 font-bold"
        : isNearLimit
          ? "text-amber-500"
          : "text-gray-400"
        }`}
    >
      {current}/{max}
    </span>
  );
};

export default function FormularioReceta({
  onCancelar,
  onEnviado,
  receta: recetaProp,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [receta, setReceta] = useState(recetaProp || null);
  const [cargandoReceta, setCargandoReceta] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    descripcion: "",
    porciones: "",
    tiempo: "",
    ingredientes: "",
    preparacion: "",
    consejo: "",
    categoria: "",
    tipo_receta: "",
    imagen: null,
    creditos: "",
    instagram: "",
    seo_alt_text: "",
    seo_title: "",
    seo_keyword: "",
    meta_description: "",
    destacada_invitado: 0,
  });

  const [cargando, setCargando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [imagenPreview, setImagenPreview] = useState(null);

  // Cargar receta desde URL si hay ID
  useEffect(() => {
    if (id && !recetaProp) {
      setCargandoReceta(true);
      fetch(`${urlApi}api/recetas/${id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Receta cargada desde API:", data);
          // Manejar si la respuesta viene con data wrapper o directamente
          const recetaData = data.receta || data.data || data;
          setReceta(recetaData);
          setCargandoReceta(false);
        })
        .catch((err) => {
          console.error("Error al cargar receta:", err);
          setCargandoReceta(false);
        });
    }
  }, [id, recetaProp]);

  // Cargar datos si se está editando
  useEffect(() => {
    if (receta) {
      setFormData({
        titulo: receta.titulo || "",
        autor: receta.autor || usuario?.nombre_usuario || "",
        descripcion: receta.descripcion || "",
        porciones: receta.porciones || "",
        tiempo: receta.tiempo || "",
        ingredientes: receta.ingredientes || "",
        preparacion: receta.preparacion || "",
        consejo: receta.consejo || "",
        categoria: receta.categoria || "",
        tipo_receta: receta.tipo_receta || "",
        imagen: null, // La imagen no se repobla en el input file
        creditos: receta.creditos || "",
        instagram: receta.instagram || "",
        seo_alt_text: receta.seo_alt_text || "",
        seo_title: receta.seo_title || "",
        seo_keyword: receta.seo_keyword || "",
        meta_description: receta.meta_description || "",
        destacada_invitado: receta.destacada_invitado || 0,
      });
    } else {
      // Resetear si no hay receta (modo crear)
      setFormData({
        titulo: "",
        autor: usuario?.nombre_usuario || "",
        descripcion: "",
        porciones: "",
        tiempo: "",
        ingredientes: "",
        preparacion: "",
        consejo: "",
        categoria: "",
        tipo_receta: "",
        imagen: null,
        creditos: "",
        instagram: "",
        seo_alt_text: "",
        seo_title: "",
        seo_keyword: "",
        meta_description: "",
        destacada_invitado: 0,
      });
    }
  }, [receta]);

  // Manejar cambios de input
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // Si es un archivo de imagen, crear preview
    if (type === "file" && files && files[0]) {
      const file = files[0];
      setFormData({
        ...formData,
        [name]: file,
      });
      // Crear URL preview para mostrar la imagen
      const previewUrl = URL.createObjectURL(file);
      setImagenPreview(previewUrl);
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // --- AUTO-GENERACIÓN SEO (Recetas) ---
  useEffect(() => {
    const { titulo, categoria, descripcion, autor } = formData;

    // Evitar actualizaciones innecesarias si no hay datos básicos
    if (!titulo && !categoria && !descripcion) return;

    const newSeoTitle = `${titulo || ""} - ${categoria || ""}`;
    const newSeoKeyword = titulo || "";
    const newAltText = `${titulo || ""} ${categoria || ""}`;

    // Meta Description: Truncate to 155
    const baseDesc = `${descripcion || ""} - Receta por ${autor || ""}`;
    const newMetaDesc =
      baseDesc.length > 155 ? baseDesc.substring(0, 155) : baseDesc;

    setFormData((prev) => {
      // Solo actualizar si hay cambios para evitar re-renders excesivos
      if (
        prev.seo_title === newSeoTitle &&
        prev.seo_keyword === newSeoKeyword &&
        prev.seo_alt_text === newAltText &&
        prev.meta_description === newMetaDesc
      ) {
        return prev;
      }

      return {
        ...prev,
        seo_title: newSeoTitle,
        seo_keyword: newSeoKeyword,
        seo_alt_text: newAltText,
        meta_description: newMetaDesc,
      };
    });
  }, [
    formData.titulo,
    formData.categoria,
    formData.descripcion,
    formData.autor,
  ]);
  // -------------------------------------

  // Enviar datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const data = new FormData();
      // Primero agregar todos los campos de texto
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "imagen") return; // Saltar imagen por ahora
        // Enviar todos los campos, incluyendo vacíos (para poder borrar valores)
        data.append(key, value !== null ? value : "");
      });

      // Agregar la imagen al final si existe
      if (formData.imagen) {
        data.append("imagen", formData.imagen);
      }

      const url = receta
        ? `${urlApi}api/recetas/${receta.id}`
        : `${urlApi}api/recetas`;

      const method = receta ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
          `Error al ${receta ? "actualizar" : "enviar"} la receta`
        );
      }

      setMensaje(`Receta ${receta ? "actualizada" : "enviada"} correctamente.`);

      if (!receta) {
        // Solo limpiar formulario si es creación nueva
        setFormData({
          titulo: "",
          autor: "",
          descripcion: "",
          porciones: "",
          tiempo: "",
          ingredientes: "",
          preparacion: "",
          consejo: "",
          categoria: "",
          tipo_receta: "",
          imagen: null,
          creditos: "",
          instagram: "",
          destacada_invitado: 0,
        });
      }

      // Ocultar el formulario después de enviar exitosamente
      if (onEnviado) {
        setTimeout(() => {
          onEnviado();
        }, 1500);
      } else {
        // Si no hay callback, navegar de vuelta a la lista
        setTimeout(() => {
          navigate("/dashboard?vista=recetas");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setMensaje(
        `Hubo un error al ${receta ? "actualizar" : "enviar"} la receta: ` +
        err.message
      );
    } finally {
      setCargando(false);
    }
  };

  // Función para eliminar (desactivar) la receta
  const handleEliminar = async () => {
    if (!receta?.id) return;

    const confirmacion = window.confirm(
      "¿Estás seguro de que deseas eliminar esta receta? La receta será desactivada y ya no aparecerá en las publicadas."
    );

    if (!confirmacion) return;

    setEliminando(true);
    setMensaje("");

    try {
      const response = await fetch(`${urlApi}api/recetas/${receta.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al eliminar la receta");
      }

      setMensaje("Receta eliminada correctamente.");

      // Navegar de vuelta a la lista después de eliminar
      if (onEnviado) {
        setTimeout(() => {
          onEnviado();
        }, 1500);
      } else {
        setTimeout(() => {
          navigate("/dashboard?vista=recetas");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setMensaje("Hubo un error al eliminar la receta: " + err.message);
    } finally {
      setEliminando(false);
    }
  };
  if (cargandoReceta) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <form onSubmit={handleSubmit}>
        <h1 className="leading-tight text-2xl">
          {receta ? "Editar Receta" : "Formulario de envío de receta"}
        </h1>
        {mensaje && (
          <div
            className={`px-4 py-2 rounded mb-2 text-center ${mensaje.includes("correctamente")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}
          >
            {mensaje}
          </div>
        )}

        {/* Imagen */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">
            {receta ? "Cambiar imagen (opcional)" : "Imagen principal"}
          </label>

          {/* Mostrar vista previa de imagen seleccionada */}
          {imagenPreview && (
            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-2">Vista previa:</p>
              <img
                src={imagenPreview}
                alt="Vista previa de la imagen"
                className="max-w-xs max-h-48 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}

          {/* Mostrar imagen actual cuando se está editando (solo si no hay preview) */}
          {!imagenPreview && receta && receta.imagen && !formData.imagen && (
            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-2">Imagen actual:</p>
              <img
                src={
                  receta.imagen.startsWith("http")
                    ? receta.imagen
                    : `${urlApi}api/recetas/imagen/${encodeURIComponent(
                      receta.imagen.split("/").pop()
                    )}`
                }
                alt="Imagen actual de la receta"
                className="max-w-xs max-h-48 object-cover rounded-lg border border-gray-300"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          <input
            type="file"
            name="imagen"
            accept=".jpg,.png"
            required={!receta} // Solo requerido si no estamos editando
            onChange={handleChange}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
          <p className="text-xs text-gray-400 font-roman">
            Formato JPG o PNG, máx. 5MB
          </p>
        </div>

        {/* Título */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="font-roman font-bold">Título de la receta</label>
            <CharCounter value={formData.titulo} max={CHAR_LIMITS.titulo} />
          </div>
          <input
            type="text"
            name="titulo"
            required
            maxLength={CHAR_LIMITS.titulo}
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ej. Arroz caldoso con camarón seco y chile piquín"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        {/* Autor */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">
            Autor / Creador
          </label>
          <div className="w-full px-3 py-2 font-roman font-bold text-gray-700">
            {formData.autor || usuario?.nombre_usuario || "Sin usuario"}
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="font-roman font-bold">Descripción corta</label>
            <CharCounter
              value={formData.descripcion}
              max={CHAR_LIMITS.descripcion}
            />
          </div>
          <textarea
            name="descripcion"
            rows="3"
            required
            maxLength={CHAR_LIMITS.descripcion}
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Breve contexto o idea del plato..."
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          ></textarea>
        </div>

        {/* Porciones */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="font-roman font-bold">Porciones</label>
            <CharCounter
              value={formData.porciones}
              max={CHAR_LIMITS.porciones}
            />
          </div>
          <input
            type="text"
            name="porciones"
            required
            maxLength={CHAR_LIMITS.porciones}
            value={formData.porciones}
            onChange={handleChange}
            placeholder="Ej. 4 porciones"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        {/* Tiempo */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="font-roman font-bold">Tiempo total</label>
            <CharCounter value={formData.tiempo} max={CHAR_LIMITS.tiempo} />
          </div>
          <input
            type="text"
            name="tiempo"
            required
            maxLength={CHAR_LIMITS.tiempo}
            value={formData.tiempo}
            onChange={handleChange}
            placeholder="Ej. 45 minutos"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        {/* Ingredientes */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">Ingredientes</label>
          <textarea
            name="ingredientes"
            rows="6"
            required
            value={formData.ingredientes}
            onChange={handleChange}
            placeholder="- 2 tazas de arroz\n- 1 litro de caldo de camarón\n- 1 chile piquín seco"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          ></textarea>
        </div>

        {/* Preparación */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">
            Preparación / Método
          </label>
          <textarea
            name="preparacion"
            rows="8"
            required
            value={formData.preparacion}
            onChange={handleChange}
            placeholder="1. Sofríe el arroz...\n2. Agrega el caldo..."
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          ></textarea>
        </div>

        {/* Consejo */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">
            Consejo o toque personal (opcional)
          </label>
          <textarea
            name="consejo"
            rows="2"
            value={formData.consejo}
            onChange={handleChange}
            placeholder="Ej. Puedes sustituir el camarón por setas..."
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          ></textarea>
        </div>

        {/* Categoría */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">Categoría</label>
          <select
            name="categoria"
            required
            value={formData.categoria}
            onChange={handleChange}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          >
            <option value="">Selecciona una opción</option>
            <option>Entrante</option>
            <option>Plato fuerte</option>
            <option>Postre</option>
            <option>Bebida</option>
            <option>Otro</option>
          </select>
        </div>

        {/* Tipo de Receta */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">
            Tipo de Receta
          </label>
          <input
            type="text"
            name="tipo_receta"
            value={formData.tipo_receta}
            onChange={handleChange}
            placeholder="Ej. Casera, Gourmet, Tradicional, Fusión..."
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        {/* Destacada Invitado - Solo para invitados */}
        {(usuario?.rol?.toLowerCase() === "invitado" ||
          usuario?.rol?.toLowerCase() === "invitados" ||
          usuario?.permisos?.toLowerCase() === "invitado" ||
          usuario?.permisos?.toLowerCase() === "invitados") && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="destacada_invitado"
                  checked={formData.destacada_invitado === 1}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      destacada_invitado: e.target.checked ? 1 : 0,
                    });
                  }}
                  className="form-checkbox h-5 w-5 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
                />
                <span className="ml-2 font-roman font-bold text-gray-700">
                  ⭐ Marcar como receta destacada
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Las recetas destacadas aparecen en secciones especiales del sitio
              </p>
            </div>
          )}

        {/* Créditos */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="font-roman font-bold">
              Créditos adicionales (opcional)
            </label>
            <CharCounter value={formData.creditos} max={CHAR_LIMITS.creditos} />
          </div>
          <input
            type="text"
            name="creditos"
            maxLength={CHAR_LIMITS.creditos}
            value={formData.creditos}
            onChange={handleChange}
            placeholder="Fotografía: Dna Alanis"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        {/* Sección SEO Metadata (OCULTA AUTOMÁTICAMENTE) */}
        <div className="border-t pt-4 mt-6" style={{ display: "none" }}>
          <h2 className="text-xl font-bold mb-4">SEO Metadata (Opcional)</h2>

          {/* SEO Alt Text */}
          <div className="mb-4">
            <label className="space-y-2 font-roman font-bold">
              Texto Alt de Imagen
            </label>
            <input
              type="text"
              name="seo_alt_text"
              value={formData.seo_alt_text}
              onChange={handleChange}
              placeholder="Descripción de la imagen para buscadores"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
            />
          </div>

          {/* SEO Title */}
          <div className="mb-4">
            <label className="space-y-2 font-roman font-bold">Título SEO</label>
            <input
              type="text"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleChange}
              placeholder="Título para pestaña del navegador y Google"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
            />
          </div>

          {/* SEO Keyword */}
          <div className="mb-4">
            <label className="space-y-2 font-roman font-bold">
              Palabra Clave Objetivo
            </label>
            <input
              type="text"
              name="seo_keyword"
              value={formData.seo_keyword}
              onChange={handleChange}
              placeholder="Palabra clave principal"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
            />
          </div>

          {/* Meta Description */}
          <div className="mb-4">
            <label className="space-y-2 font-roman font-bold">
              Meta Descripción
            </label>
            <textarea
              name="meta_description"
              rows="3"
              value={formData.meta_description}
              onChange={handleChange}
              placeholder="Resumen para resultados de búsqueda (Google)"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
            ></textarea>
          </div>
        </div>

        {/* Instagram */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="font-roman font-bold">
              Instagram o red del creador
            </label>
            <CharCounter
              value={formData.instagram}
              max={CHAR_LIMITS.instagram}
            />
          </div>
          <input
            type="text"
            name="instagram"
            maxLength={CHAR_LIMITS.instagram}
            value={formData.instagram}
            onChange={handleChange}
            placeholder="@mamaderoco"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              disabled={cargando || eliminando}
              className={`flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition ${cargando || eliminando ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={cargando || eliminando}
            className={`flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition ${cargando || eliminando ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {cargando
              ? "Enviando..."
              : receta
                ? "Actualizar receta"
                : "Enviar receta"}
          </button>
          {receta && (
            <button
              type="button"
              onClick={handleEliminar}
              disabled={cargando || eliminando}
              className={`flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition ${cargando || eliminando ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {eliminando ? "Eliminando..." : "Eliminar"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
