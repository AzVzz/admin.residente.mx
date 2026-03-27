import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../Context";
import { urlApi, imgApi } from "../../api/url";
import { catalogoNotasGet } from "../../api/notasPublicadasGet";
import { useDebounce } from "../../../hooks/useDebounce";

const NOTAS_MAX = 3;

const NuevaCampana = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  const [form, setForm] = useState({
    nombre: "",
    asunto: "",
    from_name: "Residente",
    logo_texto: "RESIDENTE",
    intro_texto: "",
    footer_texto: "",
    notas: [],
  });

  const [notas, setNotas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [notasFiltradas, setNotasFiltradas] = useState([]);
  const [isLoadingNotas, setIsLoadingNotas] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [correoTest, setCorreoTest] = useState("");
  const [msgTest, setMsgTest] = useState(null);
  const [error, setError] = useState(null);
  const [mostrarBuscador, setMostrarBuscador] = useState(false);
  const [vistaPreview, setVistaPreview] = useState("desktop"); // 'desktop' | 'mobile'
  const [previewHtml, setPreviewHtml] = useState("");

  const debouncedForm = useDebounce(form, 400);

  // Cargar notas
  useEffect(() => {
    setIsLoadingNotas(true);
    catalogoNotasGet(1, 100)
      .then((data) => setNotas(Array.isArray(data) ? data : []))
      .catch(() => setNotas([]))
      .finally(() => setIsLoadingNotas(false));
  }, []);

  // Filtrar notas
  useEffect(() => {
    if (!busqueda.trim()) {
      setNotasFiltradas(notas.slice(0, 20));
      return;
    }
    const q = busqueda.toLowerCase();
    setNotasFiltradas(
      notas.filter(
        (n) =>
          n.titulo?.toLowerCase().includes(q) ||
          n.resumen?.toLowerCase().includes(q) ||
          n.descripcion?.toLowerCase().includes(q)
      ).slice(0, 20)
    );
  }, [busqueda, notas]);

  // Cargar campaña si es edición
  useEffect(() => {
    if (!esEdicion) return;
    fetch(`${urlApi}api/newsletter/campanas/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setForm({
          nombre: data.nombre || "",
          asunto: data.asunto || "",
          from_name: data.from_name || "Residente",
          logo_texto: data.logo_texto || "RESIDENTE",
          intro_texto: data.intro_texto || "",
          footer_texto: data.footer_texto || "",
          notas: (() => {
            let n = data.notas;
            if (typeof n === "string") { try { n = JSON.parse(n); } catch { n = []; } }
            return Array.isArray(n) ? n : [];
          })(),
        });
      })
      .catch(() => setError("Error cargando campaña"));
  }, [id, esEdicion, token]);

  // Preview HTML en tiempo real — fetched desde el backend
  useEffect(() => {
    let cancelled = false;
    fetch(`${urlApi}api/newsletter/campanas/preview-live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logo_texto: debouncedForm.logo_texto,
        intro_texto: debouncedForm.intro_texto,
        footer_texto: debouncedForm.footer_texto,
        notas: debouncedForm.notas,
      }),
    })
      .then((r) => r.text())
      .then((html) => { if (!cancelled) setPreviewHtml(html); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [debouncedForm]);

  const agregarNota = (nota) => {
    if (form.notas.length >= NOTAS_MAX) return;
    if (form.notas.find((n) => String(n.id) === String(nota.id))) return;
    setForm((prev) => ({
      ...prev,
      notas: [
        ...prev.notas,
        {
          id: nota.id,
          titulo: nota.titulo || "",
          descripcion: nota.resumen || nota.descripcion || nota.subtitulo || "",
          imagen: nota.imagen || nota.imagen_mediana || nota.imagen_grande || "",
          slug: nota.slug || "",
        },
      ],
    }));
  };

  const quitarNota = (notaId) => {
    setForm((prev) => ({
      ...prev,
      notas: prev.notas.filter((n) => n.id !== notaId),
    }));
  };

  const guardar = async () => {
    if (!form.nombre || !form.asunto) {
      setError("El nombre y el asunto son obligatorios");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const url = esEdicion
        ? `${urlApi}api/newsletter/campanas/${id}`
        : `${urlApi}api/newsletter/campanas`;
      const method = esEdicion ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error guardando");
      if (!esEdicion) {
        navigate(`/correos/editar/${data.id}`);
      } else {
        navigate("/correos");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const enviarTest = async () => {
    if (!correoTest) return;
    setMsgTest(null);
    try {
      const saveUrl = esEdicion
        ? `${urlApi}api/newsletter/campanas/${id}`
        : `${urlApi}api/newsletter/campanas`;
      const saveRes = await fetch(saveUrl, {
        method: esEdicion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const saved = await saveRes.json();
      if (!saveRes.ok) throw new Error(saved.error || "Error guardando");
      const campanaId = saved.id || id;

      const res = await fetch(`${urlApi}api/newsletter/campanas/${campanaId}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ correo: correoTest }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error enviando test");
      setMsgTest({ ok: true, msg: `Test enviado a ${correoTest}` });
      if (!esEdicion) navigate(`/correos/editar/${campanaId}`);
    } catch (err) {
      setMsgTest({ ok: false, msg: err.message });
    }
  };

  const enviarCampana = async () => {
    if (!confirm("¿Enviar esta campaña a toda la audiencia?")) return;
    setIsSending(true);
    setError(null);
    try {
      // Guardar cambios antes de enviar para que el asunto/contenido esté actualizado
      const saveRes = await fetch(`${urlApi}api/newsletter/campanas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!saveRes.ok) {
        const d = await saveRes.json();
        throw new Error(d.error || "Error guardando antes de enviar");
      }

      const res = await fetch(`${urlApi}api/newsletter/campanas/${id}/enviar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error enviando");
      alert(data.modo_prueba ? `MODO PRUEBA: enviado a ${data.correo_prueba}` : "Campaña enviada correctamente");
      navigate("/correos");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const idsSeleccionados = new Set(form.notas.map((n) => n.id));

  return (
    <div className="max-w-[1280px] mx-auto py-6 px-4">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/correos")} className="text-gray-500 hover:text-black text-sm">
          ← Volver
        </button>
        <h1 className="text-xl font-bold">{esEdicion ? "Editar campaña" : "Nueva campaña"}</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4 text-sm">{error}</div>
      )}

      {/* Layout: izquierda=formulario, derecha=preview */}
      <div className="flex gap-6 items-start">

        {/* ── Panel izquierdo ─────────────────────────────────── */}
        <div className="w-[380px] shrink-0 space-y-3">

          {/* Campos básicos */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Título del correo (encabezado)</label>
            <input
              type="text"
              value={form.logo_texto}
              onChange={(e) => setForm((p) => ({ ...p, logo_texto: e.target.value }))}
              placeholder="Ej: RESIDENTE"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Nombre interno *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Ej: Newsletter Marzo 2026"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Nombre del remitente</label>
            <input
              type="text"
              value={form.from_name}
              onChange={(e) => setForm((p) => ({ ...p, from_name: e.target.value }))}
              placeholder="Ej: Residente Newsletter"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">Aparece en el campo "De:" del correo recibido</p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Asunto del correo *</label>
            <input
              type="text"
              value={form.asunto}
              onChange={(e) => setForm((p) => ({ ...p, asunto: e.target.value }))}
              placeholder="Ej: Las mejores notas de la semana"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Texto introductorio</label>
            <textarea
              value={form.intro_texto}
              onChange={(e) => setForm((p) => ({ ...p, intro_texto: e.target.value }))}
              rows={3}
              placeholder="Texto que aparece arriba de las notas"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Texto de cierre</label>
            <textarea
              value={form.footer_texto}
              onChange={(e) => setForm((p) => ({ ...p, footer_texto: e.target.value }))}
              rows={2}
              placeholder="Texto al final del correo"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none"
            />
          </div>

          {/* Notas seleccionadas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Notas ({form.notas.length}/{NOTAS_MAX})
              </label>
              <button
                onClick={() => setMostrarBuscador((v) => !v)}
                className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                {mostrarBuscador ? "Cerrar buscador" : "+ Agregar nota"}
              </button>
            </div>

            {form.notas.length === 0 && (
              <p className="text-xs text-gray-400 italic">Sin notas seleccionadas</p>
            )}

            <div className="space-y-2">
              {form.notas.map((nota, idx) => (
                <div key={nota.id} className="flex items-center gap-2 border border-gray-200 rounded-lg p-2">
                  <span className="text-xs text-gray-400 font-bold w-4">{idx + 1}</span>
                  {nota.imagen && (
                    <img
                      src={nota.imagen.startsWith("http") ? nota.imagen : `${imgApi}fotos/${nota.imagen}`}
                      alt={nota.titulo}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{nota.titulo}</p>
                    <p className="text-xs text-gray-400 truncate">
                      residente.mx/notas/{nota.slug}
                    </p>
                  </div>
                  <button
                    onClick={() => quitarNota(nota.id)}
                    className="text-red-400 hover:text-red-600 text-xs shrink-0 ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Buscador de notas (colapsable) */}
          {mostrarBuscador && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar nota..."
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500 mb-2 bg-white"
                autoFocus
              />
              {isLoadingNotas && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-400" />
                </div>
              )}
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                {notasFiltradas.map((nota) => {
                  const sel = idsSeleccionados.has(nota.id);
                  const lleno = form.notas.length >= NOTAS_MAX;
                  return (
                    <div
                      key={nota.id}
                      onClick={() => !sel && !lleno && agregarNota(nota)}
                      className={`flex items-center gap-2 border rounded p-1.5 transition-colors cursor-pointer text-sm ${
                        sel ? "border-yellow-400 bg-yellow-50" : lleno ? "opacity-40 cursor-not-allowed border-gray-100" : "border-gray-200 hover:border-gray-400 bg-white"
                      }`}
                    >
                      {nota.imagen && (
                        <img
                          src={nota.imagen.startsWith("http") ? nota.imagen : `${imgApi}fotos/${nota.imagen}`}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      )}
                      <span className="truncate flex-1">{nota.titulo}</span>
                      <span className="shrink-0 text-gray-400">{sel ? "✓" : "+"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={guardar}
              disabled={isSaving}
              className="bg-[#FFF200] text-black font-bold px-4 py-2 rounded hover:opacity-80 transition-opacity text-sm disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : esEdicion ? "Guardar cambios" : "Guardar borrador"}
            </button>
            {esEdicion && (
              <button
                onClick={enviarCampana}
                disabled={isSending}
                className="bg-green-600 text-white font-bold px-4 py-2 rounded hover:opacity-80 transition-opacity text-sm disabled:opacity-50"
              >
                {isSending ? "Enviando..." : "Enviar campaña"}
              </button>
            )}
          </div>

          {/* Envío de test */}
          {esEdicion && (
            <div className="border border-gray-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Enviar test</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={correoTest}
                  onChange={(e) => setCorreoTest(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500"
                />
                <button
                  onClick={enviarTest}
                  className="border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors"
                >
                  Enviar
                </button>
              </div>
              {msgTest && (
                <p className={`text-xs ${msgTest.ok ? "text-green-600" : "text-red-500"}`}>{msgTest.msg}</p>
              )}
            </div>
          )}
        </div>

        {/* ── Panel derecho: Preview en vivo ──────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Preview en vivo</p>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setVistaPreview("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  vistaPreview === "desktop" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2"/><path strokeLinecap="round" strokeWidth="2" d="M8 21h8M12 17v4"/></svg>
                Desktop
              </button>
              <button
                onClick={() => setVistaPreview("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  vistaPreview === "mobile" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg className="w-3 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>
                Mobile
              </button>
            </div>
          </div>

          <div className={`flex justify-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all`}
            style={{ minHeight: "85vh" }}
          >
            <div
              className="bg-white transition-all duration-300 overflow-hidden"
              style={{
                width: vistaPreview === "mobile" ? "375px" : "100%",
                maxWidth: vistaPreview === "desktop" ? "680px" : "375px",
                boxShadow: vistaPreview === "mobile" ? "0 0 0 8px #1f2937, 0 0 0 10px #374151" : "none",
                borderRadius: vistaPreview === "mobile" ? "24px" : "0",
                margin: vistaPreview === "mobile" ? "24px auto" : "0",
              }}
            >
              <iframe
                srcDoc={previewHtml}
                title="Email preview"
                className="w-full border-none block"
                style={{
                  height: vistaPreview === "mobile" ? "calc(85vh - 80px)" : "85vh",
                  minHeight: "600px",
                  borderRadius: vistaPreview === "mobile" ? "20px" : "0",
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NuevaCampana;
