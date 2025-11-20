import { urlApi } from './url.js';

// Obtener todas las recetas
export async function recetasGetTodas(page = 1, limit = 1000) {
    const response = await fetch(`${urlApi}api/recetas?page=${page}&limit=${limit}`);
    if (!response.ok) {
        throw new Error('Error al obtener las recetas');
    }
    const data = await response.json();
    
    // Manejar diferentes formatos de respuesta
    if (Array.isArray(data)) {
        // Si la respuesta es directamente un array
        return data;
    } else if (data.recetas && Array.isArray(data.recetas)) {
        // Si la respuesta tiene la propiedad 'recetas'
        return data.recetas;
    } else if (data.data && Array.isArray(data.data)) {
        // Si la respuesta tiene la propiedad 'data'
        return data.data;
    } else {
        return [];
    }
}

// Obtener una receta por ID
export async function recetaGetPorId(id) {
    const response = await fetch(`${urlApi}api/recetas/${id}`);
    if (!response.ok) {
        throw new Error('Error al obtener la receta');
    }
    const data = await response.json();
    return data.receta;
}

// Eliminar una receta
export async function recetaBorrar(id) {
    const response = await fetch(`${urlApi}api/recetas/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al borrar la receta');
    }
    return await response.json();
}






