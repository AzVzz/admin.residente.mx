import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../Context";
import { urlApi, imgApi } from "../../api/url";
import { catalogoNotasGet } from "../../api/notasPublicadasGet";
import { useDebounce } from "../../../hooks/useDebounce";

const BLOQUES_MAX = 8;

// ── Iconos SVG ───────────────────────────────────────────────────────────────

const IconDrag = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" className="shrink-0">
    <circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/>
    <circle cx="2" cy="7" r="1.5"/><circle cx="8" cy="7" r="1.5"/>
    <circle cx="2" cy="12" r="1.5"/><circle cx="8" cy="12" r="1.5"/>
  </svg>
);

const IconChevronUp = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
    <path d="m18 15-6-6-6 6"/>
  </svg>
);

const IconChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const IconClose = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const IconCheck = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

const IconPlus = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const IconRestaurant = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);

const IconTicket = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2M13 17v2M13 11v2"/>
  </svg>
);

// ── Helpers ─────────────────────────────────────────────────────────────────

function moverBloqueA(arr, from, to) {
  if (from === to || to < 0 || to >= arr.length) return arr;
  const copia = [...arr];
  const [item] = copia.splice(from, 1);
  copia.splice(to, 0, item);
  return copia;
}

// ── Componente: Bloque Nota ──────────────────────────────────────────────────

const BloqueNota = ({ bloque, idx, total, onChange, onQuitar }) => {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 cursor-grab active:cursor-grabbing select-none">
        <span className="text-gray-300"><IconDrag /></span>
        <span className="text-xs text-gray-400 font-bold w-4 shrink-0">{idx + 1}</span>
        {bloque.imagen && (
          <img
            src={bloque.imagen.startsWith("http") ? bloque.imagen : `${imgApi}fotos/${bloque.imagen}`}
            alt=""
            className="w-8 h-8 rounded-full object-cover shrink-0"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
        <span className="flex-1 text-xs font-medium truncate">{bloque.titulo}</span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onChange(idx, "tipo", bloque.tipo === "principal" ? "secundaria" : "principal")}
          className={`text-xs px-2 py-0.5 rounded font-semibold shrink-0 ${
            bloque.tipo === "principal" ? "bg-black text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {bloque.tipo === "principal" ? "Principal" : "Secundaria"}
        </button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setExpandido((v) => !v)} className="text-gray-400 hover:text-black p-1">{expandido ? <IconChevronUp /> : <IconChevronDown />}</button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onQuitar(bloque.id)} className="text-red-400 hover:text-red-600 p-1 ml-1"><IconClose /></button>
      </div>

      {expandido && (
        <div className="px-3 py-3 space-y-2 border-t border-gray-100 bg-white">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Etiqueta (opcional)</label>
              <input type="text" value={bloque.etiqueta || ""} onChange={(e) => onChange(idx, "etiqueta", e.target.value)}
                placeholder="Lo que está pasando"
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Texto del CTA</label>
              <input type="text" value={bloque.cta_texto || ""} onChange={(e) => onChange(idx, "cta_texto", e.target.value)}
                placeholder={bloque.tipo === "principal" ? "Leer la nota" : "Leer más"}
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={bloque.mostrar_imagen !== false} onChange={(e) => onChange(idx, "mostrar_imagen", e.target.checked)} className="rounded" />
            Mostrar imagen circular
          </label>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Descripción (override)</label>
            <textarea value={bloque.descripcion || ""} onChange={(e) => onChange(idx, "descripcion", e.target.value)}
              rows={2} placeholder="Dejar vacío para usar la descripción de la nota"
              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400 resize-none" />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Componente: Bloque Restaurantes ─────────────────────────────────────────

const BloqueRestaurantes = ({ bloque, idx, onChange, onQuitar, token }) => {
  const [expandido, setExpandido] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [todos, setTodos] = useState([]);
  const [cargados, setCargados] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!expandido || cargados) return;
    setCargando(true);
    fetch(`${urlApi}api/restaurante/basicos`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setTodos(Array.isArray(data) ? data : []); setCargados(true); })
      .catch(() => setTodos([]))
      .finally(() => setCargando(false));
  }, [expandido, cargados, token]);

  const idsAgregados = new Set((bloque.items || []).map((i) => i.id));

  const resultados = busqueda.trim()
    ? todos.filter((r) => r.nombre_restaurante?.toLowerCase().includes(busqueda.toLowerCase()) && !idsAgregados.has(r.id)).slice(0, 12)
    : [];

  const agregarItem = async (r) => {
    if (idsAgregados.has(r.id)) return;
    let imagen = "";
    try {
      const res = await fetch(`${urlApi}api/restaurante/${r.slug || r.id}`);
      const detail = await res.json();
      const imgs = detail.imagenes || [];
      imagen = imgs[0]?.src || imgs[0]?.url_imagen || "";
    } catch {}
    const items = [...(bloque.items || []), { id: r.id, nombre: r.nombre_restaurante, slug: r.slug || "", imagen, descripcion: "" }];
    onChange(idx, "items", items);
    setBusqueda("");
  };

  const quitarItem = (id) => onChange(idx, "items", (bloque.items || []).filter((i) => i.id !== id));
  const editarItemDesc = (id, val) => onChange(idx, "items", (bloque.items || []).map((i) => i.id === id ? { ...i, descripcion: val } : i));

  return (
    <div className="border border-blue-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 cursor-grab active:cursor-grabbing select-none">
        <span className="text-blue-200"><IconDrag /></span>
        <span className="text-xs text-blue-400 font-bold w-4 shrink-0">{idx + 1}</span>
        <span className="text-blue-400"><IconRestaurant /></span>
        <span className="flex-1 text-xs font-medium text-blue-900 truncate">{bloque.titulo || "Lista de restaurantes"}</span>
        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded font-semibold shrink-0">Restaurantes</span>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setExpandido((v) => !v)} className="text-blue-400 hover:text-blue-700 p-1">{expandido ? <IconChevronUp /> : <IconChevronDown />}</button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onQuitar(idx)} className="text-red-400 hover:text-red-600 p-1 ml-1"><IconClose /></button>
      </div>

      {expandido && (
        <div className="px-3 py-3 space-y-2 border-t border-blue-100 bg-white">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Título de la sección</label>
            <input type="text" value={bloque.titulo || ""} onChange={(e) => onChange(idx, "titulo", e.target.value)}
              placeholder="Dónde comer en el Valley"
              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
          </div>

          {(bloque.items || []).length > 0 && (
            <div className="space-y-1">
              {(bloque.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                  {item.imagen && (
                    <img src={item.imagen.startsWith("http") ? item.imagen : `${imgApi}fotos/${item.imagen}`} alt=""
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                      onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                  <span className="flex-1 text-xs font-medium truncate">{item.nombre}</span>
                  <input type="text" value={item.descripcion || ""} onChange={(e) => editarItemDesc(item.id, e.target.value)}
                    placeholder="Nota corta (opcional)"
                    className="w-28 border border-gray-200 rounded px-1.5 py-0.5 text-xs focus:outline-none" />
                  <button onClick={() => quitarItem(item.id)} className="text-red-400 hover:text-red-600 text-xs shrink-0">✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              placeholder={cargando ? "Cargando..." : "Buscar restaurante..."}
              disabled={cargando}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 disabled:opacity-50" />
            {busqueda.trim() && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-md mt-1 max-h-40 overflow-y-auto">
                {resultados.map((r) => (
                  <div key={r.id} onClick={() => agregarItem(r)}
                    className="px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                    {r.nombre_restaurante}
                  </div>
                ))}
                {resultados.length === 0 && <div className="px-3 py-2 text-xs text-gray-400">Sin resultados</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Componente: Bloque Cupones ───────────────────────────────────────────────

const BloqueCupones = ({ bloque, idx, onChange, onQuitar }) => {
  const [expandido, setExpandido] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [todos, setTodos] = useState([]);
  const [cargados, setCargados] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!expandido || cargados) return;
    setCargando(true);
    fetch(`${urlApi}api/tickets/`)
      .then((r) => r.json())
      .then((data) => { setTodos(Array.isArray(data) ? data : []); setCargados(true); })
      .catch(() => setTodos([]))
      .finally(() => setCargando(false));
  }, [expandido, cargados]);

  const idsAgregados = new Set((bloque.items || []).map((i) => i.id));

  const resultados = busqueda.trim()
    ? todos.filter((c) => {
        const q = busqueda.toLowerCase();
        return (c.nombre_restaurante?.toLowerCase().includes(q) || c.titulo?.toLowerCase().includes(q) || c.subtitulo?.toLowerCase().includes(q)) && !idsAgregados.has(c.id);
      }).slice(0, 12)
    : [];

  const agregarItem = (c) => {
    if (idsAgregados.has(c.id)) return;
    const items = [...(bloque.items || []), {
      id: c.id,
      nombre_restaurante: c.nombre_restaurante || "",
      titulo: c.titulo || "",
      subtitulo: c.subtitulo || "",
      descripcion: c.descripcion || "",
      imagen_url: c.imagen_url || "",
      link: c.link || "",
      cta_texto: "",
    }];
    onChange(idx, "items", items);
    setBusqueda("");
  };

  const quitarItem = (id) => onChange(idx, "items", (bloque.items || []).filter((i) => i.id !== id));

  return (
    <div className="border border-amber-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 cursor-grab active:cursor-grabbing select-none">
        <span className="text-amber-200"><IconDrag /></span>
        <span className="text-xs text-amber-400 font-bold w-4 shrink-0">{idx + 1}</span>
        <span className="text-amber-400"><IconTicket /></span>
        <span className="flex-1 text-xs font-medium text-amber-900 truncate">{bloque.titulo || "Ofertas especiales"}</span>
        <span className="text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded font-semibold shrink-0">Cupones</span>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setExpandido((v) => !v)} className="text-amber-400 hover:text-amber-700 p-1">{expandido ? <IconChevronUp /> : <IconChevronDown />}</button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onQuitar(idx)} className="text-red-400 hover:text-red-600 p-1 ml-1"><IconClose /></button>
      </div>

      {expandido && (
        <div className="px-3 py-3 space-y-2 border-t border-amber-100 bg-white">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Título de la sección</label>
              <input type="text" value={bloque.titulo || ""} onChange={(e) => onChange(idx, "titulo", e.target.value)}
                placeholder="Ofertas especiales"
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">CTA global</label>
              <input type="text" value={bloque.cta_texto || ""} onChange={(e) => onChange(idx, "cta_texto", e.target.value)}
                placeholder="Ver cupón"
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
            </div>
          </div>

          {(bloque.items || []).length > 0 && (
            <div className="space-y-1">
              {(bloque.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1.5">
                  {item.imagen_url && (
                    <img src={item.imagen_url} alt="" className="w-8 h-8 object-cover shrink-0 rounded"
                      onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{item.titulo} {item.subtitulo}</p>
                    <p className="text-xs text-gray-400 truncate">{item.nombre_restaurante}</p>
                  </div>
                  <button onClick={() => quitarItem(item.id)} className="text-red-400 hover:text-red-600 text-xs shrink-0">✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              placeholder={cargando ? "Cargando cupones..." : "Buscar por restaurante o descuento..."}
              disabled={cargando}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 disabled:opacity-50" />
            {busqueda.trim() && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-md mt-1 max-h-48 overflow-y-auto">
                {resultados.map((c) => (
                  <div key={c.id} onClick={() => agregarItem(c)}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                    {c.imagen_url && <img src={c.imagen_url} alt="" className="w-7 h-7 object-cover rounded shrink-0" onError={(e) => { e.target.style.display = "none"; }} />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{c.titulo} {c.subtitulo}</p>
                      <p className="text-xs text-gray-400 truncate">{c.nombre_restaurante}</p>
                    </div>
                  </div>
                ))}
                {resultados.length === 0 && <div className="px-3 py-2 text-xs text-gray-400">Sin resultados</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────────────────────

const NuevaCampana = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  const [form, setForm] = useState({
    nombre: "", asunto: "", from_name: "Residente", logo_texto: "RESIDENTE",
    intro_texto: "", footer_texto: "", notas: [],
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
  const [vistaPreview, setVistaPreview] = useState("desktop");
  const [previewHtml, setPreviewHtml] = useState("");

  // Drag & drop state
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const debouncedForm = useDebounce(form, 400);

  useEffect(() => {
    setIsLoadingNotas(true);
    catalogoNotasGet(1, 100)
      .then((data) => setNotas(Array.isArray(data) ? data : []))
      .catch(() => setNotas([]))
      .finally(() => setIsLoadingNotas(false));
  }, []);

  useEffect(() => {
    if (!busqueda.trim()) { setNotasFiltradas(notas.slice(0, 20)); return; }
    const q = busqueda.toLowerCase();
    setNotasFiltradas(notas.filter((n) => n.titulo?.toLowerCase().includes(q) || n.resumen?.toLowerCase().includes(q)).slice(0, 20));
  }, [busqueda, notas]);

  useEffect(() => {
    if (!esEdicion) return;
    fetch(`${urlApi}api/newsletter/campanas/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(async (data) => {
        let bloques = data.notas;
        if (typeof bloques === "string") { try { bloques = JSON.parse(bloques); } catch { bloques = []; } }
        if (!Array.isArray(bloques)) bloques = [];

        bloques = await Promise.all(bloques.map(async (b) => {
          if (b.tipo === "restaurantes" || b.tipo === "cupones") return b;
          // Si ya tiene la clave descripcion (aunque sea vacía), respetarla — el usuario la editó
          if ("descripcion" in b) return b;
          try {
            const res = await fetch(`${urlApi}api/notas/id/${b.id}`, { headers: { Authorization: `Bearer ${token}` } });
            const detail = await res.json();
            return { ...b, descripcion: detail.descripcion || detail.subtitulo || "" };
          } catch { return b; }
        }));

        setForm({
          nombre: data.nombre || "", asunto: data.asunto || "",
          from_name: data.from_name || "Residente", logo_texto: data.logo_texto || "RESIDENTE",
          intro_texto: data.intro_texto || "", footer_texto: data.footer_texto || "",
          notas: bloques,
        });
      })
      .catch(() => setError("Error cargando campaña"));
  }, [id, esEdicion, token]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${urlApi}api/newsletter/campanas/preview-live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logo_texto: debouncedForm.logo_texto, intro_texto: debouncedForm.intro_texto, footer_texto: debouncedForm.footer_texto, notas: debouncedForm.notas }),
    })
      .then((r) => r.text())
      .then((html) => { if (!cancelled) setPreviewHtml(html); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [debouncedForm]);

  // ── Gestión de bloques ────────────────────────────────────────────────────

  const agregarNota = async (nota) => {
    if (form.notas.length >= BLOQUES_MAX) return;
    if (form.notas.find((b) => b.tipo !== "restaurantes" && b.tipo !== "cupones" && String(b.id) === String(nota.id))) return;

    let descripcion = "";
    try {
      const res = await fetch(`${urlApi}api/notas/id/${nota.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const detail = await res.json();
      descripcion = detail.descripcion || detail.subtitulo || "";
    } catch {}

    const tieneNotaPrincipal = form.notas.some((b) => b.tipo === "principal");
    const tipo = tieneNotaPrincipal ? "secundaria" : "principal";

    setForm((prev) => ({
      ...prev,
      notas: [...prev.notas, { tipo, id: nota.id, titulo: nota.titulo || "", descripcion, imagen: nota.imagen || nota.imagen_mediana || nota.imagen_grande || "", slug: nota.slug || "", cta_texto: "", etiqueta: "", mostrar_imagen: true }],
    }));
  };

  const agregarBloqueRestaurantes = () => {
    if (form.notas.length >= BLOQUES_MAX) return;
    setForm((prev) => ({ ...prev, notas: [...prev.notas, { tipo: "restaurantes", titulo: "", items: [] }] }));
  };

  const agregarBloqueCupones = () => {
    if (form.notas.length >= BLOQUES_MAX) return;
    setForm((prev) => ({ ...prev, notas: [...prev.notas, { tipo: "cupones", titulo: "", cta_texto: "", items: [] }] }));
  };

  const actualizarBloque = (idx, campo, valor) => {
    setForm((prev) => {
      const notas = [...prev.notas];
      notas[idx] = { ...notas[idx], [campo]: valor };
      return { ...prev, notas };
    });
  };

  const quitarNota = (id) => setForm((prev) => ({ ...prev, notas: prev.notas.filter((b) => b.id !== id) }));
  const quitarBloqueIdx = (idx) => setForm((prev) => ({ ...prev, notas: prev.notas.filter((_, i) => i !== idx) }));

  // ── Drag & drop ───────────────────────────────────────────────────────────

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDrop = (toIdx) => {
    if (dragIdx !== null && dragIdx !== toIdx) {
      setForm((prev) => ({ ...prev, notas: moverBloqueA(prev.notas, dragIdx, toIdx) }));
    }
    setDragIdx(null);
    setDragOverIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };

  // ── Acciones ──────────────────────────────────────────────────────────────

  const guardar = async () => {
    if (!form.nombre || !form.asunto) { setError("El nombre y el asunto son obligatorios"); return; }
    setIsSaving(true); setError(null);
    try {
      const url = esEdicion ? `${urlApi}api/newsletter/campanas/${id}` : `${urlApi}api/newsletter/campanas`;
      const res = await fetch(url, { method: esEdicion ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error guardando");
      navigate(esEdicion ? "/correos" : `/correos/editar/${data.id}`);
    } catch (err) { setError(err.message); }
    finally { setIsSaving(false); }
  };

  const enviarTest = async () => {
    if (!correoTest) return;
    setMsgTest(null);
    try {
      const saveUrl = esEdicion ? `${urlApi}api/newsletter/campanas/${id}` : `${urlApi}api/newsletter/campanas`;
      const saveRes = await fetch(saveUrl, { method: esEdicion ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const saved = await saveRes.json();
      if (!saveRes.ok) throw new Error(saved.error || "Error guardando");
      const campanaId = saved.id || id;
      const res = await fetch(`${urlApi}api/newsletter/campanas/${campanaId}/test`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ correo: correoTest }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error enviando test");
      setMsgTest({ ok: true, msg: `Test enviado a ${correoTest}` });
      if (!esEdicion) navigate(`/correos/editar/${campanaId}`);
    } catch (err) { setMsgTest({ ok: false, msg: err.message }); }
  };

  const enviarCampana = async () => {
    if (!confirm("¿Enviar esta campaña a toda la audiencia?")) return;
    setIsSending(true); setError(null);
    try {
      const saveRes = await fetch(`${urlApi}api/newsletter/campanas/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      if (!saveRes.ok) { const d = await saveRes.json(); throw new Error(d.error || "Error guardando"); }
      const res = await fetch(`${urlApi}api/newsletter/campanas/${id}/enviar`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error enviando");
      alert(data.modo_prueba ? `MODO PRUEBA: enviado a ${data.correo_prueba}` : "Campaña enviada correctamente");
      navigate("/correos");
    } catch (err) { setError(err.message); }
    finally { setIsSending(false); }
  };

  const idsNotasSeleccionadas = new Set(form.notas.filter((b) => b.tipo !== "restaurantes" && b.tipo !== "cupones").map((b) => b.id));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1280px] mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/correos")} className="text-gray-500 hover:text-black text-sm">← Volver</button>
        <h1 className="text-xl font-bold">{esEdicion ? "Editar campaña" : "Nueva campaña"}</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4 text-sm">{error}</div>}

      <div className="flex gap-6 items-start">

        {/* ── Panel izquierdo ──────────────────────────────────────────── */}
        <div className="w-[400px] shrink-0 space-y-3">

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Encabezado</label>
            <input type="text" value={form.logo_texto} onChange={(e) => setForm((p) => ({ ...p, logo_texto: e.target.value }))}
              placeholder="RESIDENTE" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 uppercase" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Nombre interno *</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Newsletter Semana Santa 2026" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Remitente</label>
              <input type="text" value={form.from_name} onChange={(e) => setForm((p) => ({ ...p, from_name: e.target.value }))}
                placeholder="Residente Newsletter" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Asunto *</label>
              <input type="text" value={form.asunto} onChange={(e) => setForm((p) => ({ ...p, asunto: e.target.value }))}
                placeholder="Las mejores de la semana" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Intro editorial</label>
            <textarea value={form.intro_texto} onChange={(e) => setForm((p) => ({ ...p, intro_texto: e.target.value }))}
              rows={4} placeholder={"Esta semana...\n\nTe mandamos las opciones que sí valen la pena."}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none" />
            <p className="text-xs text-gray-400 mt-1">Doble salto de línea = párrafo nuevo.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Firma de cierre</label>
            <textarea value={form.footer_texto} onChange={(e) => setForm((p) => ({ ...p, footer_texto: e.target.value }))}
              rows={2} placeholder={"Hasta la próxima,\nEquipo Residente"}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none" />
          </div>

          {/* ── Bloques ───────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Contenido ({form.notas.length}/{BLOQUES_MAX})</label>
              <div className="flex gap-1">
                <button onClick={() => setMostrarBuscador((v) => !v)} disabled={form.notas.length >= BLOQUES_MAX}
                  className="flex items-center gap-1 text-xs text-gray-700 border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 transition-colors disabled:opacity-40">
                  <IconPlus /> Nota
                </button>
                <button onClick={agregarBloqueRestaurantes} disabled={form.notas.length >= BLOQUES_MAX}
                  title="Agregar lista de restaurantes"
                  className="flex items-center gap-1 text-xs text-blue-700 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 transition-colors disabled:opacity-40">
                  <IconRestaurant /> Restaurantes
                </button>
                <button onClick={agregarBloqueCupones} disabled={form.notas.length >= BLOQUES_MAX}
                  title="Agregar bloque de cupones"
                  className="flex items-center gap-1 text-xs text-amber-700 border border-amber-200 px-2 py-1 rounded hover:bg-amber-50 transition-colors disabled:opacity-40">
                  <IconTicket /> Cupones
                </button>
              </div>
            </div>

            {form.notas.length === 0 && (
              <p className="text-xs text-gray-400 italic">Sin bloques. Usa los botones para agregar.</p>
            )}

            <div className="space-y-2">
              {form.notas.map((bloque, idx) => {
                const key = bloque.tipo === "restaurantes" || bloque.tipo === "cupones" ? `${bloque.tipo}-${idx}` : bloque.id;
                const isDragging = dragIdx === idx;
                const isDragOver = dragOverIdx === idx && dragIdx !== idx;
                return (
                  <div
                    key={key}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    className={`transition-all rounded-lg ${isDragging ? "opacity-40 scale-[0.98]" : ""} ${isDragOver ? "ring-2 ring-[#FFF200]" : ""}`}
                  >
                    {bloque.tipo === "restaurantes" ? (
                      <BloqueRestaurantes bloque={bloque} idx={idx} onChange={actualizarBloque} onQuitar={quitarBloqueIdx} token={token} />
                    ) : bloque.tipo === "cupones" ? (
                      <BloqueCupones bloque={bloque} idx={idx} onChange={actualizarBloque} onQuitar={quitarBloqueIdx} />
                    ) : (
                      <BloqueNota bloque={bloque} idx={idx} total={form.notas.length} onChange={actualizarBloque} onQuitar={quitarNota} imgApi={imgApi} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buscador de notas */}
          {mostrarBuscador && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Buscar nota</span>
                <button onClick={() => setMostrarBuscador(false)} className="text-xs text-gray-400 hover:text-black">✕ Cerrar</button>
              </div>
              <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar nota..." autoFocus
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500 mb-2 bg-white" />
              {isLoadingNotas && <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-400" /></div>}
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                {notasFiltradas.map((nota) => {
                  const sel = idsNotasSeleccionadas.has(nota.id);
                  const lleno = form.notas.length >= BLOQUES_MAX;
                  return (
                    <div key={nota.id} onClick={() => !sel && !lleno && agregarNota(nota)}
                      className={`flex items-center gap-2 border rounded p-1.5 transition-colors cursor-pointer text-sm ${sel ? "border-yellow-400 bg-yellow-50" : lleno ? "opacity-40 cursor-not-allowed border-gray-100" : "border-gray-200 hover:border-gray-400 bg-white"}`}>
                      {nota.imagen && (
                        <img src={nota.imagen.startsWith("http") ? nota.imagen : `${imgApi}fotos/${nota.imagen}`} alt=""
                          className="w-8 h-8 rounded-full object-cover shrink-0" onError={(e) => { e.target.style.display = "none"; }} />
                      )}
                      <span className="truncate flex-1">{nota.titulo}</span>
                      <span className="shrink-0 text-gray-400">{sel ? <IconCheck /> : <IconPlus />}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={guardar} disabled={isSaving}
              className="bg-[#FFF200] text-black font-bold px-4 py-2 rounded hover:opacity-80 transition-opacity text-sm disabled:opacity-50">
              {isSaving ? "Guardando..." : esEdicion ? "Guardar cambios" : "Guardar borrador"}
            </button>
            {esEdicion && (
              <button onClick={enviarCampana} disabled={isSending}
                className="bg-green-600 text-white font-bold px-4 py-2 rounded hover:opacity-80 transition-opacity text-sm disabled:opacity-50">
                {isSending ? "Enviando..." : "Enviar campaña"}
              </button>
            )}
          </div>

          {esEdicion && (
            <div className="border border-gray-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Enviar test</p>
              <div className="flex gap-2">
                <input type="email" value={correoTest} onChange={(e) => setCorreoTest(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500" />
                <button onClick={enviarTest} className="border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors">Enviar</button>
              </div>
              {msgTest && <p className={`text-xs ${msgTest.ok ? "text-green-600" : "text-red-500"}`}>{msgTest.msg}</p>}
            </div>
          )}
        </div>

        {/* ── Panel derecho: Preview ───────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Preview en vivo</p>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setVistaPreview("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${vistaPreview === "desktop" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2"/><path strokeLinecap="round" strokeWidth="2" d="M8 21h8M12 17v4"/></svg>
                Desktop
              </button>
              <button onClick={() => setVistaPreview("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${vistaPreview === "mobile" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                <svg className="w-3 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>
                Mobile
              </button>
            </div>
          </div>

          <div className="flex justify-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm" style={{ minHeight: "85vh" }}>
            <div className="bg-white transition-all duration-300 overflow-hidden"
              style={{
                width: vistaPreview === "mobile" ? "375px" : "100%",
                maxWidth: vistaPreview === "desktop" ? "680px" : "375px",
                boxShadow: vistaPreview === "mobile" ? "0 0 0 8px #1f2937, 0 0 0 10px #374151" : "none",
                borderRadius: vistaPreview === "mobile" ? "24px" : "0",
                margin: vistaPreview === "mobile" ? "24px auto" : "0",
              }}>
              <iframe srcDoc={previewHtml} title="Email preview" className="border-none block"
                style={{
                  width: vistaPreview === "mobile" ? "600px" : "100%",
                  zoom: vistaPreview === "mobile" ? (375 / 600) : 1,
                  height: vistaPreview === "mobile" ? "1400px" : "85vh",
                  minHeight: "600px",
                  borderRadius: vistaPreview === "mobile" ? "20px" : "0",
                }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NuevaCampana;
