import { urlApi } from './url.js';

/**
 * Obtiene todas las infografías desde la base de datos
 * @returns {Promise<Array>} Array de infografías con estructura:
 * - id: number
 * - info_imagen: string (URL completa de la imagen)
 * - pdf: string (URL completa del PDF)
 * - created_at: string (fecha de creación)
 */
export const infografiasGet = async () => {
  try {
    const response = await fetch(`${urlApi}api/infografias`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validar que la respuesta sea un array
    if (!Array.isArray(data)) {
      throw new Error('La respuesta de la API no es un array válido');
    }
    
    // Validar estructura de cada infografía
    data.forEach((infografia, index) => {
      if (!infografia.id || !infografia.info_imagen || !infografia.pdf) {
        throw new Error(`Infografía en índice ${index} no tiene la estructura correcta`);
      }
    });
    
    return data;
  } catch (error) {
    console.error('Error al obtener infografías:', error);
    throw error;
  }
};

/**
 * Obtiene una infografía específica por ID
 * @param {number} id - ID de la infografía
 * @returns {Promise<Object>} Infografía específica
 */
export const infografiaGetById = async (id) => {
  try {
    const response = await fetch(`${urlApi}api/infografias/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener infografía ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene la última infografía (la más reciente)
 * @returns {Promise<Object>} Última infografía creada
 */
export const ultimaInfografiaGet = async () => {
  try {
    const response = await fetch(`${urlApi}infografias/ultima`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validar estructura de la infografía
    if (!data.id || !data.info_imagen || !data.pdf) {
      throw new Error('La infografía no tiene la estructura correcta');
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener la última infografía:', error);
    throw error;
  }
};
