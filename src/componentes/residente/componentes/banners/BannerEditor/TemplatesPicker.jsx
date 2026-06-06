import React from "react";
import { useEditor } from "./useEditor.js";
import templates from "./templates.js";

const TemplatesPicker = () => {
  const { loadScene } = useEditor();

  const handleLoad = (template) => {
    const isConfirmed = window.confirm(
      `Load template "${template.name}"? Current canvas will be replaced.`
    );
    if (isConfirmed) loadScene(template.scene);
  };

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Templates</p>
      <div className="flex flex-col gap-2">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => handleLoad(t)}
            className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 transition-colors"
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPicker;
