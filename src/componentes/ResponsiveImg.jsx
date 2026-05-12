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

import { memo } from "react";
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
  draggable,
}) {
  const set = imgSrcset(src, { widths, sizes, defaultWidth: width });

  const imgProps = {
    src: set.src,
    alt,
    width,
    height,
    className,
    loading,
    decoding,
    style,
  };
  if (fetchPriority) imgProps.fetchPriority = fetchPriority;
  if (onError) imgProps.onError = onError;
  if (onClick) imgProps.onClick = onClick;
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
