import React from "react";
import { useEditor } from "./useEditor.js";
import { CANVAS_SIZES } from "./sceneSchema.js";

const VARIANTS = ["desktop", "mobile"];

const VariantSwitcher = ({ onBeforeSwitch }) => {
  const { activeVariant, setActiveVariant, scene, updateObject } = useEditor();

  const handleSwitch = (next) => {
    if (next === activeVariant) return;
    // Commit any in-progress inline text edits before switching (caller responsibility via onBeforeSwitch).
    if (onBeforeSwitch) onBeforeSwitch();

    // Seed mobile variant proportionally on first switch if no overrides exist yet.
    if (next === "mobile") {
      const { w: dw, h: dh } = CANVAS_SIZES.desktop;
      const { w: mw, h: mh } = CANVAS_SIZES.mobile;
      const scaleX = mw / dw;
      const scaleY = mh / dh;
      const uniform = Math.min(scaleX, scaleY); // keep images/stickers square — no distortion

      scene.objects.forEach((obj) => {
        if (obj.variants?.mobile) return;
        const pos = { x: Math.round(obj.x * scaleX), y: Math.round(obj.y * scaleY) };
        if (obj.type === "text") {
          updateObject(obj.id, "mobile", {
            ...pos,
            width: Math.round((obj.width ?? 0) * scaleX),
            fontSize: Math.max(8, Math.round((obj.fontSize ?? 24) * uniform)),
          });
        } else {
          updateObject(obj.id, "mobile", {
            ...pos,
            width: Math.round((obj.width ?? 0) * uniform),
            height: Math.round((obj.height ?? 0) * uniform),
          });
        }
      });
    }

    setActiveVariant(next);
  };

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {VARIANTS.map((v) => (
        <button
          key={v}
          onClick={() => handleSwitch(v)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeVariant === v
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {v === "desktop"
            ? `Desktop ${CANVAS_SIZES.desktop.w}×${CANVAS_SIZES.desktop.h}`
            : `Mobile ${CANVAS_SIZES.mobile.w}×${CANVAS_SIZES.mobile.h}`}
        </button>
      ))}
    </div>
  );
};

export default VariantSwitcher;
