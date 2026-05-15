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

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className={`w-3.5 h-3.5 ${n <= rating ? "text-[#FFC107]" : "text-gray-300"}`}
          fill="currentColor"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </span>
  );
}

function SatisfactionRow({ item, token }) {
  const [expanded, setExpanded] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const date = new Date(item.created_at).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "short",
    timeStyle: "short",
  });
  const cats = Array.isArray(item.categorias) ? item.categorias : [];

  async function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && !transcript && token) {
      setLoadingTranscript(true);
      try {
        const res = await fetch(
          `${urlApi}api/chatbot/admin/session/${encodeURIComponent(item.session_id)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) setTranscript(await res.json());
      } catch {
        // silent
      } finally {
        setLoadingTranscript(false);
      }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Stars rating={item.rating} />
          <span className="text-xs font-semibold text-gray-700">{item.rating}/5</span>
          <span className="text-xs text-gray-400 font-mono">{item.session_id?.slice(0, 12)}…</span>
          <span className="text-xs text-gray-400">{date}</span>
          {item.message_count != null && (
            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {item.message_count} msg
            </span>
          )}
        </div>
        <button
          onClick={toggleExpand}
          className="text-xs text-gray-500 hover:text-gray-800 shrink-0"
        >
          {expanded ? "Ocultar conversación" : "Ver conversación"}
        </button>
      </div>
      {cats.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {cats.map((c) => (
            <span key={c} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              {c}
            </span>
          ))}
        </div>
      )}
      {(item.comentario || item.respuesta_esperada) && (
        <div className="space-y-2 mb-2">
          {item.comentario && (
            <p className="text-xs text-gray-700 bg-gray-50 rounded p-2 whitespace-pre-wrap">
              <span className="font-semibold">Comentario:</span> {item.comentario}
            </p>
          )}
          {item.respuesta_esperada && (
            <p className="text-xs text-orange-800 bg-orange-50 border border-orange-100 rounded p-2 whitespace-pre-wrap">
              <span className="font-semibold">Respuesta esperada:</span> {item.respuesta_esperada}
            </p>
          )}
        </div>
      )}
      {expanded && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          {loadingTranscript && (
            <p className="text-xs text-gray-400">Cargando conversación…</p>
          )}
          {transcript && transcript.interactions && transcript.interactions.length === 0 && (
            <p className="text-xs text-gray-400">Sin mensajes registrados para esta sesión.</p>
          )}
          {transcript && transcript.interactions && transcript.interactions.length > 0 && (
            <div className="space-y-2">
              {transcript.interactions.map((m) => {
                const negFeedback = (transcript.feedbacks || []).find((f) => f.interaction_id === m.id);
                return (
                  <div key={m.id} className="rounded-lg bg-gray-50 border border-gray-100 p-2">
                    <p className="text-[10px] text-gray-400 mb-1">
                      #{m.id} · {new Date(m.created_at).toLocaleString("es-MX", { timeZone: "America/Mexico_City", dateStyle: "short", timeStyle: "short" })}
                      {" · "}{m.latency_ms}ms · {m.llm_model}
                      {m.flagged_reason && (
                        <span className="ml-1 text-red-600">· flagged: {m.flagged_reason}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-900 mb-1">
                      <span className="font-semibold text-gray-500">Usuario:</span> {m.user_message}
                    </p>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">
                      <span className="font-semibold text-gray-500">Bot:</span> {m.llm_response}
                    </p>
                    {negFeedback && (
                      <p className="text-[11px] text-red-700 bg-red-50 border border-red-100 rounded p-1.5 mt-1.5">
                        <span className="font-semibold">⚠ Feedback:</span> {negFeedback.motivo}
                        {negFeedback.nota ? ` — ${negFeedback.nota}` : ""}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function buildSatParams({ ratingMin, ratingMax, dateFrom, dateTo, hasComment, hasRespuestaEsperada, categoria }) {
  const p = new URLSearchParams();
  if (ratingMin) p.set("rating_min", ratingMin);
  if (ratingMax) p.set("rating_max", ratingMax);
  if (dateFrom) p.set("date_from", dateFrom);
  if (dateTo) p.set("date_to", dateTo);
  if (hasComment) p.set("has_comment", "1");
  if (hasRespuestaEsperada) p.set("has_respuesta_esperada", "1");
  if (categoria) p.set("categoria", categoria);
  return p;
}

export default function ChatbotFeedback() {
  const { token } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [sessionSat, setSessionSat] = useState(null);
  const [satStats, setSatStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros para satisfacción de sesión
  const [satRatingMin, setSatRatingMin] = useState("");
  const [satRatingMax, setSatRatingMax] = useState("");
  const [satDateFrom, setSatDateFrom] = useState("");
  const [satDateTo, setSatDateTo] = useState("");
  const [satHasComment, setSatHasComment] = useState(false);
  const [satHasRespEsperada, setSatHasRespEsperada] = useState(false);
  const [satCategoria, setSatCategoria] = useState("");
  const [isLoadingSat, setIsLoadingSat] = useState(false);

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
        setSessionSat(data.session_satisfaction || []);
        setSatStats(data.satisfaction_stats || null);
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

  const fetchSatisfaction = useCallback(async () => {
    if (!token) return;
    setIsLoadingSat(true);
    try {
      const params = buildSatParams({
        ratingMin: satRatingMin,
        ratingMax: satRatingMax,
        dateFrom: satDateFrom,
        dateTo: satDateTo,
        hasComment: satHasComment,
        hasRespuestaEsperada: satHasRespEsperada,
        categoria: satCategoria,
      });
      params.set("limit", "50");
      const res = await fetch(`${urlApi}api/chatbot/admin/satisfaction?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSessionSat(data.satisfaction || []);
      setSatStats(data.stats || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoadingSat(false);
    }
  }, [token, satRatingMin, satRatingMax, satDateFrom, satDateTo, satHasComment, satHasRespEsperada, satCategoria]);

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

  async function handleExportSatisfactionCsv() {
    try {
      const params = buildSatParams({
        ratingMin: satRatingMin,
        ratingMax: satRatingMax,
        dateFrom: satDateFrom,
        dateTo: satDateTo,
        hasComment: satHasComment,
        hasRespuestaEsperada: satHasRespEsperada,
        categoria: satCategoria,
      });
      params.set("export", "csv");
      const res = await fetch(`${urlApi}api/chatbot/admin/satisfaction?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chatbot-satisfaction-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silencioso
    }
  }

  function resetSatFilters() {
    setSatRatingMin("");
    setSatRatingMax("");
    setSatDateFrom("");
    setSatDateTo("");
    setSatHasComment(false);
    setSatHasRespEsperada(false);
    setSatCategoria("");
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

      {/* Satisfacción de sesión */}
      {satStats && Number(satStats.total) > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-lg font-semibold">Satisfacción de sesión</h2>
            <div className="flex gap-2">
              <button
                onClick={fetchSatisfaction}
                disabled={isLoadingSat}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isLoadingSat ? "Filtrando…" : "Aplicar filtros"}
              </button>
              <button
                onClick={() => { resetSatFilters(); fetchFeedback(1); }}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={handleExportSatisfactionCsv}
                className="px-3 py-1.5 text-xs bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-gray-500 block mb-1">Rating mínimo</label>
              <select
                value={satRatingMin}
                onChange={(e) => setSatRatingMin(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
              >
                <option value="">Cualquiera</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 block mb-1">Rating máximo</label>
              <select
                value={satRatingMax}
                onChange={(e) => setSatRatingMax(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
              >
                <option value="">Cualquiera</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 block mb-1">Desde</label>
              <input
                type="date"
                value={satDateFrom}
                onChange={(e) => setSatDateFrom(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 block mb-1">Hasta</label>
              <input
                type="date"
                value={satDateTo}
                onChange={(e) => setSatDateTo(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] text-gray-500 block mb-1">Categoría/chip contiene</label>
              <input
                type="text"
                value={satCategoria}
                onChange={(e) => setSatCategoria(e.target.value)}
                placeholder="ej. respuestas vagas"
                className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-700 md:col-span-1 mt-4">
              <input
                type="checkbox"
                checked={satHasComment}
                onChange={(e) => setSatHasComment(e.target.checked)}
              />
              Solo con comentario
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 md:col-span-1 mt-4">
              <input
                type="checkbox"
                checked={satHasRespEsperada}
                onChange={(e) => setSatHasRespEsperada(e.target.checked)}
              />
              Solo con "respuesta esperada"
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold mt-0.5">{satStats.total}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500">Promedio</p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-xl font-bold">{Number(satStats.promedio || 0).toFixed(2)}</p>
                <Stars rating={Math.round(Number(satStats.promedio || 0))} />
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-xs text-emerald-700">Positivos (4-5)</p>
              <p className="text-xl font-bold text-emerald-800 mt-0.5">{satStats.positivos || 0}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-xs text-yellow-700">Neutros (3)</p>
              <p className="text-xl font-bold text-yellow-800 mt-0.5">{satStats.neutros || 0}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-700">Negativos (1-2)</p>
              <p className="text-xl font-bold text-red-800 mt-0.5">{satStats.negativos || 0}</p>
            </div>
          </div>
          {sessionSat && sessionSat.length > 0 && (
            <div className="space-y-2">
              {sessionSat.map((item) => (
                <SatisfactionRow key={item.id} item={item} token={token} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback por mensaje (thumbs down) */}
      <h2 className="text-lg font-semibold mb-3">Feedback por mensaje</h2>

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
