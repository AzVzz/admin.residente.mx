import React, { createContext, useMemo, useState } from "react";
import { useSceneDocument } from "./useSceneDocument.js";

export const EditorContext = createContext(null);

const EditorProvider = ({ children, initialScene }) => {
  const sceneDoc = useSceneDocument(initialScene);
  const [activeVariant, setActiveVariant] = useState("desktop");
  const [isFontsReady, setIsFontsReady] = useState(false);

  const value = useMemo(
    () => ({ ...sceneDoc, activeVariant, setActiveVariant, isFontsReady, setIsFontsReady }),
    [sceneDoc, activeVariant, isFontsReady]
  );

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

export default EditorProvider;
