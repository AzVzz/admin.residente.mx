import React, { useRef, useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";

const ImageNode = ({ obj, onSelect, onDragEnd, onTransformEnd }) => {
  const ref = useRef(null);
  const [imgEl, setImgEl] = useState(null);

  useEffect(() => {
    if (!obj.src) return;
    const img = new window.Image();
    // crossOrigin required to avoid tainted canvas on export
    img.crossOrigin = "anonymous";
    img.src = obj.src;
    img.onload = () => setImgEl(img);
    img.onerror = () => setImgEl(null);
  }, [obj.src]);

  return (
    <KonvaImage
      ref={ref}
      id={obj.id}
      image={imgEl}
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      rotation={obj.rotation ?? 0}
      opacity={obj.opacity ?? 1}
      draggable
      onClick={() => onSelect(obj.id)}
      onTap={() => onSelect(obj.id)}
      onDragEnd={(e) => onDragEnd(obj.id, e)}
      onTransformEnd={(e) => onTransformEnd(obj.id, e, ref)}
    />
  );
};

export default ImageNode;
