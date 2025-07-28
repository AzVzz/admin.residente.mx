import { urlApi } from './url.js';

export async function cuponesGet() {
    const response = await fetch(`${urlApi}api/tickets`);
    if (!response.ok) {
        throw new Error('Error al obtener los cupones');
    }
    return await response.json();
}