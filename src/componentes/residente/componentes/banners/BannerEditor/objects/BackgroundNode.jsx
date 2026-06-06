import React, { useEffect, useState } from "react";
import { Rect, Image as KonvaImage } from "react-konva";

const BackgroundNode = ({ background, width, height }) => {
  const [imgEl, setImgEl] = useState(null);

  useEffect(() => {
    if (!background.imageSrc) { setImgEl(null); return; }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = background.imageSrc;
    img.onload = () => setImgEl(img);
    img.onerror = () => setImgEl(null);
  }, [background.imageSrc]);

  return (
    <>
      <Rect x={0} y={0} width={width} height={height} fill={background.fill ?? "#FFFFFF"} listening={false} />
      {imgEl && (
        <KonvaImage
          image={imgEl}
          x={0} y={0}
          width={width} height={height}
          listening={false}
        />
      )}
    </>
  );
};

export default BackgroundNode;
