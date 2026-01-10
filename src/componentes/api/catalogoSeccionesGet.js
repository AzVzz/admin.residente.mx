//src/componentes/api/catalogoSeccionesGet.js
import { urlApi, imgApi } from './url.js'

// =============================================================================
// SISTEMA DE CACHÉ EN MEMORIA - TTL 15 minutos
// =============================================================================
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutos

const getCached = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
};

const setCache = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

// Limpiar caché (útil para forzar refresco)
export const clearCatalogoCache = () => {
    cache.clear();
};

// =============================================================================
// FUNCIONES DE API CON CACHÉ
// =============================================================================

export const catalogoSeccionesGet = async () => {
    const cacheKey = 'secciones';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(`${urlApi}api/catalogo/secciones`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error("La API no devolvió success:true");
        setCache(cacheKey, result.data);
        return result.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

export const catalogoTipoNotaGet = async () => {
    const cacheKey = 'tipo-nota';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(`${urlApi}api/catalogo/tipo-nota`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error("La API no devolvió success:true");
        setCache(cacheKey, result.data);
        return result.data;
    } catch (error) {
        console.error("Error fetching data", error);
        throw error;
    }
}

export const catalogoHeadersGet = async () => {
    const cacheKey = 'headers';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(`${urlApi}api/catalogo/headers`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error("La API no devolvió success:true");
        setCache(cacheKey, result.data);
        return result.data;
    } catch (error) {
        console.error("Error fetching data", error);
        throw error;
    }
}

export const catalogoFoodDrinkGet = async () => {
    const cacheKey = 'food-drink';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(`${urlApi}api/catalogo/opciones-food-drink`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error("La API no devolvió success:true");
        setCache(cacheKey, result.data);
        return result.data;
    } catch (error) {
        console.error("Error fetching food & drink options", error);
        throw error;
    }
}