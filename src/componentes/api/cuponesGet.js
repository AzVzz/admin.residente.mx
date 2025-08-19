import { urlApi } from './url.js';

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