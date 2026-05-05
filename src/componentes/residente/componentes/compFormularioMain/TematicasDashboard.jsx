import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../Context";
import {
  tematicasGet,
  tematicaBorrar,
  tematicaEditar,
  tematicaCrear,
  tematicaGetById,
} from "../../../../componentes/api/tematicasApi.js";

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
    <div className="max-w-[600px] mx-auto py-4">
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Día de las Madres"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            required
          />
        </div>

        <div>
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

        <div>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Inicio
            </label>
            <input
              type="datetime-local"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <p className="text-xs text-gray-400 mt-1">Vacío = activa de inmediato</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Fin
            </label>
            <input
              type="datetime-local"
              name="fecha_fin"
              value={form.fecha_fin}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <p className="text-xs text-gray-400 mt-1">Vacío = sin expiración</p>
          </div>
        </div>

        <div>
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
              className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            URL del ícono (opcional)
          </label>
          <input
            type="text"
            name="icon"
            value={form.icon}
            onChange={handleChange}
            placeholder="https://residente.mx/fotos/…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
        </div>

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
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Estado
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Inicio
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Fin
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Color
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{t.nombre}</div>
                    <div className="text-xs text-gray-400">{t.slug}</div>
                    {t.descripcion && (
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {t.descripcion}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleEstatus(t)}
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
                        onClick={() => {
                          setEditandoId(t.id);
                          setSubVista("editar");
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(t.id, t.nombre)}
                        disabled={eliminando === t.id}
                        className="text-red-500 hover:text-red-700 font-medium text-sm disabled:opacity-40"
                      >
                        {eliminando === t.id ? "…" : "Borrar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TematicasDashboard;
