import React, { useState, useEffect } from "react";
import { urlApi } from "../../../api/url";

export default function FormularioReceta({ onCancelar, onEnviado, receta }) {
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
    imagen: null,
    creditos: "",
    creditos: "",
    instagram: "",
    seo_alt_text: "",
    seo_title: "",
    seo_keyword: "",
    meta_description: "",
  });

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar datos si se está editando
  useEffect(() => {
    if (receta) {
      setFormData({
        titulo: receta.titulo || "",
        autor: receta.autor || "",
        descripcion: receta.descripcion || "",
        porciones: receta.porciones || "",
        tiempo: receta.tiempo || "",
        ingredientes: receta.ingredientes || "",
        preparacion: receta.preparacion || "",
        consejo: receta.consejo || "",
        categoria: receta.categoria || "",
        imagen: null, // La imagen no se repobla en el input file
        creditos: receta.creditos || "",
        instagram: receta.instagram || "",
        seo_alt_text: receta.seo_alt_text || "",
        seo_title: receta.seo_title || "",
        seo_keyword: receta.seo_keyword || "",
        meta_description: receta.meta_description || "",
      });
    } else {
      // Resetear si no hay receta (modo crear)
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
        imagen: null,
        creditos: "",
        creditos: "",
        instagram: "",
        seo_alt_text: "",
        seo_title: "",
        seo_keyword: "",
        meta_description: "",
        seo_alt_text: "",
        seo_title: "",
        seo_keyword: "",
        meta_description: "",
      });
    }
  }, [receta]);

  // Manejar cambios de input
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    });
  };

  // Enviar datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const data = new FormData();
      // Primero agregar todos los campos de texto
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'imagen') return; // Saltar imagen por ahora
        if (value !== null && value !== "") {
          data.append(key, value);
        }
      });

      // Agregar la imagen al final si existe
      if (formData.imagen) {
        data.append('imagen', formData.imagen);
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
        throw new Error(errorData.error || `Error al ${receta ? 'actualizar' : 'enviar'} la receta`);
      }

      setMensaje(`Receta ${receta ? 'actualizada' : 'enviada'} correctamente.`);

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
          imagen: null,
          creditos: "",
          instagram: "",
        });
      }

      // Ocultar el formulario después de enviar exitosamente
      if (onEnviado) {
        setTimeout(() => {
          onEnviado();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setMensaje(`Hubo un error al ${receta ? 'actualizar' : 'enviar'} la receta: ` + err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="py-8">
      <form
        onSubmit={handleSubmit}
      >
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

        {/* Título */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">Título de la receta</label>
          <input
            type="text"
            name="titulo"
            maxLength="100"
            required
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ej. Arroz caldoso con camarón seco y chile piquín"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        {/* Autor */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">Autor / Creador</label>
          <input
            type="text"
            name="autor"
            maxLength="60"
            required
            value={formData.autor}
            onChange={handleChange}
            placeholder="Ej. Mamá de Roco"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">Descripción corta</label>
          <textarea
            name="descripcion"
            maxLength="300"
            rows="3"
            required
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Breve contexto o idea del plato..."
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          ></textarea>
        </div>

        {/* Porciones */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">Porciones</label>
          <input
            type="text"
            name="porciones"
            maxLength="30"
            required
            value={formData.porciones}
            onChange={handleChange}
            placeholder="Ej. 4 porciones"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        {/* Tiempo */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">Tiempo total</label>
          <input
            type="text"
            name="tiempo"
            maxLength="30"
            required
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
            maxLength="500"
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
          <label className="space-y-2 font-roman font-bold">Preparación / Método</label>
          <textarea
            name="preparacion"
            maxLength="1000"
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
          <label className="space-y-2 font-roman font-bold">Consejo o toque personal (opcional)</label>
          <textarea
            name="consejo"
            maxLength="200"
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

        {/* Imagen */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">
            {receta ? "Cambiar imagen (opcional)" : "Imagen principal"}
          </label>
          {receta && !formData.imagen && (
            <p className="text-sm text-gray-500 mb-2">Imagen actual configurada. Sube una nueva para cambiarla.</p>
          )}
          <input
            type="file"
            name="imagen"
            accept=".jpg,.png"
            required={!receta} // Solo requerido si no estamos editando
            onChange={handleChange}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
          <p className="text-xs text-gray-400">Formato JPG o PNG, máx. 5MB</p>
        </div>

        {/* Créditos */}
        <div className="mb-4">
          <label className="space-y-2 font-roman font-bold">Créditos adicionales (opcional)</label>
          <input
            type="text"
            name="creditos"
            maxLength="100"
            value={formData.creditos}
            onChange={handleChange}
            placeholder="Fotografía: Dna Alanis"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        {/* Sección SEO Metadata */}
        <div className="border-t pt-4 mt-6">
          <h2 className="text-xl font-bold mb-4">SEO Metadata (Opcional)</h2>

          {/* SEO Alt Text */}
          <div className="mb-4">
            <label className="space-y-2 font-roman font-bold">Texto Alt de Imagen</label>
            <input
              type="text"
              name="seo_alt_text"
              maxLength="255"
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
              maxLength="255"
              value={formData.seo_title}
              onChange={handleChange}
              placeholder="Título para pestaña del navegador y Google"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
            />
          </div>

          {/* SEO Keyword */}
          <div className="mb-4">
            <label className="space-y-2 font-roman font-bold">Palabra Clave Objetivo</label>
            <input
              type="text"
              name="seo_keyword"
              maxLength="255"
              value={formData.seo_keyword}
              onChange={handleChange}
              placeholder="Palabra clave principal"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
            />
          </div>

          {/* Meta Description */}
          <div className="mb-4">
            <label className="space-y-2 font-roman font-bold">Meta Descripción</label>
            <textarea
              name="meta_description"
              maxLength="300"
              rows="3"
              value={formData.meta_description}
              onChange={handleChange}
              placeholder="Resumen para resultados de búsqueda (Google)"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
            ></textarea>
          </div>
        </div>

        {/* Instagram */}
        <div>
          <label className="space-y-2 font-roman font-bold">Instagram o red del creador</label>
          <input
            type="text"
            name="instagram"
            maxLength="80"
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
              disabled={cargando}
              className={`flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition ${cargando ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={cargando}
            className={`flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition ${cargando ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {cargando ? "Enviando..." : (receta ? "Actualizar receta" : "Enviar receta")}
          </button>
        </div>
      </form>
    </div>
  );
}

