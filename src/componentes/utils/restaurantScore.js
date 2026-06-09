// Score de completitud del perfil de restaurante.
// Criterios ponderados (suman 100) + opcionales que no puntúan.
// Acepta dos formas de datos: objeto de la API (detalle) o valores del formulario (RHF).

const hasText = (v) => typeof v === "string" && v.trim().length > 0;
const arrLen = (v) => (Array.isArray(v) ? v.filter(Boolean).length : 0);

// Normaliza el objeto de la API (GET /api/restaurante/:slug)
export function normalizeFromApi(r) {
  if (!r) return null;
  let menuData = r.menu_data;
  if (typeof menuData === "string") {
    try {
      menuData = JSON.parse(menuData);
    } catch {
      menuData = null;
    }
  }
  return {
    telefono: r.telefono,
    direccion: r.direccion,
    sucursalesCount: arrLen(r.sucursales),
    ticket_promedio: r.ticket_promedio,
    codigo_vestir: r.codigo_vestir,
    comida: Array.isArray(r.comida) ? r.comida : hasText(r.comida) ? [r.comida] : [],
    seccionesCount: arrLen(r.secciones_categorias),
    historia: r.historia,
    imagenesCount: arrLen(r.imagenes),
    logo: r.url_logo,
    fotosLugarCount: arrLen(r.fotos_lugar),
    menuItemsCount: arrLen(menuData?.items),
    platillosCount: arrLen(r.platillos),
    instagram: r.instagram,
    facebook: r.facebook,
    sitio_web: r.sitio_web,
    razonesCount: arrLen(r.razones),
    // Opcionales
    faqsCount: (() => {
      let f = r.faqs;
      if (typeof f === "string") {
        try { f = JSON.parse(f); } catch { f = null; }
      }
      return arrLen(f);
    })(),
    tieneGeo: r.lat != null && r.lng != null,
    tieneDelivery: hasText(r.rappi_link) || hasText(r.ubereats_link) || hasText(r.didi_link),
    testimoniosCount: arrLen(r.testimonios),
    logrosCount: arrLen(r.logros),
    reconocimientosCount: arrLen(r.reconocimientos),
  };
}

// Normaliza los valores del formulario (react-hook-form, FormularioMain)
export function normalizeFromForm(v) {
  if (!v) return null;
  const platillos = [];
  for (let i = 1; i <= 6; i++) if (hasText(v[`platillo_${i}`])) platillos.push(v[`platillo_${i}`]);

  const menuItems = (v.menu_sections || []).reduce(
    (n, s) => n + (Array.isArray(s?.platillos) ? s.platillos.filter((p) => hasText(p?.nombre)).length : 0),
    0,
  );

  const razones = [];
  for (let i = 1; i <= 5; i++) if (hasText(v[`razon_titulo_${i}`])) razones.push(i);

  // secciones_categorias en el form es objeto { Seccion: categoria|[] }
  const seccionesCount = v.secciones_categorias && typeof v.secciones_categorias === "object"
    ? Object.values(v.secciones_categorias).filter((x) => (Array.isArray(x) ? x.length : hasText(x))).length
    : 0;

  const testimonios = [];
  for (let i = 1; i <= 3; i++) if (hasText(v[`testimonio_descripcion_${i}`])) testimonios.push(i);
  const logros = [];
  for (let i = 1; i <= 5; i++) if (hasText(v[`logro_descripcion_${i}`])) logros.push(i);
  const reconocimientos = [];
  for (let i = 1; i <= 5; i++) if (hasText(v[`reconocimiento_${i}`])) reconocimientos.push(i);

  return {
    telefono: v.telefono,
    direccion: v.direccion,
    sucursalesCount: arrLen(v.sucursales),
    faqsCount: Array.isArray(v.faqs)
      ? v.faqs.filter((f) => hasText(f?.q) && hasText(f?.a)).length
      : 0,
    ticket_promedio: v.ticket_promedio,
    codigo_vestir: v.codigo_vestir,
    comida: hasText(v.comida) ? v.comida.split(",").map((s) => s.trim()).filter(Boolean) : [],
    seccionesCount,
    historia: v.historia,
    imagenesCount: arrLen(v.imagenes),
    logo: v.url_logo,
    fotosLugarCount: arrLen(v.fotos_lugar),
    menuItemsCount: menuItems,
    platillosCount: platillos.length,
    instagram: v.instagram,
    facebook: v.facebook,
    sitio_web: v.sitio_web,
    razonesCount: razones.length,
    tieneGeo: v.lat != null && v.lat !== "" && v.lng != null && v.lng !== "",
    tieneDelivery: hasText(v.rappi_link) || hasText(v.ubereats_link) || hasText(v.didi_link),
    testimoniosCount: testimonios.length,
    logrosCount: logros.length,
    reconocimientosCount: reconocimientos.length,
  };
}

// Criterios core — pesos suman 100. `anchor` = id de la sección en FormularioMain.
// Solo campos realmente editables en el formulario (Logo no existe en el form → no puntúa).
export const CRITERIOS = [
  { key: "menu", label: "Menú con secciones y precios", peso: 15, anchor: "seccion-menu", check: (d) => d.menuItemsCount >= 3 },
  { key: "imagenes", label: "Al menos 2 imágenes de platillos", peso: 10, anchor: "seccion-imagenes", check: (d) => d.imagenesCount >= 2 },
  { key: "historia", label: "Historia del restaurante", peso: 10, anchor: "seccion-historia", check: (d) => hasText(d.historia) },
  { key: "secciones", label: "Secciones y categorías", peso: 8, anchor: "seccion-secciones", check: (d) => d.seccionesCount >= 2 },
  { key: "platillos", label: "Qué pedir (mínimo 4 platillos)", peso: 8, anchor: "seccion-platillos", check: (d) => d.platillosCount >= 4 },
  { key: "fotos_lugar", label: "Fotos del lugar", peso: 8, anchor: "seccion-fotos-lugar", check: (d) => d.fotosLugarCount >= 1 },
  { key: "faqs", label: "Preguntas frecuentes (mínimo 2)", peso: 7, anchor: "seccion-faqs", check: (d) => d.faqsCount >= 2 },
  { key: "redes", label: "Instagram o Facebook", peso: 6, anchor: "seccion-redes", check: (d) => hasText(d.instagram) || hasText(d.facebook) },
  { key: "cocina", label: "Tipo de cocina", peso: 6, anchor: "seccion-informacion", check: (d) => d.comida.length > 0 },
  { key: "razones", label: "Razones para visitar", peso: 5, anchor: "seccion-razones", check: (d) => d.razonesCount >= 1 },
  { key: "telefono", label: "Teléfono", peso: 5, anchor: "seccion-informacion", check: (d) => hasText(d.telefono) },
  { key: "ubicacion", label: "Dirección o sucursales", peso: 5, anchor: "seccion-geolocalizacion", check: (d) => hasText(d.direccion) || d.sucursalesCount > 0 },
  { key: "ticket", label: "Ticket promedio", peso: 5, anchor: "seccion-informacion", check: (d) => hasText(String(d.ticket_promedio ?? "")) },
  { key: "vestir", label: "Código de vestimenta", peso: 2, anchor: "seccion-vestir", check: (d) => hasText(d.codigo_vestir) },
];

// Opcionales — no afectan el score, solo se muestran como sugerencia
export const OPCIONALES = [
  { key: "geo", label: "Geolocalización (mapa)", check: (d) => d.tieneGeo },
  { key: "sitio", label: "Sitio web externo", check: (d) => hasText(d.sitio_web) },
  { key: "delivery", label: "Links de delivery", check: (d) => d.tieneDelivery },
  { key: "testimonios", label: "Testimonios", check: (d) => d.testimoniosCount >= 1 },
  { key: "logros", label: "Logros", check: (d) => d.logrosCount >= 1 },
  { key: "reconocimientos", label: "Reconocimientos", check: (d) => d.reconocimientosCount >= 1 },
];

// Calcula score 0-100 + checklist con estado por criterio
export function computeScore(normalized) {
  if (!normalized) return { score: 0, items: [], opcionales: [], faltantes: [] };
  const items = CRITERIOS.map((c) => ({ ...c, ok: c.check(normalized) }));
  const opcionales = OPCIONALES.map((c) => ({ ...c, ok: c.check(normalized) }));
  const score = items.reduce((n, i) => n + (i.ok ? i.peso : 0), 0);
  const faltantes = items.filter((i) => !i.ok).sort((a, b) => b.peso - a.peso);
  return { score, items, opcionales, faltantes };
}
