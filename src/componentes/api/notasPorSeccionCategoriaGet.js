import { urlApi } from './url.js';

export const notasPorSeccionCategoriaGet = async (seccion, categoria) => {
    try {
        const response = await fetch(
            `${urlApi}api/notas/por-seccion-categoria?seccion=${encodeURIComponent(seccion)}&categoria=${encodeURIComponent(categoria)}`
        );
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();
        return result; // El backend ya regresa el array de notas
    } catch (error) {
        console.error("Error fetching notas por sección y categoría:", error);
        throw error;
    }
};

// Nuevo: obtener top 5 más vistas por sección y categoría
export const notasTopPorSeccionCategoriaGet = async (seccion, categoria) => {
    try {
        const response = await fetch(
            `${urlApi}api/notas/por-seccion-categoria/top?seccion=${encodeURIComponent(seccion)}&categoria=${encodeURIComponent(categoria)}`
        );
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error fetching top notas por sección y categoría:", error);
        throw error;
    }
};