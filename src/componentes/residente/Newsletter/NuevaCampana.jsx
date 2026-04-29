import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../Context";
import { urlApi, imgApi } from "../../api/url";
import { catalogoNotasGetTodas } from "../../api/notasPublicadasGet";
import { useDebounce } from "../../../hooks/useDebounce";
import EditorTextoRico from "./EditorTextoRico";

const BLOQUES_MAX = 12;

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

const IconImage = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
);

const IconText = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
  </svg>
);

const IconLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const IconSeparator = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
    <path d="M3 12h18M12 5v2M12 17v2"/>
  </svg>
);

// ── Helpers ─────────────────────────────────────────────────────────────────

const BotonesMover = ({ idx, total, onMover }) => (
  <div className="flex" onPointerDown={(e) => e.stopPropagation()}>
    <button onClick={() => onMover(idx, -1)} disabled={idx === 0}
      className="text-gray-300 hover:text-gray-600 p-1 disabled:opacity-20 transition-colors" title="Mover arriba">
      <IconChevronUp />
    </button>
    <button onClick={() => onMover(idx, 1)} disabled={idx >= total - 1}
      className="text-gray-300 hover:text-gray-600 p-1 disabled:opacity-20 transition-colors" title="Mover abajo">
      <IconChevronDown />
    </button>
  </div>
);

function moverBloqueA(arr, from, to) {
  if (from === to || to < 0 || to >= arr.length) return arr;
  const copia = [...arr];
  const [item] = copia.splice(from, 1);
  copia.splice(to, 0, item);
  return copia;
}

// ── Componente: Bloque Nota ──────────────────────────────────────────────────

const BloqueNota = ({ bloque, idx, total, onChange, onQuitar, onMover, plantilla }) => {
  const [expandido, setExpandido] = useState(false);
  const esEditorial = plantilla === "editorial";

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
        <BotonesMover idx={idx} total={total} onMover={onMover} />
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
            {esEditorial ? "Mostrar imagen rectangular" : "Mostrar imagen circular"}
          </label>
          {esEditorial && bloque.mostrar_imagen !== false && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Ancho de imagen: <span className="font-mono">{bloque.ancho_imagen || 400}px</span>
              </label>
              <div className="flex items-center gap-2">
                <input type="range" min="120" max="540" step="20"
                  value={bloque.ancho_imagen || 400}
                  onChange={(e) => onChange(idx, "ancho_imagen", Number(e.target.value))}
                  className="flex-1" />
                <input type="number" min="120" max="540"
                  value={bloque.ancho_imagen || 400}
                  onChange={(e) => onChange(idx, "ancho_imagen", Number(e.target.value) || 400)}
                  className="w-16 border border-gray-200 rounded px-1.5 py-0.5 text-xs text-center" />
              </div>
            </div>
          )}
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

const BloqueRestaurantes = ({ bloque, idx, total, onChange, onQuitar, onMover, token }) => {
  const [expandido, setExpandido] = useState(true);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [todos, setTodos] = useState([]);
  const [cargados, setCargados] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoId, setCargandoId] = useState(null);
  const [expandidosItems, setExpandidosItems] = useState({});
  const toggleExpandItem = (id) => setExpandidosItems((p) => ({ ...p, [id]: !p[id] }));

  const items = bloque.items || [];

  useEffect(() => {
    if (!mostrarPicker || cargados) return;
    setCargando(true);
    fetch(`${urlApi}api/restaurante/basicos`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setTodos(Array.isArray(data) ? data : []); setCargados(true); })
      .catch(() => setTodos([]))
      .finally(() => setCargando(false));
  }, [mostrarPicker, cargados, token]);

  const idsAgregados = new Set(items.map((i) => i.id));

  const filtrados = busqueda.trim()
    ? todos.filter((r) => r.nombre_restaurante?.toLowerCase().includes(busqueda.toLowerCase()))
    : todos;

  const toggleItem = async (r) => {
    if (idsAgregados.has(r.id)) {
      onChange(idx, "items", items.filter((i) => i.id !== r.id));
      return;
    }
    setCargandoId(r.id);
    let imagen = "", tipo_lugar = "", comida = "", ticket_promedio = "", zona = "", descripcion = "";
    try {
      const res = await fetch(`${urlApi}api/restaurante/${r.slug || r.id}`);
      const detail = await res.json();
      const imgs = detail.imagenes || [];
      imagen = imgs[0]?.src || imgs[0]?.url_imagen || "";
      tipo_lugar = detail.tipo_lugar || "";
      const comidaArr = Array.isArray(detail.comida) ? detail.comida : (typeof detail.comida === "string" ? JSON.parse(detail.comida || "[]") : []);
      comida = comidaArr.slice(0, 3).join(" · ");
      ticket_promedio = detail.ticket_promedio || "";
      const secciones = Array.isArray(detail.secciones_categorias) ? detail.secciones_categorias : [];
      zona = secciones.find((s) => s.tipo === "zona" || s.categoria === "zona")?.nombre || secciones[0]?.nombre || "";
      descripcion = detail.meta_description || "";
    } catch {}
    onChange(idx, "items", [...items, { id: r.id, nombre: r.nombre_restaurante, slug: r.slug || "", imagen, descripcion: "", tipo_lugar, comida, ticket_promedio, zona, cta_texto: "" }]);
    setCargandoId(null);
  };

  const editarItem = (id, campo, val) =>
    onChange(idx, "items", items.map((i) => i.id === id ? { ...i, [campo]: val } : i));

  const quitarItem = (id) => onChange(idx, "items", items.filter((i) => i.id !== id));

  return (
    <div className="border border-blue-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 cursor-grab active:cursor-grabbing select-none">
        <span className="text-blue-200"><IconDrag /></span>
        <span className="text-xs text-blue-400 font-bold w-4 shrink-0">{idx + 1}</span>
        <span className="text-blue-400"><IconRestaurant /></span>
        <span className="flex-1 text-xs font-medium text-blue-900 truncate">
          {bloque.titulo || "Lista de restaurantes"}
          {items.length > 0 && <span className="ml-1 text-blue-400">({items.length})</span>}
        </span>
        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded font-semibold shrink-0">Restaurantes</span>
        <BotonesMover idx={idx} total={total} onMover={onMover} />
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setExpandido((v) => !v)} className="text-blue-400 hover:text-blue-700 p-1">{expandido ? <IconChevronUp /> : <IconChevronDown />}</button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onQuitar(idx)} className="text-red-400 hover:text-red-600 p-1 ml-1"><IconClose /></button>
      </div>

      {expandido && (
        <div className="px-3 py-3 space-y-3 border-t border-blue-100 bg-white">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Título de la sección</label>
            <input type="text" value={bloque.titulo || ""} onChange={(e) => onChange(idx, "titulo", e.target.value)}
              placeholder="Dónde comer en el Valley"
              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
          </div>

          {/* ── Restaurantes seleccionados ── */}
          {items.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Seleccionados ({items.length})</p>
              {items.map((item) => {
                const exp = !!expandidosItems[item.id];
                const imgSrc = item.imagen ? (item.imagen.startsWith("http") ? item.imagen : `${imgApi}fotos/${item.imagen}`) : "";
                return (
                  <div key={item.id} className="border border-blue-100 rounded-lg overflow-hidden">
                    {/* Header del item */}
                    <div className="flex items-center gap-2 px-2 py-2 bg-blue-50">
                      {imgSrc ? (
                        <img src={imgSrc} alt="" className="w-8 h-8 rounded-full object-cover shrink-0"
                          onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-gray-400"><IconRestaurant /></div>
                      )}
                      <span className="flex-1 text-xs font-bold text-blue-900 truncate">{item.nombre}</span>
                      <button onPointerDown={(e) => e.stopPropagation()} onClick={() => toggleExpandItem(item.id)}
                        className="text-blue-400 hover:text-blue-700 p-1">{exp ? <IconChevronUp /> : <IconChevronDown />}</button>
                      <button onPointerDown={(e) => e.stopPropagation()} onClick={() => quitarItem(item.id)}
                        className="text-red-400 hover:text-red-600 p-1"><IconClose /></button>
                    </div>
                    {/* Panel editable */}
                    {exp && (
                      <div className="px-3 py-2.5 space-y-2 bg-white border-t border-blue-100">
                        {/* Toggles */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          {[
                            ["mostrar_imagen", "Imagen"],
                            ["mostrar_tipo", "Tipo / Cocina"],
                            ["mostrar_precio", "Precio promedio"],
                            ["mostrar_descripcion", "Descripción"],
                            ["mostrar_cta", "Botón CTA"],
                          ].map(([campo, label]) => (
                            <label key={campo} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                              <input type="checkbox" checked={item[campo] !== false}
                                onChange={(e) => editarItem(item.id, campo, e.target.checked)} className="rounded" />
                              {label}
                            </label>
                          ))}
                        </div>
                        {/* Info auto-cargada (solo lectura si no se edita) */}
                        {(item.tipo_lugar || item.comida) && (
                          <div className="text-xs text-gray-400 bg-gray-50 rounded px-2 py-1">
                            {[item.tipo_lugar, item.comida].filter(Boolean).join(" · ")}
                            {item.ticket_promedio && <span className="ml-2 font-semibold">{item.ticket_promedio}</span>}
                          </div>
                        )}
                        {/* Campos editables */}
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Nombre (override)</label>
                          <input type="text" value={item.nombre || ""}
                            onChange={(e) => editarItem(item.id, "nombre", e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-0.5">Tipo / Cocina</label>
                            <input type="text" value={item.comida || ""}
                              onChange={(e) => editarItem(item.id, "comida", e.target.value)}
                              placeholder={item.tipo_lugar || "Japonesa · Fusión"}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-0.5">Precio promedio</label>
                            <input type="text" value={item.ticket_promedio || ""}
                              onChange={(e) => editarItem(item.id, "ticket_promedio", e.target.value)}
                              placeholder="$200-$500"
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Descripción</label>
                          <textarea value={item.descripcion || ""}
                            onChange={(e) => editarItem(item.id, "descripcion", e.target.value)}
                            rows={2} placeholder="Texto que aparece bajo el nombre"
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400 resize-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Texto del botón CTA</label>
                          <input type="text" value={item.cta_texto || ""}
                            onChange={(e) => editarItem(item.id, "cta_texto", e.target.value)}
                            placeholder="Ver restaurante"
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Picker ── */}
          <div>
            <button onClick={() => setMostrarPicker((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold hover:text-blue-900 transition-colors">
              <IconPlus />
              {mostrarPicker ? "Ocultar lista" : "Agregar restaurante"}
            </button>
            {mostrarPicker && (
              <div className="mt-2 space-y-1.5">
                <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                  placeholder={cargando ? "Cargando..." : `Buscar entre ${todos.length} restaurantes...`}
                  disabled={cargando}
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 disabled:opacity-50" />
                <div className="max-h-48 overflow-y-auto border border-gray-100 rounded">
                  {cargando && <div className="flex justify-center py-5"><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-400" /></div>}
                  {!cargando && filtrados.length === 0 && <div className="px-3 py-3 text-xs text-gray-400 text-center">Sin resultados</div>}
                  {filtrados.map((r) => {
                    const sel = idsAgregados.has(r.id);
                    const cargandoEste = cargandoId === r.id;
                    return (
                      <div key={r.id} onClick={() => !cargandoEste && toggleItem(r)}
                        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors ${sel ? "bg-blue-50" : "bg-white hover:bg-gray-50"}`}>
                        <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${sel ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                          {sel && <IconCheck />}
                          {cargandoEste && <div className="w-2.5 h-2.5 animate-spin rounded-full border-t border-blue-400" />}
                        </div>
                        <span className={`flex-1 text-xs truncate ${sel ? "font-semibold text-blue-900" : "text-gray-700"}`}>{r.nombre_restaurante}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Componente: Bloque Cupones ───────────────────────────────────────────────

const BloqueCupones = ({ bloque, idx, total, onChange, onQuitar, onMover }) => {
  const [expandido, setExpandido] = useState(true);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [todos, setTodos] = useState([]);
  const [cargados, setCargados] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [expandidosItems, setExpandidosItems] = useState({});
  const toggleExpandItem = (id) => setExpandidosItems((p) => ({ ...p, [id]: !p[id] }));

  const items = bloque.items || [];

  useEffect(() => {
    if (!mostrarPicker || cargados) return;
    setCargando(true);
    fetch(`${urlApi}api/tickets/`)
      .then((r) => r.json())
      .then((data) => { setTodos(Array.isArray(data) ? data : []); setCargados(true); })
      .catch(() => setTodos([]))
      .finally(() => setCargando(false));
  }, [mostrarPicker, cargados]);

  const idsAgregados = new Set(items.map((i) => i.id));

  const filtrados = busqueda.trim()
    ? todos.filter((c) => {
        const q = busqueda.toLowerCase();
        return c.nombre_restaurante?.toLowerCase().includes(q) || c.titulo?.toLowerCase().includes(q) || c.subtitulo?.toLowerCase().includes(q);
      })
    : todos;

  const toggleItem = (c) => {
    if (idsAgregados.has(c.id)) {
      onChange(idx, "items", items.filter((i) => i.id !== c.id));
    } else {
      onChange(idx, "items", [...items, {
        id: c.id,
        nombre_restaurante: c.nombre_restaurante || "",
        titulo: c.titulo || "",
        subtitulo: c.subtitulo || "",
        descripcion: c.descripcion || "",
        imagen_url: c.imagen_url || "",
        link: c.link || "",
        cta_texto: "",
      }]);
    }
  };

  const editarItem = (id, campo, val) =>
    onChange(idx, "items", items.map((i) => i.id === id ? { ...i, [campo]: val } : i));

  return (
    <div className="border border-amber-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 cursor-grab active:cursor-grabbing select-none">
        <span className="text-amber-200"><IconDrag /></span>
        <span className="text-xs text-amber-400 font-bold w-4 shrink-0">{idx + 1}</span>
        <span className="text-amber-400"><IconTicket /></span>
        <span className="flex-1 text-xs font-medium text-amber-900 truncate">
          {bloque.titulo || "Ofertas especiales"}
          {items.length > 0 && <span className="ml-1 text-amber-400">({items.length})</span>}
        </span>
        <span className="text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded font-semibold shrink-0">Cupones</span>
        <BotonesMover idx={idx} total={total} onMover={onMover} />
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setExpandido((v) => !v)} className="text-amber-400 hover:text-amber-700 p-1">{expandido ? <IconChevronUp /> : <IconChevronDown />}</button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onQuitar(idx)} className="text-red-400 hover:text-red-600 p-1 ml-1"><IconClose /></button>
      </div>

      {expandido && (
        <div className="px-3 py-3 space-y-3 border-t border-amber-100 bg-white">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Título de la sección</label>
              <input type="text" value={bloque.titulo || ""} onChange={(e) => onChange(idx, "titulo", e.target.value)}
                placeholder="Ofertas especiales"
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">CTA por defecto</label>
              <input type="text" value={bloque.cta_texto || ""} onChange={(e) => onChange(idx, "cta_texto", e.target.value)}
                placeholder="Ver cupón"
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
            </div>
          </div>

          {/* ── Cupones seleccionados ── */}
          {items.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Seleccionados ({items.length})</p>
              {items.map((item) => {
                const exp = !!expandidosItems[item.id];
                return (
                  <div key={item.id} className="border border-amber-100 rounded-lg overflow-hidden">
                    {/* Header del item */}
                    <div className="flex items-center gap-2 px-2 py-2 bg-amber-50">
                      {item.imagen_url ? (
                        <img src={item.imagen_url} alt=""
                          className="w-8 h-auto rounded shrink-0" style={{ maxWidth: "30px" }}
                          onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded shrink-0 flex items-center justify-center text-gray-400"><IconTicket /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-amber-900 truncate leading-tight">{item.titulo}{item.subtitulo ? ` ${item.subtitulo}` : ""}</p>
                        {item.nombre_restaurante && <p className="text-xs text-amber-600 truncate">{item.nombre_restaurante}</p>}
                      </div>
                      <button onPointerDown={(e) => e.stopPropagation()} onClick={() => toggleExpandItem(item.id)}
                        className="text-amber-400 hover:text-amber-700 p-1">{exp ? <IconChevronUp /> : <IconChevronDown />}</button>
                      <button onPointerDown={(e) => e.stopPropagation()} onClick={() => toggleItem({ id: item.id })}
                        className="text-red-400 hover:text-red-600 p-1"><IconClose /></button>
                    </div>
                    {/* Panel editable */}
                    {exp && (
                      <div className="px-3 py-2.5 space-y-2 bg-white border-t border-amber-100">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                            <input type="checkbox" checked={item.mostrar_imagen !== false}
                              onChange={(e) => editarItem(item.id, "mostrar_imagen", e.target.checked)} className="rounded" />
                            Imagen
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                            <input type="checkbox" checked={item.mostrar_nombre !== false}
                              onChange={(e) => editarItem(item.id, "mostrar_nombre", e.target.checked)} className="rounded" />
                            Nombre restaurante
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                            <input type="checkbox" checked={item.mostrar_titulo !== false}
                              onChange={(e) => editarItem(item.id, "mostrar_titulo", e.target.checked)} className="rounded" />
                            Título / precio
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                            <input type="checkbox" checked={item.mostrar_descripcion !== false}
                              onChange={(e) => editarItem(item.id, "mostrar_descripcion", e.target.checked)} className="rounded" />
                            Descripción
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-0.5">Título (override)</label>
                            <input type="text" value={item.titulo || ""}
                              onChange={(e) => editarItem(item.id, "titulo", e.target.value)}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-0.5">Subtítulo (override)</label>
                            <input type="text" value={item.subtitulo || ""}
                              onChange={(e) => editarItem(item.id, "subtitulo", e.target.value)}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Descripción (override)</label>
                          <textarea value={item.descripcion || ""}
                            onChange={(e) => editarItem(item.id, "descripcion", e.target.value)}
                            rows={2} placeholder="Descripción del cupón"
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400 resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-0.5">Texto del botón CTA</label>
                            <input type="text" value={item.cta_texto || ""}
                              onChange={(e) => editarItem(item.id, "cta_texto", e.target.value)}
                              placeholder={bloque.cta_texto || "Ver cupón"}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-0.5">URL destino</label>
                            <input type="text" value={item.link || ""}
                              onChange={(e) => editarItem(item.id, "link", e.target.value)}
                              placeholder="https://..."
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Picker ── */}
          <div>
            <button onClick={() => setMostrarPicker((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold hover:text-amber-900 transition-colors">
              <IconPlus />
              {mostrarPicker ? "Ocultar lista" : "Agregar cupón"}
            </button>
            {mostrarPicker && (
              <div className="mt-2 space-y-1.5">
                <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                  placeholder={cargando ? "Cargando..." : `Buscar entre ${todos.length} cupones...`}
                  disabled={cargando}
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 disabled:opacity-50" />
                <div className="max-h-48 overflow-y-auto border border-gray-100 rounded">
                  {cargando && <div className="flex justify-center py-5"><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-amber-400" /></div>}
                  {!cargando && filtrados.length === 0 && <div className="px-3 py-3 text-xs text-gray-400 text-center">Sin resultados</div>}
                  {filtrados.map((c) => {
                    const sel = idsAgregados.has(c.id);
                    return (
                      <div key={c.id} onClick={() => toggleItem(c)}
                        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors ${sel ? "bg-amber-50" : "bg-white hover:bg-gray-50"}`}>
                        <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${sel ? "bg-amber-500 border-amber-500" : "border-gray-300"}`}>
                          {sel && <IconCheck />}
                        </div>
                        {c.imagen_url && (
                          <img src={c.imagen_url} alt="" className="w-8 h-auto rounded shrink-0"
                            style={{ maxWidth: "30px" }} onError={(e) => { e.target.style.display = "none"; }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs truncate ${sel ? "font-semibold text-amber-900" : "font-medium text-gray-700"}`}>
                            {c.titulo}{c.subtitulo ? ` ${c.subtitulo}` : ""}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{c.nombre_restaurante}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Componente: Bloque Imagen ────────────────────────────────────────────────

const BloqueImagen = ({ bloque, idx, total, onChange, onQuitar, onMover, token }) => {
  const [expandido, setExpandido] = useState(true);
  const [subiendo, setSubiendo] = useState(false);

  const subirImagen = async (file) => {
    if (!file) return;
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append("imagen", file);
      const res = await fetch(`${urlApi}api/uploads/newsletter-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) onChange(idx, "url", data.url);
    } catch (e) {
      console.error("Error subiendo imagen:", e);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="border border-purple-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 cursor-grab active:cursor-grabbing select-none">
        <span className="text-purple-200"><IconDrag /></span>
        <span className="text-xs text-purple-400 font-bold w-4 shrink-0">{idx + 1}</span>
        <span className="text-purple-400"><IconImage /></span>
        {bloque.url && (
          <img src={bloque.url} alt="" className="w-7 h-7 object-cover shrink-0 rounded"
            onError={(e) => { e.target.style.display = "none"; }} />
        )}
        <span className="flex-1 text-xs font-medium text-purple-900 truncate">{bloque.caption || "Imagen"}</span>
        <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded font-semibold shrink-0">Imagen</span>
        <BotonesMover idx={idx} total={total} onMover={onMover} />
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setExpandido((v) => !v)} className="text-purple-400 hover:text-purple-700 p-1">{expandido ? <IconChevronUp /> : <IconChevronDown />}</button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onQuitar(idx)} className="text-red-400 hover:text-red-600 p-1 ml-1"><IconClose /></button>
      </div>

      {expandido && (
        <div className="px-3 py-3 space-y-2 border-t border-purple-100 bg-white">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Imagen</label>
            <div className="flex gap-2 items-center">
              <label className={`flex items-center gap-1 text-xs border rounded px-2 py-1.5 cursor-pointer transition-colors ${subiendo ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 border-gray-200"}`}>
                <IconImage />
                {subiendo ? "Subiendo..." : "Subir"}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" disabled={subiendo}
                  onChange={(e) => subirImagen(e.target.files[0])} />
              </label>
              <span className="text-xs text-gray-300">PNG · JPG · WEBP · GIF</span>
              <span className="text-xs text-gray-400">o</span>
              <input type="text" value={bloque.url || ""} onChange={(e) => onChange(idx, "url", e.target.value)}
                placeholder="https://... URL de imagen"
                className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
            </div>
            {bloque.url && (
              <img src={bloque.url} alt="" className="mt-2 max-h-20 object-contain rounded border border-gray-100"
                onError={(e) => { e.target.style.display = "none"; }} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tamaño</label>
              <select
                value={bloque.ancho_imagen ? "personalizado" : (bloque.tamanio || "completo")}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "personalizado") {
                    onChange(idx, "ancho_imagen", bloque.ancho_imagen || 400);
                  } else {
                    onChange(idx, "ancho_imagen", null);
                    onChange(idx, "tamanio", v);
                  }
                }}
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400">
                <option value="completo">Completo (540px)</option>
                <option value="mediano">Mediano (320px)</option>
                <option value="pequeno">Pequeño (200px)</option>
                <option value="personalizado">Personalizado…</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Alineación</label>
              <select value={bloque.alineacion || "centro"} onChange={(e) => onChange(idx, "alineacion", e.target.value)}
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400">
                <option value="izquierda">Izquierda</option>
                <option value="centro">Centro</option>
                <option value="derecha">Derecha</option>
              </select>
            </div>
          </div>
          {bloque.ancho_imagen != null && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Ancho: <span className="font-mono">{bloque.ancho_imagen}px</span>
              </label>
              <div className="flex items-center gap-2">
                <input type="range" min="80" max="540" step="20"
                  value={bloque.ancho_imagen}
                  onChange={(e) => onChange(idx, "ancho_imagen", Number(e.target.value))}
                  className="flex-1" />
                <input type="number" min="80" max="540"
                  value={bloque.ancho_imagen}
                  onChange={(e) => onChange(idx, "ancho_imagen", Number(e.target.value) || 400)}
                  className="w-16 border border-gray-200 rounded px-1.5 py-0.5 text-xs text-center" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1">Link al hacer clic (opcional)</label>
            <input type="text" value={bloque.link || ""} onChange={(e) => onChange(idx, "link", e.target.value)}
              placeholder="https://youtube.com/watch?v=... o cualquier URL"
              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Pie de foto (opcional)</label>
            <input type="text" value={bloque.caption || ""} onChange={(e) => onChange(idx, "caption", e.target.value)}
              placeholder="Descripción de la imagen"
              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Componente: Bloque Texto ─────────────────────────────────────────────────

const BloqueTexto = ({ bloque, idx, total, onChange, onQuitar, onMover }) => {
  const [expandido, setExpandido] = useState(true);
  const textoPlano = (bloque.texto || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const preview = textoPlano ? textoPlano.slice(0, 40) + (textoPlano.length > 40 ? "..." : "") : "Texto libre";

  return (
    <div className="border border-green-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 cursor-grab active:cursor-grabbing select-none">
        <span className="text-green-200"><IconDrag /></span>
        <span className="text-xs text-green-400 font-bold w-4 shrink-0">{idx + 1}</span>
        <span className="text-green-400"><IconText /></span>
        <span className="flex-1 text-xs font-medium text-green-900 truncate">{preview}</span>
        <span className="text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded font-semibold shrink-0">Texto</span>
        <BotonesMover idx={idx} total={total} onMover={onMover} />
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setExpandido((v) => !v)} className="text-green-400 hover:text-green-700 p-1">{expandido ? <IconChevronUp /> : <IconChevronDown />}</button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onQuitar(idx)} className="text-red-400 hover:text-red-600 p-1 ml-1"><IconClose /></button>
      </div>

      {expandido && (
        <div className="px-3 py-3 space-y-2 border-t border-green-100 bg-white" onPointerDown={(e) => e.stopPropagation()}>
          <label className="block text-xs text-gray-500 mb-1">Texto</label>
          <EditorTextoRico
            value={bloque.texto || ""}
            onChange={(html) => onChange(idx, "texto", html)}
            placeholder="Escribe un párrafo, nota de cierre, aviso..."
          />
        </div>
      )}
    </div>
  );
};

// ── Componente: Bloque Link ──────────────────────────────────────────────────

const BloqueLink = ({ bloque, idx, total, onChange, onQuitar, onMover }) => {
  const [expandido, setExpandido] = useState(true);

  return (
    <div className="border border-sky-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 cursor-grab active:cursor-grabbing select-none">
        <span className="text-sky-200"><IconDrag /></span>
        <span className="text-xs text-sky-400 font-bold w-4 shrink-0">{idx + 1}</span>
        <span className="text-sky-400"><IconLink /></span>
        <span className="flex-1 text-xs font-medium text-sky-900 truncate">{bloque.texto || "Botón / Enlace"}</span>
        <span className="text-xs bg-sky-200 text-sky-700 px-2 py-0.5 rounded font-semibold shrink-0">Enlace</span>
        <BotonesMover idx={idx} total={total} onMover={onMover} />
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setExpandido((v) => !v)} className="text-sky-400 hover:text-sky-700 p-1">{expandido ? <IconChevronUp /> : <IconChevronDown />}</button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onQuitar(idx)} className="text-red-400 hover:text-red-600 p-1 ml-1"><IconClose /></button>
      </div>

      {expandido && (
        <div className="px-3 py-3 space-y-2 border-t border-sky-100 bg-white">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Texto del botón</label>
            <input type="text" value={bloque.texto || ""} onChange={(e) => onChange(idx, "texto", e.target.value)}
              placeholder="Ver más en Residente"
              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">URL destino</label>
            <input type="text" value={bloque.url || ""} onChange={(e) => onChange(idx, "url", e.target.value)}
              placeholder="https://residente.mx/..."
              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Alineación</label>
            <div className="flex gap-1">
              {["izquierda", "centro", "derecha"].map((a) => (
                <button key={a} onClick={() => onChange(idx, "alineacion", a)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${(bloque.alineacion || "centro") === a ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}>
                  {a === "izquierda" ? "Izq" : a === "centro" ? "Centro" : "Der"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Componente: Bloque Separador ─────────────────────────────────────────────

const BloqueSeparador = ({ bloque, idx, total, onChange, onQuitar, onMover }) => {
  const etiquetas = { solido: "Línea sólida", punteado: "Línea punteada", grueso: "Línea gruesa", espacio: "Espacio" };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 cursor-grab active:cursor-grabbing select-none">
        <span className="text-gray-300"><IconDrag /></span>
        <span className="text-xs text-gray-400 font-bold w-4 shrink-0">{idx + 1}</span>
        <span className="text-gray-400"><IconSeparator /></span>
        <span className="flex-1 text-xs font-medium text-gray-700 truncate">{etiquetas[bloque.estilo || "solido"]}</span>
        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-semibold shrink-0">Divisor</span>
        <div className="flex gap-1 ml-1" onPointerDown={(e) => e.stopPropagation()}>
          {Object.entries(etiquetas).map(([val, label]) => (
            <button key={val} onClick={() => onChange(idx, "estilo", val)} title={label}
              className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${(bloque.estilo || "solido") === val ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}>
              {val === "solido" ? "—" : val === "punteado" ? "···" : val === "grueso" ? "━" : "↕"}
            </button>
          ))}
        </div>
        <BotonesMover idx={idx} total={total} onMover={onMover} />
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onQuitar(idx)} className="text-red-400 hover:text-red-600 p-1 ml-1"><IconClose /></button>
      </div>
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
    plantilla: "clasica",
    tema: { color_primario: "#000000", fuente: "helvetica" },
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
  const [plantillasDisponibles, setPlantillasDisponibles] = useState([]);
  const [fuentesDisponibles, setFuentesDisponibles] = useState([]);

  const debouncedForm = useDebounce(form, 400);

  useEffect(() => {
    setIsLoadingNotas(true);
    catalogoNotasGetTodas(100)
      .then((data) => setNotas(Array.isArray(data) ? data : []))
      .catch(() => setNotas([]))
      .finally(() => setIsLoadingNotas(false));
  }, []);

  useEffect(() => {
    if (!busqueda.trim()) { setNotasFiltradas(notas.slice(0, 50)); return; }
    const q = busqueda.toLowerCase();
    setNotasFiltradas(notas.filter((n) => n.titulo?.toLowerCase().includes(q) || n.resumen?.toLowerCase().includes(q)));
  }, [busqueda, notas]);

  useEffect(() => {
    fetch(`${urlApi}api/newsletter/campanas/plantillas`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setPlantillasDisponibles(data.plantillas || []);
        setFuentesDisponibles(data.fuentes || []);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!esEdicion) return;
    fetch(`${urlApi}api/newsletter/campanas/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(async (data) => {
        let bloques = data.notas;
        if (typeof bloques === "string") { try { bloques = JSON.parse(bloques); } catch { bloques = []; } }
        if (!Array.isArray(bloques)) bloques = [];

        bloques = await Promise.all(bloques.map(async (b) => {
          if (b.tipo === "restaurantes" || b.tipo === "cupones" || b.tipo === "imagen" || b.tipo === "texto" || b.tipo === "link" || b.tipo === "separador") return b;
          // Si ya tiene la clave descripcion (aunque sea vacía), respetarla — el usuario la editó
          if ("descripcion" in b) return b;
          try {
            const res = await fetch(`${urlApi}api/notas/id/${b.id}`, { headers: { Authorization: `Bearer ${token}` } });
            const detail = await res.json();
            return { ...b, descripcion: detail.descripcion || detail.subtitulo || "" };
          } catch { return b; }
        }));

        let temaCargado = data.tema;
        if (typeof temaCargado === "string") { try { temaCargado = JSON.parse(temaCargado); } catch { temaCargado = null; } }
        setForm({
          nombre: data.nombre || "", asunto: data.asunto || "",
          from_name: data.from_name || "Residente", logo_texto: data.logo_texto || "RESIDENTE",
          intro_texto: data.intro_texto || "", footer_texto: data.footer_texto || "",
          notas: bloques,
          plantilla: data.plantilla || "clasica",
          tema: temaCargado || { color_primario: "#000000", fuente: "helvetica" },
        });
      })
      .catch(() => setError("Error cargando campaña"));
  }, [id, esEdicion, token]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${urlApi}api/newsletter/campanas/preview-live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logo_texto: debouncedForm.logo_texto, intro_texto: debouncedForm.intro_texto, footer_texto: debouncedForm.footer_texto, notas: debouncedForm.notas, plantilla: debouncedForm.plantilla, tema: debouncedForm.tema }),
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

  const agregarBloqueImagen = () => {
    if (form.notas.length >= BLOQUES_MAX) return;
    setForm((prev) => ({ ...prev, notas: [...prev.notas, { tipo: "imagen", url: "", link: "", caption: "", tamanio: "completo", alineacion: "centro" }] }));
  };

  const agregarBloqueTexto = () => {
    if (form.notas.length >= BLOQUES_MAX) return;
    setForm((prev) => ({ ...prev, notas: [...prev.notas, { tipo: "texto", texto: "", alineacion: "izquierda" }] }));
  };

  const agregarBloqueLink = () => {
    if (form.notas.length >= BLOQUES_MAX) return;
    setForm((prev) => ({ ...prev, notas: [...prev.notas, { tipo: "link", texto: "", url: "", alineacion: "centro" }] }));
  };

  const agregarBloqueSeparador = () => {
    if (form.notas.length >= BLOQUES_MAX) return;
    setForm((prev) => ({ ...prev, notas: [...prev.notas, { tipo: "separador", estilo: "solido" }] }));
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

  const moverBloque = (idx, delta) => {
    const toIdx = idx + delta;
    if (toIdx < 0 || toIdx >= form.notas.length) return;
    setForm((prev) => ({ ...prev, notas: moverBloqueA(prev.notas, idx, toIdx) }));
  };

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

  const TIPOS_NO_NOTA = new Set(["restaurantes", "cupones", "imagen", "texto", "link", "separador"]);
  const idsNotasSeleccionadas = new Set(form.notas.filter((b) => !TIPOS_NO_NOTA.has(b.tipo)).map((b) => b.id));

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

          <div className="border border-gray-200 rounded p-3 bg-gray-50 space-y-3">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Diseño</label>

            <div>
              <label className="block text-[11px] font-semibold mb-1 text-gray-500 uppercase tracking-wide">Plantilla</label>
              <div className="grid grid-cols-2 gap-2">
                {plantillasDisponibles.map((pl) => {
                  const activa = form.plantilla === pl.id;
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      disabled={pl.placeholder}
                      onClick={() => !pl.placeholder && setForm((p) => ({ ...p, plantilla: pl.id }))}
                      className={`text-left border rounded p-2 text-xs transition ${
                        activa ? "border-black bg-white" : "border-gray-300 bg-white hover:border-gray-400"
                      } ${pl.placeholder ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      title={pl.descripcion}
                    >
                      <div className="font-bold">{pl.nombre}</div>
                      <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                        {pl.placeholder ? "Próximamente" : pl.descripcion}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold mb-1 text-gray-500 uppercase tracking-wide">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.tema?.color_primario || "#000000"}
                    onChange={(e) => setForm((p) => ({ ...p, tema: { ...p.tema, color_primario: e.target.value } }))}
                    className="h-9 w-12 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.tema?.color_primario || "#000000"}
                    onChange={(e) => setForm((p) => ({ ...p, tema: { ...p.tema, color_primario: e.target.value } }))}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-gray-500"
                  />
                </div>
                {(() => {
                  const hex = form.tema?.color_primario || "#000000";
                  const m = hex.match(/^#([0-9a-f]{6})$/i);
                  if (!m) return null;
                  const toLin = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                  const lum = 0.2126 * toLin(parseInt(m[1].slice(0,2),16)/255)
                    + 0.7152 * toLin(parseInt(m[1].slice(2,4),16)/255)
                    + 0.0722 * toLin(parseInt(m[1].slice(4,6),16)/255);
                  const bajo = (1.05 / (lum + 0.05)) < 4.5;
                  return bajo ? (
                    <p className="text-[10px] text-amber-600 mt-1 leading-tight">
                      Color claro: se aplicará solo a botones. El texto permanece negro para ser legible.
                    </p>
                  ) : null;
                })()}
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1 text-gray-500 uppercase tracking-wide">Fuente</label>
                <select
                  value={form.tema?.fuente || "helvetica"}
                  onChange={(e) => setForm((p) => ({ ...p, tema: { ...p.tema, fuente: e.target.value } }))}
                  className="w-full border border-gray-300 rounded px-2 py-2 text-xs focus:outline-none focus:border-gray-500 bg-white"
                >
                  {fuentesDisponibles.map((f) => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Encabezado</label>
            <EditorTextoRico
              value={form.logo_texto || ""}
              onChange={(html) => setForm((p) => ({ ...p, logo_texto: html }))}
              placeholder="RESIDENTE"
            />
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
            <EditorTextoRico
              value={form.intro_texto || ""}
              onChange={(html) => setForm((p) => ({ ...p, intro_texto: html }))}
              placeholder="Esta semana... Te mandamos las opciones que sí valen la pena."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600 uppercase tracking-wide">Firma de cierre</label>
            <EditorTextoRico
              value={form.footer_texto || ""}
              onChange={(html) => setForm((p) => ({ ...p, footer_texto: html }))}
              placeholder="Hasta la próxima, Equipo Residente"
            />
          </div>

          {/* ── Bloques ───────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Contenido ({form.notas.length}/{BLOQUES_MAX})</label>
              <div className="flex flex-wrap gap-1">
                <button onClick={() => setMostrarBuscador((v) => !v)} disabled={form.notas.length >= BLOQUES_MAX}
                  className="flex items-center gap-1 text-xs text-gray-700 border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 transition-colors disabled:opacity-40">
                  <IconPlus /> Nota
                </button>
                <button onClick={agregarBloqueRestaurantes} disabled={form.notas.length >= BLOQUES_MAX}
                  title="Agregar lista de restaurantes"
                  className="flex items-center gap-1 text-xs text-blue-700 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 transition-colors disabled:opacity-40">
                  <IconRestaurant /> Rest.
                </button>
                <button onClick={agregarBloqueCupones} disabled={form.notas.length >= BLOQUES_MAX}
                  title="Agregar bloque de cupones"
                  className="flex items-center gap-1 text-xs text-amber-700 border border-amber-200 px-2 py-1 rounded hover:bg-amber-50 transition-colors disabled:opacity-40">
                  <IconTicket /> Cup.
                </button>
                <button onClick={agregarBloqueImagen} disabled={form.notas.length >= BLOQUES_MAX}
                  title="Agregar imagen"
                  className="flex items-center gap-1 text-xs text-purple-700 border border-purple-200 px-2 py-1 rounded hover:bg-purple-50 transition-colors disabled:opacity-40">
                  <IconImage /> Img
                </button>
                <button onClick={agregarBloqueTexto} disabled={form.notas.length >= BLOQUES_MAX}
                  title="Agregar bloque de texto libre"
                  className="flex items-center gap-1 text-xs text-green-700 border border-green-200 px-2 py-1 rounded hover:bg-green-50 transition-colors disabled:opacity-40">
                  <IconText /> Texto
                </button>
                <button onClick={agregarBloqueLink} disabled={form.notas.length >= BLOQUES_MAX}
                  title="Agregar botón / enlace"
                  className="flex items-center gap-1 text-xs text-sky-700 border border-sky-200 px-2 py-1 rounded hover:bg-sky-50 transition-colors disabled:opacity-40">
                  <IconLink /> Enlace
                </button>
                <button onClick={agregarBloqueSeparador} disabled={form.notas.length >= BLOQUES_MAX}
                  title="Agregar separador / divisor"
                  className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 transition-colors disabled:opacity-40">
                  <IconSeparator /> Divisor
                </button>
              </div>
            </div>

            {form.notas.length === 0 && (
              <p className="text-xs text-gray-400 italic">Sin bloques. Usa los botones para agregar.</p>
            )}

            <div className="space-y-2">
              {form.notas.map((bloque, idx) => {
                const key = bloque.tipo && bloque.tipo !== "principal" && bloque.tipo !== "secundaria" ? `${bloque.tipo}-${idx}` : bloque.id;
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
                      <BloqueRestaurantes bloque={bloque} idx={idx} total={form.notas.length} onChange={actualizarBloque} onQuitar={quitarBloqueIdx} onMover={moverBloque} token={token} />
                    ) : bloque.tipo === "cupones" ? (
                      <BloqueCupones bloque={bloque} idx={idx} total={form.notas.length} onChange={actualizarBloque} onQuitar={quitarBloqueIdx} onMover={moverBloque} />
                    ) : bloque.tipo === "imagen" ? (
                      <BloqueImagen bloque={bloque} idx={idx} total={form.notas.length} onChange={actualizarBloque} onQuitar={quitarBloqueIdx} onMover={moverBloque} token={token} />
                    ) : bloque.tipo === "texto" ? (
                      <BloqueTexto bloque={bloque} idx={idx} total={form.notas.length} onChange={actualizarBloque} onQuitar={quitarBloqueIdx} onMover={moverBloque} />
                    ) : bloque.tipo === "link" ? (
                      <BloqueLink bloque={bloque} idx={idx} total={form.notas.length} onChange={actualizarBloque} onQuitar={quitarBloqueIdx} onMover={moverBloque} />
                    ) : bloque.tipo === "separador" ? (
                      <BloqueSeparador bloque={bloque} idx={idx} total={form.notas.length} onChange={actualizarBloque} onQuitar={quitarBloqueIdx} onMover={moverBloque} />
                    ) : (
                      <BloqueNota bloque={bloque} idx={idx} total={form.notas.length} onChange={actualizarBloque} onQuitar={quitarNota} onMover={moverBloque} imgApi={imgApi} plantilla={form.plantilla} />
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
