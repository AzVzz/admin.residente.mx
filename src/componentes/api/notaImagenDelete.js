import { urlApi } from './url.js';

export const notaImagenDelete = async (id) => {
    try {
        const response = await fetch(`${urlApi}api/notas/imagen/${id}/imagen`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Nota o imagen no encontrada');
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error("Error eliminando imagen:", error);
        throw error;
    }
};