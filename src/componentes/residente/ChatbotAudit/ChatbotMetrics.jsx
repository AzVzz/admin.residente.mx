import React, { useState, useCallback, useEffect } from "react";
import { urlApi } from "../../api/url";
import { useAuth } from "../../Context";
import SesionesChatbotDiarias from "./SesionesChatbotDiarias";

const API = `${urlApi}api/chatbot`;

function fmtDuration(seg) {
  if (!seg) return "—";
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${m}m ${s}s`;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("es-MX", { timeZone: "America/Mexico_City", dateStyle: "short", timeStyle: "short" });
}

const ENTITY_LABELS = { restaurante: "Restaurante", nota: "Nota", cupon: "Cupón", evento: "Evento" };

export default function ChatbotMetrics() {
  const { token } = useAuth();
  const [days, setDays] = useState(7);
  const [metrics, setMetrics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [onlyRated, setOnlyRated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const from = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
      const to = new Date().toISOString();
      const [mRes, sRes] = await Promise.all([
        fetch(`${API}/admin/metrics?from=${from}&to=${to}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/admin/sessions?page=${page}&limit=30${onlyRated ? "&only_rated=1" : ""}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!mRes.ok) throw new Error(`metrics HTTP ${mRes.status}`);
      if (!sRes.ok) throw new Error(`sessions HTTP ${sRes.status}`);
      setMetrics(await mRes.json());
      const s = await sRes.json();
      setSessions(s.sessions || []);
      setSessionsTotal(s.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, days, page, onlyRated]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const g = metrics?.globales || {};

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-bold">Métricas del chatbot</h1>
        <div className="flex gap-2 items-center text-xs">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="border-b border-gray-300 bg-transparent px-1 py-0.5 text-sm focus:outline-none">
            <option value={1}>Hoy</option>
            <option value={7}>últimos 7 días</option>
            <option value={30}>últimos 30 días</option>
            <option value={90}>últimos 90 días</option>
          </select>
          <button onClick={fetchAll} disabled={isLoading} className="text-xs underline text-gray-500 hover:text-black disabled:opacity-50">
            {isLoading ? "..." : "actualizar"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Gráfico de uso: personas y sesiones por día */}
      <div className="mb-9">
        <SesionesChatbotDiarias days={days} />
      </div>

      {/* Números grandes (estilo dashboard) */}
      <div className="mb-9 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-5">
        <div>
          <p className="text-[40px] font-bold text-black leading-[1]">{g.sesiones_totales ?? "—"}</p>
          <p className="text-sm text-black -mt-1">Sesiones</p>
        </div>
        <div>
          <p className="text-[40px] font-bold text-black leading-[1]">{g.usuarios_logueados_distintos ?? "—"}</p>
          <p className="text-sm text-black -mt-1">Usuarios logueados</p>
        </div>
        <div>
          <p className="text-[40px] font-bold text-black leading-[1]">{g.ips_distintas ?? "—"}</p>
          <p className="text-sm text-black -mt-1">IPs únicas</p>
        </div>
        <div>
          <p className="text-[40px] font-bold text-black leading-[1]">{g.promedio_mensajes ?? "—"}</p>
          <p className="text-sm text-black -mt-1">Mensajes / sesión</p>
        </div>
        <div>
          <p className="text-[40px] font-bold text-black leading-[1]">{g.impressions_totales ?? "0"}</p>
          <p className="text-sm text-black -mt-1">Impressions</p>
        </div>
        <div>
          <p className="text-[40px] font-bold text-black leading-[1]">{g.clicks_totales ?? "0"}</p>
          <p className="text-sm text-black -mt-1">Clicks</p>
        </div>
        <div>
          <p className="text-[40px] font-bold text-black leading-[1]">
            {g.impressions_totales > 0 ? `${Math.round((g.clicks_totales / g.impressions_totales) * 1000) / 10}%` : "—"}
          </p>
          <p className="text-sm text-black -mt-1">CTR global</p>
          <p className="text-[10px] text-gray-400 -mt-0.5">clicks ÷ impresiones</p>
        </div>
        <div>
          <p className="text-[40px] font-bold text-black leading-[1]">{g.csat_promedio ?? "—"}</p>
          <p className="text-sm text-black -mt-1">CSAT promedio</p>
          <p className="text-[10px] text-gray-400 -mt-0.5">satisfacción 1-5 · {g.sesiones_con_rating || 0} rateadas</p>
        </div>
        <div>
          <p className="text-[40px] font-bold text-black leading-[1]">{fmtDuration(g.promedio_duracion_seg)}</p>
          <p className="text-sm text-black -mt-1">Duración promedio</p>
        </div>
      </div>

      {/* Top entidades */}
      <div className="mb-9">
        <p className="text-[25px] leading-[1] underline mb-2">Top entidades por clicks</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-gray-500 border-b border-gray-200">
              <tr>
                <th className="text-left py-1.5 pr-2 font-normal">Tipo</th>
                <th className="text-left py-1.5 px-2 font-normal">ID</th>
                <th className="text-right py-1.5 px-2 font-normal">Impr.</th>
                <th className="text-right py-1.5 px-2 font-normal">Clicks</th>
                <th className="text-right py-1.5 pl-2 font-normal">CTR</th>
              </tr>
            </thead>
            <tbody>
              {(metrics?.top_entidades || []).map((e, i) => {
                const imp = Number(e.impressions);
                const clk = Number(e.clicks);
                const ctr = imp > 0 ? Math.round((clk / imp) * 1000) / 10 : 0;
                return (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-1.5 pr-2">{ENTITY_LABELS[e.entity_type] || e.entity_type}</td>
                    <td className="py-1.5 px-2 font-mono text-gray-500">#{e.entity_id}</td>
                    <td className="text-right py-1.5 px-2">{imp}</td>
                    <td className="text-right py-1.5 px-2 font-bold">{clk}</td>
                    <td className="text-right py-1.5 pl-2 text-gray-500">{ctr}%</td>
                  </tr>
                );
              })}
              {metrics?.top_entidades?.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-4">Sin actividad</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top queries */}
      <div className="mb-9">
        <p className="text-[25px] leading-[1] underline mb-2">Top queries</p>
        <ul className="text-sm">
          {(metrics?.top_queries || []).map((q, i) => (
            <li key={i} className="flex justify-between gap-2 border-b border-gray-100 py-1">
              <span className="text-gray-800 truncate" title={q.user_message}>"{q.user_message}"</span>
              <span className="font-bold shrink-0">{q.veces}×</span>
            </li>
          ))}
          {metrics?.top_queries?.length === 0 && (
            <li className="text-gray-400 py-2">Sin queries</li>
          )}
        </ul>
      </div>

      {/* Sesiones */}
      <div>
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <p className="text-[25px] leading-[1] underline">Sesiones <span className="text-sm font-bold text-black">({sessionsTotal})</span></p>
          <label className="flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={onlyRated} onChange={(e) => { setOnlyRated(e.target.checked); setPage(1); }} />
            Solo con CSAT
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-gray-500 border-b border-gray-200">
              <tr>
                <th className="text-left py-1.5 pr-2 font-normal">Inicio</th>
                <th className="text-left py-1.5 px-2 font-normal">Sesión</th>
                <th className="text-left py-1.5 px-2 font-normal">User</th>
                <th className="text-right py-1.5 px-2 font-normal">Msgs</th>
                <th className="text-right py-1.5 px-2 font-normal">Impr.</th>
                <th className="text-right py-1.5 px-2 font-normal">Clicks</th>
                <th className="text-right py-1.5 px-2 font-normal">Duración</th>
                <th className="text-center py-1.5 pl-2 font-normal">CSAT</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.session_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-1.5 pr-2 text-[10px] text-gray-400">{fmtDate(s.started_at)}</td>
                  <td className="py-1.5 px-2 font-mono text-[10px] text-gray-500">{s.session_id.slice(0, 12)}…</td>
                  <td className="py-1.5 px-2 text-[10px]">{s.user_id ? `#${s.user_id}` : <span className="text-gray-400">anon</span>}</td>
                  <td className="text-right py-1.5 px-2">{s.message_count}</td>
                  <td className="text-right py-1.5 px-2">{s.impressions_total}</td>
                  <td className="text-right py-1.5 px-2 font-bold">{s.clicks_total}</td>
                  <td className="text-right py-1.5 px-2 text-[10px]">{fmtDuration(s.duracion_seg)}</td>
                  <td className="text-center py-1.5 pl-2">
                    {s.satisfaction_rating ? (
                      <span className="font-bold">{s.satisfaction_rating}★</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-6">Sin sesiones</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
