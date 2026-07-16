import { useCallback } from "react";
import Konva from "konva";
import { CANVAS_SIZES, resolveObject } from "./sceneSchema.js";
import { assetPreviewCache } from "./assetPreview.js";

export const preloadFonts = async (scene) => {
  const families = [
    ...new Set(
      scene.objects
        .filter((o) => o.type === "text" && o.fontFamily)
        .map((o) => o.fontFamily)
    ),
  ];
  await Promise.all(families.map((f) => document.fonts.load(`16px "${f}"`)));
};

// Resolves immediately if image is already loaded (avoids blank export / tainted canvas).
const waitForImage = (konvaImgNode) =>
  new Promise((resolve) => {
    const img = konvaImgNode.image();
    if (!img || img.complete) {
      resolve();
      return;
    }
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });

const loadImageElement = (src) =>
  new Promise((resolve) => {
    const imgEl = new Image();
    imgEl.crossOrigin = "anonymous";
    imgEl.onload = () => resolve(imgEl);
    imgEl.onerror = () => resolve(null);
    imgEl.src = assetPreviewCache.get(src) || src || "";
  });

// Hide editor chrome (selection handles + snap guides) so it never lands in the PNG.
const hideExportUi = (stage) => {
  const nodes = [...stage.find("Transformer"), ...stage.find(".export-ui-guide")];
  const wasVisible = nodes.map((n) => n.visible());
  nodes.forEach((n) => n.hide());
  stage.batchDraw();
  return () => {
    nodes.forEach((n, i) => {
      if (wasVisible[i]) n.show();
    });
    stage.batchDraw();
  };
};

// Falls back to offscreen Stage if stageRef is unavailable (mobile reliability).
export const exportVariant = async (scene, variant, stageRef) => {
  const { w, h } = CANVAS_SIZES[variant];

  // Collect image nodes and wait for loads to avoid tainted canvas / blank export.
  if (stageRef?.current) {
    const stage = stageRef.current;
    const imgNodes = stage.find("Image");
    await Promise.all(imgNodes.map(waitForImage));

    const restoreUi = hideExportUi(stage);
    try {
      const displayW = stage.width();
      const fit = displayW / w;
      // pixelRatio 1/fit renders at the native canvas size (already the target export resolution).
      const dataURL = stage.toDataURL({ pixelRatio: 1 / fit, mimeType: "image/png" });
      const blob = await (await fetch(dataURL)).blob();
      return new File([blob], `banner-${variant}.png`, { type: "image/png" });
    } finally {
      restoreUi();
    }
  }

  // Offscreen fallback: build a minimal Stage in memory.
  return exportOffscreen(scene, variant, w, h);
};

const exportOffscreen = async (scene, variant, w, h) => {
  const container = document.createElement("div");
  container.style.cssText = `position:absolute;top:-9999px;left:-9999px;width:${w}px;height:${h}px`;
  document.body.appendChild(container);

  try {
    const stage = new Konva.Stage({ container, width: w, height: h });
    const layer = new Konva.Layer();
    stage.add(layer);

    // Background
    const bg = scene.background;
    if (bg.fill) {
      layer.add(new Konva.Rect({ x: 0, y: 0, width: w, height: h, fill: bg.fill }));
    }
    if (bg.imageSrc) {
      const bgImg = await loadImageElement(bg.imageSrc);
      if (bgImg) {
        layer.add(new Konva.Image({ x: 0, y: 0, width: w, height: h, image: bgImg }));
      }
    }

    // Objects sorted by zIndex
    const sorted = [...scene.objects].sort((a, b) => a.zIndex - b.zIndex);

    for (const obj of sorted) {
      const resolved = resolveObject(obj, variant);
      if (resolved.hidden) continue;

      if (resolved.type === "text") {
        layer.add(
          new Konva.Text({
            x: resolved.x, y: resolved.y,
            width: resolved.width,
            text: resolved.text ?? "",
            fontSize: resolved.fontSize ?? 24,
            fontFamily: resolved.fontFamily ?? "sans-serif",
            fill: resolved.fill ?? "#000000",
            align: resolved.align ?? "left",
            rotation: resolved.rotation ?? 0,
            opacity: resolved.opacity ?? 1,
          })
        );
      } else if (resolved.type === "image" || resolved.type === "sticker") {
        const imgEl = await loadImageElement(resolved.src);
        if (!imgEl) continue;
        layer.add(
          new Konva.Image({
            x: resolved.x, y: resolved.y,
            width: resolved.width, height: resolved.height,
            image: imgEl,
            rotation: resolved.rotation ?? 0,
            opacity: resolved.opacity ?? 1,
          })
        );
      }
    }

    layer.draw();
    const dataURL = stage.toDataURL({ mimeType: "image/png" });
    stage.destroy();
    const blob = await (await fetch(dataURL)).blob();
    return new File([blob], `banner-${variant}.png`, { type: "image/png" });
  } finally {
    document.body.removeChild(container);
  }
};

export const useSceneExport = (scene, desktopStageRef, mobileStageRef) => {
  const exportAll = useCallback(async () => {
    await preloadFonts(scene);
    const [desktopFile, mobileFile] = await Promise.all([
      exportVariant(scene, "desktop", desktopStageRef),
      exportVariant(scene, "mobile", mobileStageRef),
    ]);
    return { desktopFile, mobileFile };
  }, [scene, desktopStageRef, mobileStageRef]);

  return { exportAll };
};
