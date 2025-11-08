//src/componentes/api/notasCompletas.js
import { urlApi, imgApi } from './url.js';

export const notasTodasGet = async (token, page = 1, limit = "all", q = "", filtros = {}) => {
    try {
        const url = new URL(`${urlApi}api/notas/todas`);
        url.searchParams.append("page", page);
        if (limit !== undefined && limit !== null) url.searchParams.append("limit", limit);
        if (q) url.searchParams.append("q", q);
        // Agrega filtros dinámicamente
        Object.entries(filtros).forEach(([key, value]) => {
            if (value) url.searchParams.append(key, value);
        });

        const response = await fetch(url, {
            headers: token ? { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const error = new Error('Error al obtener notas');
            error.status = response.status;
            throw error;
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// Obtener una nota por ID
export const notaGetById = async (id) => {
    try {
        const response = await fetch(`${urlApi}api/notas/${id}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching nota by id:", error);
        throw error;
    }
};