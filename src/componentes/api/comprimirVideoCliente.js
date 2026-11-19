/** Peso a partir del cual conviene comprimir en el navegador antes de subir */
export const UMBRAL_COMPRESION_BYTES = 20 * 1024 * 1024;

const elegirMime = () => {
  const candidatos = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm",
  ];
  return candidatos.find((m) => MediaRecorder.isTypeSupported(m)) || "";
};

const cargarVideo = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    video.onloadedmetadata = () => resolve({ video, url });
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          "El navegador no pudo leer este video. Prueba en MP4 o comprímelo antes.",
        ),
      );
    };
  });

/**
 * Reencodea a ~720p / bitrate bajo con MediaRecorder.
 * Sirve para videos pesados sin cargar todo en WASM.
 */
export async function comprimirVideoCliente(file, { onProgress } = {}) {
  if (!file || file.size <= UMBRAL_COMPRESION_BYTES) {
    return { file, comprimido: false };
  }
  if (typeof MediaRecorder === "undefined") {
    throw new Error("Este navegador no soporta compresión de video.");
  }

  const mime = elegirMime();
  if (!mime) {
    throw new Error("Este navegador no puede comprimir video (falta WebM).");
  }

  const { video, url } = await cargarVideo(file);
  const maxW = 1280;
  const scale = Math.min(1, maxW / (video.videoWidth || maxW));
  const width = Math.max(
    2,
    Math.round(((video.videoWidth || 1280) * scale) / 2) * 2,
  );
  const height = Math.max(
    2,
    Math.round(((video.videoHeight || 720) * scale) / 2) * 2,
  );
  const videoBits = 1_200_000;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(url);
    throw new Error("No se pudo preparar el canvas para comprimir.");
  }

  const canvasStream = canvas.captureStream(30);
  let stream = canvasStream;
  try {
    const raw =
      typeof video.captureStream === "function"
        ? video.captureStream()
        : typeof video.mozCaptureStream === "function"
          ? video.mozCaptureStream()
          : null;
    const audio = raw?.getAudioTracks?.() || [];
    if (audio.length) {
      stream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audio,
      ]);
    }
  } catch {
    // Sin audio si el navegador no lo permite
  }

  const chunks = [];
  const recorder = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: videoBits,
    audioBitsPerSecond: 96_000,
  });

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) chunks.push(event.data);
  };

  const stopped = new Promise((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () =>
      reject(new Error("Falló la compresión del video en el navegador."));
  });

  let raf = 0;
  const pintar = () => {
    if (!video.paused && !video.ended) {
      ctx.drawImage(video, 0, 0, width, height);
      if (onProgress && video.duration > 0) {
        onProgress(
          Math.min(99, Math.round((video.currentTime / video.duration) * 100)),
        );
      }
      raf = requestAnimationFrame(pintar);
    }
  };

  try {
    // Más rápido que tiempo real; 4x suele ir bien en Chrome/Edge
    video.playbackRate = 4;
    recorder.start(1000);
    await video.play();
    pintar();
    await new Promise((resolve) => {
      video.onended = resolve;
    });
    ctx.drawImage(video, 0, 0, width, height);
    if (recorder.state !== "inactive") recorder.stop();
    await stopped;
  } finally {
    cancelAnimationFrame(raf);
    video.pause();
    video.removeAttribute("src");
    video.load();
    stream.getTracks().forEach((t) => t.stop());
    URL.revokeObjectURL(url);
  }

  const blob = new Blob(chunks, { type: mime.split(";")[0] });
  if (!blob.size) {
    throw new Error("La compresión no generó archivo. Intenta con otro MP4.");
  }

  // Si casi no bajó de peso, mejor subir el original
  if (blob.size >= file.size * 0.9) {
    onProgress?.(100);
    return { file, comprimido: false };
  }

  const base = (file.name || "video").replace(/\.[^.]+$/, "");
  const out = new File([blob], `${base}-web.webm`, { type: "video/webm" });
  onProgress?.(100);
  return {
    file: out,
    comprimido: true,
    originalBytes: file.size,
    nuevoBytes: out.size,
  };
}
