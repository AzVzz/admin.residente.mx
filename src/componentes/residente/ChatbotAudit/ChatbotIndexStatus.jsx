import React, { useState, useCallback } from "react";
import { urlApi } from "../../api/url";
import { useAuth } from "../../Context";

const ENTITY_LABELS = {
  restaurante: "Restaurantes",
  nota: "Notas",
  cupon: "Cupones",
  evento: "Eventos",
};

const ENTITY_ORDER = ["restaurante", "nota", "cupon", "evento"];

const REINDEXABLE = ["restaurante", "nota"];

function StatusBadge({ pct }) {
  if (pct === 100) return <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">Completo</span>;
  if (pct > 0) return <span className="px-2 py-0.5 rounded text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">Parcial {pct}%</span>;
  return <span className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-600 border border-red-200">Sin indexar</span>;
}

function ProgressBar({ pct }) {
  const color = pct === 100 ? "bg-green-500" : pct > 0 ? "bg-yellow-400" : "bg-gray-200";
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
      <div
        className={`${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function EntityCard({ entity, token, onRefresh }) {
  const [reindexing, setReindexing] = useState(false);
  const [reindexResult, setReindexResult] = useState(null);
  const [showMissing, setShowMissing] = useState(false);
  const [missing, setMissing] = useState(null);
  const [loadingMissing, setLoadingMissing] = useState(false);

  const canReindex = REINDEXABLE.includes(entity.entity_type);

  async function handleReindex() {
    setReindexing(true);
    setReindexResult(null);
    try {
      const res = await fetch(
        `${urlApi}api/chatbot/admin/reindex?only=${entity.entity_type === "nota" ? "notas" : "restaurantes"}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setReindexResult(data.ok ? "Reindex completado" : data.error || "Error");
      onRefresh();
    } catch {
      setReindexResult("Error al ejecutar reindex");
    } finally {
      setReindexing(false);
    }
  }

  async function handleShowMissing() {
    if (showMissing) { setShowMissing(false); return; }
    setShowMissing(true);
    if (missing !== null) return;
    setLoadingMissing(true);
    try {
      const res = await fetch(
        `${urlApi}api/chatbot/admin/index-status?missing=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setMissing(data.missing_restaurantes || []);
    } catch {
      setMissing([]);
    } finally {
      setLoadingMissing(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 text-base">
            {ENTITY_LABELS[entity.entity_type] ?? entity.entity_type}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {entity.indexados.toLocaleString()} / {entity.total.toLocaleString()} indexados
            {entity.entity_type === "nota" && entity.chunks > 0 && (
              <span className="ml-1">· {entity.chunks.toLocaleString()} chunks</span>
            )}
          </p>
        </div>
        <StatusBadge pct={entity.pct} />
      </div>

      <ProgressBar pct={entity.pct} />

      {entity.faltantes > 0 && (
        <p className="text-xs text-red-500 mt-2">
          {entity.faltantes.toLocaleString()} {entity.faltantes === 1 ? "falta" : "faltan"} por indexar
        </p>
      )}

      {entity.ultimo_embed && (
        <p className="text-xs text-gray-400 mt-1">
          Último embed:{" "}
          {new Date(entity.ultimo_embed).toLocaleString("es-MX", {
            timeZone: "America/Mexico_City",
            dateStyle: "short",
            timeStyle: "short",
          })}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {canReindex && (
          <button
            onClick={handleReindex}
            disabled={reindexing}
            className="px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {reindexing ? "Indexando…" : "Reindexar"}
          </button>
        )}
        {entity.entity_type === "restaurante" && entity.faltantes > 0 && (
          <button
            onClick={handleShowMissing}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showMissing ? "Ocultar faltantes" : `Ver ${entity.faltantes} faltantes`}
          </button>
        )}
        {!canReindex && entity.pct === 0 && (
          <span className="text-xs text-gray-400 italic">Pendiente en Sprint 3</span>
        )}
      </div>

      {reindexResult && (
        <p className="text-xs mt-2 text-blue-600">{reindexResult}</p>
      )}

      {showMissing && entity.entity_type === "restaurante" && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {loadingMissing ? (
            <p className="text-xs text-gray-400">Cargando…</p>
          ) : missing && missing.length > 0 ? (
            <div className="overflow-y-auto max-h-52 rounded-lg border border-gray-100">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-500">ID</th>
                    <th className="px-3 py-2 text-left text-gray-500">Nombre</th>
                    <th className="px-3 py-2 text-left text-gray-500">Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {missing.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5 text-gray-400 font-mono">{r.id}</td>
                      <td className="px-3 py-1.5 text-gray-700">{r.nombre_restaurante}</td>
                      <td className="px-3 py-1.5 text-gray-400">{r.tipo_restaurante}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-green-600">Todos indexados</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChatbotIndexStatus() {
  const { token } = useAuth();
  const [entities, setEntities] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${urlApi}api/chatbot/admin/index-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const ordered = ENTITY_ORDER
        .map((t) => data.entities.find((e) => e.entity_type === t))
        .filter(Boolean);
      setEntities(ordered);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  React.useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const total = entities?.reduce((s, e) => s + e.total, 0) ?? 0;
  const indexed = entities?.reduce((s, e) => s + e.indexados, 0) ?? 0;
  const globalPct = total > 0 ? Math.round((indexed / total) * 100) : 0;

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Índice Vectorial</h1>
          <p className="text-sm text-gray-400 mt-0.5">Estado de embeddings en Qdrant</p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={isLoading}
          className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {entities && (
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Cobertura total</span>
            <span className="font-semibold text-gray-800">{indexed.toLocaleString()} / {total.toLocaleString()} ({globalPct}%)</span>
          </div>
          <ProgressBar pct={globalPct} />
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {isLoading && !entities ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      ) : entities ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {entities.map((e) => (
            <EntityCard
              key={e.entity_type}
              entity={e}
              token={token}
              onRefresh={fetchStatus}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
