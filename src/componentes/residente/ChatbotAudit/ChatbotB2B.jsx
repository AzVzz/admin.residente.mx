import { useState, useCallback, useEffect } from "react";
import { urlApi } from "../../api/url";
import { useAuth } from "../../Context";
import DenueAdmin from "./DenueAdmin";

function formatShort(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function StatCard({ label, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">{label}</p>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value ?? "—"}</span>
    </div>
  );
}

// --- Audit helpers ---

function parseJSON(raw) {
  if (!raw) return null;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return raw;
}

function parseEntities(raw) {
  const parsed = parseJSON(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function entityType(e) {
  return (e.type || e.source_type || e.entity_type || "").toLowerCase();
}

function entityLabel(e) {
  const t = entityType(e);
  if (t.includes("denue")) {
    const loc = e.municipio ? ` — ${e.municipio}` : "";
    return `${e.nombre || e.name || "—"}${loc}`;
  }
  if (t.includes("nota") || t.includes("note")) return e.titulo || e.title || String(e.id || "—");
  if (t.includes("doc")) return e.titulo || e.title || e.filename || String(e.id || "—");
  return `${e.entity_type || e.type || "—"} #${e.id || ""}`;
}

function groupLabel(type) {
  const t = type.toLowerCase();
  if (t.includes("doc")) return "Documentos";
  if (t.includes("nota") || t.includes("note")) return "Notas B2B";
  if (t.includes("denue")) return "DENUE";
  return "Entidades";
}

function groupEntities(entities) {
  const groups = {};
  for (const e of entities) {
    const key = e.type || e.source_type || e.entity_type || "otro";
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return groups;
}

// --- Component ---

export default function ChatbotB2B() {
  const { token } = useAuth();

  // B2B index
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Conversation audit
  const [auditData, setAuditData] = useState(null);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [expandedInteraction, setExpandedInteraction] = useState(null);

  const fetchStatus = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${urlApi}api/chatbot/admin/b2b-index-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchAudit = useCallback(async (sessionId = null) => {
    if (!token) return;
    setIsAuditLoading(true);
    setAuditError(null);
    try {
      const qs = sessionId
        ? `?limit=50&session_id=${encodeURIComponent(sessionId)}`
        : "?limit=50";
      const res = await fetch(`${urlApi}api/chatbot/admin/b2b-interactions${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setAuditData(json);
    } catch (e) {
      setAuditError(e.message);
    } finally {
      setIsAuditLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  useEffect(() => { fetchAudit(); }, [fetchAudit]);

  const handleSessionClick = useCallback((sesion) => {
    setExpandedInteraction(null);
    if (selectedSession === sesion.session_id) {
      setSelectedSession(null);
      fetchAudit(null);
    } else {
      setSelectedSession(sesion.session_id);
      fetchAudit(sesion.session_id);
    }
  }, [selectedSession, fetchAudit]);

  const doc = data?.documentos;
  const notas = data?.notas_b2b;
  const denue = data?.denue;

  const sesiones = auditData?.sesiones ?? [];
  const interacciones = auditData?.interacciones ?? [];
  const isEmpty = !auditData || (sesiones.length === 0 && interacciones.length === 0);

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-4">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Chatbot B2B</h1>
          <p className="text-sm text-gray-400 mt-0.5">Estado del índice vectorial B2B · Qdrant</p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={isLoading}
          className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {/* B2B index */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Índice B2B</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {isLoading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Documents */}
          <StatCard label="Documentos">
            <div className="space-y-1.5">
              <Row label="Archivos" value={doc?.archivos?.toLocaleString()} />
              <Row
                label="Chunks indexados"
                value={
                  doc
                    ? `${(doc.chunks_indexados ?? 0).toLocaleString()} / ${(doc.chunks ?? 0).toLocaleString()}`
                    : "—"
                }
              />
              <Row label="Último import" value={formatShort(doc?.ultimo_import)} />
            </div>
          </StatCard>

          {/* B2B notes */}
          <StatCard label="Notas B2B">
            <div className="space-y-1.5">
              <Row label="En base de datos" value={notas?.total_db?.toLocaleString()} />
              <Row label="Puntos en Qdrant" value={notas?.puntos_qdrant?.toLocaleString()} />
            </div>
          </StatCard>

          {/* DENUE stats */}
          <StatCard label="DENUE">
            <div className="space-y-1.5">
              <Row label="Total" value={denue?.total_db?.toLocaleString()} />
              <Row label="Indexados" value={denue?.indexados?.toLocaleString()} />
              <Row label="Puntos en Qdrant" value={denue?.puntos_qdrant?.toLocaleString()} />
            </div>
          </StatCard>
        </div>
      )}

      {/* Conversation audit */}
      <div className="border-t border-gray-200 pt-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Auditoría de conversaciones</h2>
          <button
            onClick={() => {
              setSelectedSession(null);
              setExpandedInteraction(null);
              fetchAudit(null);
            }}
            disabled={isAuditLoading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isAuditLoading ? "Cargando…" : "Refrescar"}
          </button>
        </div>

        {auditError && <p className="text-red-500 text-sm mb-4">{auditError}</p>}

        {isAuditLoading && !auditData ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl h-10 animate-pulse" />
            ))}
          </div>
        ) : isEmpty ? (
          <p className="text-sm text-gray-400">Sin conversaciones B2B aún.</p>
        ) : (
          <>
            {/* Sessions sub-table */}
            {sesiones.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Sesiones</p>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                        <th className="px-4 py-2.5 font-medium">Usuario</th>
                        <th className="px-4 py-2.5 font-medium text-right">Preguntas</th>
                        <th className="px-4 py-2.5 font-medium text-right">Tokens</th>
                        <th className="px-4 py-2.5 font-medium">Primera → Última</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sesiones.map((s) => {
                        const isSelected = selectedSession === s.session_id;
                        const displayName = s.usuario || s.user_id || s.session_id || "—";
                        return (
                          <tr
                            key={s.session_id}
                            onClick={() => handleSessionClick(s)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-4 py-2.5 text-gray-800 font-medium">{displayName}</td>
                            <td className="px-4 py-2.5 text-right text-gray-600">{s.preguntas ?? "—"}</td>
                            <td className="px-4 py-2.5 text-right text-gray-600">
                              {s.tokens_total != null ? s.tokens_total.toLocaleString() : "—"}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                              {formatShort(s.primera)}
                              {s.ultima && s.ultima !== s.primera ? ` → ${formatShort(s.ultima)}` : ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {selectedSession && (
                  <p className="text-xs text-blue-600 mt-1.5">
                    Filtrando por sesión ·{" "}
                    <button
                      onClick={() => { setSelectedSession(null); fetchAudit(null); }}
                      className="underline"
                    >
                      Limpiar filtro
                    </button>
                  </p>
                )}
              </div>
            )}

            {/* Interactions list */}
            {interacciones.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Interacciones
                  {auditData?.total != null ? ` · ${auditData.total} total` : ""}
                </p>
                <div className="space-y-1.5">
                  {interacciones.map((ix) => {
                    const isExpanded = expandedInteraction === ix.id;
                    const entities = parseEntities(ix.retrieved_entities);
                    const layers = parseJSON(ix.retrieval_layers);
                    const model = [ix.llm_provider, ix.llm_model].filter(Boolean).join(" / ");
                    const displayUser = ix.usuario || ix.user_id || "—";
                    const msgShort = ix.user_message
                      ? ix.user_message.slice(0, 120) + (ix.user_message.length > 120 ? "…" : "")
                      : "—";

                    return (
                      <div key={ix.id} className="rounded-xl border border-gray-200 overflow-hidden">
                        {/* Collapsed row */}
                        <button
                          onClick={() => setExpandedInteraction(isExpanded ? null : ix.id)}
                          className="w-full text-left px-4 py-3 flex flex-wrap gap-x-4 gap-y-1 items-center hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {formatShort(ix.created_at)}
                          </span>
                          <span className="text-xs font-medium text-gray-700">{displayUser}</span>
                          <span className="text-sm text-gray-600 flex-1 min-w-0 truncate">{msgShort}</span>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{model || "—"}</span>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            ↑{ix.tokens_input ?? "?"} ↓{ix.tokens_output ?? "?"} tok
                          </span>
                          {ix.latency_ms != null && (
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {ix.latency_ms} ms
                            </span>
                          )}
                          {ix.flagged_reason && (
                            <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                              {ix.flagged_reason}
                            </span>
                          )}
                        </button>

                        {/* Expanded panel */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-3">
                            {/* Full message */}
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Mensaje completo</p>
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                {ix.user_message || "—"}
                              </p>
                            </div>

                            {/* LLM response */}
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Respuesta</p>
                              <div
                                className="text-sm text-gray-800 whitespace-pre-wrap bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 overflow-y-auto max-h-[300px]"
                              >
                                {ix.llm_response || "—"}
                              </div>
                            </div>

                            {/* Entity chips */}
                            {entities.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1.5">
                                  Objetos recuperados
                                </p>
                                {Object.entries(groupEntities(entities)).map(([type, items]) => (
                                  <div key={type} className="mb-2">
                                    <span className="text-xs text-gray-400 mr-2">
                                      {groupLabel(type)}:
                                    </span>
                                    <span className="inline-flex flex-wrap gap-1">
                                      {items.map((e, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full"
                                        >
                                          {entityLabel(e)}
                                        </span>
                                      ))}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Retrieval layers */}
                            {layers && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                  Retrieval layers
                                </p>
                                <pre className="text-xs text-gray-600 bg-white border border-gray-100 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap">
                                  {JSON.stringify(layers, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              auditData && (
                <p className="text-sm text-gray-400">Sin interacciones para esta sesión.</p>
              )
            )}
          </>
        )}
      </div>

      {/* Embedded DENUE census */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Censo DENUE</h2>
        <DenueAdmin isEmbedded />
      </div>
    </div>
  );
}
