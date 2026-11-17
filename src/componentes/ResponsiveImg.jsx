// Wrapper sobre /api/img + <picture>: emite AVIF + WebP srcset con fallback
// transparente al <img> con URL original. Para imagenes que vienen de fotos/.
//
// IMPORTANTE: <picture> con display:contents hace que el <img> interno tome
// el width/height del padre flex/grid. Sin esto, las imagenes circulares o
// con object-cover colapsan a 0x0.
//
// Uso:
//   <ResponsiveImg
//     src={nota.imagen}
//     alt={nota.titulo}
//     width={400}
//     height={240}
//     widths={[200, 400]}
//     sizes="400px"
//     className="absolute inset-0 w-full h-full object-cover"
//     loading="lazy"
//   />

import { memo, useEffect, useState } from "react";
import { imgSrcset } from "./utils/imgSrcset";

function ResponsiveImg({
  src,
  alt,
  width,
  height,
  widths,
  sizes,
  className,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  style,
  onError,
  onClick,
  onLoad,
  draggable,
}) {
  const [failed, setFailed] = useState(false);
  const set = imgSrcset(src, { widths, sizes, defaultWidth: width });

  useEffect(() => {
    setFailed(false);
  }, [src]);

  // Si la URL falla, no mostramos icono roto + alt encima del layout.
  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className={className}
        style={{
          ...style,
          background:
            "linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)",
        }}
      />
    );
  }

  const handleError = (event) => {
    setFailed(true);
    if (onError) onError(event);
  };

  const imgProps = {
    src: set.src,
    alt,
    width,
    height,
    className,
    loading,
    decoding,
    style,
    onError: handleError,
  };
  if (fetchPriority) imgProps.fetchPriority = fetchPriority;
  if (onClick) imgProps.onClick = onClick;
  if (onLoad) imgProps.onLoad = onLoad;
  if (draggable !== undefined) imgProps.draggable = draggable;

  if (!set.isOptimized) {
    return <img {...imgProps} />;
  }

  return (
    <picture style={{ display: "contents" }}>
      <source type="image/avif" srcSet={set.srcsetAvif} sizes={set.sizes} />
      <source type="image/webp" srcSet={set.srcset} sizes={set.sizes} />
      <img {...imgProps} />
    </picture>
  );
}

export default memo(ResponsiveImg);
