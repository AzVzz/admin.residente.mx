import React, { useRef, useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import { localImgSrc } from "../sceneSchema.js";

// Brand stickers from the Residente CDN, loaded same-origin so export doesn't taint.
const StickerNode = ({ obj, onSelect, onDragEnd, onTransformEnd }) => {
  const ref = useRef(null);
  const [imgEl, setImgEl] = useState(null);

  useEffect(() => {
    if (!obj.src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = localImgSrc(obj.src);
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
      width={obj.width ?? 64}
      height={obj.height ?? 64}
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

export default StickerNode;
