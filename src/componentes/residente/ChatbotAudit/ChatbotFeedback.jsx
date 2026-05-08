import React, { useState, useCallback, useEffect } from "react";
import { urlApi } from "../../api/url";
import { useAuth } from "../../Context";

const MOTIVO_LABELS = {
  respuesta_incorrecta: "Incorrecta",
  informacion_falsa: "Info falsa",
  fuera_de_tema: "Fuera de tema",
  otro: "Otro",
};

const MOTIVO_COLORS = {
  respuesta_incorrecta: "bg-red-50 text-red-700 border-red-200",
  informacion_falsa: "bg-orange-50 text-orange-700 border-orange-200",
  fuera_de_tema: "bg-yellow-50 text-yellow-700 border-yellow-200",
  otro: "bg-gray-50 text-gray-600 border-gray-200",
};

function MotivoBadge({ motivo }) {
  const colors = MOTIVO_COLORS[motivo] ?? "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${colors}`}>
      {MOTIVO_LABELS[motivo] ?? motivo}
    </span>
  );
}

function FeedbackRow({ item }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(item.created_at).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <MotivoBadge motivo={item.motivo} />
          <span className="text-xs text-gray-400 font-mono">#{item.interaction_id}</span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-gray-500 hover:text-gray-800 shrink-0"
        >
          {expanded ? "Ocultar" : "Ver detalle"}
        </button>
      </div>

      {item.interaction && (
        <div className="space-y-1">
          <p className="text-sm text-gray-800 font-medium truncate">
            Q: {item.interaction.user_message}
          </p>
          {expanded && (
            <>
              <p className="text-xs text-gray-600 whitespace-pre-wrap mt-2 bg-gray-50 rounded p-2">
                R: {item.interaction.llm_response}
              </p>
              {item.nota && (
                <p className="text-xs text-gray-500 mt-1 italic">Nota: {item.nota}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">Modelo: {item.interaction.llm_model}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChatbotFeedback() {
  const { token } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeedback = useCallback(
    async (p = 1) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: p, limit: 30 });
        if (motivo) params.set("motivo", motivo);
        const res = await fetch(`${urlApi}api/chatbot/admin/feedback?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setFeedback(data.feedback);
        setTotal(data.total);
        setPage(data.page);
        setPages(data.pages);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    },
    [token, motivo]
  );

  useEffect(() => {
    fetchFeedback(1);
  }, [fetchFeedback]);

  async function handleExportCsv() {
    try {
      const params = new URLSearchParams({ export: "csv" });
      if (motivo) params.set("motivo", motivo);
      const res = await fetch(`${urlApi}api/chatbot/admin/feedback?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chatbot-feedback-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silencioso
    }
  }

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Feedback del Chatbot</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total > 0 ? `${total.toLocaleString()} reportes` : "Sin reportes aún"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">Todos los motivos</option>
            {Object.entries(MOTIVO_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button
            onClick={() => fetchFeedback(1)}
            disabled={isLoading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Cargando…" : "Actualizar"}
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 text-sm bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {isLoading && !feedback ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-50 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : feedback && feedback.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-16">Sin reportes para este filtro</p>
      ) : feedback ? (
        <>
          <div className="space-y-3">
            {feedback.map((item) => (
              <FeedbackRow key={item.id} item={item} />
            ))}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => fetchFeedback(page - 1)}
                disabled={page <= 1 || isLoading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                {page} / {pages}
              </span>
              <button
                onClick={() => fetchFeedback(page + 1)}
                disabled={page >= pages || isLoading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
