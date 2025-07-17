//src/componentes/api/notasCompletas.js
import { urlApi } from './url.js';

export const notasTodasGet = async (page = 1, limit = 15) => {
    try {
        const response = await fetch(`${urlApi}api/notas/todas?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        return data; // Tu API regresa un array, no un objeto con "notas"
    } catch (error) {
        console.error("Error fetching notas:", error);
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