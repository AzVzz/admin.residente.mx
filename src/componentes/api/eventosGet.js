import { urlApi } from './url.js';

export async function eventosGet() {
    const response = await fetch(`${urlApi}api/eventos`);
    if (!response.ok) throw new Error('Error al obtener los eventos');
    return await response.json();
}

export async function eventosGetFiltrados(seccion, categoria) {
    const params = new URLSearchParams();
    if (seccion) params.append('seccion', seccion);
    if (categoria) params.append('categoria', categoria);
    const response = await fetch(`${urlApi}api/eventos/filtrar?${params.toString()}`);
    if (!response.ok) throw new Error('Error al obtener los eventos filtrados');
    return await response.json();
}

export async function eventosGetTodas(token, { sortBy, sortOrder, estado, page, limit } = {}) {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (estado) params.append('estado', estado);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    const response = await fetch(`${urlApi}api/eventos/todas?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Error al obtener todos los eventos');
    return await response.json();
}

export async function eventosGetActivos() {
    const response = await fetch(`${urlApi}api/eventos/activos`);
    if (!response.ok) throw new Error('Error al obtener los eventos activos');
    return await response.json();
}

export async function eventoCrear(data, token) {
    const response = await fetch(`${urlApi}api/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        let msg = 'Error al crear el evento';
        try {
            const errorData = await response.json();
            msg = errorData.details || errorData.error || msg;
        } catch {
            msg = `Error ${response.status}: revisa que VITE_API_URL apunte al backend (ver .env.example), no al puerto de Astro.`;
        }
        throw new Error(msg);
    }
    return await response.json();
}

export async function eventoEditar(id, data, token) {
    const response = await fetch(`${urlApi}api/eventos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el evento');
    }
    return await response.json();
}

export async function eventoBorrar(id, token) {
    const response = await fetch(`${urlApi}api/eventos/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Error al borrar el evento');
    return await response.json();
}
