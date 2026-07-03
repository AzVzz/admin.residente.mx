import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaRegStar, FaGripVertical } from "react-icons/fa";
import { useAuth } from "../../../Context";
import {
  tematicasGet,
  tematicaBorrar,
  tematicaEditar,
  tematicaCrear,
  tematicaGetById,
  tematicaNotasAdmin,
  tematicaSetRestaurantes,
  tematicaSetNotaDestacada,
  tematicaSetNotasOrden,
} from "../../../../componentes/api/tematicasApi.js";
import { restaurantesBasicosGet } from "../../../../componentes/api/restaurantesBasicosGet.js";
import { imgApi } from "../../../../componentes/api/url.js";

const ESTATUS_COLOR = {
  publicada: "bg-green-100 text-green-800",
  borrador: "bg-gray-100 text-gray-600",
};

function formatFecha(f) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function logoUrl(r) {
  const u = r?.imagen || r?.url_logo;
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return `${imgApi}${u.replace(/^\/+/, "")}`;
}

// ── Restaurantes de una temática (cuadros + agregar) ─────────────────────────

// La API puede devolver restaurantes_ids como array [12] o como string "[12]"
// (columna JSON que llega serializada). Normalizamos a array de números.
function parseRestaurantesIds(valor) {
  if (Array.isArray(valor)) return valor.map((n) => Number(n)).filter((n) => !isNaN(n));
  if (typeof valor === "string" && valor.trim()) {
    try {
      const arr = JSON.parse(valor);
      if (Array.isArray(arr)) return arr.map((n) => Number(n)).filter((n) => !isNaN(n));
    } catch {
      /* string no parseable */
    }
  }
  return [];
}

const RestaurantesRow = ({ tematica, restaurantes, token, onChange }) => {
  const [ids, setIds] = useState(() =>
    parseRestaurantesIds(tematica.restaurantes_ids)
  );
  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const pickerRef = useRef(null);
  const btnRef = useRef(null);
  const inputRef = useRef(null);

  const reposicionar = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const anchoMenu = 256; // w-64
    let left = r.right + 8;
    if (left + anchoMenu > window.innerWidth - 8) {
      left = Math.max(8, r.left - anchoMenu - 8);
    }
    setCoords({ top: r.top, left });
  };

  const toggle = () => {
    if (!abierto) reposicionar();
    setAbierto((v) => !v);
  };

  useEffect(() => {
    if (!abierto) return;
    inputRef.current?.focus({ preventScroll: true });
    const onClickFuera = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setAbierto(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClickFuera);
    window.addEventListener("scroll", reposicionar, true);
    window.addEventListener("resize", reposicionar);
    return () => {
      document.removeEventListener("mousedown", onClickFuera);
      window.removeEventListener("scroll", reposicionar, true);
      window.removeEventListener("resize", reposicionar);
    };
  }, [abierto]);

  const mapa = React.useMemo(() => {
    const m = {};
    (restaurantes || []).forEach((r) => (m[r.id] = r));
    return m;
  }, [restaurantes]);

  const seleccionados = ids.map((id) => mapa[id]).filter(Boolean);

  const guardar = async (nuevos) => {
    setIds(nuevos);
    setGuardando(true);
    try {
      await tematicaSetRestaurantes(tematica.id, nuevos, token);
      onChange?.(nuevos);
    } catch (e) {
      alert(e.message || "Error al guardar restaurantes");
    } finally {
      setGuardando(false);
    }
  };

  const agregar = (id) => {
    if (ids.includes(id)) return;
    guardar([...ids, id]);
    setQuery("");
    setAbierto(false);
  };

  const quitar = (id) => guardar(ids.filter((x) => x !== id));

  const resultados = (restaurantes || []).filter((r) =>
    r.nombre_restaurante?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mt-4 pt-3 border-t border-gray-200">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Restaurantes etiquetados {guardando && <span className="text-gray-400">· guardando…</span>}
      </p>
      <div className="flex flex-wrap gap-3 items-start">
        {seleccionados.map((r) => {
          const url = logoUrl(r);
          return (
            <div key={r.id} className="w-24 flex flex-col items-center text-center group">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                {url ? (
                  <img src={url} alt={r.nombre_restaurante} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin logo</div>
                )}
                <button
                  type="button"
                  onClick={() => quitar(r.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Quitar"
                >
                  ×
                </button>
              </div>
              <span className="mt-1 text-xs text-gray-700 line-clamp-2 leading-tight">
                {r.nombre_restaurante}
              </span>
            </div>
          );
        })}

        {/* Cuadro "+" agregar */}
        <div ref={pickerRef} className="w-24 flex flex-col items-center text-center relative">
          <button
            ref={btnRef}
            type="button"
            onClick={toggle}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center text-3xl transition-colors"
            title="Agregar restaurante"
          >
            +
          </button>
          <span className="mt-1 text-xs text-gray-400">Agregar</span>

          {abierto && (
            <div
              style={{ position: "fixed", top: coords.top, left: coords.left }}
              className="z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar restaurante…"
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 max-h-60 overflow-y-auto">
                {resultados.length === 0 ? (
                  <div className="text-xs text-gray-400 px-1 py-2">Sin resultados</div>
                ) : (
                  resultados.map((r) => {
                    const yaSeleccionado = ids.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        disabled={yaSeleccionado}
                        onClick={() => agregar(r.id)}
                        className={`w-full flex items-center gap-2 px-1 py-1.5 rounded text-left ${
                          yaSeleccionado ? "cursor-default" : "hover:bg-gray-50"
                        }`}
                        title={yaSeleccionado ? "Ya seleccionado" : undefined}
                      >
                        <span className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                          {logoUrl(r) && (
                            <img
                              src={logoUrl(r)}
                              alt=""
                              className={`w-full h-full object-cover ${yaSeleccionado ? "grayscale opacity-40" : ""}`}
                              loading="lazy"
                            />
                          )}
                        </span>
                        <span className={`text-sm truncate ${yaSeleccionado ? "text-gray-300" : "text-gray-700"}`}>
                          {r.nombre_restaurante}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Form ────────────────────────────────────────────────────────────────────

const FormTematica = ({ id, onGuardado, onCancelar }) => {
  const { token } = useAuth();
  const esEdicion = Boolean(id);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    color: "#FFF200",
    icon: "",
    estatus: "borrador",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [isLoading, setIsLoading] = useState(esEdicion);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!esEdicion) return;
    (async () => {
      try {
        const data = await tematicaGetById(id, token);
        setForm({
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          color: data.color || "#FFF200",
          icon: data.icon || "",
          estatus: data.estatus || "borrador",
          fecha_inicio: data.fecha_inicio ? data.fecha_inicio.slice(0, 16) : "",
          fecha_fin: data.fecha_fin ? data.fecha_fin.slice(0, 16) : "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, token, esEdicion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setError("El nombre es requerido");
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        color: form.color || "#FFF200",
        icon: form.icon.trim() || null,
        estatus: form.estatus,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
      };
      if (esEdicion) {
        await tematicaEditar(id, payload, token);
      } else {
        await tematicaCrear(payload, token);
      }
      onGuardado();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return <div className="py-10 text-center text-gray-500">Cargando…</div>;

  return (
    <div className="max-w-[1080px] mx-auto py-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onCancelar}
          className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1"
        >
          ← Volver
        </button>
        <h2 className="text-2xl font-bold">
          {esEdicion ? "Editar Temática" : "Nueva Temática"}
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6 items-start">
          {/* Columna izquierda (chica) — configuración */}
          <aside className="w-72 shrink-0">
            {/* Estado */}
            <div className="pb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Estado
              </label>
              <div className="flex gap-4">
                {["borrador", "publicada"].map((op) => (
                  <label key={op} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="estatus"
                      value={op}
                      checked={form.estatus === op}
                      onChange={handleChange}
                      className="accent-yellow-400"
                    />
                    <span className="capitalize text-sm">{op}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Solo las temáticas <strong>publicadas</strong> aparecen en el
                carrusel del sitio.
              </p>
            </div>

            {/* Inicio */}
            <div className="pb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Inicio
              </label>
              <input
                type="datetime-local"
                name="fecha_inicio"
                value={form.fecha_inicio}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Vacío = activa de inmediato</p>
            </div>

            {/* Fin */}
            <div className="pb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Fin
              </label>
              <input
                type="datetime-local"
                name="fecha_fin"
                value={form.fecha_fin}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Vacío = sin expiración</p>
            </div>

            {/* Color */}
            <div className="pb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Color del carrusel
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  placeholder="#FFF200"
                  className="w-28 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Ícono */}
            <div className="pb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                URL del ícono (opcional)
              </label>
              <input
                type="text"
                name="icon"
                value={form.icon}
                onChange={handleChange}
                placeholder="https://residente.mx/fotos/…"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </aside>

          {/* Columna derecha (grande, principal) — contenido */}
          <div className="flex-1 min-w-0">
            {/* Nombre */}
            <div className="pb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Día de las Madres"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Descripción */}
            <div className="pb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
                placeholder="Descripción interna de la temática"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#FFF200] text-black font-bold px-6 py-2.5 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
          >
            {isSaving
              ? "Guardando…"
              : esEdicion
              ? "Guardar cambios"
              : "Crear temática"}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="bg-gray-100 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

// ── Lista ────────────────────────────────────────────────────────────────────

const TematicasDashboard = () => {
  const { token } = useAuth();
  const [subVista, setSubVista] = useState("lista"); // "lista" | "nueva" | "editar"
  const [editandoId, setEditandoId] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [expandidaId, setExpandidaId] = useState(null);
  const [notasCache, setNotasCache] = useState({}); // { [tematicaId]: nota[] }
  const [cargandoNotas, setCargandoNotas] = useState(null);
  const [restaurantes, setRestaurantes] = useState([]);
  const [destacando, setDestacando] = useState(null);
  const [guardandoOrden, setGuardandoOrden] = useState(null); // tematicaId
  const dragIndexRef = useRef(null); // índice arrastrado dentro de las 5 ordenables

  useEffect(() => {
    restaurantesBasicosGet()
      .then((data) => setRestaurantes(Array.isArray(data) ? data : []))
      .catch(() => setRestaurantes([]));
  }, []);

  const handleToggleDestacada = async (tematica, notaId) => {
    const nuevo = tematica.nota_destacada_id === notaId ? null : notaId;
    setDestacando(notaId);
    try {
      await tematicaSetNotaDestacada(tematica.id, nuevo, token);
      setItems((prev) =>
        prev.map((x) =>
          x.id === tematica.id ? { ...x, nota_destacada_id: nuevo } : x
        )
      );
    } catch (e) {
      alert(e.message || "Error al destacar la nota");
    } finally {
      setDestacando(null);
    }
  };

  // Reordena TODAS las notas no-destacadas y guarda el orden en el backend.
  const handleReordenarNotas = async (tematica, fromIdx, toIdx) => {
    if (fromIdx == null || toIdx == null || fromIdx === toIdx) return;
    const notas = notasCache[tematica.id] || [];
    const destacadas = notas.filter((n) => n.id === tematica.nota_destacada_id);
    const resto = notas.filter((n) => n.id !== tematica.nota_destacada_id);
    if (fromIdx >= resto.length || toIdx >= resto.length) return;

    const nuevo = [...resto];
    const [movido] = nuevo.splice(fromIdx, 1);
    nuevo.splice(toIdx, 0, movido);

    const nuevaCache = [...destacadas, ...nuevo];
    setNotasCache((prev) => ({ ...prev, [tematica.id]: nuevaCache }));

    const idsOrden = nuevo.map((n) => n.id);
    setGuardandoOrden(tematica.id);
    try {
      await tematicaSetNotasOrden(tematica.id, idsOrden, token);
      setItems((prev) =>
        prev.map((x) => (x.id === tematica.id ? { ...x, notas_orden: idsOrden } : x))
      );
    } catch (e) {
      alert(e.message || "Error al guardar el orden");
    } finally {
      setGuardandoOrden(null);
    }
  };

  const toggleExpandir = async (id) => {
    if (expandidaId === id) {
      setExpandidaId(null);
      return;
    }
    setExpandidaId(id);
    if (!notasCache[id]) {
      setCargandoNotas(id);
      try {
        const notas = await tematicaNotasAdmin(id, token);
        setNotasCache((prev) => ({ ...prev, [id]: Array.isArray(notas) ? notas : [] }));
      } catch {
        setNotasCache((prev) => ({ ...prev, [id]: [] }));
      } finally {
        setCargandoNotas(null);
      }
    }
  };

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tematicasGet(token);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleEliminar = async (id, nombre) => {
    if (
      !window.confirm(
        `¿Eliminar temática "${nombre}"? Las notas asociadas quedarán sin temática.`
      )
    )
      return;
    setEliminando(id);
    try {
      await tematicaBorrar(id, token);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Error al eliminar la temática");
    } finally {
      setEliminando(null);
    }
  };

  const handleToggleEstatus = async (item) => {
    setToggling(item.id);
    const nuevoEstatus = item.estatus === "publicada" ? "borrador" : "publicada";
    try {
      const updated = await tematicaEditar(
        item.id,
        { estatus: nuevoEstatus },
        token
      );
      setItems((prev) =>
        prev.map((t) =>
          t.id === item.id ? { ...t, estatus: updated.estatus } : t
        )
      );
    } catch {
      alert("Error al cambiar el estado");
    } finally {
      setToggling(null);
    }
  };

  const handleGuardado = () => {
    setSubVista("lista");
    setEditandoId(null);
    cargar();
  };

  const handleCancelar = () => {
    setSubVista("lista");
    setEditandoId(null);
  };

  if (subVista === "nueva" || subVista === "editar") {
    return (
      <FormTematica
        id={editandoId}
        onGuardado={handleGuardado}
        onCancelar={handleCancelar}
      />
    );
  }

  if (isLoading)
    return (
      <div className="py-10 text-center text-gray-500">Cargando temáticas…</div>
    );
  if (error)
    return (
      <div className="py-10 text-center text-red-500">Error: {error}</div>
    );

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Temáticas</h2>
        <button
          onClick={() => setSubVista("nueva")}
          className="bg-[#FFF200] text-black font-bold px-5 py-2 rounded-lg hover:bg-yellow-300 transition-colors"
        >
          + Nueva Temática
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center text-gray-500 py-16 border border-dashed rounded-lg">
          <p className="text-lg mb-2">No hay temáticas creadas aún</p>
          <button
            onClick={() => setSubVista("nueva")}
            className="text-blue-600 underline"
          >
            Crear la primera
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-[34%] text-left px-4 py-3 font-semibold text-gray-700">
                  Nombre
                </th>
                <th className="w-[12%] text-left px-4 py-3 font-semibold text-gray-700">
                  Estado
                </th>
                <th className="w-[8%] text-center px-4 py-3 font-semibold text-gray-700">
                  Notas
                </th>
                <th className="w-[12%] text-left px-4 py-3 font-semibold text-gray-700">
                  Inicio
                </th>
                <th className="w-[12%] text-left px-4 py-3 font-semibold text-gray-700">
                  Fin
                </th>
                <th className="w-[8%] text-left px-4 py-3 font-semibold text-gray-700">
                  Color
                </th>
                <th className="w-[14%] text-center px-4 py-3 font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((t) => (
                <React.Fragment key={t.id}>
                <tr
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleExpandir(t.id)}
                  title="Ver notas de la temática"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2 text-left group">
                      <span
                        className={`mt-0.5 text-gray-400 group-hover:text-gray-700 transition-transform ${
                          expandidaId === t.id ? "rotate-90" : ""
                        }`}
                      >
                        ▶
                      </span>
                      <span>
                        <span className="block font-semibold text-gray-900 group-hover:text-blue-700">
                          {t.nombre}
                        </span>
                        <span className="block text-xs text-gray-400">{t.slug}</span>
                        {t.descripcion && (
                          <span className="block text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {t.descripcion}
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleEstatus(t);
                      }}
                      disabled={toggling === t.id}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-opacity ${ESTATUS_COLOR[t.estatus]} hover:opacity-80 disabled:opacity-40`}
                      title="Click para cambiar estado"
                    >
                      {toggling === t.id
                        ? "…"
                        : t.estatus === "publicada"
                        ? "Publicada"
                        : "Borrador"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      {t.notas_count ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatFecha(t.fecha_inicio)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatFecha(t.fecha_fin)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block w-6 h-6 rounded border border-gray-300"
                      style={{ background: t.color || "#FFF200" }}
                      title={t.color}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditandoId(t.id);
                          setSubVista("editar");
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEliminar(t.id, t.nombre);
                        }}
                        disabled={eliminando === t.id}
                        className="text-red-500 hover:text-red-700 font-medium text-sm disabled:opacity-40"
                      >
                        {eliminando === t.id ? "…" : "Borrar"}
                      </button>
                    </div>
                  </td>
                </tr>

                {expandidaId === t.id && (
                  <tr className="bg-gray-50/60">
                    <td colSpan={7} className="px-6 py-4">
                      {cargandoNotas === t.id ? (
                        <div className="text-sm text-gray-500 py-2">Cargando notas…</div>
                      ) : (notasCache[t.id] || []).length === 0 ? (
                        <div className="text-sm text-gray-400 py-2">
                          Esta temática no tiene notas asignadas.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-1">
                          <p className="text-xs text-gray-400">
                            La destacada (★) es la foto grande. Arrastra ⠿ para
                            reordenar las notas en el orden que quieras.
                            {guardandoOrden === t.id && (
                              <span className="ml-2 text-blue-500">Guardando…</span>
                            )}
                          </p>
                          {(() => {
                            const notas = notasCache[t.id] || [];
                            const destacadas = notas.filter(
                              (n) => n.id === t.nota_destacada_id
                            );
                            const resto = notas.filter(
                              (n) => n.id !== t.nota_destacada_id
                            );

                            const renderFila = (nota, esDestacada, ordenable, idx) => (
                              <div
                                key={nota.id}
                                draggable={ordenable}
                                onDragStart={
                                  ordenable
                                    ? () => {
                                        dragIndexRef.current = idx;
                                      }
                                    : undefined
                                }
                                onDragOver={
                                  ordenable ? (e) => e.preventDefault() : undefined
                                }
                                onDrop={
                                  ordenable
                                    ? (e) => {
                                        e.preventDefault();
                                        handleReordenarNotas(
                                          t,
                                          dragIndexRef.current,
                                          idx
                                        );
                                        dragIndexRef.current = null;
                                      }
                                    : undefined
                                }
                                className={`flex items-center gap-3 bg-white border rounded-lg p-2 hover:shadow-sm transition-shadow ${
                                  esDestacada
                                    ? "border-yellow-300 ring-1 ring-yellow-200"
                                    : "border-gray-200"
                                } ${ordenable ? "cursor-move" : ""}`}
                              >
                                {ordenable ? (
                                  <FaGripVertical
                                    className="w-3.5 h-3.5 text-gray-300 shrink-0"
                                    title="Arrastra para reordenar"
                                  />
                                ) : (
                                  <span className="w-3.5 shrink-0" />
                                )}
                                {nota.imagen ? (
                                  <img
                                    src={nota.imagen}
                                    alt={nota.titulo}
                                    className="w-20 h-14 object-cover rounded-md shrink-0"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-20 h-14 rounded-md bg-gray-100 flex items-center justify-center text-gray-300 text-xs shrink-0">
                                    Sin foto
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {nota.nombre_restaurante && (
                                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 truncate">
                                        {nota.nombre_restaurante}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-400 font-mono shrink-0">
                                      #{nota.id}
                                    </span>
                                  </div>
                                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                    {nota.titulo}
                                  </h3>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleToggleDestacada(t, nota.id)}
                                  disabled={destacando === nota.id}
                                  className="shrink-0 disabled:opacity-40"
                                  title={
                                    esDestacada
                                      ? "Quitar destacada"
                                      : "Marcar como destacada"
                                  }
                                >
                                  {esDestacada ? (
                                    <FaStar className="w-4 h-4 text-yellow-400" />
                                  ) : (
                                    <FaRegStar className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
                                  )}
                                </button>
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                    ESTATUS_COLOR[nota.estatus] ||
                                    "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {nota.estatus === "publicada"
                                    ? "Publicada"
                                    : "Borrador"}
                                </span>
                                <Link
                                  to={`/dashboard/nota/editar/${nota.id}`}
                                  className="text-blue-600 hover:text-blue-800 font-medium text-sm shrink-0"
                                >
                                  Editar
                                </Link>
                              </div>
                            );

                            return (
                              <>
                                {destacadas.map((nota) =>
                                  renderFila(nota, true, false, -1)
                                )}
                                {resto.map((nota, i) =>
                                  renderFila(nota, false, true, i)
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      <RestaurantesRow
                        tematica={t}
                        restaurantes={restaurantes}
                        token={token}
                        onChange={(ids) =>
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === t.id ? { ...x, restaurantes_ids: ids } : x
                            )
                          )
                        }
                      />
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TematicasDashboard;
