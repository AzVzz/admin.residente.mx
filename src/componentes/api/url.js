// En Docker local: VITE_API_URL = http://localhost:3000/
// En produccion (sin variable): fallback a https://admin.residente.mx/
export const urlApi =
  import.meta.env.VITE_API_URL || "https://admin.residente.mx/";
export const imgApi = import.meta.env.VITE_IMG_URL || "https://residente.mx/";
