// Boost temporal de métricas (pedido comercial / demo).
export const BOOST_METRICAS = {
  barama: { vistas: 2000, clicks: 100 },
  700: { vistas: 2000, clicks: 100 },
  "romito-pizzeria": { vistas: 2000, clicks: 100 },
  692: { vistas: 2000, clicks: 100 },
};

export function getMetricasBoost(restaurante) {
  if (!restaurante) return { vistas: 0, clicks: 0 };
  const bySlug = BOOST_METRICAS[restaurante.slug];
  if (bySlug) return bySlug;
  const byId =
    BOOST_METRICAS[restaurante.id] || BOOST_METRICAS[String(restaurante.id)];
  if (byId) return byId;
  const nombre = String(restaurante.nombre_restaurante || "")
    .trim()
    .toLowerCase();
  if (nombre.includes("barama")) return BOOST_METRICAS.barama;
  if (nombre.includes("romito")) return BOOST_METRICAS["romito-pizzeria"];
  return { vistas: 0, clicks: 0 };
}
