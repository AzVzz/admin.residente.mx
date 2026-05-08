import React, { useState, useEffect } from "react";
import { urlApi } from "../../api/url";
import { useAuth } from "../../Context";

function StatCard({ title, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function ChatbotStats() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${urlApi}api/chatbot/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) return <div className="p-8 text-gray-400">Cargando estadísticas...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!stats) return null;

  const notFlagged = stats.flagged_distribution.find((f) => f.flagged_reason === null);
  const flagged = stats.flagged_distribution.filter((f) => f.flagged_reason !== null);
  const passCount = notFlagged ? Number(notFlagged.count) : 0;
  const passRate =
    stats.total_interactions > 0
      ? Math.round((passCount / stats.total_interactions) * 100)
      : 0;

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">Estadísticas del Chatbot</h1>
      <p className="text-sm text-gray-400 mb-6">Últimas 24 horas · Resi</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Conversaciones" value={stats.total_interactions} sub="en 24h" />
        <StatCard title="Tasa de pase" value={`${passRate}%`} sub="sin flag" />
        <StatCard
          title="Latencia promedio"
          value={`${stats.latency.avg_ms ?? "—"}ms`}
          sub={`LLM ${stats.latency.avg_llm_ms ?? "—"}ms · retrieval ${stats.latency.avg_retrieval_ms ?? "—"}ms`}
        />
        <StatCard
          title="Latencia máxima"
          value={`${stats.latency.max_ms ?? "—"}ms`}
          sub="pico observado"
        />
      </div>

      {/* Flagged breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold mb-4">Distribución de flags</h2>
        {flagged.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin interacciones con flag en las últimas 24 horas.</p>
        ) : (
          <div className="space-y-3">
            {flagged
              .sort((a, b) => Number(b.count) - Number(a.count))
              .map((f) => {
                const pct = stats.total_interactions > 0
                  ? Math.min(100, (Number(f.count) / stats.total_interactions) * 100)
                  : 0;
                return (
                  <div key={f.flagged_reason} className="flex items-center gap-3">
                    <span className="min-w-[180px] text-sm text-gray-700">{f.flagged_reason}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-red-400 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 min-w-[30px] text-right">
                      {f.count}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Refresh note */}
      <p className="text-xs text-gray-300 text-center">
        Los datos se actualizan al recargar la página.
      </p>
    </div>
  );
}
