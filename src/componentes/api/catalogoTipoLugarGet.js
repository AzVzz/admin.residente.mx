import { urlApi } from "./url";

export const catalogoTipoLugarGet = async () => {
    try {
        const response = await fetch(`${urlApi}/api/catalogo/tipo-lugar`);
        const data = await response.json();
        if (data.success) {
            return data.data;
        }
        throw new Error("Error al obtener tipos de lugar");
    } catch (error) {
        console.error("Error en catalogoTipoLugarGet:", error);
        throw error;
    }
};
