import { urlApi } from './url.js';

/**
 * Crear una nueva promoción de tickets (POST)
 * @param {object} datosPromo - Objeto con los datos de la promoción (debe incluir al menos titulo y email)
 * @param {string} [token] - Token de autenticación opcional
 * @returns {Promise<object>} - Respuesta de la API
 */
export const ticketCrear = async (datosPromo, token) => {
    const response = await fetch(`${urlApi}api/tickets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(datosPromo)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear la promoción');
    }
    return await response.json();
};