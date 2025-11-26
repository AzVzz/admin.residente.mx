import { urlApi } from './url.js';

export async function cuponesGetTest() {
    const response = await fetch(`${urlApi}api/tickets-test`);
    if (!response.ok) {
        throw new Error('Error al obtener los cupones de prueba');
    }
    return await response.json();
}

export async function cuponesGetTodasTest(token) {
    const response = await fetch(`${urlApi}api/tickets-test`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
        throw new Error('Error al obtener mis cupones de prueba');
    }
    return await response.json();
}

export async function cuponBorrarTest(id, token) {
    const response = await fetch(`${urlApi}api/tickets-test/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
        throw new Error('Error al borrar el cupón de prueba');
    }
    return await response.json();
}

export async function cuponEditarTest(id, data, token) {
    const response = await fetch(`${urlApi}api/tickets-test/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el cupón de prueba');
    }
    return await response.json();
}

export async function cuponCrearTest(data, token) {
    const response = await fetch(`${urlApi}api/tickets-test`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el cupón de prueba');
    }
    return await response.json();
}
