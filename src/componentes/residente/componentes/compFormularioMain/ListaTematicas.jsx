import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../Context";
import { tematicasGet, tematicaBorrar, tematicaEditar } from "../../../../componentes/api/tematicasApi.js";

const ESTATUS_LABEL = { publicada: "Publicada", borrador: "Borrador" };
const ESTATUS_COLOR = { publicada: "bg-green-100 text-green-800", borrador: "bg-gray-100 text-gray-600" };

function formatFecha(f) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

const ListaTematicas = () => {
  const { token } = useAuth();
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

  useEffect(() => { cargar(); }, [cargar]);

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar temática "${nombre}"? Las notas asociadas quedarán sin temática.`)) return;
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
      const updated = await tematicaEditar(item.id, { estatus: nuevoEstatus }, token);
      setItems((prev) => prev.map((t) => (t.id === item.id ? { ...t, estatus: updated.estatus } : t)));
    } catch {
      alert("Error al cambiar el estado");
    } finally {
      setToggling(null);
    }
  };

  if (isLoading) return <div className="py-10 text-center text-gray-500">Cargando temáticas…</div>;
  if (error) return <div className="py-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard Temáticas</h1>
        <Link
          to="/tematicas/nueva"
          className="bg-[#FFF200] text-black font-bold px-5 py-2 rounded-lg hover:bg-yellow-300 transition-colors"
        >
          + Nueva Temática
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center text-gray-500 py-16 border border-dashed rounded-lg">
          <p className="text-lg mb-2">No hay temáticas creadas aún</p>
          <Link to="/tematicas/nueva" className="text-blue-600 underline">Crear la primera</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Inicio</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Fin</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Color</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{t.nombre}</div>
                    <div className="text-xs text-gray-400">{t.slug}</div>
                    {t.descripcion && (
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{t.descripcion}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleEstatus(t)}
                      disabled={toggling === t.id}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-opacity ${ESTATUS_COLOR[t.estatus]} hover:opacity-80 disabled:opacity-40`}
                      title="Click para cambiar estado"
                    >
                      {toggling === t.id ? "…" : ESTATUS_LABEL[t.estatus]}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatFecha(t.fecha_inicio)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatFecha(t.fecha_fin)}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block w-6 h-6 rounded border border-gray-300"
                      style={{ background: t.color || "#FFF200" }}
                      title={t.color}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        to={`/tematicas/editar/${t.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Editar
                      </Link>
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

export default ListaTematicas;
