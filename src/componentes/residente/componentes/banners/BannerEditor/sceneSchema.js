// schema version bump required when the shape changes.
const SCHEMA_VERSION = 1;

export const CANVAS_SIZES = {
  desktop: { w: 1080, h: 216 },
  mobile: { w: 1000, h: 250 },
};

export const emptyScene = () => ({
  schemaVersion: SCHEMA_VERSION,
  canvas: {
    desktop: { ...CANVAS_SIZES.desktop },
    mobile: { ...CANVAS_SIZES.mobile },
  },
  background: { fill: "#FFFFFF", imageSrc: null },
  objects: [],
});

// variants[variant] is a shallow delta — does not overwrite base (desktop) layout.
export const resolveObject = (obj, variant) => {
  if (variant === "desktop" || !obj.variants?.[variant]) return obj;
  return { ...obj, ...obj.variants[variant] };
};

// Images must be URL strings before calling this, never base64.
export const serializeScene = (scene) => JSON.stringify(scene);

// scene_json comes as a raw string from MariaDB (LONGTEXT alias of JSON — not auto-parsed).
export const deserializeScene = (raw) => {
  if (!raw) return emptyScene();
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!parsed.schemaVersion) parsed.schemaVersion = SCHEMA_VERSION;
  if (!parsed.canvas) parsed.canvas = emptyScene().canvas;
  if (!Array.isArray(parsed.objects)) parsed.objects = [];
  if (!parsed.background) parsed.background = { fill: "#FFFFFF", imageSrc: null };
  return parsed;
};

export const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// Route residente.mx asset URLs through a same-origin path (Vite /fotos proxy in dev,
// nginx in prod) so Konva can read them for export without a CORS-tainted canvas.
export const localImgSrc = (src) => {
  if (typeof src !== "string") return src;
  return src.replace(/^https?:\/\/(www\.)?residente\.mx/i, "");
};
