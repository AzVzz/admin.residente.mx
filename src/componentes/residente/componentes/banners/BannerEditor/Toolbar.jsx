import React from "react";
import { useEditor } from "./useEditor.js";
import { resolveObject } from "./sceneSchema.js";

// Font families available in the repo (from index.css @font-face declarations).
const FONT_OPTIONS = [
  { label: "Neue Haas Bold", value: "NeueHaasGroteskDisplayW02Bold, sans-serif" },
  { label: "Neue Haas Roman", value: "NeueHaasGroteskDisplayPro55Roman, sans-serif" },
  { label: "Neue Haas 75", value: "NeueHaasGroteskDisplayPro75Bold, sans-serif" },
  { label: "Bebas", value: "BebasRegular, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
];

const ALIGN_OPTIONS = ["left", "center", "right"];

const Toolbar = () => {
  const { scene, selectedId, activeVariant, updateObject, removeObject, reorderObject, setBackground } = useEditor();

  const selected = selectedId ? scene.objects.find((o) => o.id === selectedId) : null;
  const resolved = selected ? resolveObject(selected, activeVariant) : null;

  const update = (changes) => {
    if (!selectedId) return;
    updateObject(selectedId, activeVariant, changes);
  };

  if (!selected) {
    // Background controls when nothing is selected.
    return (
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-white border-b border-gray-100">
        <span className="text-xs font-medium text-gray-500">Background</span>
        <label className="flex items-center gap-1.5 text-xs text-gray-600">
          Color
          <input
            type="color"
            value={scene.background.fill ?? "#FFFFFF"}
            onChange={(e) => setBackground({ fill: e.target.value })}
            className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-gray-600">
          Image URL
          <input
            type="text"
            placeholder="https://..."
            defaultValue={scene.background.imageSrc ?? ""}
            onBlur={(e) => setBackground({ imageSrc: e.target.value || null })}
            className="border border-gray-200 rounded px-2 py-0.5 text-xs w-52"
          />
        </label>
      </div>
    );
  }

  if (selected.type === "text") {
    return (
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-white border-b border-gray-100">
        <span className="text-xs font-medium text-gray-500">Text</span>

        <input
          type="text"
          value={selected.text ?? ""}
          onChange={(e) => update({ text: e.target.value })}
          className="border border-gray-200 rounded px-2 py-0.5 text-sm w-40"
          placeholder="Text content"
        />

        <select
          value={selected.fontFamily ?? FONT_OPTIONS[0].value}
          onChange={(e) => update({ fontFamily: e.target.value })}
          className="border border-gray-200 rounded px-2 py-0.5 text-xs"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <input
          type="number"
          value={selected.fontSize ?? 24}
          min={8} max={200}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
          className="border border-gray-200 rounded px-2 py-0.5 text-xs w-16"
          title="Font size"
        />

        <label className="flex items-center gap-1 text-xs text-gray-600">
          Color
          <input
            type="color"
            value={selected.fill ?? "#111111"}
            onChange={(e) => update({ fill: e.target.value })}
            className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
          />
        </label>

        <div className="flex gap-0.5">
          {ALIGN_OPTIONS.map((a) => (
            <button
              key={a}
              onClick={() => update({ align: a })}
              className={`px-2 py-1 text-xs rounded ${selected.align === a ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {a[0].toUpperCase()}
            </button>
          ))}
        </div>

        <ToolbarShared selected={selected} resolved={resolved} removeObject={removeObject} reorderObject={reorderObject} />
      </div>
    );
  }

  if (selected.type === "image" || selected.type === "sticker") {
    return (
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-white border-b border-gray-100">
        <span className="text-xs font-medium text-gray-500">{selected.type === "sticker" ? "Sticker" : "Image"}</span>

        <label className="flex items-center gap-1 text-xs text-gray-600">
          Opacity
          <input
            type="range" min={0} max={1} step={0.05}
            value={selected.opacity ?? 1}
            onChange={(e) => update({ opacity: Number(e.target.value) })}
            className="w-20"
          />
          <span>{Math.round((selected.opacity ?? 1) * 100)}%</span>
        </label>

        <ToolbarShared selected={selected} resolved={resolved} removeObject={removeObject} reorderObject={reorderObject} />
      </div>
    );
  }

  return null;
};

const ToolbarShared = ({ selected, resolved, removeObject, reorderObject }) => (
  <>
    {resolved && (
      <span className="text-[11px] text-gray-400 tabular-nums" title="Tamaño en píxeles">
        {Math.round(resolved.width ?? 0)}×{Math.round(resolved.height ?? 0)} px
      </span>
    )}
    <button
      onClick={() => reorderObject(selected.id, 1)}
      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
      title="Bring forward"
    >↑ Forward</button>
    <button
      onClick={() => reorderObject(selected.id, -1)}
      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
      title="Send back"
    >↓ Back</button>
    <button
      onClick={() => removeObject(selected.id)}
      className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
      title="Delete object"
    >Delete</button>
  </>
);

export default Toolbar;
