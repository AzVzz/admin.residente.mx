import React, { useState } from "react";

// Sub-componente reutilizable: renderiza la sección "Checa tus Resultados"
// para un solo restaurante o para la vista TOTAL agregada.
//
// Props:
// - esTotal: boolean. Cuando es true, ignora `restaurante` puntual y suma todo.
// - restaurante: detalle de un restaurante (con views, clicks, slug, etc.)
// - notasStats: stats de notas del restaurante actual (total_vistas, total_clicks, notas[])
// - cupones: array de cupones del restaurante actual (ya filtrado por restaurante_id)
// - todosLosRestaurantes: array completo (solo se usa cuando esTotal=true para sumar)
// - todosLosCupones: array completo de cupones del usuario (solo cuando esTotal=true)
const MetricasRestaurante = ({
  esTotal = false,
  restaurante = null,
  notasStats = null,
  cupones = [],
  todosLosRestaurantes = [],
  todosLosCupones = [],
  chatbotStats = null,
}) => {
  const [notasOrden, setNotasOrden] = useState("vistas");
  const [notasExpandidas, setNotasExpandidas] = useState(false);

  // Sumas: si es TOTAL, agrego todos los restaurantes; si no, solo el actual.
  const restaurantesParaSumar = esTotal ? todosLosRestaurantes : restaurante ? [restaurante] : [];
  const cuponesParaSumar = esTotal ? todosLosCupones : cupones;

  const sumViewsRestaurante = restaurantesParaSumar.reduce(
    (s, r) => s + (r?.views || 0),
    0,
  );
  const sumClicksRestaurante = restaurantesParaSumar.reduce(
    (s, r) => s + (r?.clicks || 0),
    0,
  );
  const sumNotasVistas = esTotal
    ? todosLosRestaurantes.reduce(
        (s, r) => s + (r?.notasStats?.total_vistas || 0),
        0,
      )
    : notasStats?.total_vistas || 0;
  const sumNotasClicks = esTotal
    ? todosLosRestaurantes.reduce(
        (s, r) => s + (r?.notasStats?.total_clicks || 0),
        0,
      )
    : notasStats?.total_clicks || 0;
  const sumCuponesViews = cuponesParaSumar.reduce(
    (s, c) => s + (c?.views || 0),
    0,
  );
  const sumCuponesClicks = cuponesParaSumar.reduce(
    (s, c) => s + (c?.clicks || 0),
    0,
  );

  const alcanceVistas = sumViewsRestaurante + sumNotasVistas + sumCuponesViews;
  const alcanceClicks = sumClicksRestaurante + sumNotasClicks + sumCuponesClicks;

  // ─── Chatbot Resi: views/clicks últimos 30 días desde /b2b/metrics ───
  // Lookups O(1) por id desde el blob `chatbotStats` que llega del padre.
  const cbRest = (id) => chatbotStats?.restaurantes?.[id] || { impressions: 0, clicks: 0 };
  const cbNota = (id) => chatbotStats?.notas?.[id] || { impressions: 0, clicks: 0 };
  const cbCupon = (id) => chatbotStats?.cupones?.[id] || { impressions: 0, clicks: 0 };

  const sumChatbotRestVistas = restaurantesParaSumar.reduce((s, r) => s + cbRest(r?.id).impressions, 0);
  const sumChatbotRestClicks = restaurantesParaSumar.reduce((s, r) => s + cbRest(r?.id).clicks, 0);

  const notasIdsParaSumar = esTotal
    ? todosLosRestaurantes.flatMap((r) => (r?.notasStats?.notas || []).map((n) => n.id))
    : (notasStats?.notas || []).map((n) => n.id);
  const sumChatbotNotasVistas = notasIdsParaSumar.reduce((s, id) => s + cbNota(id).impressions, 0);
  const sumChatbotNotasClicks = notasIdsParaSumar.reduce((s, id) => s + cbNota(id).clicks, 0);

  const sumChatbotCuponesVistas = cuponesParaSumar.reduce((s, c) => s + cbCupon(c?.id).impressions, 0);
  const sumChatbotCuponesClicks = cuponesParaSumar.reduce((s, c) => s + cbCupon(c?.id).clicks, 0);

  const chatbotAlcanceVistas = sumChatbotRestVistas + sumChatbotNotasVistas + sumChatbotCuponesVistas;
  const chatbotAlcanceClicks = sumChatbotRestClicks + sumChatbotNotasClicks + sumChatbotCuponesClicks;

  const totalNotasCount = esTotal
    ? todosLosRestaurantes.reduce(
        (s, r) => s + (r?.notasStats?.total_notas || 0),
        0,
      )
    : notasStats?.total_notas || 0;

  // Lista de notas a mostrar: en TOTAL concateno con label de origen, sino las del restaurante.
  const notasParaListar = esTotal
    ? todosLosRestaurantes.flatMap((r) =>
        (r?.notasStats?.notas || []).map((n) => ({
          ...n,
          _origenRestaurante: r?.nombre_restaurante,
        })),
      )
    : (notasStats?.notas || []).map((n) => ({ ...n }));

  const notasOrdenadas = [...notasParaListar].sort((a, b) => {
    if (notasOrden === "vistas") return (b.vistas || 0) - (a.vistas || 0);
    if (notasOrden === "clicks") return (b.clicks || 0) - (a.clicks || 0);
    if (notasOrden === "fecha")
      return new Date(b.fecha || 0) - new Date(a.fecha || 0);
    return 0;
  });

  const tituloDirectorio = esTotal
    ? "Todos tus restaurantes"
    : restaurante?.nombre_restaurante || "Restaurante";

  return (
    <>
      {/* Alcance Total */}
      <div className="mb-6">
        <p className="text-[25px] leading-[1] underline mb-1">Alcance Total</p>
        <div className="flex gap-8 mt-1 flex-wrap">
          <div>
            <p className="text-[40px] font-bold text-black leading-[1]">
              {alcanceVistas.toLocaleString("es-MX")}
            </p>
            <p className="text-sm text-black -mt-1">
              Vistas totales
              <span className="text-gray-400 ml-1">
                · {chatbotAlcanceVistas.toLocaleString("es-MX")} chatbot
              </span>
            </p>
          </div>
          <div>
            <p className="text-[40px] font-bold text-black leading-[1]">
              {alcanceClicks.toLocaleString("es-MX")}
            </p>
            <p className="text-sm text-black -mt-1">
              Clicks totales
              <span className="text-gray-400 ml-1">
                · {chatbotAlcanceClicks.toLocaleString("es-MX")} chatbot
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Directorio */}
      <div className="mb-0">
        {esTotal ? (
          <span className="text-[25px] leading-[1] underline pr-2">
            Directorio
          </span>
        ) : (
          <a
            href={`https://residente.mx/restaurantes/${restaurante?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[25px] leading-[1] underline pr-2"
          >
            Directorio
          </a>
        )}
        <span>{tituloDirectorio}</span>
        {!esTotal && restaurante?.created_at && (
          <p className="text-xs text-gray-400 mt-0.5 mb-1">
            {(() => {
              const d = new Date(restaurante.created_at);
              const meses = [
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre",
              ];
              return `Publicado desde el ${d.getDate()} de ${meses[d.getMonth()]} del ${d.getFullYear()}`;
            })()}
          </p>
        )}

        <div className="flex gap-8 flex-wrap">
          <div>
            <p className="text-[40px] font-bold text-black leading-[1]">
              {sumViewsRestaurante.toLocaleString("es-MX")}
            </p>
            <p className="text-sm text-black -mt-1">
              {esTotal
                ? "Vistas combinadas de tus restaurantes"
                : "Vistas totales en tu restaurante"}
              <span className="text-gray-400 ml-1">
                · {sumChatbotRestVistas.toLocaleString("es-MX")} chatbot
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mb-9">
        <div className="flex gap-8 flex-wrap">
          <div>
            <p className="text-[40px] font-bold text-black leading-[1]">
              {sumClicksRestaurante.toLocaleString("es-MX")}
            </p>
            <p className="text-sm text-black -mt-1">
              {esTotal
                ? "Clicks combinados de tus restaurantes"
                : "Clicks totales en tu restaurante"}
              <span className="text-gray-400 ml-1">
                · {sumChatbotRestClicks.toLocaleString("es-MX")} chatbot
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Notas etiquetadas */}
      <div className="mb-9">
        <span className="text-[25px] leading-[1] underline pr-2">Notas</span>
        <span>{tituloDirectorio}</span>
        <span className="text-sm font-bold text-black">
          {totalNotasCount > 0 ? ` (${totalNotasCount})` : ""}
        </span>

        <div className="leading-tight mb-1">
          <p className="text-[40px] font-bold text-black leading-[1]">
            {sumNotasVistas.toLocaleString("es-MX")}
          </p>
          <p className="text-sm text-black -mt-1">
            Suma de vistas de notas etiquetadas
            <span className="text-gray-400 ml-1">
              · {sumChatbotNotasVistas.toLocaleString("es-MX")} chatbot
            </span>
          </p>
        </div>
        <div className="leading-tight mb-2">
          <p className="text-[40px] font-bold text-black leading-[1]">
            {sumNotasClicks.toLocaleString("es-MX")}
          </p>
          <p className="text-sm text-black -mt-1">
            Suma de clicks de notas etiquetadas
            <span className="text-gray-400 ml-1">
              · {sumChatbotNotasClicks.toLocaleString("es-MX")} chatbot
            </span>
          </p>
        </div>

        {notasParaListar.length > 0 ? (
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <span className="text-[11px] text-gray-400">Ordenar:</span>
              {[
                { key: "vistas", label: "Vistas" },
                { key: "clicks", label: "Clicks" },
                { key: "fecha", label: "Fecha" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNotasOrden(key)}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                    notasOrden === key
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-500 border-gray-300 hover:border-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-0.5">
              {notasOrdenadas
                .slice(0, notasExpandidas ? undefined : 3)
                .map((nota) => (
                  <div
                    key={`${nota.id}-${nota._origenRestaurante || ""}`}
                    className="flex justify-between items-center text-xs py-0.5"
                  >
                    <a
                      href={`https://residente.mx/notas/${nota.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate max-w-[55%] text-black font-medium hover:text-gray-600"
                      title={nota.titulo}
                    >
                      {nota.titulo}
                      {esTotal && nota._origenRestaurante && (
                        <span className="block text-[10px] text-gray-400">
                          {nota._origenRestaurante}
                        </span>
                      )}
                    </a>
                    <span className="text-gray-600 whitespace-nowrap text-right">
                      {(nota.vistas || 0).toLocaleString("es-MX")} v &middot;{" "}
                      {(nota.clicks || 0).toLocaleString("es-MX")} cl
                      {(nota.fecha || nota.created_at) && (
                        <span className="text-gray-400 ml-1">
                          &middot;{" "}
                          {new Date(
                            nota.fecha || nota.created_at,
                          ).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
            </div>

            {notasParaListar.length > 3 && (
              <button
                type="button"
                onClick={() => setNotasExpandidas((v) => !v)}
                className="mt-2 text-[11px] text-gray-500 hover:text-black underline"
              >
                {notasExpandidas
                  ? "Ver menos"
                  : `Ver todas (${notasParaListar.length})`}
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2 mb-4">
            {esTotal
              ? "Aún no hay notas etiquetadas a tus restaurantes."
              : "Aún no hay notas etiquetadas a tu restaurante."}
          </p>
        )}
      </div>

      {/* Cupones */}
      <div className="mb-9">
        <span className="text-[25px] leading-[1] underline pr-2">Cupones</span>
        <span>{tituloDirectorio}</span>

        {cuponesParaSumar.length > 0 ? (
          <>
            <div>
              <p className="text-[40px] font-bold text-black leading-[1]">
                {sumCuponesViews.toLocaleString("es-MX")}
              </p>
              <p className="text-sm text-black">
                Vistas totales de tus cupones
                <span className="text-gray-400 ml-1">
                  · {sumChatbotCuponesVistas.toLocaleString("es-MX")} chatbot
                </span>
              </p>
            </div>
            <div>
              <p className="text-[40px] font-bold text-black leading-[1]">
                {sumCuponesClicks.toLocaleString("es-MX")}
              </p>
              <p className="text-sm text-black">
                Clicks totales de tus cupones
                <span className="text-gray-400 ml-1">
                  · {sumChatbotCuponesClicks.toLocaleString("es-MX")} chatbot
                </span>
              </p>
            </div>
            <div className="space-y-0.5 mt-2">
              {cuponesParaSumar.map((c) => {
                const fmt = (d) =>
                  new Date(d).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  });
                const periodo = c.created_at
                  ? c.tiene_caducidad && c.fecha_validez
                    ? `${fmt(c.created_at)} – ${fmt(c.fecha_validez)}`
                    : c.activo_manual
                      ? `${fmt(c.created_at)} – activo`
                      : `${fmt(c.created_at)} – desactivado`
                  : null;
                return (
                  <div
                    key={c.id}
                    className="flex justify-between items-center text-xs"
                  >
                    <span
                      className="truncate max-w-[45%] text-black font-medium"
                      title={[c.subtitulo, c.titulo].filter(Boolean).join(" ")}
                    >
                      {[c.subtitulo, c.titulo].filter(Boolean).join(" ") ||
                        c.nombre_restaurante}
                    </span>
                    <span className="text-gray-600 whitespace-nowrap text-right">
                      {(c.views || 0).toLocaleString("es-MX")} v &middot;{" "}
                      {(c.clicks || 0).toLocaleString("es-MX")} cl
                      {periodo && (
                        <span className="text-gray-400 ml-1">
                          &middot; {periodo}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-gray-400 text-sm mt-2">
            No tienes cupones registrados {esTotal ? "" : "para este restaurante"}.
          </div>
        )}
      </div>
    </>
  );
};

export default MetricasRestaurante;
