import { urlApi } from './url.js';

/**
 * Actualiza la imagen de una nota usando PUT y form-data.
 * @param {string|number} id - ID de la nota.
 * @param {File} file - Archivo de imagen (File de input type="file").
 * @returns {Promise<object>} - Respuesta de la API.
 */

// Crear una nueva nota (POST)
export const notaCrear = async (datosNota) => {
    const response = await fetch(`${urlApi}api/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosNota)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear la nota');
    }
    return await response.json();
};

// Editar una nota existente (PUT)
export const notaEditar = async (id, notaData) => {
    try {
        const response = await fetch(`${urlApi}api/notas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(notaData)
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error editando nota:", error);
        throw error;
    }
};

export const notaImagenPut = async (id, file) => {
    const formData = new FormData();
    formData.append('imagen', file); // 'imagen' debe coincidir con la key que espera tu backend

    try {
        const response = await fetch(`${urlApi}api/notas/imagen/${id}`, {
            method: 'PUT',
            body: formData
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error actualizando imagen de nota:", error);
        throw error;
    }
};