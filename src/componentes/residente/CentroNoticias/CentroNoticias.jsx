import React, { useState, useRef } from "react";
import { centroNoticiasEnviar } from "../../api/centroNoticiasPost";

/**
 * Centro de Noticias — formulario PÚBLICO (sin login).
 *
 * Cualquier persona puede enviar una noticia sobre su negocio. Un código de
 * acceso protege el envío contra bots/spam. La noticia entra como borrador y un
 * editor la revisa en el dashboard antes de publicarla.
 *
 * Campos (brief editorial): nombre, categoría, situación, datos duros,
 * justificación, material visual (imagen y/o enlace), fecha de publicación y
 * contacto (nombre + teléfono). El contacto y la fecha son datos internos.
 */

const CATEGORIAS = [
  { value: "apertura", label: "Apertura" },
  { value: "cambio_menu", label: "Cambio de menú" },
  { value: "evento", label: "Evento" },
  { value: "premio", label: "Premio o reconocimiento" },
  { value: "aniversario", label: "Aniversario" },
  { value: "cambio_chef", label: "Cambio de chef" },
  { value: "remodelacion", label: "Remodelación" },
  { value: "otro", label: "Otro" },
];

const ESTADO_INICIAL = {
  nombre: "",
  categoria: "",
  situacion: "",
  datosDuros: "",
  justificacion: "",
  materialLink: "",
  fechaPublicacion: "",
  contactoNombre: "",
  contactoTelefono: "",
  codigo: "",
};

const CentroNoticias = () => {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (JPG, PNG o WEBP).");
      return;
    }
    setError("");
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const resetear = () => {
    setForm(ESTADO_INICIAL);
    setImagen(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.nombre.trim() ||
      !form.categoria ||
      !form.situacion.trim() ||
      !form.justificacion.trim() ||
      !form.contactoNombre.trim() ||
      !form.contactoTelefono.trim() ||
      !form.codigo.trim()
    ) {
      setError(
        "Completa los campos obligatorios (marcados con *): nombre, categoría, situación, justificación, contacto y código.",
      );
      return;
    }
    if (!imagen && !form.materialLink.trim()) {
      setError(
        "Adjunta una imagen o comparte el enlace del material visual (fotos/logo).",
      );
      return;
    }

    setLoading(true);
    try {
      await centroNoticiasEnviar({
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        situacion: form.situacion.trim(),
        datosDuros: form.datosDuros.trim(),
        justificacion: form.justificacion.trim(),
        fechaPublicacion: form.fechaPublicacion.trim(),
        contactoNombre: form.contactoNombre.trim(),
        contactoTelefono: form.contactoTelefono.trim(),
        materialLink: form.materialLink.trim(),
        codigo: form.codigo.trim(),
        imagen,
      });
      setExito(true);
      resetear();
    } catch (err) {
      setError(err.message || "Ocurrió un error al enviar la noticia.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-black/15 px-4 py-2.5 focus:border-black focus:outline-none focus:ring-2 focus:ring-[#FFF200]";

  // ── Pantalla de éxito ──
  if (exito) {
    return (
      <div className="max-w-[680px] mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-black/10 p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF200]">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">¡Noticia enviada!</h1>
          <p className="text-black/70 mb-8">
            Gracias por tu colaboración. Tu noticia quedó pendiente de revisión y
            será publicada una vez que nuestro equipo editorial la apruebe.
          </p>
          <button
            type="button"
            onClick={() => setExito(false)}
            className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-white font-semibold hover:bg-black/80 transition-colors cursor-pointer"
          >
            Enviar otra noticia
          </button>
        </div>
      </div>
    );
  }

  // ── Formulario ──
  return (
    <div className="max-w-[680px] mx-auto py-10 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-[70px] font-bold mb-2">Centro de Noticias</h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-black/10 p-6 sm:p-8 flex flex-col gap-5"
      >
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-semibold mb-1.5">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            maxLength={255}
            placeholder="Nombre o marca de tu negocio, tal como quieres que aparezca en la noticia"
            className={inputCls}
          />
        </div>

        {/* Categoría */}
        <div>
          <label
            htmlFor="categoria"
            className="block text-sm font-semibold mb-1.5"
          >
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            id="categoria"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className={`${inputCls} bg-white`}
          >
            <option value="">Selecciona el tipo de novedad…</option>
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Situación */}
        <div>
          <label
            htmlFor="situacion"
            className="block text-sm font-semibold mb-1.5"
          >
            Situación <span className="text-red-500">*</span>
          </label>
          <textarea
            id="situacion"
            name="situacion"
            value={form.situacion}
            onChange={handleChange}
            rows={5}
            placeholder="Describe la novedad que quieres comunicar sobre tu negocio."
            className={`${inputCls} resize-y`}
          />
        </div>

        {/* Datos duros */}
        <div>
          <label
            htmlFor="datosDuros"
            className="block text-sm font-semibold mb-1.5"
          >
            Datos duros{" "}
            <span className="text-black/40 font-normal">(opcional)</span>
          </label>
          <textarea
            id="datosDuros"
            name="datosDuros"
            value={form.datosDuros}
            onChange={handleChange}
            rows={4}
            placeholder="Datos específicos que apliquen: fecha, hora, dirección, protagonistas."
            className={`${inputCls} resize-y`}
          />
        </div>

        {/* Justificación */}
        <div>
          <label
            htmlFor="justificacion"
            className="block text-sm font-semibold mb-1.5"
          >
            Justificación <span className="text-red-500">*</span>
          </label>
          <textarea
            id="justificacion"
            name="justificacion"
            value={form.justificacion}
            onChange={handleChange}
            rows={4}
            placeholder="Explica por qué esta novedad es relevante para el público."
            className={`${inputCls} resize-y`}
          />
        </div>

        {/* Material visual — imagen */}
        <div>
          <label htmlFor="imagen" className="block text-sm font-semibold mb-1.5">
            Material visual — imagen
          </label>
          <input
            id="imagen"
            ref={fileInputRef}
            name="imagen"
            type="file"
            accept="image/*"
            onChange={handleImagen}
            className="w-full text-sm text-black/70 file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-black/80"
          />
          {preview && (
            <img
              src={preview}
              alt="Vista previa"
              className="mt-3 max-h-56 w-auto rounded-lg border border-black/10 object-contain"
            />
          )}
        </div>

        {/* Material visual — enlace */}
        <div>
          <label
            htmlFor="materialLink"
            className="block text-sm font-semibold mb-1.5"
          >
            Material visual — enlace{" "}
            <span className="text-black/40 font-normal">
              (si no adjuntas imagen)
            </span>
          </label>
          <input
            id="materialLink"
            name="materialLink"
            type="text"
            value={form.materialLink}
            onChange={handleChange}
            placeholder="Enlace de fotos o logo en alta resolución (Drive, WeTransfer, etc.)"
            className={inputCls}
          />
          <p className="mt-1.5 text-xs text-black/50">
            Adjunta una imagen o comparte un enlace. Al menos uno es obligatorio.
          </p>
        </div>

        {/* Fecha de publicación */}
        <div>
          <label
            htmlFor="fechaPublicacion"
            className="block text-sm font-semibold mb-1.5"
          >
            Fecha de publicación{" "}
            <span className="text-black/40 font-normal">(opcional)</span>
          </label>
          <input
            id="fechaPublicacion"
            name="fechaPublicacion"
            type="date"
            value={form.fechaPublicacion}
            onChange={handleChange}
            className={inputCls}
          />
          <p className="mt-1.5 text-xs text-black/50">
            Fecha en la que prefieres que se publique la noticia (sujeta a
            revisión editorial).
          </p>
        </div>

        {/* Contacto */}
        <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm font-semibold mb-1">
            Contacto <span className="text-red-500">*</span>
          </p>
          <p className="text-xs text-black/50 mb-3">
            Persona que pueda ampliar la información. Es un dato interno, no se
            publica.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              id="contactoNombre"
              name="contactoNombre"
              type="text"
              value={form.contactoNombre}
              onChange={handleChange}
              maxLength={120}
              placeholder="Nombre"
              className={inputCls}
            />
            <input
              id="contactoTelefono"
              name="contactoTelefono"
              type="tel"
              value={form.contactoTelefono}
              onChange={handleChange}
              maxLength={30}
              placeholder="Teléfono directo"
              className={inputCls}
            />
          </div>
        </div>

        {/* Código de acceso */}
        <div>
          <label htmlFor="codigo" className="block text-sm font-semibold mb-1.5">
            Código de acceso <span className="text-red-500">*</span>
          </label>
          <input
            id="codigo"
            name="codigo"
            type="text"
            value={form.codigo}
            onChange={handleChange}
            autoComplete="off"
            placeholder="Ingresa el código proporcionado"
            className={inputCls}
          />
          <p className="mt-1.5 text-xs text-black/50">
            El código evita el envío de spam. Solicítalo con el equipo de
            Residente.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Enviar */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-[#FFF200] px-6 py-3 font-bold text-black hover:brightness-95 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Enviando…" : "Enviar noticia"}
        </button>
      </form>
    </div>
  );
};

export default CentroNoticias;
