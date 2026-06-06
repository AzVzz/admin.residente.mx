import React, { useRef, useState } from "react";
import { useEditor } from "./useEditor.js";
import { CANVAS_SIZES } from "./sceneSchema.js";
import { bannerAssetUpload } from "../../../../api/bannerSceneApi.js";
import { assetPreviewCache } from "./assetPreview.js";
import StickerPicker from "./StickerPicker.jsx";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB client guard

const AssetPanel = () => {
  const { addObject, activeVariant } = useEditor();
  const { w, h } = CANVAS_SIZES[activeVariant];
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected after an error.
    e.target.value = "";

    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("El archivo supera el límite de 5 MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const { url } = await bannerAssetUpload(file);
      assetPreviewCache.set(url, URL.createObjectURL(file));
      addObject({
        type: "image",
        src: url,
        x: Math.round(w * 0.1),
        y: Math.round(h * 0.1),
        width: Math.round(w * 0.3),
        height: Math.round(h * 0.6),
        rotation: 0,
        opacity: 1,
      });
    } catch (err) {
      setUploadError(err.message || "Error al subir imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {/* Image upload */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Tu imagen</p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-dashed border-gray-300 text-gray-700 disabled:opacity-50"
        >
          {isUploading ? "Subiendo…" : "+ Subir imagen (logo, foto)"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {uploadError && (
          <p className="text-xs text-red-600 mt-1">{uploadError}</p>
        )}
      </div>

      {/* Brand stickers */}
      <StickerPicker />
    </div>
  );
};

export default AssetPanel;
