import React, { useState } from "react";
import { useAuth } from "../Context";
import { mediaincCrear, mediaincEditar } from "../api/mediaincApi";
import { imgApi } from "../api/url";

const FormularioMediainc = ({ proyecto, onGuardado, onCancelar }) => {
  const { token } = useAuth();
  const esEdicion = !!proyecto;

  const [titulo, setTitulo] = useState(proyecto?.titulo || "");
  const [descripcion, setDescripcion] = useState(proyecto?.descripcion || "");
  const [categoria, setCategoria] = useState(proyecto?.categoria || "");
  const [link, setLink] = useState(proyecto?.link || "");
  const [fechaProyecto, setFechaProyecto] = useState(proyecto?.fecha_proyecto || "");
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(
    proyecto?.imagen ? `${imgApi}${proyecto.imagen.replace(/^\//, "")}` : null
  );
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivo(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError("Titulo es obligatorio");
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("titulo", titulo.trim());
      formData.append("descripcion", descripcion.trim());
      formData.append("categoria", categoria.trim());
      formData.append("link", link.trim());
      formData.append("fecha_proyecto", fechaProyecto);
      if (archivo) {
        formData.append("imagen", archivo);
      }

      if (esEdicion) {
        await mediaincEditar(proyecto.id, formData, token);
      } else {
        await mediaincCrear(formData, token);
      }

      onGuardado();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-6 shadow-sm border"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-5">
        {esEdicion ? "Editar Proyecto" : "Nuevo Proyecto"}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Titulo */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Titulo *
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Folio Magazine"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          />
        </div>

        {/* Categoria */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <input
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Ej. Editorial, Digital, Consultoría..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          />
        </div>

        {/* Descripcion */}
        <div className="flex flex-col sm:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Descripcion
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe el proyecto..."
            rows={3}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Link */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Link externo
          </label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          />
        </div>

        {/* Fecha del proyecto */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Fecha del proyecto
          </label>
          <input
            type="date"
            value={fechaProyecto}
            onChange={(e) => setFechaProyecto(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          />
        </div>

        {/* Imagen */}
        <div className="flex flex-col sm:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Imagen
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {preview ? "Cambiar imagen" : "Subir imagen"}
            </label>
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="h-20 w-auto rounded-lg border object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={isPosting}
          className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
        >
          {isPosting
            ? "Guardando..."
            : esEdicion
              ? "Actualizar"
              : "Crear Proyecto"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default FormularioMediainc;
