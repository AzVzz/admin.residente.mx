// Starter scene templates — static JSON in repo.
// Each template conforms to the scene schema (schemaVersion 1).
// Sized for the thin banner canvases: desktop 1080×114, mobile 656×132.

const templates = [
  {
    id: "promo-yellow",
    name: "Promo Amarillo",
    thumbnail: null,
    scene: {
      schemaVersion: 1,
      canvas: { desktop: { w: 1080, h: 114 }, mobile: { w: 656, h: 132 } },
      background: { fill: "#FFF200", imageSrc: null },
      objects: [
        {
          id: "t1", type: "text",
          x: 32, y: 18, width: 640, height: 48,
          rotation: 0, opacity: 1, zIndex: 1,
          text: "Tu anuncio aquí",
          fontFamily: "NeueHaasGroteskDisplayPro75Bold, sans-serif",
          fontSize: 40, fill: "#111111", align: "left",
          variants: { mobile: { x: 24, y: 16, width: 440, fontSize: 36 } },
        },
        {
          id: "t2", type: "text",
          x: 32, y: 72, width: 520, height: 26,
          rotation: 0, opacity: 1, zIndex: 2,
          text: "Subtítulo o información de contacto",
          fontFamily: "NeueHaasGroteskDisplayPro55Roman, sans-serif",
          fontSize: 18, fill: "#333333", align: "left",
          variants: { mobile: { x: 24, y: 80, width: 440, fontSize: 20 } },
        },
      ],
    },
  },
  {
    id: "dark-minimal",
    name: "Dark Minimal",
    thumbnail: null,
    scene: {
      schemaVersion: 1,
      canvas: { desktop: { w: 1080, h: 114 }, mobile: { w: 656, h: 132 } },
      background: { fill: "#111111", imageSrc: null },
      objects: [
        {
          id: "t1", type: "text",
          x: 40, y: 16, width: 700, height: 56,
          rotation: 0, opacity: 1, zIndex: 1,
          text: "Experiencias únicas",
          fontFamily: "BebasRegular, sans-serif",
          fontSize: 48, fill: "#FFF200", align: "left",
          variants: { mobile: { x: 28, y: 16, width: 500, fontSize: 44 } },
        },
        {
          id: "t2", type: "text",
          x: 40, y: 78, width: 500, height: 24,
          rotation: 0, opacity: 0.8, zIndex: 2,
          text: "residente.mx",
          fontFamily: "NeueHaasGroteskDisplayPro55Roman, sans-serif",
          fontSize: 16, fill: "#FFFFFF", align: "left",
          variants: { mobile: { x: 28, y: 88, fontSize: 20 } },
        },
      ],
    },
  },
];

export default templates;
