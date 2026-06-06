// Smoke test: verifies react-konva mounts without React 19 ref errors.
// Not referenced from production routes.
import React, { useRef } from "react";
import { Stage, Layer, Rect, Text, Transformer } from "react-konva";

const KonvaSmoke = () => {
  const rectRef = useRef(null);
  const trRef = useRef(null);

  const handleSelect = () => {
    if (trRef.current && rectRef.current) {
      trRef.current.nodes([rectRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  };

  return (
    <div className="inline-block border-2 border-amarillo p-2">
      <p className="text-xs mb-1">KonvaSmoke — react-konva OK on React 19</p>
      <Stage width={400} height={120}>
        <Layer>
          <Rect
            ref={rectRef}
            x={20} y={20} width={100} height={80}
            fill="#FFF200" draggable
            onClick={handleSelect}
          />
          <Text x={140} y={50} text="Drag me →" fontSize={16} />
          <Transformer ref={trRef} />
        </Layer>
      </Stage>
    </div>
  );
};

export default KonvaSmoke;
