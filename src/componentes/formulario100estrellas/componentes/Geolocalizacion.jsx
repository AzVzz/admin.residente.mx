import { useFormContext } from "react-hook-form";
import { useCallback, useEffect, useRef, useState } from "react";
import { urlApi } from "../../api/url";

// Las URLs de Google Maps pueden anidar varios POIs en el query "data=".
// Cada "place cluster" viene como: !1s<place_id>!2s<name>!8m2!3d<lat>!4d<lng>.
// El ultimo cluster es el que el usuario tiene seleccionado — por eso usamos
// regex GLOBALES y tomamos el ultimo match, no el primero.
const RE_LONG_G = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/g;
const RE_LL = /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
const RE_AT = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
const RE_PLACE_ID_1S_G = /!1s(0x[0-9a-f]+:0x[0-9a-f]+)/gi;
const RE_PLACE_ID_FTID = /[?&!]ftid=(0x[0-9a-f]+:0x[0-9a-f]+)/i;

function lastMatch(regexGlobal, str) {
  const all = [...str.matchAll(regexGlobal)];
  return all.length > 0 ? all[all.length - 1] : null;
}

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Geocoding gratis via Nominatim (OpenStreetMap).
// Rate limit: 1 req/s. Politica: Referer/User-Agent identificable.
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_MIN_INTERVAL_MS = 1100;
// Radio en km para aceptar un match por nombre como "mismo lugar" que las coords del link.
const MATCH_RADIO_KM = 2;
let ultimaNominatimReq = 0;

async function respetarRateLimit() {
  const ahora = Date.now();
  const espera = NOMINATIM_MIN_INTERVAL_MS - (ahora - ultimaNominatimReq);
  if (espera > 0) await new Promise((r) => setTimeout(r, espera));
  ultimaNominatimReq = Date.now();
}

function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatNominatimAddress(data) {
  if (!data) return "";
  const a = data.address || {};
  const parts = [];
  const callePlus = [a.road, a.pedestrian, a.path].find(Boolean);
  if (callePlus) {
    parts.push(a.house_number ? `${callePlus} ${a.house_number}` : callePlus);
  }
  const colonia = a.neighbourhood || a.suburb || a.quarter || a.residential;
  if (colonia) parts.push(colonia);
  const municipio =
    a.city || a.town || a.village || a.municipality || a.city_district || a.county;
  if (municipio) parts.push(municipio);
  if (a.state) parts.push(a.state);
  if (a.postcode) parts.push(a.postcode);
  if (a.country) parts.push(a.country);
  const estructurado = parts.filter(Boolean).join(", ");
  // Fallback a display_name si el desglose no logro armar nada
  return estructurado || (data.display_name || "").trim();
}

async function reverseGeocode(lat, lng) {
  await respetarRateLimit();
  const url =
    `${NOMINATIM_REVERSE_URL}?format=jsonv2&addressdetails=1` +
    `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}` +
    `&zoom=18&accept-language=es`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const data = await res.json();
  return formatNominatimAddress(data);
}

// Nominatim es literal: "Calz." no matchea "Calzada". Expandimos abreviaturas
// comunes en español mexicano antes de consultar.
const ABREVIATURAS = [
  [/\bCalz\.(\s|$)/gi, "Calzada$1"],
  [/\bAv\.(\s|$)/gi, "Avenida$1"],
  [/\bAvda\.(\s|$)/gi, "Avenida$1"],
  [/\bBlvd\.(\s|$)/gi, "Boulevard$1"],
  [/\bBvd\.(\s|$)/gi, "Boulevard$1"],
  [/\bCol\.(\s|$)/gi, "Colonia$1"],
  [/\bFracc\.(\s|$)/gi, "Fraccionamiento$1"],
  [/\bPriv\.(\s|$)/gi, "Privada$1"],
  [/\bSn\.(\s|$)/gi, "San$1"],
  [/\bSta\.(\s|$)/gi, "Santa$1"],
  [/\bSto\.(\s|$)/gi, "Santo$1"],
  [/\bN\.L\.?/gi, "Nuevo León"],
  [/\bCDMX\b/gi, "Ciudad de México"],
  [/\bDF\b/gi, "Ciudad de México"],
  [/\bC\.P\.?\s*\d+/gi, ""], // remueve "C.P. 66220"
];

function expandirAbreviaturas(texto) {
  let out = texto;
  for (const [re, rep] of ABREVIATURAS) out = out.replace(re, rep);
  return out.replace(/\s+/g, " ").replace(/\s*,\s*,\s*/g, ", ").trim();
}

// Construye variantes progresivamente mas cortas para tolerar errores de
// ortografía / mapeo incompleto de OSM.
function construirVariantesQuery(texto) {
  const base = expandirAbreviaturas(texto);
  const variantes = new Set([base]);

  // Quita codigo postal (5 digitos)
  variantes.add(base.replace(/\b\d{5}\b/g, "").replace(/\s*,\s*,\s*/g, ", "));

  // Quita la primera coma-segmento (normalmente la colonia "Del Valle")
  const segments = base.split(",").map((s) => s.trim()).filter(Boolean);
  if (segments.length >= 3) {
    const sinColonia = [segments[0], ...segments.slice(2)].join(", ");
    variantes.add(sinColonia);
    // Sin colonia y sin postcode
    variantes.add(sinColonia.replace(/\b\d{5}\b/g, "").replace(/\s*,\s*,\s*/g, ", "));
  }

  // Solo calle + ciudad + estado (sin colonia ni CP)
  if (segments.length >= 4) {
    variantes.add([segments[0], segments[segments.length - 2], segments[segments.length - 1]].join(", "));
  }

  // Limpia espacios sobrantes en cada variante
  return [...variantes].map((v) => v.trim().replace(/\s+/g, " ")).filter(Boolean);
}

// Forward geocoding: direccion (texto) -> lat/lng.
// Prueba variantes en cascada hasta obtener match. Determina precision.
async function forwardGeocode(direccionTexto) {
  if (!direccionTexto || !direccionTexto.trim()) return null;
  const variantes = construirVariantesQuery(direccionTexto);

  for (const q of variantes) {
    try {
      await respetarRateLimit();
      const qs = new URLSearchParams({
        q,
        format: "jsonv2",
        addressdetails: "1",
        limit: "3",
        countrycodes: "mx",
        "accept-language": "es",
      });
      const res = await fetch(`${NOMINATIM_SEARCH_URL}?${qs}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;
      const arr = await res.json();
      if (Array.isArray(arr) && arr.length > 0) {
        const best = arr[0];
        const a = best.address || {};
        const tipoExacto = ["house", "amenity", "building", "shop"].includes(best.type);
        const precision = a.house_number || tipoExacto ? "exact" : "approximate";
        return {
          lat: parseFloat(best.lat),
          lng: parseFloat(best.lon),
          precision,
          display_name: best.display_name,
          tipo: best.type,
          clase: best.class,
          tieneHouseNumber: Boolean(a.house_number),
          queryUsada: q,
        };
      }
    } catch (e) {
      console.warn("forwardGeocode variante falló:", q, e);
    }
  }
  return null;
}

// Busca un lugar por nombre. Si se pasa un punto "near", los resultados se
// ordenan por cercania. Devuelve el mejor candidato o null.
async function searchByName(query, nearLat, nearLng) {
  if (!query || !query.trim()) return null;
  await respetarRateLimit();
  const qs = new URLSearchParams({
    q: query.trim(),
    format: "jsonv2",
    addressdetails: "1",
    limit: "5",
    "accept-language": "es",
  });
  if (nearLat != null && nearLng != null) {
    // Viewbox de ~20 km alrededor del punto de referencia para priorizar cercania.
    const delta = 0.2;
    qs.set(
      "viewbox",
      `${nearLng - delta},${nearLat + delta},${nearLng + delta},${nearLat - delta}`
    );
    qs.set("bounded", "0");
  }
  const res = await fetch(`${NOMINATIM_SEARCH_URL}?${qs}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const arr = await res.json();
  if (!Array.isArray(arr) || arr.length === 0) return null;

  let mejor = arr[0];
  if (nearLat != null && nearLng != null) {
    mejor = arr
      .map((r) => ({
        ...r,
        _dist: distKm(nearLat, nearLng, parseFloat(r.lat), parseFloat(r.lon)),
      }))
      .sort((a, b) => a._dist - b._dist)[0];
  }
  return {
    lat: parseFloat(mejor.lat),
    lng: parseFloat(mejor.lon),
    display_name: mejor.display_name,
    address: mejor.address,
    tipo: mejor.type,
    clase: mejor.class,
  };
}

const SHORTLINK_HOSTS = ["maps.app.goo.gl", "goo.gl", "g.co", "share.google"];
function isShortlink(url) {
  try {
    const u = new URL(url);
    return SHORTLINK_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith("." + h));
  } catch { return false; }
}

async function expandShortlink(url) {
  const res = await fetch(`${urlApi}api/restaurante/expand-link?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`expand-link HTTP ${res.status}`);
  const data = await res.json();
  return data.expanded || url;
}

// Centro por defecto: Monterrey
const DEFAULT_CENTER = [25.6866, -100.3161];
const DEFAULT_ZOOM = 12;

function parseFromMapsUrl(url) {
  if (!url || typeof url !== "string") return null;
  let coords = null;
  let precision = null;

  const lastLong = lastMatch(RE_LONG_G, url);
  if (lastLong) {
    coords = { lat: parseFloat(lastLong[1]), lng: parseFloat(lastLong[2]) };
    precision = "exact";
  } else {
    let m = url.match(RE_LL);
    if (m) {
      coords = { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
      precision = "exact";
    } else if ((m = url.match(RE_AT))) {
      coords = { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
      precision = "viewport";
    }
  }

  const last1s = lastMatch(RE_PLACE_ID_1S_G, url);
  const placeId = last1s ? last1s[1] : (url.match(RE_PLACE_ID_FTID)?.[1] || null);

  if (!coords && !placeId) return null;
  return { coords, placeId, precision };
}

let leafletLoader = null;
function loadLeaflet() {
  if (typeof window !== "undefined" && window.L) return Promise.resolve(window.L);
  if (leafletLoader) return leafletLoader;

  leafletLoader = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L));
      existing.addEventListener("error", () => reject(new Error("Leaflet failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Leaflet failed to load"));
    document.head.appendChild(script);
  });
  return leafletLoader;
}

const Geolocalizacion = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const [pastedUrl, setPastedUrl] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [mapaAbierto, setMapaAbierto] = useState(false);
  const [autollenandoDir, setAutollenandoDir] = useState(false);
  const [buscandoNombre, setBuscandoNombre] = useState(false);
  const [ubicandoDir, setUbicandoDir] = useState(false);

  const lat = watch("lat");
  const lng = watch("lng");
  const direccionActual = watch("direccion");
  const nombreRestaurante = watch("nombre_restaurante");
  const sucursales = watch("sucursales");

  const construirQueriesNombre = useCallback(() => {
    const n = (nombreRestaurante || "").trim();
    if (!n) return [];
    const zona = Array.isArray(sucursales) && sucursales.length > 0 ? sucursales[0] : null;
    const queries = [];
    if (zona) queries.push(`${n}, ${zona}, Nuevo León, México`);
    queries.push(`${n}, Nuevo León, México`);
    queries.push(`${n} Monterrey`);
    queries.push(n);
    return queries;
  }, [nombreRestaurante, sucursales]);

  // Prueba las queries en orden hasta obtener un resultado.
  const buscarPorNombreEncadenado = useCallback(
    async (nearLat, nearLng) => {
      const queries = construirQueriesNombre();
      for (const q of queries) {
        try {
          const r = await searchByName(q, nearLat, nearLng);
          if (r) return { ...r, _query: q };
        } catch (e) {
          console.warn("searchByName error:", e);
        }
      }
      return null;
    },
    [construirQueriesNombre]
  );

  const autollenarDireccion = useCallback(
    async (la, ln, { sobrescribir = false } = {}) => {
      if (!sobrescribir && direccionActual && direccionActual.trim()) return;
      setAutollenandoDir(true);
      try {
        const texto = await reverseGeocode(la, ln);
        if (texto) {
          setValue("direccion", texto, { shouldDirty: true });
          setFeedback((prev) => ({
            ok: true,
            msg: `${prev?.msg ? prev.msg + " · " : ""}Dirección autollenada: ${texto}`,
          }));
        }
      } catch (e) {
        setFeedback((prev) => ({
          ok: prev?.ok ?? true,
          msg: `${prev?.msg ? prev.msg + " · " : ""}No se pudo autocompletar dirección (${e.message}).`,
        }));
      } finally {
        setAutollenandoDir(false);
      }
    },
    [direccionActual, setValue]
  );

  const aplicarExtraccion = async (url) => {
    let urlParaParsear = url;

    // Si el parse directo no da coords y es un shortlink, expandir via backend.
    let res = parseFromMapsUrl(url);
    if (!res && isShortlink(url)) {
      setFeedback({ ok: true, msg: "Expandiendo link corto…" });
      try {
        urlParaParsear = await expandShortlink(url);
        res = parseFromMapsUrl(urlParaParsear);
      } catch (e) {
        setFeedback({ ok: false, msg: `No se pudo expandir el link: ${e.message}` });
        return;
      }
    }

    if (!res) {
      setFeedback({
        ok: false,
        msg: "No pude extraer coordenadas ni place_id de este link.",
      });
      return;
    }
    const parts = [];
    if (res.coords) {
      setValue("lat", res.coords.lat, { shouldDirty: true });
      setValue("lng", res.coords.lng, { shouldDirty: true });
      setValue("geo_precision", res.precision, { shouldDirty: true });
      parts.push(`lat=${res.coords.lat}, lng=${res.coords.lng} (${res.precision})`);
    }
    if (res.placeId) {
      setValue("google_place_id", res.placeId, { shouldDirty: true });
      parts.push(`place_id=${res.placeId}`);
    }
    if (!watch("link_horario")) {
      setValue("link_horario", url, { shouldDirty: true });
    }
    setFeedback({ ok: true, msg: `Extraído: ${parts.join(" | ")}` });

    // Refinar por nombre si hay coords (las del link suelen caer en la calle, no en el local).
    let coordsFinales = res.coords;
    if (res.coords && construirQueriesNombre().length > 0) {
      try {
        setBuscandoNombre(true);
        const porNombre = await buscarPorNombreEncadenado(res.coords.lat, res.coords.lng);
        if (porNombre) {
          const d = distKm(res.coords.lat, res.coords.lng, porNombre.lat, porNombre.lng);
          if (d <= MATCH_RADIO_KM) {
            setValue("lat", Number(porNombre.lat.toFixed(7)), { shouldDirty: true });
            setValue("lng", Number(porNombre.lng.toFixed(7)), { shouldDirty: true });
            setValue("geo_precision", "exact", { shouldDirty: true });
            coordsFinales = { lat: porNombre.lat, lng: porNombre.lng };
            setFeedback((prev) => ({
              ok: true,
              msg: `${prev?.msg || ""} · Ajustado al POI "${(porNombre.display_name || "").split(",")[0]}" (a ${d.toFixed(2)} km del punto del link).`,
            }));
          } else {
            setFeedback((prev) => ({
              ok: prev?.ok ?? true,
              msg: `${prev?.msg || ""} · Match por nombre a ${d.toFixed(1)} km — conservé las coords del link.`,
            }));
          }
        }
      } catch (e) {
        console.warn("búsqueda por nombre falló:", e);
      } finally {
        setBuscandoNombre(false);
      }
    }

    if (coordsFinales) {
      await autollenarDireccion(coordsFinales.lat, coordsFinales.lng);
    }
  };

  const handleBuscarPorNombre = async () => {
    const queries = construirQueriesNombre();
    if (queries.length === 0) {
      setFeedback({
        ok: false,
        msg: "Primero captura el nombre del restaurante arriba.",
      });
      return;
    }
    setBuscandoNombre(true);
    setFeedback({ ok: true, msg: `Buscando "${(nombreRestaurante || "").trim()}" en OpenStreetMap…` });
    try {
      const nearLat = lat != null && !Number.isNaN(Number(lat)) ? Number(lat) : null;
      const nearLng = lng != null && !Number.isNaN(Number(lng)) ? Number(lng) : null;
      const porNombre = await buscarPorNombreEncadenado(nearLat, nearLng);
      if (!porNombre) {
        setFeedback({
          ok: false,
          msg: `OpenStreetMap no tiene este lugar indexado. Usa el botón "Seleccionar en el mapa" para colocar el pin manualmente.`,
        });
        return;
      }
      setValue("lat", Number(porNombre.lat.toFixed(7)), { shouldDirty: true });
      setValue("lng", Number(porNombre.lng.toFixed(7)), { shouldDirty: true });
      setValue("geo_precision", "exact", { shouldDirty: true });
      setFeedback({
        ok: true,
        msg: `Encontrado (query: "${porNombre._query}"): ${porNombre.display_name}`,
      });
      await autollenarDireccion(porNombre.lat, porNombre.lng, { sobrescribir: true });
    } catch (e) {
      setFeedback({ ok: false, msg: `Error al buscar: ${e.message}` });
    } finally {
      setBuscandoNombre(false);
    }
  };

  const handleExtraer = () => aplicarExtraccion(pastedUrl.trim());

  const handleLimpiar = () => {
    setValue("lat", null, { shouldDirty: true });
    setValue("lng", null, { shouldDirty: true });
    setValue("google_place_id", null, { shouldDirty: true });
    setValue("geo_precision", null, { shouldDirty: true });
    setValue("direccion", "", { shouldDirty: true });
    setFeedback(null);
    setPastedUrl("");
  };

  const handleCoordsDesdeMapa = async (nuevaLat, nuevaLng) => {
    setValue("lat", Number(nuevaLat.toFixed(7)), { shouldDirty: true });
    setValue("lng", Number(nuevaLng.toFixed(7)), { shouldDirty: true });
    setValue("geo_precision", "exact", { shouldDirty: true });
    setFeedback({
      ok: true,
      msg: `Ubicación seleccionada: ${nuevaLat.toFixed(7)}, ${nuevaLng.toFixed(7)}`,
    });
    await autollenarDireccion(nuevaLat, nuevaLng, { sobrescribir: true });
  };

  const handleAutocompletarManual = () => {
    const la = Number(lat);
    const ln = Number(lng);
    if (Number.isNaN(la) || Number.isNaN(ln)) {
      setFeedback({
        ok: false,
        msg: "Primero necesitas lat y lng (pega una URL de Maps o usa 'Seleccionar en el mapa').",
      });
      return;
    }
    autollenarDireccion(la, ln, { sobrescribir: true });
  };

  const ubicarDireccion = useCallback(async () => {
    const texto = (direccionActual || "").trim();
    if (!texto) {
      setFeedback({ ok: false, msg: "Escribe una dirección primero." });
      return;
    }
    setUbicandoDir(true);
    setFeedback({ ok: true, msg: `Ubicando "${texto}"…` });
    try {
      const res = await forwardGeocode(texto);
      if (!res) {
        setFeedback({
          ok: false,
          msg: "OpenStreetMap no pudo ubicar esa dirección. Verifica ortografía o usa el mapa.",
        });
        return;
      }
      setValue("lat", Number(res.lat.toFixed(7)), { shouldDirty: true });
      setValue("lng", Number(res.lng.toFixed(7)), { shouldDirty: true });
      setValue("geo_precision", res.precision, { shouldDirty: true });
      const nota = res.tieneHouseNumber
        ? "con número exacto"
        : "a nivel de calle (OSM no tiene el número; el texto de tu dirección se conserva tal cual)";
      const usoVariante = res.queryUsada && res.queryUsada !== texto
        ? ` · Query que funcionó: "${res.queryUsada}"`
        : "";
      setFeedback({
        ok: true,
        msg: `Ubicada ${nota}: ${res.lat.toFixed(7)}, ${res.lng.toFixed(7)}. Match OSM: ${res.display_name}${usoVariante}`,
      });
    } catch (e) {
      setFeedback({ ok: false, msg: `Error al ubicar: ${e.message}` });
    } finally {
      setUbicandoDir(false);
    }
  }, [direccionActual, setValue]);

  // Auto-ubicar al perder foco del input si hay direccion pero no coords.
  const handleDireccionBlur = () => {
    const texto = (direccionActual || "").trim();
    const tieneCoords =
      lat != null && lng != null &&
      !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng));
    if (texto && !tieneCoords && !ubicandoDir) {
      ubicarDireccion();
    }
  };

  const coordsValidas =
    lat != null && lng != null && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng));

  return (
    <div className="form-geolocalizacion">
      <fieldset>
        <legend>Ubicación geográfica</legend>

        <div className="input-group">
          <label htmlFor="geo-paste-url">
            Pega la URL de Google Maps y presiona Extraer
          </label>
          <div className="geo-url-row">
            <input
              id="geo-paste-url"
              type="text"
              placeholder="https://www.google.com/maps/place/..."
              value={pastedUrl}
              onChange={(e) => setPastedUrl(e.target.value)}
            />
            <button
              type="button"
              className="geo-btn"
              onClick={handleExtraer}
              disabled={!pastedUrl.trim()}
            >
              Extraer
            </button>
            <button
              type="button"
              className="geo-btn geo-btn--ghost"
              onClick={handleLimpiar}
            >
              Limpiar
            </button>
          </div>
          <small className="geo-help">
            Tip: en Google Maps → menú del lugar → <i>Compartir</i> →{" "}
            <i>Copiar vínculo</i>. Si es un shortlink corto, ábrelo primero en tu
            navegador para que se expanda antes de pegarlo aquí.
          </small>
          {feedback && (
            <div className={`geo-feedback ${feedback.ok ? "ok" : "err"}`}>
              {feedback.msg}
            </div>
          )}
        </div>

        <div className="input-group">
          <div className="geo-url-row">
            <button
              type="button"
              className="geo-btn geo-btn--mapa"
              onClick={() => setMapaAbierto(true)}
              style={{ flex: 2 }}
            >
              Seleccionar en el mapa ⟶
            </button>
            <button
              type="button"
              className="geo-btn geo-btn--ghost geo-btn--mapa"
              onClick={handleBuscarPorNombre}
              disabled={buscandoNombre || !(nombreRestaurante || "").trim()}
              style={{ flex: 1 }}
              title={
                (nombreRestaurante || "").trim()
                  ? `Busca "${nombreRestaurante}" en OpenStreetMap`
                  : "Captura el nombre del restaurante para habilitar"
              }
            >
              {buscandoNombre ? "Buscando…" : "Buscar por nombre"}
            </button>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="direccion">
            Dirección
            {autollenandoDir && (
              <span style={{ marginLeft: 10, fontSize: "0.85rem", color: "#c2410c", fontWeight: 500 }}>
                · autocompletando…
              </span>
            )}
            {ubicandoDir && (
              <span style={{ marginLeft: 10, fontSize: "0.85rem", color: "#c2410c", fontWeight: 500 }}>
                · ubicando…
              </span>
            )}
          </label>
          <div className="geo-url-row">
            {(() => {
              const reg = register("direccion", { maxLength: 500 });
              return (
                <input
                  id="direccion"
                  type="text"
                  placeholder="Av. Vasconcelos 150, Del Valle, San Pedro Garza García, N.L."
                  {...reg}
                  onBlur={(e) => {
                    reg.onBlur(e);
                    handleDireccionBlur();
                  }}
                />
              );
            })()}
            <button
              type="button"
              className="geo-btn"
              onClick={ubicarDireccion}
              disabled={ubicandoDir || !(direccionActual || "").trim()}
              title="Convierte la dirección escrita a lat/lng (forward geocoding)"
            >
              {ubicandoDir ? "…" : "Ubicar ↓"}
            </button>
            <button
              type="button"
              className="geo-btn geo-btn--ghost"
              onClick={handleAutocompletarManual}
              disabled={autollenandoDir}
              title="Toma las coords actuales y rellena el texto de dirección (reverse geocoding)"
            >
              {autollenandoDir ? "…" : "Autocompletar ↑"}
            </button>
          </div>
          {errors.direccion && <span className="error">Máximo 500 caracteres</span>}
          <small className="geo-help">
            Dos caminos: <b>escribe la dirección y presiona "Ubicar ↓"</b> para generar lat/lng,
            o pega una URL / elige en el mapa y presiona <b>"Autocompletar ↑"</b> para el texto.
            El texto que escribas se guarda tal cual (incluyendo el número) aunque OSM no tenga
            ese número específico mapeado.
          </small>
        </div>

        <div className="geo-latlng">
          <div className="input-group">
            <label htmlFor="lat">Latitud</label>
            <input
              id="lat"
              type="number"
              step="0.0000001"
              min="-90"
              max="90"
              placeholder="25.6494618"
              {...register("lat", {
                valueAsNumber: true,
                min: { value: -90, message: "Debe estar entre -90 y 90" },
                max: { value: 90, message: "Debe estar entre -90 y 90" },
              })}
            />
            {errors.lat && <span className="error">{errors.lat.message}</span>}
          </div>
          <div className="input-group">
            <label htmlFor="lng">Longitud</label>
            <input
              id="lng"
              type="number"
              step="0.0000001"
              min="-180"
              max="180"
              placeholder="-100.3563295"
              {...register("lng", {
                valueAsNumber: true,
                min: { value: -180, message: "Debe estar entre -180 y 180" },
                max: { value: 180, message: "Debe estar entre -180 y 180" },
              })}
            />
            {errors.lng && <span className="error">{errors.lng.message}</span>}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="google_place_id">Google Place ID</label>
          <input
            id="google_place_id"
            type="text"
            placeholder="0x8662bd95b36a19f1:0x5e5e95af1550f416"
            {...register("google_place_id", { maxLength: 100 })}
          />
          <small className="geo-help">
            Opcional. Se extrae automáticamente al pegar una URL larga de Maps.
          </small>
        </div>

        {coordsValidas && (
          <a
            className="geo-ver-mapa"
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver {lat}, {lng} en Google Maps →
          </a>
        )}
      </fieldset>

      {mapaAbierto && (
        <MapaModal
          initialLat={coordsValidas ? Number(lat) : null}
          initialLng={coordsValidas ? Number(lng) : null}
          onUsar={(la, ln) => {
            handleCoordsDesdeMapa(la, ln);
            setMapaAbierto(false);
          }}
          onClose={() => setMapaAbierto(false)}
        />
      )}
    </div>
  );
};

function MapaModal({ initialLat, initialLng, onUsar, onClose }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const [coords, setCoords] = useState(
    initialLat != null && initialLng != null
      ? { lat: initialLat, lng: initialLng }
      : null
  );
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const setMarker = useCallback((L, latlng) => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.marker(latlng, { draggable: true }).addTo(mapRef.current);
      markerRef.current.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        setCoords({ lat: pos.lat, lng: pos.lng });
      });
    }
    setCoords({ lat: latlng.lat ?? latlng[0], lng: latlng.lng ?? latlng[1] });
  }, []);

  useEffect(() => {
    let cancelado = false;
    loadLeaflet()
      .then((L) => {
        if (cancelado || !mapContainerRef.current) return;
        const centerLatLng =
          initialLat != null && initialLng != null
            ? [initialLat, initialLng]
            : DEFAULT_CENTER;
        const zoom = initialLat != null && initialLng != null ? 17 : DEFAULT_ZOOM;

        mapRef.current = L.map(mapContainerRef.current).setView(centerLatLng, zoom);
        L.tileLayer(OSM_TILES, {
          attribution: OSM_ATTRIBUTION,
          maxZoom: 19,
        }).addTo(mapRef.current);

        if (initialLat != null && initialLng != null) {
          setMarker(L, { lat: initialLat, lng: initialLng });
        }

        mapRef.current.on("click", (e) => setMarker(L, e.latlng));
        setCargando(false);
        setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 100);
      })
      .catch((err) => {
        if (cancelado) return;
        console.error("Leaflet load error:", err);
        setErrorCarga("No se pudo cargar el mapa. Revisa tu conexión.");
        setCargando(false);
      });

    return () => {
      cancelado = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, [initialLat, initialLng, setMarker]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="geo-modal-overlay" onClick={handleOverlayClick}>
      <div className="geo-modal">
        <div className="geo-modal-header">
          <h3>Selecciona la ubicación</h3>
          <button type="button" className="geo-modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        <small className="geo-help" style={{ marginTop: 0 }}>
          Haz clic en el mapa para colocar el pin, o arrástralo para ajustar.
          Usa la rueda del ratón para hacer zoom.
        </small>
        <div ref={mapContainerRef} className="geo-modal-map">
          {cargando && (
            <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
              Cargando mapa…
            </div>
          )}
          {errorCarga && (
            <div style={{ padding: 20, textAlign: "center", color: "#b91c1c" }}>
              {errorCarga}
            </div>
          )}
        </div>
        <div className="geo-modal-footer">
          <div className="geo-modal-coords">
            {coords
              ? `lat ${coords.lat.toFixed(7)}   lng ${coords.lng.toFixed(7)}`
              : "Clic en el mapa para seleccionar"}
          </div>
          <div className="geo-modal-actions">
            <button type="button" className="geo-btn geo-btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="geo-btn"
              onClick={() => coords && onUsar(coords.lat, coords.lng)}
              disabled={!coords}
            >
              Usar esta ubicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Geolocalizacion;
