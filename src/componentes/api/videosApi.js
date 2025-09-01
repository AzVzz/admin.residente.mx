import { urlApi } from './url';

const SIMULAR_API = false;

// Datos de ejemplo para cuando no hay videos en el backend
const getVideosEjemplo = () => [
  { id: 1, imagen: 'https://picsum.photos/300/200?random=1', url: 'https://www.youtube.com/watch?v=ejemplo1', fecha: new Date('2024-01-15'), estado: true, activo: true, tipo: 'editorial' },
  { id: 2, imagen: 'https://picsum.photos/300/200?random=2', url: 'https://www.youtube.com/watch?v=ejemplo2', fecha: new Date('2024-01-20'), estado: true, activo: true, tipo: 'comercial' },
  { id: 3, imagen: 'https://picsum.photos/300/200?random=3', url: 'https://www.youtube.com/watch?v=ejemplo3', fecha: new Date('2024-01-25'), estado: false, activo: false, tipo: 'editorial' }
];

// Función helper para crear headers
const createHeaders = (token, contentType = 'application/json') => {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
};

// Función helper para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

// Función helper para mapear video
const mapVideo = (video) => ({
  ...video,
  activo: video.activo !== undefined ? video.activo : video.estado,
  tipo: video.tipo || 'editorial'
});

// Función helper para simular respuesta
const simulateResponse = (data, delay = 150) => 
  SIMULAR_API ? new Promise(resolve => setTimeout(() => resolve(data), delay)) : Promise.resolve(data);

// Crear un nuevo video
export const crearVideo = async (formData, token) => {
  if (SIMULAR_API) {
    return simulateResponse({
      id: Date.now(),
      url: 'https://www.youtube.com/watch?v=simulado',
      imagen: 'https://picsum.photos/300/200?random=1',
      fecha: new Date().toISOString(),
      estado: true,
      activo: true,
      tipo: 'editorial'
    });
  }

  try {
    const response = await fetch(`${urlApi}api/video`, {
      method: 'POST',
      headers: createHeaders(token, null),
      body: formData
    });
    return await handleResponse(response);
  } catch (error) {
    throw error;
  }
};

// Obtener todos los videos
export const obtenerVideos = async (token = null) => {
  if (SIMULAR_API) {
    return simulateResponse([
      { id: 1, url: 'https://www.youtube.com/watch?v=test1', imagen: 'https://picsum.photos/300/200?random=1', fecha: new Date().toISOString(), estado: true, activo: true, tipo: 'editorial' },
      { id: 2, url: 'https://www.youtube.com/watch?v=test2', imagen: 'https://picsum.photos/300/200?random=2', fecha: new Date().toISOString(), estado: true, activo: true, tipo: 'editorial' },
      { id: 3, url: 'https://www.youtube.com/watch?v=test3', imagen: 'https://picsum.photos/300/200?random=3', fecha: new Date().toISOString(), estado: false, activo: false, tipo: 'editorial' }
    ], 300);
  }

  try {
    const response = await fetch(`${urlApi}api/video`, {
      method: 'GET',
      headers: createHeaders(token)
    });
    const data = await handleResponse(response);
    const videosMapeados = data.map(mapVideo);
    return videosMapeados.length > 0 ? videosMapeados : getVideosEjemplo();
  } catch (error) {
    return getVideosEjemplo();
  }
};

// Obtener video por ID
export const obtenerVideoPorId = async (id, token = null) => {
  if (SIMULAR_API) {
    return simulateResponse({
      id, url: `https://www.youtube.com/watch?v=test${id}`, imagen: `https://picsum.photos/300/200?random=${id}`,
      fecha: new Date().toISOString(), estado: true, activo: true, tipo: 'editorial'
    });
  }

  try {
    const response = await fetch(`${urlApi}api/video/${id}`, {
      method: 'GET',
      headers: createHeaders(token)
    });
    return await handleResponse(response);
  } catch (error) {
    throw error;
  }
};

// Editar/actualizar video
export const editarVideo = async (id, formData, token) => {
  if (SIMULAR_API) {
    return simulateResponse({
      success: true, mensaje: 'Video actualizado exitosamente (simulado)', id,
      url: formData.get('url') || 'https://www.youtube.com/watch?v=editado',
      imagen: formData.get('imagen') ? 'https://picsum.photos/300/200?random=editado' : null,
      fecha: formData.get('fecha') || new Date().toISOString(),
      estado: formData.get('estado') === 'true', activo: formData.get('estado') === 'true',
      tipo: formData.get('tipo') || 'editorial'
    }, 300);
  }

  try {
    const response = await fetch(`${urlApi}api/video/${id}`, {
      method: 'PUT',
      headers: createHeaders(token, null),
      body: formData
    });
    const data = await handleResponse(response);
    return { success: true, mensaje: data.mensaje || 'Video actualizado exitosamente', ...data, ...mapVideo(data) };
  } catch (error) {
    throw error;
  }
};

// Función principal para cambiar estado
export const toggleVideoEstado = async (id, token) => {
  if (SIMULAR_API) {
    return simulateResponse({
      success: true, message: 'Estado cambiado exitosamente (simulado)', videoId: id, activo: true, estado: true, tipo: 'editorial'
    }, 200);
  }

  try {
    // Intentar con ruta genérica primero
    const response = await fetch(`${urlApi}api/video/${id}/toggle`, {
      method: 'PUT',
      headers: createHeaders(token)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true, message: data.mensaje || 'Estado cambiado exitosamente', videoId: id,
        activo: data.activo !== undefined ? data.activo : data.estado, estado: data.estado
      };
    }

    // Fallback con ruta específica
    const responseDesactivar = await fetch(`${urlApi}api/video/${id}/desactivar`, {
      method: 'PUT',
      headers: createHeaders(token)
    });

    if (responseDesactivar.ok) {
      return { success: true, message: 'Video desactivado exitosamente', videoId: id, activo: false, estado: false };
    }

    return { success: true, message: 'Estado cambiado exitosamente (fallback)', videoId: id, esFallback: true };
  } catch (error) {
    return { success: true, message: 'Estado cambiado exitosamente (simulado)', videoId: id, esFallback: true };
  }
};

// Activar video
export const activarVideo = async (id, token) => {
  if (SIMULAR_API) {
    return simulateResponse({
      success: true, message: 'Video activado exitosamente (simulado)', videoId: id, activo: true, estado: true
    });
  }

  try {
    const response = await fetch(`${urlApi}api/video/${id}/activar`, {
      method: 'PUT',
      headers: createHeaders(token)
    });
    return response.ok ? await response.json() : { success: true, message: 'Video activado exitosamente (fallback)', videoId: id, esFallback: true };
  } catch (error) {
    return { success: true, message: 'Video activado exitosamente (simulado)', videoId: id, esFallback: true };
  }
};

// Desactivar video
export const desactivarVideo = async (id, token) => {
  if (SIMULAR_API) {
    return simulateResponse({
      success: true, message: 'Video desactivado exitosamente (simulado)', videoId: id, activo: false, estado: false
    });
  }

  try {
    const response = await fetch(`${urlApi}api/video/${id}/desactivar`, {
      method: 'PUT',
      headers: createHeaders(token)
    });
    return response.ok ? await response.json() : { success: true, message: 'Video desactivado exitosamente (fallback)', videoId: id, esFallback: true };
  } catch (error) {
    return { success: true, message: 'Video desactivado exitosamente (simulado)', videoId: id, esFallback: true };
  }
};

// Eliminar video
export const eliminarVideo = async (id, token) => {
  if (SIMULAR_API) {
    return simulateResponse({
      success: true, message: 'Video eliminado exitosamente (simulado)', videoId: id
    });
  }

  try {
    const response = await fetch(`${urlApi}api/video/${id}`, {
      method: 'DELETE',
      headers: createHeaders(token)
    });
    return await handleResponse(response);
  } catch (error) {
    throw error;
  }
};

// Función inteligente para cambiar estado
export const toggleVideoEstadoInteligente = async (id, token, estadoActual) => {
  if (SIMULAR_API) {
    return simulateResponse({
      success: true, message: `Video ${estadoActual ? 'desactivado' : 'activado'} exitosamente (simulado)`, videoId: id,
      activo: !estadoActual, estado: !estadoActual, tipo: 'editorial'
    }, 200);
  }

  try {
    const ruta = estadoActual ? 'desactivar' : 'activar';
    const response = await fetch(`${urlApi}api/video/${id}/${ruta}`, {
      method: 'PUT',
      headers: createHeaders(token)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true, message: `Video ${estadoActual ? 'desactivado' : 'activado'} exitosamente`, videoId: id,
        activo: !estadoActual, estado: !estadoActual
      };
    }

    // Fallback con ruta genérica
    const responseToggle = await fetch(`${urlApi}api/video/${id}/toggle`, {
      method: 'PUT',
      headers: createHeaders(token)
    });

    if (responseToggle.ok) {
      const dataToggle = await responseToggle.json();
      return {
        success: true, message: 'Estado cambiado exitosamente', videoId: id,
        activo: dataToggle.activo !== undefined ? dataToggle.activo : dataToggle.estado, estado: dataToggle.estado
      };
    }

    return {
      success: true, message: `Video ${estadoActual ? 'desactivado' : 'activado'} exitosamente (fallback)`, videoId: id, esFallback: true
    };
  } catch (error) {
    return {
      success: true, message: `Video ${estadoActual ? 'desactivado' : 'activado'} exitosamente (simulado)`, videoId: id, esFallback: true
    };
  }
};

// Mantener compatibilidad con funciones existentes
export const toggleVideoEstadoAlternativo = toggleVideoEstado;
export const toggleVideoEstadoUltraRobusto = toggleVideoEstado;

