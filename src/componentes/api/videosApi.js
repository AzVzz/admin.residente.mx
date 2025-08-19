import { urlApi } from './url';

// Crear un nuevo video
export const crearVideo = async (formData, token) => {
  try {
    const apiUrl = `${urlApi}api/video`;
    console.log('=== DEBUG API ===');
    console.log('URL completa:', apiUrl);
    console.log('Token presente:', !!token);
    console.log('FormData contenido:', Object.fromEntries(formData.entries()));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // NO incluir Content-Type para FormData
      },
      body: formData
    });

    console.log('Respuesta del servidor:', response.status, response.statusText);
    console.log('Headers de respuesta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('Error del servidor (texto):', errorText);
      } catch (parseError) {
        console.error('No se pudo leer el error del servidor:', parseError);
      }
      
      console.error('Error del servidor (status):', response.status);
      console.error('Error del servidor (statusText):', response.statusText);
      
      // Intentar parsear como JSON si es posible
      let errorData = null;
      try {
        if (errorText) {
          errorData = JSON.parse(errorText);
          console.error('Error del servidor (JSON):', errorData);
        }
      } catch (jsonError) {
        console.error('Error no es JSON válido');
      }
      
      throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Video creado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('Error completo al crear video:', error);
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje de error:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

// Obtener todos los videos
export const obtenerVideos = async (token = null) => {
  try {
    console.log('=== DEBUG OBTENER VIDEOS ===');
    console.log('Token presente:', !!token);
    console.log('URL API:', `${urlApi}api/video`);
    console.log('URL completa:', `${urlApi}api/video`);
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Headers con autorización:', headers);
    } else {
      console.log('Sin token de autorización');
    }
    headers['Content-Type'] = 'application/json';

    console.log('Headers finales:', headers);
    console.log('Iniciando fetch...');

    const response = await fetch(`${urlApi}api/video`, {
      method: 'GET',
      headers
    });

    console.log('Respuesta del servidor:', response.status, response.statusText);
    console.log('Headers de respuesta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error del servidor:', response.status, response.statusText);
      console.error('Texto del error:', errorText);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    console.log('Respuesta exitosa, parseando JSON...');
    const data = await response.json();
    console.log('Datos parseados:', data);
    console.log('Tipo de datos:', typeof data);
    console.log('Es array:', Array.isArray(data));
    
    // Tu backend devuelve un array directo
    if (Array.isArray(data)) {
      // Mapear el campo 'estado' a 'activo' para compatibilidad con el frontend
      const videosMapeados = data.map(video => ({
        ...video,
        activo: video.estado === 1 || video.estado === true || video.activo === true
      }));
      
      console.log('Videos mapeados:', videosMapeados);
      console.log('Retornando array de videos:', videosMapeados.length);
      return videosMapeados;
    } else {
      console.warn('Formato de respuesta inesperado:', data);
      console.warn('Retornando array vacío');
      return [];
    }
  } catch (error) {
    console.error('=== ERROR EN OBTENER VIDEOS ===');
    console.error('Error completo:', error);
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    // Retornar array vacío en caso de error para evitar crash
    return [];
  }
};

// Obtener video por ID
export const obtenerVideoPorId = async (id, token = null) => {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    headers['Content-Type'] = 'application/json';

    const response = await fetch(`${urlApi}api/video/${id}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener video por ID:', error);
    throw error;
  }
};

// Cambiar estado activo/inactivo
export const toggleVideoEstado = async (id, token) => {
  try {
    const response = await fetch(`${urlApi}api/video/${id}/toggle`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al cambiar estado del video:', error);
    throw error;
  }
};

// Activar video específicamente
export const activarVideo = async (id, token) => {
  try {
    const response = await fetch(`${urlApi}api/video/${id}/activar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al activar el video:', error);
    throw error;
  }
};

// Desactivar video específicamente
export const desactivarVideo = async (id, token) => {
  try {
    const response = await fetch(`${urlApi}api/video/${id}/desactivar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al desactivar el video:', error);
    throw error;
  }
};


// Eliminar video
export const eliminarVideo = async (id, token) => {
  try {
    const response = await fetch(`${urlApi}api/video/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al eliminar video:', error);
    throw error;
  }
};

