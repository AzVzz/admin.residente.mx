import { urlApi } from './url.js';

/**
 * Actualiza la imagen de una nota usando PUT y form-data.
 * @param {string|number} id - ID de la nota.
 * @param {File} file - Archivo de imagen (File de input type="file").
 * @returns {Promise<object>} - Respuesta de la API.
 */

// Crear una nueva nota (POST)
export const notaCrear = async (datosNota, token) => {
    const response = await fetch(`${urlApi}api/notas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(datosNota)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear la nota');
    }
    return await response.json();
};

// Editar una nota existente (PUT)
export const notaEditar = async (id, notaData, token) => {
    try {
        const response = await fetch(`${urlApi}api/notas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
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

export const notaImagenPut = async (id, file, token) => {
    const formData = new FormData();
    formData.append('imagen', file); // 'imagen' debe coincidir con la key que espera tu backend

    try {
        const response = await fetch(`${urlApi}api/notas/imagen/${id}`, {
            method: 'PUT',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` })
            },
            body: formData
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error actualizando imagen de nota:", error);
        throw error;
    }
};

export const notaInstafotoPut = async (id, file, token) => {
    const formData = new FormData();
    formData.append('insta_imagen', file); // 'insta_imagen' debe coincidir con la key que espera tu backend

    try {
        const response = await fetch(`${urlApi}api/notas/imagen/${id}/insta-imagen`, {
            method: 'PUT',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` })
            },
            body: formData
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error actualizando instafoto de nota:", error);
        throw error;
    }
};

export const notaInstafotoDelete = async (id, token) => {
    try {
        console.log('Eliminando instafoto con ID:', id);
        console.log('URL de la API:', `${urlApi}api/notas/${id}/insta_imagen`);
        
        const response = await fetch(`${urlApi}api/notas/${id}/insta_imagen`, {
            method: 'DELETE',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });
        
        console.log('Respuesta del servidor:', response.status, response.statusText);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Nota o instafoto no encontrada');
            }
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        console.log('Instafoto eliminada exitosamente del servidor');
        return true;
    } catch (error) {
        console.error("Error eliminando instafoto:", error);
        throw error;
    }
};

// Función alternativa para eliminar instafoto usando PUT
export const notaInstafotoDeleteAlternative = async (id, token) => {
    try {
        console.log('Eliminando instafoto (método alternativo) con ID:', id);
        console.log('URL de la API:', `${urlApi}api/notas/${id}`);
        
        const response = await fetch(`${urlApi}api/notas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            },
            body: JSON.stringify({
                insta_imagen: null
            })
        });
        
        console.log('Respuesta del servidor:', response.status, response.statusText);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Nota no encontrada');
            }
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        console.log('Instafoto eliminada exitosamente del servidor (método alternativo)');
        return true;
    } catch (error) {
        console.error("Error eliminando instafoto (método alternativo):", error);
        throw error;
    }
};