import React, { useRef, useEffect } from "react";
import { Transformer } from "react-konva";
import { useEditor } from "./useEditor.js";

const SelectionTransformer = ({ stageRef }) => {
  const { scene, selectedId, removeObject } = useEditor();
  const trRef = useRef(null);
  const selected = selectedId ? scene.objects.find((o) => o.id === selectedId) : null;

  // Attach transformer to the selected node.
  useEffect(() => {
    if (!trRef.current || !stageRef?.current) return;
    const node = stageRef.current.findOne(`#${selectedId}`);
    if (node) {
      trRef.current.nodes([node]);
      trRef.current.getLayer()?.batchDraw();
    } else {
      trRef.current.nodes([]);
    }
  }, [selectedId, stageRef]);

  // Delete key removes selected object.
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // only delete if not typing inside an input
        if (document.activeElement?.tagName === "INPUT" ||
            document.activeElement?.tagName === "TEXTAREA") return;
        removeObject(selectedId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, removeObject]);

  if (!selectedId) return null;

  return (
    <Transformer
      ref={trRef}
      boundBoxFunc={(oldBox, newBox) => {
        // Prevent collapsing to zero
        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
        return newBox;
      }}
      rotateEnabled
      keepRatio={selected?.type === "image" || selected?.type === "sticker"}
      borderStroke="#0099ff"
      borderStrokeWidth={1.5}
      anchorStroke="#0099ff"
      anchorFill="#ffffff"
      anchorSize={8}
    />
  );
};

export default SelectionTransformer;
