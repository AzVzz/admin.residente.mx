//src/componentes/api/CatalogoNotasGet.js
import { urlApi, imgApi } from './url.js';

// Puro Gets a notasPublicadas

export const catalogoNotasGet = async (page = 1, limit = 50) => {
    try {
        const response = await fetch(`${urlApi}api/notas?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();

        // Manejar nuevo formato paginado y formato antiguo (retrocompatibilidad)
        if (Array.isArray(result)) {
            // Formato antiguo: array directo
            return result;
        } else if (result.notas && Array.isArray(result.notas)) {
            // Nuevo formato: { notas: [...], paginacion: {...} }
            return result.notas;
        } else {
            return [];
        }
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
    // Intentar primero con guiones (formato URL)
    const tipoNotaUrl = tipoNota.toLowerCase().replace(/ /g, '-');

    let response = await fetch(`${urlApi}api/notas/por-tipo-nota/${tipoNotaUrl}`);
    let result = await response.json();

    // Si no hay resultados, intentar con espacios
    if (result.length === 0) {
        const tipoNotaConEspacios = tipoNota.replace(/-/g, ' ');

        response = await fetch(`${urlApi}api/notas/por-tipo-nota/${tipoNotaConEspacios}`);
        if (response.ok) {
            result = await response.json();
        }
    }

    return result;
};

export const notasResidenteGet = async () => {
    try {
        const response = await fetch(`${urlApi}api/notas/residente`);
        if (!response.ok) throw new Error('Error al obtener notas tipo Residente');
        return await response.json();
    } catch (error) {
        console.error("Error fetching notas tipo Residente:", error);
        throw error;
    }
};

export const notasDestacadasPorTipoGet = async (tipoNota) => {
    // Asegurar que la primera letra sea mayúscula y el resto minúsculas
    const tipoNotaFormateado = tipoNota.charAt(0).toUpperCase() + tipoNota.slice(1).toLowerCase();

    // Convertir espacios a guiones para la URL
    const tipoNotaUrl = tipoNotaFormateado.replace(/ /g, '-');

    // Añadir timestamp para evitar cache
    const timestamp = new Date().getTime();

    const response = await fetch(`${urlApi}api/notas/destacadas/${tipoNotaUrl}?t=${timestamp}`);
    if (!response.ok) throw new Error(`Error al obtener notas destacadas de ${tipoNota}`);
    return await response.json();
};