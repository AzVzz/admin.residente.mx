import { urlApi } from './url';

// Crear un nuevo video
export const crearVideo = async (formData, token) => {
  try {
    const response = await fetch(`${urlApi}api/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No incluir Content-Type para FormData
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al crear video:', error);
    throw error;
  }
};

// Obtener todos los videos
export const obtenerVideos = async (token) => {
  try {
    const response = await fetch(`${urlApi}api/videos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener videos:', error);
    throw error;
  }
};

// Obtener video por ID
export const obtenerVideoPorId = async (id, token) => {
  try {
    const response = await fetch(`${urlApi}api/videos/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener video:', error);
    throw error;
  }
};

// Actualizar video
export const actualizarVideo = async (id, formData, token) => {
  try {
    const response = await fetch(`${urlApi}api/videos/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No incluir Content-Type para FormData
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar video:', error);
    throw error;
  }
};

// Eliminar video
export const eliminarVideo = async (id, token) => {
  try {
    const response = await fetch(`${urlApi}api/videos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al eliminar video:', error);
    throw error;
  }
};

