import { urlApi } from './url.js';

// Función helper para obtener el token
const getToken = () => {
    // El token se guarda como 'admin_token' según Context.jsx
    return localStorage.getItem('admin_token') || null;
};

// Obtener recetas del invitado autenticado (solo sus propias recetas)
export async function recetasGetMisRecetas(page = 1, limit = 15, filtros = {}) {
    const token = getToken();
    if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }

    // Verificar que el token tenga el formato correcto
    if (typeof token !== 'string' || token.length < 10) {
        console.error('[recetasApi] Token inválido:', token);
        throw new Error('Token de autenticación inválido. Por favor, cierra sesión e inicia sesión nuevamente.');
    }

    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);

    // Agregar filtros dinámicamente
    if (filtros.q) params.append('q', filtros.q);
    if (filtros.tipo_receta) params.append('tipo_receta', filtros.tipo_receta);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.estatus) params.append('estatus', filtros.estatus);

    const response = await fetch(`${urlApi}api/recetas/mis-recetas?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json();
        } catch (e) {
            console.error('[recetasApi] No se pudo parsear la respuesta de error:', e);
        }
        
        console.error('[recetasApi] Error en respuesta:', {
            status: response.status,
            statusText: response.statusText,
            errorData,
            errorDato: errorData, // Por si viene como errorDato
            error: errorData.error,
            details: errorData.details,
            message: errorData.message
        });
        
        // Si es un error 403, mostrar el mensaje específico del servidor
        if (response.status === 403) {
            const errorMessage = errorData.error || errorData.message || errorData.errorDato?.error || 'No tienes permiso para ver recetas';
            
            // Si el error es de token, NO limpiar el token automáticamente
            // Solo mostrar el mensaje para que el usuario cierre sesión manualmente
            if (errorMessage.includes('Token') || errorMessage.includes('token') || errorMessage.includes('expirado') || errorMessage.includes('inválido')) {
                throw new Error('Tu sesión ha expirado. Por favor, cierra sesión e inicia sesión nuevamente.');
            }
            throw new Error(errorMessage);
        }
        // Para otros errores, mostrar el mensaje genérico
        throw new Error(errorData.error || errorData.message || `Error al obtener las recetas (${response.status})`);
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
