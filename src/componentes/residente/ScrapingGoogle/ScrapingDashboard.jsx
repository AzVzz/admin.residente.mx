import React, { useState, useCallback, useEffect, useRef } from "react";
import { urlApi } from "../../api/url";
import { useAuth } from "../../Context";

const API_BASE = `${urlApi}api/restaurante/admin/scraping`;

function StatCard({ label, value, color = "gray" }) {
  const colorMap = {
    gray: "bg-gray-50 border-gray-200 text-gray-800",
    green: "bg-emerald-50 border-emerald-200 text-emerald-800",
    red: "bg-red-50 border-red-200 text-red-800",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
  };
  return (
    <div className={`rounded-xl border p-3 ${colorMap[color]}`}>
      <p className="text-[11px] uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-0.5">{value ?? "—"}</p>
    </div>
  );
}

function CoverageBar({ label, value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="text-xs">
      <div className="flex justify-between mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-mono text-gray-800">{value}/{total} ({pct}%)</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DetailPanel({ id, token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/detail/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) { setData(json); setLoading(false); }
      } catch (e) {
        if (!cancelled) { setError(e.message); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [id, token]);

  if (loading) return <div className="p-4 text-xs text-gray-500">Cargando detalle...</div>;
  if (error) return <div className="p-4 text-xs text-red-600">Error: {error}</div>;
  if (!data) return null;

  const extra = data.google_extra || {};
  const items = data.menu_items_normalizados || [];
  const horariosDb = data.opening_hours_db?.weekday_text || extra.horarios || [];

  // Agrupar items por categoría
  const itemsPorCategoria = items.reduce((acc, it) => {
    const cat = it.categoria || "Sin categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(it);
    return acc;
  }, {});

  return (
    <div className="bg-gray-50 border-t-2 border-black p-4">
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Sitio web</p>
          {extra.sitio_web ? (
            <a href={extra.sitio_web} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline break-all">{extra.sitio_web}</a>
          ) : <span className="text-xs text-gray-400">—</span>}
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Teléfono</p>
          <span className="text-xs font-mono">{extra.telefono || data.restaurante.formatted_phone_number || "—"}</span>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Rating Google</p>
          <span className="text-xs">
            {data.restaurante.google_rating ? `${data.restaurante.google_rating}★ (${data.restaurante.google_user_ratings_total || 0} reviews)` : "—"}
          </span>
        </div>
      </div>

      {extra.direccion && (
        <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Dirección</p>
          <p className="text-xs">{extra.direccion}</p>
        </div>
      )}

      {horariosDb.length > 0 && (
        <details className="bg-white rounded-lg border border-gray-200 mb-4" open>
          <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-gray-700">🕐 Horarios ({horariosDb.length} días)</summary>
          <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {horariosDb.map((h, i) => <div key={i} className="text-xs">{h}</div>)}
          </div>
        </details>
      )}

      {extra.about_text && (
        <details className="bg-white rounded-lg border border-gray-200 mb-4">
          <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-gray-700">📝 Acerca de ({extra.about_text.length} chars)</summary>
          <pre className="p-3 text-[11px] whitespace-pre-wrap font-sans text-gray-700 max-h-64 overflow-y-auto">{extra.about_text}</pre>
        </details>
      )}

      {extra.amenities?.length > 0 && (
        <details className="bg-white rounded-lg border border-gray-200 mb-4">
          <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-gray-700">✅ Amenidades ({extra.amenities.length})</summary>
          <div className="p-3 flex flex-wrap gap-1.5">
            {extra.amenities.map((a, i) => <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">{a}</span>)}
          </div>
        </details>
      )}

      {extra.destacadas?.length > 0 && (
        <details className="bg-white rounded-lg border border-gray-200 mb-4">
          <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-gray-700">⭐ Destacadas ({extra.destacadas.length})</summary>
          <div className="p-3 flex flex-wrap gap-1.5">
            {extra.destacadas.map((d, i) => <span key={i} className="text-[10px] bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200">{d}</span>)}
          </div>
        </details>
      )}

      {items.length > 0 && (
        <details className="bg-white rounded-lg border border-gray-200 mb-4" open>
          <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-gray-700">🍽️ Menú ({items.length} items en {Object.keys(itemsPorCategoria).length} categorías)</summary>
          <div className="p-3 space-y-3">
            {Object.entries(itemsPorCategoria).map(([cat, list]) => (
              <div key={cat}>
                <p className="text-[11px] font-semibold text-gray-700 mb-1.5 border-b border-gray-200 pb-1">{cat} <span className="text-gray-400 font-normal">({list.length})</span></p>
                <div className="space-y-1.5">
                  {list.map((it) => (
                    <div key={it.id} className="flex items-start justify-between gap-3 text-xs">
                      <div className="flex-1">
                        <p className="font-medium">{it.nombre}</p>
                        {it.descripcion && <p className="text-[11px] text-gray-500 mt-0.5">{it.descripcion}</p>}
                      </div>
                      <span className="text-emerald-700 font-mono whitespace-nowrap text-[11px]">{it.precio_raw}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {extra.reviews_top?.length > 0 && (
        <details className="bg-white rounded-lg border border-gray-200 mb-4">
          <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-gray-700">💬 Reviews ({extra.reviews_top.length})</summary>
          <div className="p-3 space-y-3">
            {extra.reviews_top.map((rv, i) => (
              <div key={i} className="border-b border-gray-100 pb-2 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold">{rv.autor || "Anónimo"}</span>
                  {rv.stars && <span className="text-[10px] text-yellow-700">{rv.stars}</span>}
                  {rv.fecha && <span className="text-[10px] text-gray-400">{rv.fecha}</span>}
                </div>
                {rv.texto && <p className="text-[11px] text-gray-700 whitespace-pre-wrap">{rv.texto}</p>}
              </div>
            ))}
          </div>
        </details>
      )}

      {data.scrape_logs?.length > 0 && (
        <details className="bg-white rounded-lg border border-gray-200">
          <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-gray-700">📋 Últimos {data.scrape_logs.length} intentos de scrape</summary>
          <div className="p-3 space-y-1">
            {data.scrape_logs.map((l, i) => (
              <div key={i} className="text-[11px] flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${l.status === "ok" ? "bg-emerald-100 text-emerald-700" : l.status === "captcha" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{l.status}</span>
                <span className="text-gray-400">{new Date(l.created_at).toLocaleString("es-MX")}</span>
                <span className="text-gray-500">{l.items_extraidos || 0} items · {l.duracion_ms}ms</span>
                {l.error_msg && <span className="text-red-600 truncate">{l.error_msg}</span>}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function RowRest({ r, onRescrape, expanded, onToggle, token }) {
  const ok = (n) => (Number(n) > 0 ? "text-emerald-700 font-semibold" : "text-gray-300");
  return (
    <>
      <tr className="border-t border-gray-100 hover:bg-gray-50">
        <td className="px-2 py-2 text-xs">
          <div className="flex items-center gap-1.5">
            {r.es_promovido === 1 && <span className="text-[9px] bg-yellow-100 text-yellow-800 px-1 rounded">B2B</span>}
            <span className="font-mono text-gray-400">#{r.id}</span>
          </div>
        </td>
        <td className="px-2 py-2 text-xs font-medium">
          <button onClick={onToggle} className="text-left hover:underline">
            {expanded ? "▼" : "▶"} {r.nombre_restaurante}
          </button>
        </td>
        <td className={`px-2 py-2 text-xs text-center ${ok(r.menu_items)}`}>{r.menu_items || 0}</td>
        <td className={`px-2 py-2 text-xs text-center ${ok(r.amenities)}`}>{r.amenities || 0}</td>
        <td className={`px-2 py-2 text-xs text-center ${ok(r.reviews_top)}`}>{r.reviews_top || 0}</td>
        <td className={`px-2 py-2 text-xs text-center ${ok(r.destacadas)}`}>{r.destacadas || 0}</td>
        <td className={`px-2 py-2 text-xs text-center ${ok(r.about_chars)}`}>{r.about_chars || 0}</td>
        <td className="px-2 py-2 text-xs text-center">
          {r.has_horarios ? <span className="text-emerald-700">✓</span> : <span className="text-gray-300">—</span>}
        </td>
        <td className="px-2 py-2 text-xs text-center">
          {r.has_link ? <span className="text-emerald-700">✓</span> : <span className="text-red-400">×</span>}
        </td>
        <td className="px-2 py-2 text-[10px] text-gray-400">
          {r.google_extra_at ? new Date(r.google_extra_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }) : "—"}
        </td>
        <td className="px-2 py-2 text-xs">
          <button
            onClick={() => onRescrape(r.id)}
            className="text-[10px] px-2 py-0.5 border border-gray-300 rounded hover:bg-black hover:text-white transition-colors"
          >
            Re-scrape
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={11} className="p-0">
            <DetailPanel id={r.id} token={token} />
          </td>
        </tr>
      )}
    </>
  );
}

export default function ScrapingDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [filterPromo, setFilterPromo] = useState(false);
  const [filterMissing, setFilterMissing] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Launch config
  const [opts, setOpts] = useState({ all: false, skipDone: true, limit: 500, delay: 180, jitter: 30, warmupEvery: 10, freshEach: true });
  const [isLaunching, setIsLaunching] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Fila expandida (detalle)
  const [expandedId, setExpandedId] = useState(null);

  // Jobs / log
  const [jobs, setJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState(null);
  const [logTail, setLogTail] = useState("");
  const logPollRef = useRef(null);
  const logBoxRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterPromo) params.set("only_promovidos", "1");
      if (filterMissing) params.set("only_missing", "1");
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`${API_BASE}/status?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data.stats);
      setRows(data.restaurantes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [token, filterPromo, filterMissing, search]);

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/jobs`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {}
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Polling del log del job activo cada 3s
  useEffect(() => {
    if (!activeJobId) {
      if (logPollRef.current) { clearInterval(logPollRef.current); logPollRef.current = null; }
      return;
    }
    const tick = async () => {
      try {
        const res = await fetch(`${API_BASE}/log/${activeJobId}?lines=300`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        setLogTail(data.tail || "");
        if (logBoxRef.current) logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
        // Refrescar también jobs y status si terminó
        if (data.status !== "running") { fetchJobs(); fetchStatus(); }
      } catch {}
    };
    tick();
    logPollRef.current = setInterval(tick, 3000);
    return () => { if (logPollRef.current) clearInterval(logPollRef.current); };
  }, [activeJobId, token, fetchJobs, fetchStatus]);

  async function launch(body) {
    if (!token) return;
    setIsLaunching(true);
    try {
      const res = await fetch(`${API_BASE}/launch`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body || opts),
      });
      const data = await res.json();
      if (data.jobId) {
        setActiveJobId(data.jobId);
        await fetchJobs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLaunching(false);
    }
  }

  async function stopJob(jobId) {
    if (!confirm("¿Detener el job?")) return;
    await fetch(`${API_BASE}/stop/${jobId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    await fetchJobs();
  }

  async function resetAll(scope) {
    const labels = { all: "TODOS los restaurantes (empezar desde cero)", lite: "los que están con vista lite", english: "los que están en inglés" };
    if (!confirm(`⚠ Vas a borrar el scraping de ${labels[scope]}. ¿Continuar?`)) return;
    setIsResetting(true);
    try {
      const res = await fetch(`${API_BASE}/reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      const data = await res.json();
      alert(`Borrado: ${data.restaurantes_afectados ?? "?"} restaurantes afectados (scope=${scope}).`);
      await fetchStatus();
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-1">Scraping de Google Maps</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enriquece los datos de Maps en restaurantes: menú con precios, descripción, amenidades y opiniones.
      </p>

      {/* Stats globales */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard label="Total activos" value={stats.total} />
          <StatCard label="Promovidos" value={stats.promovidos} color="yellow" />
          <StatCard label="Scrapeados" value={stats.scrapeados} color="green" />
          <StatCard label="Pendientes" value={stats.pendientes} color="red" />
          <StatCard label="Sin link Maps" value={stats.sin_link} color="gray" />
        </div>
      )}

      {/* Barras de cobertura */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 grid md:grid-cols-2 gap-4">
          <CoverageBar label="Con menú" value={stats.con_menu || 0} total={stats.total || 1} />
          <CoverageBar label="Con amenidades" value={stats.con_amenities || 0} total={stats.total || 1} />
          <CoverageBar label="Con reviews" value={stats.con_reviews || 0} total={stats.total || 1} />
          <CoverageBar label="Con horarios" value={stats.con_horarios || 0} total={stats.total || 1} />
        </div>
      )}

      {/* Lanzador */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <h2 className="text-base font-semibold mb-3">Lanzar scraping</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
          <label className="text-xs">
            <span className="block text-gray-500 mb-1">Límite</span>
            <input type="number" min="1" max="2000" value={opts.limit} onChange={(e) => setOpts({ ...opts, limit: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1.5" />
          </label>
          <label className="text-xs">
            <span className="block text-gray-500 mb-1">Delay (s)</span>
            <input type="number" min="30" max="900" value={opts.delay} onChange={(e) => setOpts({ ...opts, delay: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1.5" />
          </label>
          <label className="text-xs">
            <span className="block text-gray-500 mb-1">Jitter (%)</span>
            <input type="number" min="0" max="60" value={opts.jitter} onChange={(e) => setOpts({ ...opts, jitter: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1.5" />
          </label>
          <label className="text-xs">
            <span className="block text-gray-500 mb-1">Re-warmup cada</span>
            <input type="number" min="1" max="50" value={opts.warmupEvery} onChange={(e) => setOpts({ ...opts, warmupEvery: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1.5" />
          </label>
          <div className="flex flex-col gap-1 text-xs">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={opts.all} onChange={(e) => setOpts({ ...opts, all: e.target.checked })} />
              <span>Todos (no solo B2B)</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={opts.skipDone} onChange={(e) => setOpts({ ...opts, skipDone: e.target.checked })} />
              <span>Saltar ya hechos</span>
            </label>
            <label className="flex items-center gap-1.5" title="Borra cookies y hace warmup antes de cada restaurante. +15s por scrape pero garantiza vista completa.">
              <input type="checkbox" checked={opts.freshEach} onChange={(e) => setOpts({ ...opts, freshEach: e.target.checked })} />
              <span>Sesión fresca por restaurante (recomendado)</span>
            </label>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => launch()}
            disabled={isLaunching}
            className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {isLaunching ? "Iniciando…" : "▶ Lanzar batch"}
          </button>
          <div className="flex-1" />
          <button
            onClick={() => resetAll("lite")}
            disabled={isResetting}
            className="px-3 py-2 text-xs border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-lg hover:bg-yellow-100 disabled:opacity-50"
          >
            🧹 Limpiar vista lite
          </button>
          <button
            onClick={() => resetAll("english")}
            disabled={isResetting}
            className="px-3 py-2 text-xs border border-blue-300 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 disabled:opacity-50"
          >
            🌐 Limpiar UI en inglés
          </button>
          <button
            onClick={() => resetAll("all")}
            disabled={isResetting}
            className="px-3 py-2 text-xs border border-red-400 bg-red-50 text-red-800 rounded-lg hover:bg-red-100 disabled:opacity-50"
          >
            🗑 Borrar TODO (empezar de cero)
          </button>
        </div>
      </div>

      {/* Jobs activos */}
      {jobs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <h2 className="text-base font-semibold mb-3">Jobs</h2>
          <div className="space-y-2">
            {jobs.map((j) => (
              <div key={j.jobId} className={`flex items-center justify-between px-3 py-2 rounded border ${j.jobId === activeJobId ? "border-black bg-gray-50" : "border-gray-200"}`}>
                <div className="text-xs">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] mr-2 ${j.status === "running" ? "bg-blue-100 text-blue-700" : j.status === "killed" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                    {j.status}
                  </span>
                  <span className="font-mono text-gray-500">{j.jobId}</span>
                  <span className="text-gray-400 ml-2">PID {j.pid}</span>
                  <span className="text-gray-400 ml-2">{new Date(j.started_at).toLocaleString("es-MX")}</span>
                  {j.exit_code != null && <span className="ml-2 text-gray-500">exit={j.exit_code}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setActiveJobId(j.jobId)} className="text-[10px] px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-100">Ver log</button>
                  {j.status === "running" && (
                    <button onClick={() => stopJob(j.jobId)} className="text-[10px] px-2 py-0.5 border border-red-300 text-red-700 rounded hover:bg-red-50">Detener</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {activeJobId && (
            <pre ref={logBoxRef} className="mt-3 bg-black text-emerald-300 text-[11px] font-mono p-3 rounded max-h-72 overflow-y-auto whitespace-pre-wrap">
              {logTail || "Esperando log..."}
            </pre>
          )}
        </div>
      )}

      {/* Filtros + tabla */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h2 className="text-base font-semibold">Restaurantes ({rows.length})</h2>
          <div className="flex gap-2 items-center text-xs">
            <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchStatus()}
              className="border border-gray-300 rounded px-2 py-1.5 w-48" />
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={filterPromo} onChange={(e) => setFilterPromo(e.target.checked)} />Solo B2B</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={filterMissing} onChange={(e) => setFilterMissing(e.target.checked)} />Solo pendientes</label>
            <button onClick={fetchStatus} disabled={isLoading} className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">
              {isLoading ? "..." : "Actualizar"}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-2 py-2 text-left">ID</th>
                <th className="px-2 py-2 text-left">Nombre</th>
                <th className="px-2 py-2">Items</th>
                <th className="px-2 py-2">Amen.</th>
                <th className="px-2 py-2">Rev.</th>
                <th className="px-2 py-2">Dest.</th>
                <th className="px-2 py-2">About</th>
                <th className="px-2 py-2">Hor.</th>
                <th className="px-2 py-2">Link</th>
                <th className="px-2 py-2">Último scrape</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <RowRest
                  key={r.id}
                  r={r}
                  token={token}
                  expanded={expandedId === r.id}
                  onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  onRescrape={(id) => launch({ ids: [id], all: false, skipDone: false, limit: 1, delay: 5, jitter: 0, warmupEvery: 100 })}
                />
              ))}
            </tbody>
          </table>
          {rows.length === 0 && !isLoading && (
            <p className="text-center text-gray-400 py-8 text-sm">Sin resultados</p>
          )}
        </div>
      </div>
    </div>
  );
}
