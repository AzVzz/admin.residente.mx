/**
 * Peso máximo del video que se sube. El servidor lo comprime, así que se
 * manda el archivo original. Debe coincidir con MAX_VIDEO del backend
 * (videosRoutes.js) y con el límite de nginx.
 */
export const MAX_UPLOAD_BYTES = 600 * 1024 * 1024;
