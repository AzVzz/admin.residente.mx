import React, { useState, useRef } from "react";
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
  const [fechaProyecto, setFechaProyecto] = useState(
    proyecto?.fecha_proyecto || ""
  );
  const [archivoPortada, setArchivoPortada] = useState(null);
  const [previewPortada, setPreviewPortada] = useState(
    proyecto?.imagen ? `${imgApi}${proyecto.imagen.replace(/^\//, "")}` : null
  );

  // Galería: cada item es { id?, url?, file?, preview, ref }
  // - existente: { id, url, preview, ref: id }
  // - nueva:     { file, preview, ref: "nueva:<idx>" }
  const inicialesGaleria = Array.isArray(proyecto?.imagenes)
    ? [...proyecto.imagenes]
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
        .map((img) => ({
          id: img.id,
          url: img.url,
          preview: `${imgApi}${img.url.replace(/^\//, "")}`,
          ref: img.id,
        }))
    : [];
  const [galeria, setGaleria] = useState(inicialesGaleria);
  const [imagenesBorrar, setImagenesBorrar] = useState([]);
  const [logoArchivo, setLogoArchivo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    proyecto?.logo ? `${imgApi}${proyecto.logo.replace(/^\//, "")}` : null
  );

  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);

  // Snapshot de los valores con los que se abrió el form. Lo usamos para que
  // en edición solo se envíen los campos que el usuario realmente modificó.
  // Previene que dos personas editando al mismo tiempo se pisen entre sí los
  // cambios: si tu form tiene datos viejos y solo cambias la descripción,
  // únicamente la descripción viaja al backend.
  const valoresIniciales = useRef({
    titulo: (proyecto?.titulo || "").trim(),
    descripcion: (proyecto?.descripcion || "").trim(),
    categoria: (proyecto?.categoria || "").trim(),
    link: (proyecto?.link || "").trim(),
    fechaProyecto: proyecto?.fecha_proyecto || "",
    galeriaRefs: inicialesGaleria.map((g) => `id:${g.id}`).join("|"),
  });

  const handlePortadaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoPortada(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewPortada(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAgregarGaleria = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGaleria((prev) => [
          ...prev,
          {
            file,
            preview: reader.result,
            ref: `nueva:tmp-${Date.now()}-${Math.random()}`,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleQuitarGaleria = (index) => {
    setGaleria((prev) => {
      const item = prev[index];
      if (item?.id) {
        setImagenesBorrar((borrar) => [...borrar, item.id]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const moverGaleria = (index, delta) => {
    setGaleria((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const nuevo = [...prev];
      [nuevo[index], nuevo[target]] = [nuevo[target], nuevo[index]];
      return nuevo;
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoArchivo(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
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
      const tituloLimpio = titulo.trim();
      const descripcionLimpia = descripcion.trim();
      const categoriaLimpia = categoria.trim();
      const linkLimpio = link.trim();

      // Construye la representación actual de la galería para comparar contra
      // la inicial: detecta agregados (item.file), removidos o reordenados.
      const refsActuales = galeria
        .map((item) => (item.id ? `id:${item.id}` : item.ref))
        .join("|");
      const ini = valoresIniciales.current;
      const galeriaCambio =
        refsActuales !== ini.galeriaRefs ||
        galeria.some((g) => g.file) ||
        imagenesBorrar.length > 0;

      const appendGaleria = () => {
        const ordenFinal = [];
        let idxNueva = 0;
        galeria.forEach((item) => {
          if (item.file) {
            formData.append("imagenes", item.file);
            ordenFinal.push(`nueva:${idxNueva}`);
            idxNueva += 1;
          } else if (item.id) {
            ordenFinal.push(item.id);
          }
        });
        formData.append("imagenes_orden", JSON.stringify(ordenFinal));
        if (imagenesBorrar.length > 0) {
          formData.append("imagenes_borrar", JSON.stringify(imagenesBorrar));
        }
      };

      if (esEdicion) {
        // Solo enviar los campos que realmente cambiaron, así no pisamos
        // los cambios que otra persona haya hecho en paralelo a este proyecto.
        if (tituloLimpio !== ini.titulo)
          formData.append("titulo", tituloLimpio);
        if (descripcionLimpia !== ini.descripcion)
          formData.append("descripcion", descripcionLimpia);
        if (categoriaLimpia !== ini.categoria)
          formData.append("categoria", categoriaLimpia);
        if (linkLimpio !== ini.link) formData.append("link", linkLimpio);
        if (fechaProyecto !== ini.fechaProyecto)
          formData.append("fecha_proyecto", fechaProyecto);
        if (archivoPortada) formData.append("imagen", archivoPortada);
        if (logoArchivo) formData.append("logo", logoArchivo);
        if (galeriaCambio) appendGaleria();

        const sinCambios = [...formData.keys()].length === 0;
        if (sinCambios) {
          onGuardado();
          return;
        }

        await mediaincEditar(proyecto.id, formData, token);
      } else {
        // Creación: enviar todo
        formData.append("titulo", tituloLimpio);
        formData.append("descripcion", descripcionLimpia);
        formData.append("categoria", categoriaLimpia);
        formData.append("link", linkLimpio);
        formData.append("fecha_proyecto", fechaProyecto);
        if (archivoPortada) formData.append("imagen", archivoPortada);
        if (logoArchivo) formData.append("logo", logoArchivo);
        appendGaleria();

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

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <input
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Ej. Editorial, Digital, Distribucion..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          />
        </div>

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

        <div className="flex flex-col sm:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Imagen de portada (opcional)
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePortadaChange}
              />
              {previewPortada ? "Cambiar portada" : "Subir portada"}
            </label>
            {previewPortada && (
              <img
                src={previewPortada}
                alt="preview portada"
                className="h-20 w-auto rounded-lg border object-cover"
              />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Si no agregas imagenes a la galeria, se usara la portada como
            unica imagen.
          </p>
        </div>

        <div className="flex flex-col sm:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Galeria del carrusel ({galeria.length})
            </label>
            <label className="cursor-pointer bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAgregarGaleria}
              />
              + Agregar imagenes
            </label>
          </div>

          {galeria.length === 0 ? (
            <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-6 text-center">
              No hay imagenes en la galeria. Si agregas varias, en mediainc.net
              se mostraran como carrusel.
            </div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {galeria.map((item, index) => (
                <li
                  key={item.ref}
                  className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                >
                  <img
                    src={item.preview}
                    alt={`imagen ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                  <div className="flex items-stretch border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => moverGaleria(index, -1)}
                      disabled={index === 0}
                      className="flex-1 py-1 text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Mover arriba"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moverGaleria(index, 1)}
                      disabled={index === galeria.length - 1}
                      className="flex-1 py-1 text-sm border-l border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Mover abajo"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuitarGaleria(index)}
                      className="flex-1 py-1 text-sm border-l border-gray-200 text-red-600 hover:bg-red-50"
                      title="Quitar"
                    >
                      X
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Logo */}
        <div className="flex flex-col sm:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Logo
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              {logoPreview ? "Cambiar logo" : "Subir logo"}
            </label>
            {logoPreview && (
              <img
                src={logoPreview}
                alt="logo preview"
                className="h-20 w-auto rounded-lg border bg-white object-contain p-2"
              />
            )}
          </div>
        </div>
      </div>

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
