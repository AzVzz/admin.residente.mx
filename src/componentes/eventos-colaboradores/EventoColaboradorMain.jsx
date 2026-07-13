import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../Context";
import {
  eventoColaboradorCrear,
  eventoColaboradorEditar,
  eventoColaboradorGet,
  eventoColaboradorBorrar,
} from "../api/eventosColaboradoresApi";

// Estilos alineados al editor de notas (FormMainResidente)
const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 outline-none";
const textareaClass = `${inputClass} resize-none`;
const labelClass = "block text-sm font-medium text-gray-700";
const cardClass = "mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg";
const cardTitleClass = "text-lg font-bold text-gray-800 mb-4";
const hintClass = "text-xs text-gray-500 mt-1";
const opcional = <span className="text-gray-400 font-normal text-xs">(opcional)</span>;

const contarPalabras = (texto) =>
  texto?.trim() ? texto.trim().split(/\s+/).length : 0;

const aLineas = (texto) =>
  (texto || "")
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

const ESTADO_INICIAL = {
  nombre_organizador: "",
  titulo: "",
  pais_origen: "",
  ciudad_origen: "",
  disciplina: "",
  duracion: "",
  publico_objetivo: "",
  idioma: "",
  fecha_inicio_evento: "",
  fecha_fin_evento: "",
  lugar_evento: "",
  quien_es: "",
  descripcion: "",
  por_que_festival: "",
  dd_anio_fundacion: "",
  dd_anio_estreno: "",
  dd_integrantes: "",
  dd_funciones: "",
  dd_paises: "",
  dd_premios: "",
  dd_festivales: "",
  datos_curiosos: "",
  red_sitio_web: "",
  red_instagram: "",
  red_facebook: "",
  red_youtube: "",
  red_tiktok: "",
  foto_credito: "",
  foto_derechos: false,
  email_contacto: "",
  activo_manual: true,
};

const EventoColaboradorMain = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = !!id;

  const [f, setF] = useState(ESTADO_INICIAL);
  const [imagenBase64, setImagenBase64] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(esEdicion);
  const [isPosting, setIsPosting] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (!esEdicion) return;
    eventoColaboradorGet(id)
      .then((evento) => {
        const ficha = evento.ficha || {};
        const dd = ficha.datos_destacados || {};
        const redes = ficha.redes || {};
        const foto = ficha.foto || {};
        setF({
          nombre_organizador: evento.nombre_organizador || "",
          titulo: evento.titulo || "",
          pais_origen: ficha.pais_origen || "",
          ciudad_origen: ficha.ciudad_origen || "",
          disciplina: ficha.disciplina || "",
          duracion: ficha.duracion || "",
          publico_objetivo: ficha.publico_objetivo || "",
          idioma: ficha.idioma || "",
          fecha_inicio_evento: evento.fecha_inicio_evento ? evento.fecha_inicio_evento.slice(0, 10) : "",
          fecha_fin_evento: evento.fecha_fin_evento ? evento.fecha_fin_evento.slice(0, 10) : "",
          lugar_evento: evento.lugar_evento || "",
          quien_es: ficha.quien_es || "",
          descripcion: evento.descripcion || "",
          por_que_festival: (ficha.por_que_festival || []).join("\n"),
          dd_anio_fundacion: dd.anio_fundacion || "",
          dd_anio_estreno: dd.anio_estreno || "",
          dd_integrantes: dd.integrantes_escena || "",
          dd_funciones: dd.funciones_realizadas || "",
          dd_paises: dd.paises_presentado || "",
          dd_premios: dd.premios || "",
          dd_festivales: dd.festivales || "",
          datos_curiosos: (ficha.datos_curiosos || []).join("\n"),
          red_sitio_web: redes.sitio_web || evento.link_boletos || "",
          red_instagram: redes.instagram || "",
          red_facebook: redes.facebook || "",
          red_youtube: redes.youtube || "",
          red_tiktok: redes.tiktok || "",
          foto_credito: foto.credito || "",
          foto_derechos: !!foto.derechos_autorizados,
          email_contacto: evento.email_contacto || "",
          activo_manual: evento.activo_manual ?? true,
        });
        setImagenPreview(evento.imagen_url || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, esEdicion]);

  const set = (campo, valor) => setF((prev) => ({ ...prev, [campo]: valor }));

  const procesarImagen = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 1200;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.82);
        setImagenBase64(base64);
        setImagenPreview(base64);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    procesarImagen(e.dataTransfer.files?.[0]);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError(null);

    if (!f.titulo.trim()) return setError("El título es obligatorio.");
    if (!f.fecha_inicio_evento) return setError("La fecha de inicio es obligatoria.");
    if (contarPalabras(f.quien_es) > 180) return setError("La semblanza (¿Quién es?) supera las 180 palabras.");
    if (contarPalabras(f.descripcion) > 180) return setError("El texto Sobre el evento supera las 180 palabras.");

    const puntos = aLineas(f.por_que_festival);
    if (puntos.length > 5) return setError("¿Por qué es especial? admite máximo 5 puntos.");
    const curiosos = aLineas(f.datos_curiosos);
    if (curiosos.length > 3) return setError("Datos curiosos admite máximo 3 datos.");

    const ficha = {
      pais_origen: f.pais_origen.trim() || null,
      ciudad_origen: f.ciudad_origen.trim() || null,
      disciplina: f.disciplina.trim() || null,
      duracion: f.duracion.trim() || null,
      publico_objetivo: f.publico_objetivo.trim() || null,
      idioma: f.idioma.trim() || null,
      quien_es: f.quien_es.trim() || null,
      por_que_festival: puntos,
      datos_destacados: {
        anio_fundacion: f.dd_anio_fundacion.trim() || null,
        anio_estreno: f.dd_anio_estreno.trim() || null,
        integrantes_escena: f.dd_integrantes.trim() || null,
        paises_presentado: f.dd_paises.trim() || null,
        funciones_realizadas: f.dd_funciones.trim() || null,
        premios: f.dd_premios.trim() || null,
        festivales: f.dd_festivales.trim() || null,
      },
      datos_curiosos: curiosos,
      redes: {
        sitio_web: f.red_sitio_web.trim() || null,
        instagram: f.red_instagram.trim() || null,
        facebook: f.red_facebook.trim() || null,
        youtube: f.red_youtube.trim() || null,
        tiktok: f.red_tiktok.trim() || null,
      },
      foto: {
        credito: f.foto_credito.trim() || null,
        derechos_autorizados: f.foto_derechos,
      },
    };

    const payload = {
      nombre_organizador: f.nombre_organizador.trim() || null,
      titulo: f.titulo.trim(),
      fecha_inicio_evento: f.fecha_inicio_evento,
      fecha_fin_evento: f.fecha_fin_evento || null,
      email_contacto: f.email_contacto.trim() || null,
      descripcion: f.descripcion.trim() || null,
      lugar_evento: f.lugar_evento.trim() || null,
      link_boletos: f.red_sitio_web.trim() || null,
      activo_manual: f.activo_manual,
      ficha,
    };
    if (imagenBase64) payload.imagen_base64 = imagenBase64;

    setIsPosting(true);
    try {
      if (esEdicion) {
        await eventoColaboradorEditar(id, payload, token);
        navigate("/dashboard-eventos-colab");
      } else {
        await eventoColaboradorCrear(payload, token);
        setExito(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setError(err.message || "Error al guardar el evento");
    } finally {
      setIsPosting(false);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar este evento?")) return;
    setEliminando(true);
    try {
      await eventoColaboradorBorrar(id, token);
      navigate("/dashboard-eventos-colab");
    } catch (err) {
      setError(err.message || "Error al eliminar el evento");
      setEliminando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (exito) {
    return (
      <div className="py-16 text-center max-w-[900px] mx-auto">
        <p className="text-5xl mb-4">🎫</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Evento guardado!</h2>
        <p className="text-gray-600 mb-8">El evento ya aparece en tu dashboard.</p>
        <button
          onClick={() => navigate("/dashboard-eventos-colab")}
          className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Ver mis eventos →
        </button>
      </div>
    );
  }

  const palabrasQuienEs = contarPalabras(f.quien_es);
  const palabrasDesc = contarPalabras(f.descripcion);
  const lineasPorQue = aLineas(f.por_que_festival).length;
  const lineasCuriosos = aLineas(f.datos_curiosos).length;

  const campo = (label, name, extra = {}) => (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type={extra.type || "text"}
        inputMode={extra.inputMode}
        value={f[name]}
        onChange={(e) => set(name, e.target.value)}
        className={inputClass}
      />
    </div>
  );

  return (
    <div className="py-8">
      <div className="mx-auto max-w-[900px]">
        {/* Header centrado */}
        <div className="mb-6 text-center">
          <h1 className="leading-tight text-2xl font-bold">
            {esEdicion ? "Editar evento" : "Nuevo evento"}
          </h1>
          <p className="text-gray-600 mt-2">
            {esEdicion
              ? "Edita la información de tu evento"
              : "Crea un nuevo evento completando los siguientes campos. Los campos con * son obligatorios."}
          </p>
        </div>

        <form onSubmit={handleGuardar}>
          {/* INFORMACIÓN GENERAL */}
          <div className={cardClass}>
            <h3 className={cardTitleClass}>Información general</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelClass}>Nombre del organizador o artista</label>
                <input type="text" value={f.nombre_organizador} onChange={(e) => set("nombre_organizador", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nombre del evento *</label>
                <input type="text" value={f.titulo} onChange={(e) => set("titulo", e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {campo("País de origen", "pais_origen")}
                {campo("Ciudad de origen", "ciudad_origen")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {campo("Tipo / disciplina", "disciplina")}
                {campo("Duración", "duracion")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {campo("Público objetivo", "publico_objetivo")}
                {campo("Idioma", "idioma")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Fecha de presentación *</label>
                  <input type="date" value={f.fecha_inicio_evento} onChange={(e) => set("fecha_inicio_evento", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Última función {opcional}</label>
                  <input type="date" value={f.fecha_fin_evento} onChange={(e) => set("fecha_fin_evento", e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Sede(s)</label>
                <input type="text" value={f.lugar_evento} onChange={(e) => set("lugar_evento", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* ¿QUIÉN ES? */}
          <div className={cardClass}>
            <h3 className={cardTitleClass}>¿Quién es?</h3>
            <label className={labelClass}>Semblanza del organizador o artista {opcional}</label>
            <textarea rows={5} value={f.quien_es} onChange={(e) => set("quien_es", e.target.value)} className={textareaClass} />
            <p className={hintClass}>
              <span className={palabrasQuienEs > 180 ? "text-red-600 font-bold" : ""}>{palabrasQuienEs}</span>/180 palabras
            </p>
          </div>

          {/* SOBRE EL EVENTO */}
          <div className={cardClass}>
            <h3 className={cardTitleClass}>Sobre el evento</h3>
            <label className={labelClass}>¿De qué trata? {opcional}</label>
            <textarea rows={5} value={f.descripcion} onChange={(e) => set("descripcion", e.target.value)} className={textareaClass} />
            <p className={hintClass}>
              <span className={palabrasDesc > 180 ? "text-red-600 font-bold" : ""}>{palabrasDesc}</span>/180 palabras
            </p>
          </div>

          {/* ¿POR QUÉ ES ESPECIAL? */}
          <div className={cardClass}>
            <h3 className={cardTitleClass}>¿Por qué es especial?</h3>
            <label className={labelClass}>Un punto por línea (máximo 5) {opcional}</label>
            <textarea rows={5} value={f.por_que_festival} onChange={(e) => set("por_que_festival", e.target.value)} className={textareaClass} />
            <p className={hintClass}>
              <span className={lineasPorQue > 5 ? "text-red-600 font-bold" : ""}>{lineasPorQue}</span>/5 puntos
            </p>
          </div>

          {/* DATOS DESTACADOS */}
          <div className={cardClass}>
            <h3 className={cardTitleClass}>Datos destacados</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                {campo("Año de fundación", "dd_anio_fundacion", { inputMode: "numeric" })}
                {campo("Año de estreno", "dd_anio_estreno", { inputMode: "numeric" })}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {campo("Integrantes en escena", "dd_integrantes", { inputMode: "numeric" })}
                {campo("Funciones realizadas (aprox.)", "dd_funciones", { inputMode: "numeric" })}
              </div>
              <div>
                <label className={labelClass}>Lugares donde se ha presentado</label>
                <input type="text" value={f.dd_paises} onChange={(e) => set("dd_paises", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Premios o reconocimientos relevantes</label>
                <textarea rows={2} value={f.dd_premios} onChange={(e) => set("dd_premios", e.target.value)} className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Festivales o eventos destacados donde se ha presentado</label>
                <textarea rows={2} value={f.dd_festivales} onChange={(e) => set("dd_festivales", e.target.value)} className={textareaClass} />
              </div>
            </div>
          </div>

          {/* DATOS CURIOSOS */}
          <div className={cardClass}>
            <h3 className={cardTitleClass}>Datos curiosos</h3>
            <label className={labelClass}>Un dato por línea (máximo 3) {opcional}</label>
            <textarea rows={3} value={f.datos_curiosos} onChange={(e) => set("datos_curiosos", e.target.value)} className={textareaClass} />
            <p className={hintClass}>
              <span className={lineasCuriosos > 3 ? "text-red-600 font-bold" : ""}>{lineasCuriosos}</span>/3 datos
            </p>
          </div>

          {/* REDES SOCIALES */}
          <div className={cardClass}>
            <h3 className={cardTitleClass}>Redes sociales oficiales</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelClass}>🔗 Sitio web / boletos</label>
                <input type="url" value={f.red_sitio_web} onChange={(e) => set("red_sitio_web", e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {campo("Instagram", "red_instagram")}
                {campo("Facebook", "red_facebook")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {campo("YouTube", "red_youtube")}
                {campo("TikTok", "red_tiktok")}
              </div>
            </div>
          </div>

          {/* FOTOGRAFÍA OFICIAL */}
          <div className={cardClass}>
            <h3 className={cardTitleClass}>Fotografía oficial</h3>
            <label
              htmlFor="imagen-input"
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer transition-colors relative overflow-hidden group ${
                dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50"
              }`}
            >
              {imagenPreview ? (
                <>
                  <img src={imagenPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute bottom-3 right-3 bg-black text-white text-xs font-bold px-3 py-1.5 rounded">Cambiar</div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center gap-2 px-6">
                  <span className="text-4xl group-hover:scale-110 transition-transform">📸</span>
                  <span className="text-sm font-semibold text-gray-600">Arrastra o haz clic para subir la fotografía</span>
                  <span className="text-xs text-gray-400">JPG, PNG — alta resolución</span>
                </div>
              )}
            </label>
            <input id="imagen-input" type="file" accept="image/*" className="hidden" onChange={(e) => procesarImagen(e.target.files?.[0])} />
            <div className="mt-4">
              <label className={labelClass}>Crédito del fotógrafo</label>
              <input type="text" value={f.foto_credito} onChange={(e) => set("foto_credito", e.target.value)} className={inputClass} />
            </div>
            <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-700 mt-3">
              <input type="checkbox" checked={f.foto_derechos} onChange={(e) => set("foto_derechos", e.target.checked)} className="form-checkbox h-4 w-4 mt-0.5 text-indigo-600" />
              <span>Los derechos de uso de esta fotografía están autorizados para su difusión.</span>
            </label>
          </div>

          {/* CONTACTO */}
          <div className={cardClass}>
            <h3 className={cardTitleClass}>Contacto</h3>
            <label className={labelClass}>
              Email de contacto <span className="text-gray-400 font-normal text-xs">(no se publica)</span>
            </label>
            <input type="email" value={f.email_contacto} onChange={(e) => set("email_contacto", e.target.value)} className={inputClass} />
          </div>

          {/* PUBLICACIÓN */}
          <div className={cardClass}>
            <h3 className={cardTitleClass}>Publicación</h3>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={f.activo_manual}
                onChange={(e) => set("activo_manual", e.target.checked)}
                className="form-checkbox h-5 w-5 text-indigo-600"
              />
              <span className="ml-2 text-gray-700 font-medium">
                Evento activo (visible en el sitio)
              </span>
            </label>
          </div>

          {/* Eliminar evento (solo edición) */}
          {esEdicion && (
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={handleEliminar}
                disabled={eliminando}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  eliminando ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                }`}
              >
                {eliminando ? "Eliminando..." : "Eliminar evento"}
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard-eventos-colab")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPosting}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPosting ? "Guardando..." : esEdicion ? "Guardar cambios" : "Guardar evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventoColaboradorMain;
