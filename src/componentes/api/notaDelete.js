//src/componentes/api/notaDelete.js
import { urlApi, imgApi } from './url.js';

export const notaDelete = async (id, token) => {
    try {
        const response = await fetch(`${urlApi}api/notas/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`, // Agrega el token aquí
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Nota no encontrada');
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error("Error eliminando nota:", error);
        throw error;
    }
};

export const notaImagenDelete = async (id) => {
    try {
        const response = await fetch(`${urlApi}api/notas/${id}/imagen`, {
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