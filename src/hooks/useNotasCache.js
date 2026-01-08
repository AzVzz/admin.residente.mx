import useSWR from 'swr';
import { urlApi } from '../componentes/api/url';

/**
 * Hook para obtener notas con cache automático usando SWR
 * 
 * @param {string} token - Token de autenticación
 * @param {Object} options - Opciones de configuración
 * @param {number} options.page - Número de página (default: 1)
 * @param {number} options.limit - Límite de notas (default: 100)
 * @param {Object} options.filtros - Filtros adicionales
 * @returns {Object} - { notas, paginacion, error, isLoading, mutate }
 */
export function useNotas(token, options = {}) {
    const { page = 1, limit = 100, filtros = {} } = options;

    // Construir URL con parámetros
    const buildUrl = () => {
        if (!token) return null; // No hacer fetch sin token

        const url = new URL(`${urlApi}api/notas/todas`);
        url.searchParams.append("page", page);
        url.searchParams.append("limit", limit);

        Object.entries(filtros).forEach(([key, value]) => {
            if (value) url.searchParams.append(key, value);
        });

        return url.toString();
    };

    // Fetcher con autenticación
    const fetcher = async (url) => {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = new Error('Error al obtener notas');
            error.status = response.status;
            throw error;
        }

        return response.json();
    };

    const { data, error, isLoading, mutate } = useSWR(
        buildUrl,
        fetcher,
        {
            // Cache por 5 minutos
            dedupingInterval: 5 * 60 * 1000,
            // No revalidar al enfocar la ventana (reduce requests)
            revalidateOnFocus: false,
            // No revalidar al reconectar
            revalidateOnReconnect: false,
            // Mantener datos stale mientras revalida
            keepPreviousData: true,
            // Reintentar solo 2 veces en error
            errorRetryCount: 2,
        }
    );

    return {
        notas: data?.notas || [],
        paginacion: data?.paginacion || null,
        error,
        isLoading,
        mutate, // Para refrescar manualmente
    };
}

/**
 * Hook para obtener recetas con cache automático
 */
export function useRecetas(options = {}) {
    const { page = 1, limit = 100 } = options;

    const fetcher = async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener recetas');
        const data = await response.json();

        if (Array.isArray(data)) return data;
        if (data.recetas) return data.recetas;
        if (data.data) return data.data;
        return [];
    };

    const { data, error, isLoading, mutate } = useSWR(
        `${urlApi}api/recetas?page=${page}&limit=${limit}`,
        fetcher,
        {
            dedupingInterval: 5 * 60 * 1000,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        }
    );

    return {
        recetas: data || [],
        error,
        isLoading,
        mutate,
    };
}

export default useNotas;
