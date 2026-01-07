import { urlApi } from './url.js';

// Obtener recetas con paginación del servidor y filtros
export async function recetasGetTodas(page = 1, limit = 15, filtros = {}) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);

    // Agregar filtros dinámicamente
    if (filtros.q) params.append('q', filtros.q);
    if (filtros.autor) params.append('autor', filtros.autor);
    if (filtros.tipo_receta) params.append('tipo_receta', filtros.tipo_receta);
    if (filtros.categoria) params.append('categoria', filtros.categoria);

    const response = await fetch(`${urlApi}api/recetas?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Error al obtener las recetas');
    }
    const data = await response.json();

    // Retornar el objeto completo con información de paginación
    return {
        recetas: data.recetas || data.data || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || limit,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / limit)
    };
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
