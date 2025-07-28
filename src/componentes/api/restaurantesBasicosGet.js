import { urlApi } from './url.js';

export const restaurantesBasicosGet = async () => {
    try {
        const response = await fetch(`${urlApi}api/restaurante/basicos`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();
        return result; // Array con id, nombre_restaurante, slug, secciones_categorias
    } catch (error) {
        console.error("Error fetching restaurantes básicos:", error);
        throw error;
    }
};