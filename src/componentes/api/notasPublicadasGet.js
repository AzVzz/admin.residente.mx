//src/componentes/api/CatalogoNotasGet.js
import { urlApi } from './url.js'

export const catalogoNotasGet = async (page = 1, limit = 15) => {
    try {
        const response = await fetch(`${urlApi}api/notas?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();
        // Si tu API regresa un array directo:
        return result;
        // Si tu API regresa { data: [...] }:
        // return result.data;
    } catch (error) {
        console.error("Error fetching notas:", error);
        throw error;
    }
};

// GET:ID de las notas
export const notasPublicadasPorId = async (id) => {
    try {
        const response = await fetch(`${urlApi}/api/notas/${id}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
        const result = await response.json();
        return result;
    } catch {
        console.error("Error al obtener la nota get/notas/:id", error);
        throw error;
    }
}

// Obtener las notas más populares (destacadas/top)
export const notasDestacadasTopGet = async () => {
    try {
        const response = await fetch(`${urlApi}api/notas/destacadas/top`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error fetching notas destacadas/top:", error);
        throw error;
    }
};

export const notasPorTipoNota = async (tipoNota) => {
    // Convierte espacios a guiones para la URL
    const tipoNotaUrl = tipoNota.toLowerCase().replace(/ /g, '-');
    const response = await fetch(`${urlApi}api/notas/por-tipo-nota/${tipoNotaUrl}`);
    if (!response.ok) throw new Error('Error al obtener notas por tipo_nota');
    return await response.json();
};