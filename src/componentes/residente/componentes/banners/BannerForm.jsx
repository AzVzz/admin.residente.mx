import React, { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "../../../Context";
import { bannerCreate, bannerUpdate } from "../../../api/bannersApi";
import { FaUpload, FaArrowLeft, FaTimes } from "react-icons/fa";

const BannerEditorModal = lazy(() => import("./BannerEditor/BannerEditorModal.jsx"));

const initialState = {
  nombre: "",
  tipo: "imagen",
  url_destino: "",
  alt_text: "",
  titulo: "",
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: "",
  estatus: "borrador",
  prioridad: 0,
  es_default_seccion: false,
};

const FileUpload = ({ label, accept, preview, onChange, onClear, hint }) => (
  <div className="flex flex-col gap-2">
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
      {preview ? (
        <div className="relative">
          {typeof preview === "string" &&
          (preview.endsWith(".pdf") || preview.includes("pdf")) ? (
            <p className="text-sm text-gray-600 py-4">PDF seleccionado</p>
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="max-h-40 mx-auto rounded object-contain"
            />
          )}
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400">
          <FaUpload className="text-2xl" />
          <span className="text-sm">Arrastra o haz click para subir</span>
          <input
            type="file"
            accept={accept || "image/*"}
            onChange={onChange}
            className="hidden"
          />
        </label>
      )}
      {preview && (
        <label className="cursor-pointer text-xs text-blue-600 hover:underline mt-2 inline-block">
          Cambiar archivo
          <input
            type="file"
            accept={accept || "image/*"}
            onChange={onChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  </div>
);

const BannerForm = ({ banner, onSave, onCancel }) => {
  const { token } = useAuth();
  const [form, setForm] = useState(initialState);
  const [files, setFiles] = useState({
    imagen_desktop: null,
    imagen_mobile: null,
    imagen_portada: null,
    pdf: null,
  });
  const [previews, setPreviews] = useState({
    imagen_desktop: null,
    imagen_mobile: null,
    imagen_portada: null,
    pdf: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [editorMode, setEditorMode] = useState("upload");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [sceneJson, setSceneJson] = useState(null);

  const isEdit = Boolean(banner);

  useEffect(() => {
    if (banner) {
      setForm({
        nombre: banner.nombre || "",
        tipo: banner.tipo || "imagen",
        url_destino: banner.url_destino || "",
        alt_text: banner.alt_text || "",
        titulo: banner.titulo || "",
        descripcion: banner.descripcion || "",
        fecha_inicio: banner.fecha_inicio
          ? banner.fecha_inicio.slice(0, 16)
          : "",
        fecha_fin: banner.fecha_fin ? banner.fecha_fin.slice(0, 16) : "",
        estatus: banner.estatus || "borrador",
        prioridad: banner.prioridad ?? 0,
        es_default_seccion: banner.es_default_seccion ?? false,
      });
      setPreviews({
        imagen_desktop: banner.imagen_desktop || null,
        imagen_mobile: banner.imagen_mobile || null,
        imagen_portada: banner.imagen_portada || null,
        pdf: banner.pdf || null,
      });
      if (banner.scene_json) {
        setSceneJson(banner.scene_json);
        setEditorMode("editor");
      }
    }
  }, [banner]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFile = (field) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles((prev) => ({ ...prev, [field]: file }));

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPreviews((prev) => ({ ...prev, [field]: ev.target.result }));
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => ({ ...prev, [field]: file.name }));
    }
  };

  const clearFile = (field) => () => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: null }));
  };

  const handleEditorSave = ({ desktopFile, mobileFile, sceneJson: sj }) => {
    setFiles((prev) => ({ ...prev, imagen_desktop: desktopFile, imagen_mobile: mobileFile || null }));
    setPreviews((prev) => ({
      ...prev,
      imagen_desktop: URL.createObjectURL(desktopFile),
      imagen_mobile: mobileFile ? URL.createObjectURL(mobileFile) : null,
    }));
    setSceneJson(sj);
    setIsEditorOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== "" && val !== null && val !== undefined) {
          formData.append(key, val);
        }
      });
      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });
      if (editorMode === "editor" && sceneJson) {
        formData.append("scene_json", sceneJson);
      }

      if (isEdit) {
        await bannerUpdate(token, banner.id, formData);
      } else {
        await bannerCreate(token, formData);
      }
      onSave();
    } catch (err) {
      setError(err.message || "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const isRevista = form.tipo === "revista";

  return (
    <div>
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
      >
        <FaArrowLeft /> Volver a la lista
      </button>

      <h2 className="text-xl font-bold mb-6">
        {isEdit ? "Editar Banner" : "Nuevo Banner"}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="imagen">Imagen</option>
              <option value="revista">Revista</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>

          {/* URL Destino */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              URL Destino
            </label>
            <input
              type="text"
              name="url_destino"
              value={form.url_destino}
              onChange={handleChange}
              placeholder="https://..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Alt Text */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Texto Alternativo
            </label>
            <input
              type="text"
              name="alt_text"
              value={form.alt_text}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Estatus */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Estatus</label>
            <select
              name="estatus"
              value={form.estatus}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="borrador">Borrador</option>
              <option value="activo">Activo</option>
              <option value="programado">Programado</option>
              <option value="expirado">Expirado</option>
            </select>
          </div>

          {/* Prioridad */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Prioridad
            </label>
            <input
              type="number"
              name="prioridad"
              value={form.prioridad}
              onChange={handleChange}
              min="0"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Banner default para secciones */}
          <div className="flex items-center gap-3 md:col-span-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <input
              type="checkbox"
              id="es_default_seccion"
              name="es_default_seccion"
              checked={form.es_default_seccion}
              onChange={handleChange}
              className="w-4 h-4 accent-yellow-500 cursor-pointer"
            />
            <label
              htmlFor="es_default_seccion"
              className="text-sm text-gray-700 cursor-pointer"
            >
              <span className="font-medium">
                Banner predeterminado de secciones
              </span>
              <span className="block text-xs text-gray-500">
                Se muestra en todas las páginas de sección que no tengan un
                banner de pago activo.
              </span>
            </label>
          </div>

          {/* Fecha Inicio */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha Inicio
            </label>
            <input
              type="datetime-local"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Fecha Fin */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha Fin
            </label>
            <input
              type="datetime-local"
              name="fecha_fin"
              value={form.fecha_fin}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Campos de Revista */}
        {isRevista && (
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Datos de Revista
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Titulo
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Descripcion
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm resize-y"
                />
              </div>
            </div>
          </div>
        )}

        {/* Archivos */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Archivos
          </h3>

          {/* Toggle upload / editor solo para imagen y newsletter */}
          {!isRevista && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">¿Cómo quieres subir las imágenes?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditorMode("upload")}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                    editorMode === "upload"
                      ? "border-blue-600 bg-blue-50 text-blue-800"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Subir archivos
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("editor")}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                    editorMode === "editor"
                      ? "border-blue-600 bg-blue-50 text-blue-800"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Diseñar con editor
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Modo upload */}
            {(isRevista || editorMode === "upload") && (
              <>
                <FileUpload
                  label="Imagen Desktop"
                  preview={previews.imagen_desktop}
                  onChange={handleFile("imagen_desktop")}
                  onClear={clearFile("imagen_desktop")}
                  hint="Big: 1080×216 px · Medium: 736×147 px · Small: 680×136 px (ratio 5:1)"
                />
                <FileUpload
                  label="Imagen Mobile"
                  preview={previews.imagen_mobile}
                  onChange={handleFile("imagen_mobile")}
                  onClear={clearFile("imagen_mobile")}
                  hint="1000×250 px · 2000×500 px retina (ratio 4:1)"
                />
              </>
            )}

            {/* Modo editor visual */}
            {!isRevista && editorMode === "editor" && (
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(true)}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 text-gray-800 font-medium text-sm transition-colors cursor-pointer"
                >
                  {previews.imagen_desktop ? "Editar diseño" : "Abrir editor visual"}
                </button>
                {previews.imagen_desktop && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Desktop preview</p>
                      <img
                        src={previews.imagen_desktop}
                        alt="Preview desktop"
                        className="rounded-lg border border-gray-200 max-h-24 w-full object-contain"
                      />
                    </div>
                    {previews.imagen_mobile && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Mobile preview</p>
                        <img
                          src={previews.imagen_mobile}
                          alt="Preview mobile"
                          className="rounded-lg border border-gray-200 max-h-24 w-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
                {!previews.imagen_desktop && (
                  <p className="text-xs text-gray-400 mt-2">
                    Abre el editor para diseñar el banner. Las imágenes se generan al guardar el diseño.
                  </p>
                )}
              </div>
            )}

            {isRevista && (
              <>
                <FileUpload
                  label="Imagen Portada"
                  preview={previews.imagen_portada}
                  onChange={handleFile("imagen_portada")}
                  onClear={clearFile("imagen_portada")}
                />
                <FileUpload
                  label="PDF"
                  accept=".pdf,application/pdf"
                  preview={previews.pdf}
                  onChange={handleFile("pdf")}
                  onClear={clearFile("pdf")}
                />
              </>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isSaving ? "Guardando..." : isEdit ? "Actualizar" : "Crear Banner"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>

      <Suspense fallback={null}>
        <BannerEditorModal
          isOpen={isEditorOpen}
          initialSceneJson={sceneJson}
          onSave={handleEditorSave}
          onClose={() => setIsEditorOpen(false)}
        />
      </Suspense>
    </div>
  );
};

export default BannerForm;
