// Starter scene templates — static JSON in repo.
// Each template conforms to the scene schema (schemaVersion 1).

const templates = [
  {
    id: "promo-yellow",
    name: "Promo Amarillo",
    thumbnail: null,
    scene: {
      schemaVersion: 1,
      canvas: { desktop: { w: 1080, h: 216 }, mobile: { w: 1000, h: 250 } },
      background: { fill: "#FFF200", imageSrc: null },
      objects: [
        {
          id: "t1", type: "text",
          x: 40, y: 60, width: 620, height: 90,
          rotation: 0, opacity: 1, zIndex: 1,
          text: "Tu anuncio aquí",
          fontFamily: "NeueHaasGroteskDisplayPro75Bold, sans-serif",
          fontSize: 64, fill: "#111111", align: "left",
          variants: { mobile: { x: 30, y: 80, width: 560, fontSize: 48 } },
        },
        {
          id: "t2", type: "text",
          x: 40, y: 155, width: 500, height: 40,
          rotation: 0, opacity: 1, zIndex: 2,
          text: "Subtítulo o información de contacto",
          fontFamily: "NeueHaasGroteskDisplayPro55Roman, sans-serif",
          fontSize: 22, fill: "#333333", align: "left",
          variants: { mobile: { x: 30, y: 185, fontSize: 18 } },
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
      canvas: { desktop: { w: 1080, h: 216 }, mobile: { w: 1000, h: 250 } },
      background: { fill: "#111111", imageSrc: null },
      objects: [
        {
          id: "t1", type: "text",
          x: 60, y: 55, width: 700, height: 70,
          rotation: 0, opacity: 1, zIndex: 1,
          text: "Experiencias únicas",
          fontFamily: "BebasRegular, sans-serif",
          fontSize: 72, fill: "#FFF200", align: "left",
          variants: { mobile: { x: 40, y: 75, width: 640, fontSize: 60 } },
        },
        {
          id: "t2", type: "text",
          x: 60, y: 145, width: 500, height: 40,
          rotation: 0, opacity: 0.8, zIndex: 2,
          text: "residente.mx",
          fontFamily: "NeueHaasGroteskDisplayPro55Roman, sans-serif",
          fontSize: 20, fill: "#FFFFFF", align: "left",
          variants: { mobile: { y: 175 } },
        },
      ],
    },
  },
];

export default templates;
