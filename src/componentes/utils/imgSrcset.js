// Helper para generar srcset hacia /api/img (resize on-the-fly del backend).
// Equivalente al `src/utils/imgSrcset.ts` del repo astro.residente.mx.
//
// Uso:
//   import { imgSrcset } from "../utils/imgSrcset";
//   const { src, srcset, srcsetAvif, sizes, isOptimized } = imgSrcset(nota.imagen, {
//     widths: [400, 800],
//     sizes: "(max-width: 768px) 100vw, 400px",
//     defaultWidth: 400,
//   });

import { imgApi } from "../api/url.js";

const SUPPORTED_W = new Set([200, 400, 600, 800, 1200, 1600, 1920]);

// Paths que NO deben pasar por /api/img:
// - iconos/logos/banners estaticos: no hay ganancia y saturan sharp.
// - GIFs: el redimensionado pierde la animacion.
const SKIP_OPTIMIZE_PATTERNS = [
  /fotos-estaticas\//i,
  /\/banners\/[^/]+\.(gif|png)/i,
  /\.gif(\?|$)/i,
];

function shouldSkipOptimize(fotosPath) {
  return SKIP_OPTIMIZE_PATTERNS.some((p) => p.test(fotosPath));
}

// Inferir widths candidatos basado en el tamano del slot (defaultWidth).
function inferWidths(defaultW) {
  const upper = Math.max(defaultW * 2, 200);
  const candidates = [200, 400, 600, 800, 1200, 1600];
  const within = candidates.filter((w) => w <= upper);
  if (within.length === 1) within.push(within[0] * 2);
  if (within.length === 0) within.push(200, 400);
  return within;
}

function publicBase() {
  return (imgApi || "").replace(/\/+$/, "");
}

// Extrae la ruta relativa dentro de /fotos/ a partir de una URL absoluta o
// relativa. Devuelve null si la URL no es una imagen del backend nuestro.
function toFotosPath(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;
  if (s.startsWith("/fotos/")) return s.slice(1);
  if (s.startsWith("fotos/")) return s;
  const m = s.match(/\/fotos\/(.+)$/);
  if (m) return `fotos/${m[1]}`;
  return null;
}

function buildUrl(fotosPath, w, fmt) {
  const base = publicBase();
  const encoded = encodeURIComponent(fotosPath);
  return `${base}/api/img?path=${encoded}&w=${w}&fmt=${fmt}`;
}

export function imgSrcset(input, opts = {}) {
  const defaultW = opts.defaultWidth ?? 800;
  const widths = (opts.widths || inferWidths(defaultW)).filter((w) =>
    SUPPORTED_W.has(w),
  );
  const sizes =
    opts.sizes || `(max-width: 768px) 100vw, ${Math.min(defaultW, 1080)}px`;

  const fotosPath = toFotosPath(input);
  if (!fotosPath || shouldSkipOptimize(fotosPath)) {
    return {
      src: input || "",
      srcset: "",
      srcsetAvif: "",
      sizes,
      isOptimized: false,
    };
  }

  const srcset = widths
    .map((w) => `${buildUrl(fotosPath, w, "webp")} ${w}w`)
    .join(", ");
  const srcsetAvif = widths
    .map((w) => `${buildUrl(fotosPath, w, "avif")} ${w}w`)
    .join(", ");

  // src del <img> fallback queda en la URL original (no transformada). Asi
  // el navegador moderno usa AVIF/WebP de los <source>, y si fallan, cae a
  // la imagen original sin romper la pagina.
  return {
    src: input || "",
    srcset,
    srcsetAvif,
    sizes,
    isOptimized: true,
  };
}
