import { urlApi, imgApi } from './url.js';

export async function cuponesGet() {
    const response = await fetch(`${urlApi}api/tickets`);
    if (!response.ok) {
        throw new Error('Error al obtener los cupones');
    }
    return await response.json();
}

export async function cuponesGetFiltrados(seccion, categoria) {
    const params = new URLSearchParams();
    if (seccion) params.append('seccion', seccion);
    if (categoria) params.append('categoria', categoria);

    const response = await fetch(`${urlApi}api/tickets/filtrar?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Error al obtener los cupones filtrados');
    }
    return await response.json();
}

export async function cuponesGetTodas(token, { sortBy, sortOrder, estado, page, limit } = {}) {
    const params = new URLSearchParams();
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (estado) params.append('estado', estado);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const response = await fetch(`${urlApi}api/tickets/todas?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
        throw new Error('Error al obtener todos los cupones');
    }
    return await response.json(); // { cupones, total, page, limit }
}

export async function cuponesGetStatsB2B(token) {
    const response = await fetch(`${urlApi}api/tickets/stats-b2b`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Error al obtener estadísticas de cupones');
    }
    return await response.json();
}

export async function cuponAsignar(id, { restaurante_id, user_id } = {}, token) {
    const response = await fetch(`${urlApi}api/tickets/${id}/asignar-usuario`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ restaurante_id, user_id }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al asignar cupón');
    }
    return await response.json();
}

export async function cuponBorrar(id, token) {
    const response = await fetch(`${urlApi}api/tickets/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
        throw new Error('Error al borrar el cupón');
    }
    return await response.json();
}

export async function cuponEditar(id, data, token) {
    const response = await fetch(`${urlApi}api/tickets/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el cupón');
    }
    return await response.json();
}

export async function cuponCrear(data, token) {
    const response = await fetch(`${urlApi}api/tickets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el cupón');
    }
    return await response.json();
}

export async function cuponesGetActivos() {
    const response = await fetch(`${urlApi}api/tickets/activos`);
    if (!response.ok) {
        throw new Error('Error al obtener los cupones activos');
    }
    return await response.json();
}