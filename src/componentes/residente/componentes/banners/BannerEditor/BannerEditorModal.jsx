import React, { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import EditorProvider from "./EditorContext.jsx";
import { useEditor } from "./useEditor.js";
import KonvaFrame from "./KonvaFrame.jsx";
import VariantSwitcher from "./VariantSwitcher.jsx";
import Toolbar from "./Toolbar.jsx";
import AssetPanel from "./AssetPanel.jsx";
import TemplatesPicker from "./TemplatesPicker.jsx";
import { useSceneExport, preloadFonts } from "./useSceneExport.js";
import { deserializeScene, serializeScene, CANVAS_SIZES } from "./sceneSchema.js";

// Inner editor tree — has access to EditorContext.
const EditorInner = ({ onSave, onCancel }) => {
  const { scene, activeVariant, addObject, undo, redo, isUndoable, isRedoable, isFontsReady, setIsFontsReady } = useEditor();

  const desktopRef = useRef(null);
  const mobileRef = useRef(null);

  const { exportAll } = useSceneExport(scene, desktopRef, mobileRef);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [activePanel, setActivePanel] = useState("assets"); // assets | templates

  // Preload fonts whenever text objects change.
  useEffect(() => {
    setIsFontsReady(false);
    preloadFonts(scene)
      .then(() => setIsFontsReady(true))
      .catch(() => setIsFontsReady(true)); // don't block UI on font errors
  }, [scene, setIsFontsReady]);

  const handleSave = useCallback(async () => {
    if (!isFontsReady) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const { desktopFile, mobileFile } = await exportAll();
      onSave({ desktopFile, mobileFile, sceneJson: serializeScene(scene) });
    } catch (err) {
      setExportError("Export failed. Please try again.");
      console.error("Banner export error:", err);
    } finally {
      setIsExporting(false);
    }
  }, [isFontsReady, exportAll, onSave, scene]);

  const handleAddText = () => {
    const { w, h } = CANVAS_SIZES[activeVariant];
    addObject({
      type: "text",
      x: Math.round(w * 0.1),
      y: Math.round(h * 0.35),
      width: Math.round(w * 0.5),
      height: 60,
      text: "New text",
      fontFamily: "NeueHaasGroteskDisplayW02Bold, sans-serif",
      fontSize: 32,
      fill: "#111111",
      align: "left",
    });
  };

  const DISPLAY_W = 600;
  const DISPLAY_W_MOBILE = 500;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-800 text-sm">Banner Editor</span>
          <VariantSwitcher />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!isUndoable}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30"
            title="Undo"
          >↩ Undo</button>
          <button
            onClick={redo}
            disabled={!isRedoable}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30"
            title="Redo"
          >↪ Redo</button>

          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isFontsReady || isExporting}
            className="px-4 py-1.5 text-sm font-medium bg-amarillo hover:bg-yellow-300 text-gray-900 rounded-lg disabled:opacity-50"
          >
            {isExporting ? "Exporting…" : isFontsReady ? "Save Design" : "Loading fonts…"}
          </button>
        </div>
      </div>

      {/* Toolbar row */}
      <div className="shrink-0">
        <Toolbar />
      </div>

      {exportError && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-sm border-b border-red-200 shrink-0">
          {exportError}
        </div>
      )}

      {/* Main area: left panel + canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-48 shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-y-auto">
          {/* Add buttons */}
          <div className="p-3 border-b border-gray-100 space-y-1.5">
            <button
              onClick={handleAddText}
              className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-dashed border-gray-300 text-gray-700"
            >
              + Add Text
            </button>
          </div>

          {/* Panel tabs */}
          <div className="flex border-b border-gray-100">
            {["assets", "templates"].map((p) => (
              <button
                key={p}
                onClick={() => setActivePanel(p)}
                className={`flex-1 py-1.5 text-xs font-medium capitalize ${
                  activePanel === p ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="p-3 overflow-y-auto flex-1">
            {activePanel === "assets" && <AssetPanel />}
            {activePanel === "templates" && <TemplatesPicker />}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 overflow-auto bg-gray-100 flex flex-col items-center justify-start py-8 gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400 mb-1">Desktop · 1080×216</span>
            <KonvaFrame variant="desktop" displayWidth={DISPLAY_W} stageRef={desktopRef} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400 mb-1">Mobile · 1000×250</span>
            <KonvaFrame variant="mobile" displayWidth={DISPLAY_W_MOBILE} stageRef={mobileRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Exported as the React.lazy target; konva stays out of main bundle.
const BannerEditorModal = ({ isOpen, initialSceneJson, onSave, onClose }) => {
  if (!isOpen) return null;

  const initialScene = deserializeScene(initialSceneJson);

  return createPortal(
    <EditorProvider initialScene={initialScene}>
      <EditorInner onSave={onSave} onCancel={onClose} />
    </EditorProvider>,
    document.body
  );
};

export default BannerEditorModal;
