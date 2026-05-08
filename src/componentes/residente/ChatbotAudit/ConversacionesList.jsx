import React, { useState, useEffect } from "react";
import { urlApi } from "../../api/url";
import { useAuth } from "../../Context";

const LIMIT = 20;

const FLAG_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "null", label: "Sin flag" },
  { value: "injection_attempt", label: "Injection" },
  { value: "off_topic_pre", label: "Off-topic" },
  { value: "raw_coordinates_pre", label: "Coordenadas" },
  { value: "empty_message", label: "Vacío" },
  { value: "message_too_long", label: "Muy largo" },
  { value: "pii_phone", label: "PII teléfono" },
  { value: "pii_email", label: "PII correo" },
  { value: "system_prompt_leak", label: "Leak prompt" },
];

function safeJson(val) {
  if (val == null) return null;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

function Field({ label, value }) {
  return (
    <div className="flex gap-3 flex-wrap">
      <span className="font-medium text-gray-500 min-w-[130px]">{label}</span>
      <span className="text-gray-800 break-all flex-1">{value}</span>
    </div>
  );
}

export default function ConversacionesList() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [flagged, setFlagged] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ page, limit: LIMIT });
    if (flagged) params.set("flagged", flagged);

    fetch(`${urlApi}api/chatbot/admin/interactions?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setRows(d.interactions || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [token, page, flagged]);

  function handleFlagChange(e) {
    setFlagged(e.target.value);
    setPage(1);
  }

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">Conversaciones del Chatbot</h1>
      <p className="text-sm text-gray-400 mb-6">Historial de interacciones con Resi</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="flag-filter" className="text-sm font-medium text-gray-600">Flag:</label>
          <select
            id="flag-filter"
            value={flagged}
            onChange={handleFlagChange}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-black"
          >
            {FLAG_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <span className="text-sm text-gray-400 ml-auto">{total} registros</span>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Sesión</th>
              <th className="px-4 py-3 text-left">Mensaje</th>
              <th className="px-4 py-3 text-left">Flag</th>
              <th className="px-4 py-3 text-left">Modelo</th>
              <th className="px-4 py-3 text-left">Tokens</th>
              <th className="px-4 py-3 text-left">ms</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-400">Cargando...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-400">Sin resultados</td>
              </tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2 font-mono text-xs text-gray-400">{r.id}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-500 max-w-[90px] truncate" title={r.session_id}>
                  {r.session_id}
                </td>
                <td className="px-4 py-2 max-w-[220px] truncate text-gray-800" title={r.user_message}>
                  {r.user_message}
                </td>
                <td className="px-4 py-2">
                  {r.flagged_reason ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-600 border border-red-200">
                      {r.flagged_reason}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{r.llm_model}</td>
                <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">
                  {r.tokens_input != null ? `${r.tokens_input}+${r.tokens_output}` : "—"}
                </td>
                <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{r.latency_ms}ms</td>
                <td className="px-4 py-2 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString("es-MX", {
                    timeZone: "America/Mexico_City",
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setSelected(r)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-1.5 text-sm border rounded disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-500">{page} / {pages}</span>
          <button
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-1.5 text-sm border rounded disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-lg">Interacción #{selected.id}</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <Field label="Sesión" value={selected.session_id} />
              <Field label="IP hash" value={selected.user_ip_hash} />
              <Field label="Flag" value={selected.flagged_reason || "—"} />
              <Field label="Modelo" value={`${selected.llm_provider} / ${selected.llm_model}`} />
              <Field label="Tokens" value={`${selected.tokens_input ?? "?"} entrada · ${selected.tokens_output ?? "?"} salida`} />
              <Field
                label="Latencias"
                value={`total ${selected.latency_ms}ms · retrieval ${selected.latency_retrieval_ms ?? "—"}ms · LLM ${selected.latency_llm_ms ?? "—"}ms`}
              />

              <div>
                <p className="font-medium text-gray-500 mb-1">Mensaje del usuario</p>
                <p className="bg-gray-50 rounded-lg p-3 text-gray-800 whitespace-pre-wrap break-words">
                  {selected.user_message}
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-500 mb-1">Respuesta del bot</p>
                <p className="bg-gray-50 rounded-lg p-3 text-gray-800 whitespace-pre-wrap break-words">
                  {selected.llm_response}
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-500 mb-1">Entidades recuperadas</p>
                <pre className="bg-gray-50 rounded-lg p-3 text-xs overflow-auto text-gray-700 max-h-40">
                  {JSON.stringify(safeJson(selected.retrieved_entities), null, 2)}
                </pre>
              </div>

              <div>
                <p className="font-medium text-gray-500 mb-1">Retrieval layers</p>
                <pre className="bg-gray-50 rounded-lg p-3 text-xs overflow-auto text-gray-700">
                  {JSON.stringify(safeJson(selected.retrieval_layers), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
