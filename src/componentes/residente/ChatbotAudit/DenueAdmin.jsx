import { useState, useCallback, useEffect, useRef } from "react";
import { urlApi } from "../../api/url";
import { useAuth } from "../../Context";

function formatShort(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function StatusBadge({ status }) {
  if (status === "ok" || status === "success") {
    return <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200">{status}</span>;
  }
  if (status === "running") {
    return <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">En proceso</span>;
  }
  if (status === "error") {
    return <span className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-600 border border-red-200">Error</span>;
  }
  return <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500 border border-gray-200">{status ?? "—"}</span>;
}

function LogPanel({ jobId, token, onStop }) {
  const [lines, setLines] = useState([]);
  const [error, setError] = useState(null);
  const preRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;
    const poll = async () => {
      try {
        const res = await fetch(`${urlApi}api/restaurante/admin/denue/log/${jobId}?tail=30`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setError(`HTTP ${res.status}`); return; }
        const data = await res.json();
        setLines(data.lines || []);
      } catch {
        setError("Error de conexión");
      }
    };
    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => clearInterval(intervalRef.current);
  }, [jobId, token]);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-base">
          Job activo: <span className="font-mono text-xs text-gray-500">{jobId}</span>
        </h3>
        <button
          onClick={onStop}
          className="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          Detener
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <pre
        ref={preRef}
        className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-y-auto max-h-52 whitespace-pre-wrap break-all"
      >
        {lines.length === 0 ? "Esperando salida…" : lines.join("\n")}
      </pre>
    </div>
  );
}

export default function DenueAdmin({ isEmbedded = false }) {
  const { token } = useAuth();
  const [status, setStatus] = useState(null);
  const [municipios, setMunicipios] = useState([]);
  const [selectedMunicipios, setSelectedMunicipios] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [activeLogJob, setActiveLogJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const jobsIntervalRef = useRef(null);
  const activeLogJobRef = useRef(activeLogJob);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    activeLogJobRef.current = activeLogJob;
  }, [activeLogJob]);

  const fetchStatus = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${urlApi}api/restaurante/admin/denue/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data);
      const jobs = data.activeJobs || [];
      setActiveJobs(jobs);
      if (jobs.length > 0 && !activeLogJobRef.current) {
        setActiveLogJob(jobs[0].jobId);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchMunicipios = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${urlApi}api/restaurante/admin/denue/municipios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setMunicipios(data.municipios || data || []);
    } catch (e) { console.error("[denue municipios]", e.message); }
  }, [token]);

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${urlApi}api/restaurante/admin/denue/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const jobs = data.jobs || data || [];
      setActiveJobs(jobs);
      if (jobs.length > 0 && !activeLogJobRef.current) {
        setActiveLogJob(jobs[0].jobId);
      }
      if (jobs.length === 0) {
        setActiveLogJob(null);
      }
    } catch (e) { console.error("[denue jobs]", e.message); }
  }, [token]);

  useEffect(() => {
    fetchStatus();
    fetchMunicipios();
  }, [fetchStatus, fetchMunicipios]);

  useEffect(() => {
    jobsIntervalRef.current = setInterval(fetchJobs, 3000);
    return () => clearInterval(jobsIntervalRef.current);
  }, [fetchJobs]);

  async function handleScrape() {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setActionMsg(null);
    const body = {};
    if (selectedMunicipios.length > 0) {
      body.municipios = selectedMunicipios.join(",");
    }
    try {
      const res = await fetch(`${urlApi}api/restaurante/admin/denue/scrape`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.ok) { setActionMsg({ type: "error", text: data.error || "Error al iniciar scraper" }); return; }
      setActionMsg({ type: "ok", text: `Scraper iniciado · job ${data.jobId}` });
      setActiveLogJob(data.jobId);
      fetchJobs();
    } catch {
      setActionMsg({ type: "error", text: "Error de conexión" });
    } finally {
      isSubmittingRef.current = false;
    }
  }

  async function handleIndex() {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setActionMsg(null);
    try {
      const res = await fetch(`${urlApi}api/restaurante/admin/denue/index`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.ok) { setActionMsg({ type: "error", text: data.error || "Error al iniciar indexador" }); return; }
      setActionMsg({ type: "ok", text: `Indexador iniciado · job ${data.jobId}` });
      setActiveLogJob(data.jobId);
      fetchJobs();
    } catch {
      setActionMsg({ type: "error", text: "Error de conexión" });
    } finally {
      isSubmittingRef.current = false;
    }
  }

  async function handleStop(jobId) {
    try {
      const res = await fetch(`${urlApi}api/restaurante/admin/denue/stop/${jobId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.ok) {
        setActionMsg({ type: "ok", text: `Job ${jobId} detenido` });
        setActiveLogJob(null);
        fetchJobs();
        fetchStatus();
      } else {
        setActionMsg({ type: "error", text: data.error || "No se pudo detener" });
      }
    } catch {
      setActionMsg({ type: "error", text: "Error al detener job" });
    }
  }

  function toggleMunicipio(clave) {
    setSelectedMunicipios((prev) =>
      prev.includes(clave) ? prev.filter((c) => c !== clave) : [...prev, clave]
    );
  }

  const isScraperRunning = activeJobs.some((j) => j.fase === "scrape");
  const isIndexerRunning = activeJobs.some((j) => j.fase === "index");

  const totalRegistros = status?.total ?? 0;
  const totalIndexados = status?.indexados ?? 0;
  const ultimaActividad = status?.ultimaActividad ?? null;
  const municipioBreakdown = status?.municipios || [];
  const logHistory = status?.log || [];

  const inner = (
    <>
      {!isEmbedded && (
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold">Censo DENUE</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Directorio Estadístico Nacional de Unidades Económicas · AMM
            </p>
          </div>
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Status cards */}
      {isLoading && !status ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Total registros</p>
            <p className="text-2xl font-bold text-gray-800">{totalRegistros.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Indexados en Qdrant</p>
            <p className="text-2xl font-bold text-gray-800">{totalIndexados.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Última actividad</p>
            <p className="text-base font-semibold text-gray-700">{formatShort(ultimaActividad)}</p>
          </div>
        </div>
      )}

      {/* Municipality breakdown table */}
      {municipioBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 text-base mb-3">Desglose por municipio</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Municipio</th>
                  <th className="px-3 py-2 text-right text-gray-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {municipioBreakdown.map((m) => (
                  <tr key={m.clave ?? m.nombre} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 text-gray-700">{m.nombre}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-gray-600">
                      {(m.total ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-800 text-base mb-3">Acciones</h2>

        {municipios.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Municipios a scrapear (vacío = todos)</p>
            <div className="flex flex-wrap gap-2">
              {municipios.map((m) => (
                <button
                  key={m.clave}
                  onClick={() => toggleMunicipio(m.clave)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                    selectedMunicipios.includes(m.clave)
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {m.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleScrape}
            disabled={isScraperRunning || isIndexerRunning}
            className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isScraperRunning ? "Scrapeando…" : "Scrapear DENUE"}
          </button>
          <button
            onClick={handleIndex}
            disabled={isScraperRunning || isIndexerRunning}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isIndexerRunning ? "Indexando…" : "Indexar a Qdrant"}
          </button>
        </div>

        {actionMsg && (
          <p className={`text-xs mt-3 ${actionMsg.type === "error" ? "text-red-500" : "text-blue-600"}`}>
            {actionMsg.text}
          </p>
        )}
      </div>

      {/* Active job log panel */}
      {activeLogJob && (
        <div className="mb-6">
          <LogPanel
            jobId={activeLogJob}
            token={token}
            onStop={() => handleStop(activeLogJob)}
          />
        </div>
      )}

      {/* Log history */}
      {logHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-base mb-3">Historial reciente</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Fase</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Estado</th>
                  <th className="px-3 py-2 text-right text-gray-500 font-medium">Registros</th>
                  <th className="px-3 py-2 text-right text-gray-500 font-medium">Duración</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logHistory.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 text-gray-700 capitalize">{row.fase}</td>
                    <td className="px-3 py-1.5">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-gray-600">
                      {row.registros?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-3 py-1.5 text-right text-gray-400">{row.duracion ?? "—"}</td>
                    <td className="px-3 py-1.5 text-gray-400">{formatShort(row.fecha)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );

  if (isEmbedded) return inner;
  return <div className="max-w-[1080px] mx-auto py-8 px-4">{inner}</div>;
}
