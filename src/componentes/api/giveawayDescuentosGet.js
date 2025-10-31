import { urlApi, imgApi } from './url.js';

export const giveawayDescuentosGet = async () => {
  try {
    const response = await fetch(`${urlApi}/api/notas/giveaway/ultima`);
    if (!response.ok) {
      throw new Error('No se pudo obtener el Giveaway');
    }
    const result = await response.json();
    return result.data; // Puede ser null si no hay Giveaway
  } catch (error) {
    console.error('Error al obtener Giveaway:', error);
    return null;
  }
};