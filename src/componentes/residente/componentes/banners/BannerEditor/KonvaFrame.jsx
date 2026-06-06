import React, { useRef, useCallback } from "react";
import { Stage, Layer, Line } from "react-konva";
import { useEditor } from "./useEditor.js";
import { resolveObject, CANVAS_SIZES } from "./sceneSchema.js";
import BackgroundNode from "./objects/BackgroundNode.jsx";
import TextNode from "./objects/TextNode.jsx";
import ImageNode from "./objects/ImageNode.jsx";
import StickerNode from "./objects/StickerNode.jsx";
import SelectionTransformer from "./SelectionTransformer.jsx";

const SNAP_THRESHOLD = 5;

// Returns guide lines to show during drag (edges of stage).
const getStageGuides = (stageW, stageH) => [
  { points: [0, 0, stageW, 0] },
  { points: [0, stageH, stageW, stageH] },
  { points: [0, 0, 0, stageH] },
  { points: [stageW, 0, stageW, stageH] },
  { points: [stageW / 2, 0, stageW / 2, stageH] },
  { points: [0, stageH / 2, stageW, stageH / 2] },
];

const snapToGuide = (value, guides, threshold) => {
  for (const g of guides) {
    if (Math.abs(value - g) <= threshold) return g;
  }
  return value;
};

const KonvaFrame = ({ variant, displayWidth, stageRef: externalRef }) => {
  const { scene, selectedId, activeVariant, select, deselect, updateObject } = useEditor();
  const internalRef = useRef(null);
  const stageRef = externalRef || internalRef;

  const { w: nativeW, h: nativeH } = CANVAS_SIZES[variant];
  const scale = displayWidth / nativeW;
  const displayH = nativeH * scale;

  const isActiveVariant = activeVariant === variant;

  const sorted = [...scene.objects].sort((a, b) => a.zIndex - b.zIndex);

  const handleSelect = useCallback((id) => {
    if (isActiveVariant) select(id);
  }, [isActiveVariant, select]);

  const handleStageClick = useCallback((e) => {
    // Deselect when clicking empty area
    if (e.target === e.target.getStage()) deselect();
  }, [deselect]);

  const handleDragEnd = useCallback((id, e) => {
    const node = e.target;
    const stageW = nativeW;
    const stageH = nativeH;

    const hGuides = [0, stageH / 2, stageH];
    const vGuides = [0, stageW / 2, stageW];

    const snappedX = snapToGuide(node.x(), vGuides, SNAP_THRESHOLD);
    const snappedY = snapToGuide(node.y(), hGuides, SNAP_THRESHOLD);
    node.x(snappedX);
    node.y(snappedY);

    updateObject(id, activeVariant, { x: snappedX, y: snappedY });
  }, [activeVariant, nativeW, nativeH, updateObject]);

  const handleTransformEnd = useCallback((id, e, nodeRef) => {
    const node = nodeRef?.current || e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    // Reset scale, apply to width/height
    node.scaleX(1);
    node.scaleY(1);
    updateObject(id, activeVariant, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });
  }, [activeVariant, updateObject]);

  const stageGuides = isActiveVariant && selectedId ? getStageGuides(nativeW, nativeH) : [];

  return (
    <div className="relative border border-gray-200 shadow-sm overflow-hidden" style={{ width: displayWidth, height: displayH }}>
      <Stage
        ref={stageRef}
        width={displayWidth}
        height={displayH}
        scaleX={scale}
        scaleY={scale}
        onClick={handleStageClick}
        onTap={handleStageClick}
        listening={isActiveVariant}
      >
        <Layer>
          <BackgroundNode
            background={scene.background}
            width={nativeW}
            height={nativeH}
          />
          {sorted.map((obj) => {
            const resolved = resolveObject(obj, variant);
            if (resolved.hidden) return null;

            const sharedProps = {
              obj: resolved,
              onSelect: handleSelect,
              onDragEnd: handleDragEnd,
              onTransformEnd: handleTransformEnd,
            };

            if (resolved.type === "text") return <TextNode key={obj.id} {...sharedProps} />;
            if (resolved.type === "image") return <ImageNode key={obj.id} {...sharedProps} />;
            if (resolved.type === "sticker") return <StickerNode key={obj.id} {...sharedProps} />;
            return null;
          })}

          {/* Smart guide overlays */}
          {stageGuides.map((g, i) => (
            <Line key={i} points={g.points} stroke="#0099ff" strokeWidth={1 / scale} dash={[4 / scale, 4 / scale]} opacity={0.5} listening={false} />
          ))}

          {isActiveVariant && <SelectionTransformer stageRef={stageRef} />}
        </Layer>
      </Stage>
    </div>
  );
};

export default KonvaFrame;
