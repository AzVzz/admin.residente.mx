import { useCallback } from "react";
import Konva from "konva";
import { CANVAS_SIZES, resolveObject } from "./sceneSchema.js";

// Export multiplier per variant — mobile at 2× so it stays sharp on retina screens.
const EXPORT_SCALE = { desktop: 1, mobile: 2 };

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

// Falls back to offscreen Stage if stageRef is unavailable (mobile reliability).
export const exportVariant = async (scene, variant, stageRef) => {
  const { w, h } = CANVAS_SIZES[variant];

  // Collect image nodes and wait for loads to avoid tainted canvas / blank export.
  if (stageRef?.current) {
    const stage = stageRef.current;
    const imgNodes = stage.find("Image");
    await Promise.all(imgNodes.map(waitForImage));

    const displayW = stage.width();
    const fit = displayW / w;
    // 1/fit gives native size; × EXPORT_SCALE bumps resolution without changing aspect.
    const dataURL = stage.toDataURL({ pixelRatio: (EXPORT_SCALE[variant] ?? 1) / fit, mimeType: "image/png" });
    const blob = await (await fetch(dataURL)).blob();
    return new File([blob], `banner-${variant}.png`, { type: "image/png" });
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

    // Objects sorted by zIndex
    const sorted = [...scene.objects].sort((a, b) => a.zIndex - b.zIndex);
    const imageLoads = [];

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
        const imgEl = new Image();
        imgEl.crossOrigin = "anonymous";
        const load = new Promise((res) => {
          imgEl.onload = res;
          imgEl.onerror = res;
          imgEl.src = resolved.src ?? "";
        });
        imageLoads.push(load);
        await load;
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
    const dataURL = stage.toDataURL({ mimeType: "image/png", pixelRatio: EXPORT_SCALE[variant] ?? 1 });
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
