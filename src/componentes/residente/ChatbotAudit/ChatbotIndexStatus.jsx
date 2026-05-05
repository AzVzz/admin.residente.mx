import React, { useState, useCallback, useEffect, useRef } from "react";
import { urlApi } from "../../api/url";
import { useAuth } from "../../Context";

const ENTITY_LABELS = {
  restaurante: "Restaurantes",
  nota: "Notas",
  cupon: "Cupones",
  evento: "Eventos",
  receta: "Recetas",
};

const ENTITY_ORDER = ["restaurante", "nota", "cupon", "evento", "receta"];

const ONLY_PARAM = {
  restaurante: "restaurantes",
  nota: "notas",
  cupon: "cupones",
  evento: "eventos",
  receta: "recetas",
};

function StatusBadge({ pct }) {
  if (pct === 100) return <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">Completo</span>;
  if (pct > 0) return <span className="px-2 py-0.5 rounded text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">Parcial {pct}%</span>;
  return <span className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-600 border border-red-200">Sin indexar</span>;
}

function ProgressBar({ pct, color = null }) {
  const c = color ?? (pct === 100 ? "bg-green-500" : pct > 0 ? "bg-yellow-400" : "bg-gray-200");
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
      <div className={`${c} h-2 rounded-full transition-all duration-300`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

function MissingTable({ missing }) {
  if (!missing || missing.length === 0) return <p className="text-xs text-green-600">Todos indexados</p>;
  const hasSubtipo = missing.some((r) => r.subtipo != null);
  return (
    <div className="overflow-y-auto max-h-52 rounded-lg border border-gray-100">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-3 py-2 text-left text-gray-500 font-medium">ID</th>
            <th className="px-3 py-2 text-left text-gray-500 font-medium">Nombre</th>
            {hasSubtipo && <th className="px-3 py-2 text-left text-gray-500 font-medium">Tipo</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {missing.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-3 py-1.5 text-gray-400 font-mono">{r.id}</td>
              <td className="px-3 py-1.5 text-gray-700">{r.nombre}</td>
              {hasSubtipo && <td className="px-3 py-1.5 text-gray-400">{r.subtipo}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function useJobPoller(jobId, token, onDone) {
  const [job, setJob] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!jobId) { setJob(null); return; }

    const poll = async () => {
      try {
        const res = await fetch(`${urlApi}api/chatbot/admin/reindex-job/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setJob(data);
        if (data.status === "done" || data.status === "error") {
          clearInterval(intervalRef.current);
          onDone(data);
        }
      } catch {}
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);
    return () => clearInterval(intervalRef.current);
  }, [jobId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  return job;
}

function JobProgressBar({ job, total }) {
  if (!job) return null;
  const done = job.procesados + job.errores;
  const cap = job.total || total || 1;
  const pct = Math.round((done / cap) * 100);

  if (job.status === "done") {
    return (
      <div className="mt-2">
        <ProgressBar pct={100} color="bg-green-500" />
        <p className="text-xs text-blue-600 mt-1">
          {job.procesados} indexados{job.errores ? ` · ${job.errores} errores` : ""}
          {job.elapsed_ms ? ` · ${(job.elapsed_ms / 1000).toFixed(1)}s` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <ProgressBar pct={pct} color="bg-blue-400" />
      <p className="text-xs text-gray-500 mt-1">
        {job.procesados} / {job.total} indexados
        {job.errores > 0 ? ` · ${job.errores} errores` : ""}
        {job.status?.startsWith("running:") ? ` · ${job.status.replace("running:", "")}` : ""}
      </p>
    </div>
  );
}

function EntityCard({ entity, token, onRefresh }) {
  const [missingJobId, setMissingJobId] = useState(null);
  const [reindexJobId, setReindexJobId] = useState(null);
  const [missingMsg, setMissingMsg] = useState(null);
  const [reindexMsg, setReindexMsg] = useState(null);
  const [showMissing, setShowMissing] = useState(false);
  const [missing, setMissing] = useState(null);
  const [loadingMissing, setLoadingMissing] = useState(false);

  const missingJob = useJobPoller(missingJobId, token, (done) => {
    setMissingJobId(null);
    setMissing(null);
    setMissingMsg(
      done.procesados === 0 && done.errores === 0
        ? "Nada pendiente"
        : `${done.procesados} indexados${done.errores ? ` · ${done.errores} errores` : ""} · ${(done.elapsed_ms / 1000).toFixed(1)}s`
    );
    onRefresh();
  });

  const reindexJob = useJobPoller(reindexJobId, token, (done) => {
    setReindexJobId(null);
    setReindexMsg(
      `${done.re_embebidos ?? 0} reembebidos · ${done.procesados ?? 0} revisados · ${(done.elapsed_ms / 1000).toFixed(1)}s`
    );
    onRefresh();
  });

  const isIndexingMissing = !!missingJobId;
  const isReindexing = !!reindexJobId;

  async function handleIndexMissing() {
    setMissingMsg(null);
    try {
      const res = await fetch(
        `${urlApi}api/chatbot/admin/reindex-missing?only=${entity.entity_type}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!data.ok) { setMissingMsg(data.error || "Error"); return; }
      if (data.jobId === null) { setMissingMsg("Nada pendiente"); return; }
      setMissingJobId(data.jobId);
    } catch {
      setMissingMsg("Error de conexión");
    }
  }

  async function handleReindex() {
    setReindexMsg(null);
    try {
      const res = await fetch(
        `${urlApi}api/chatbot/admin/reindex?only=${ONLY_PARAM[entity.entity_type]}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!data.ok) { setReindexMsg(data.error || "Error"); return; }
      setReindexJobId(data.jobId);
    } catch {
      setReindexMsg("Error de conexión");
    }
  }

  async function handleShowMissing() {
    if (showMissing) { setShowMissing(false); return; }
    setShowMissing(true);
    if (missing !== null) return;
    setLoadingMissing(true);
    try {
      const res = await fetch(
        `${urlApi}api/chatbot/admin/index-status?missing=${entity.entity_type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setMissing(data.missing || []);
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
            {["nota", "receta"].includes(entity.entity_type) && entity.chunks > 0 && (
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
        {entity.faltantes > 0 && (
          <button
            onClick={handleIndexMissing}
            disabled={isIndexingMissing || isReindexing}
            className="px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isIndexingMissing
              ? `Indexandoâ€¦ (${missingJob?.procesados ?? 0}/${missingJob?.total ?? entity.faltantes > 50 ? 50 : entity.faltantes})`
              : `Indexar ${entity.faltantes > 50 ? "50 de " + entity.faltantes.toLocaleString() : entity.faltantes} faltantes`}
          </button>
        )}
        <button
          onClick={handleReindex}
          disabled={isIndexingMissing || isReindexing}
          className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isReindexing ? "Reindexandoâ€¦" : "Reindexar todo"}
        </button>
        {entity.faltantes > 0 && (
          <button
            onClick={handleShowMissing}
            disabled={isIndexingMissing}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {showMissing ? "Ocultar lista" : "Ver faltantes"}
          </button>
        )}
      </div>

      {/* Barra de progreso para indexar faltantes */}
      {(isIndexingMissing || (missingJob && missingJob.status === "done")) && (
        <JobProgressBar job={missingJob} total={entity.faltantes > 50 ? 50 : entity.faltantes} />
      )}

      {/* Resultado de indexar faltantes (sin job activo) */}
      {missingMsg && !isIndexingMissing && (
        <p className="text-xs mt-2 text-blue-600">{missingMsg}</p>
      )}

      {/* Estado del reindex completo */}
      {isReindexing && (
        <p className="text-xs mt-2 text-gray-400">
          Procesando en servidor{reindexJob?.status?.startsWith("running:") ? ` â€” ${reindexJob.status.replace("running:", "")}` : "â€¦"}
        </p>
      )}
      {reindexMsg && !isReindexing && (
        <p className="text-xs mt-2 text-gray-500">{reindexMsg}</p>
      )}

      {showMissing && entity.faltantes > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {loadingMissing ? (
            <p className="text-xs text-gray-400">Cargandoâ€¦</p>
          ) : (
            <MissingTable missing={missing} />
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

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const total = entities?.reduce((s, e) => s + e.total, 0) ?? 0;
  const indexed = entities?.reduce((s, e) => s + e.indexados, 0) ?? 0;
  const globalPct = total > 0 ? Math.round((indexed / total) * 100) : 0;

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Índice Vectorial</h1>
          <p className="text-sm text-gray-400 mt-0.5">Estado de embeddings en Qdrant · lotes de máx 50</p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={isLoading}
          className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Actualizandoâ€¦" : "Actualizar"}
        </button>
      </div>

      {entities && (
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Cobertura total</span>
            <span className="font-semibold text-gray-800">
              {indexed.toLocaleString()} / {total.toLocaleString()} ({globalPct}%)
            </span>
          </div>
          <ProgressBar pct={globalPct} />
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {isLoading && !entities ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
