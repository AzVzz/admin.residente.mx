// Session cache mapping a server asset URL to a local blob URL for in-editor preview.
// In local dev the /fotos proxy points to prod, so a just-uploaded file 404s; the blob
// is same-origin, renders immediately, and exports without tainting the canvas.
export const assetPreviewCache = new Map();
