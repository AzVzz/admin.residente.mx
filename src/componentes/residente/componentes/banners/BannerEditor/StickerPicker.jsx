import React from "react";
import { Iconografia } from "../../../../utils/Iconografia.jsx";
import { useEditor } from "./useEditor.js";
import { CANVAS_SIZES } from "./sceneSchema.js";

// Flattened list of all brand stickers from Iconografia.
const ALL_STICKERS = [
  ...Iconografia.categorias,
  ...Iconografia.ocasiones,
  ...Iconografia.zonas,
];

const StickerPicker = () => {
  const { addObject, activeVariant } = useEditor();
  const { w, h } = CANVAS_SIZES[activeVariant];

  const handleAdd = (sticker) => {
    addObject({
      type: "sticker",
      src: sticker.icono,
      x: Math.round(w / 2 - 32),
      y: Math.round(h / 2 - 32),
      width: 64,
      height: 64,
      rotation: 0,
      opacity: 1,
    });
  };

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Brand Stickers</p>
      <div className="grid grid-cols-3 gap-2">
        {ALL_STICKERS.map((s) => (
          <button
            key={s.clave}
            onClick={() => handleAdd(s)}
            title={s.nombre}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <img src={s.icono} alt={s.nombre} className="w-8 h-8 object-contain" />
            <span className="text-[10px] text-gray-500 text-center leading-tight">{s.nombre}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StickerPicker;
