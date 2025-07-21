import { urlApi } from './url.js';

export const restaurantesPorSeccionCategoriaGet = async (seccion, categoria) => {
    try {
        const response = await fetch(
            `${urlApi}api/restaurante/por-seccion-categoria?seccion=${encodeURIComponent(seccion)}&categoria=${encodeURIComponent(categoria)}`
        );
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();
        return result; // El backend ya regresa el array de restaurantes
    } catch (error) {
        console.error("Error fetching restaurantes por sección y categoría:", error);
        throw error;
    }
};