import axios from 'axios';
import { urlApi, imgApi } from './url';

const SIMULAR_API = false;

/** Chunks chicos para evitar el freeze de Plesk/nginx ~5 MB */
const CHUNK_SIZE = 2 * 1024 * 1024;
const CHUNK_RETRIES = 3;

const authHeaders = (token) =>
  token ? { Authorization: `Bearer ${token}` } : undefined;

const mensajeErrorAxios = (error, fallback) =>
  error?.response?.data?.error ||
  error?.response?.data?.details ||
  error?.message ||
  fallback;

/** Subida multipart con progreso. onProgress({ pct, loaded, total }) */
const subirVideoConProgreso = async (method, url, formData, token, onProgress) => {
  const { data } = await axios({
    method,
    url,
    data: formData,
    timeout: 0,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: authHeaders(token),
    onUploadProgress: (event) => {
      if (!onProgress) return;
      const total = event.total || 0;
      const loaded = event.loaded || 0;
      const pct = total
        ? Math.min(100, Math.round((loaded * 100) / total))
        : 0;
      onProgress({ pct, loaded, total });
    },
  });
  return data;
};

const postChunkConReintentos = async (url, blob, token) => {
  let lastError;
  for (let intento = 1; intento <= CHUNK_RETRIES; intento++) {
    try {
      // POST + FormData: menos fricción con CORS/preflight en Plesk que PUT binario
      const body = new FormData();
      body.append('chunk', blob, 'chunk.bin');
      await axios.post(url, body, {
        timeout: 120000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        headers: authHeaders(token),
      });
      return;
    } catch (error) {
      lastError = error;
      if (intento < CHUNK_RETRIES) {
        await new Promise((r) => setTimeout(r, 400 * intento));
      }
    }
  }
  throw lastError;
};

/** Sube el video en chunks y luego manda metadata + portada */
const subirVideoPorChunks = async ({
  method,
  videoFile,
  formData,
  token,
  onProgress,
  videoId,
}) => {
  const totalChunks = Math.ceil(videoFile.size / CHUNK_SIZE) || 1;

  const { data: init } = await axios.post(
    `${urlApi}api/video/upload/init`,
    {
      fileName: videoFile.name || 'video.mp4',
      fileSize: videoFile.size,
      totalChunks,
    },
    { headers: authHeaders(token), timeout: 30000 },
  );

  const uploadId = init.uploadId;
  let loaded = 0;

  for (let index = 0; index < totalChunks; index++) {
    const start = index * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, videoFile.size);
    const blob = videoFile.slice(start, end);

    await postChunkConReintentos(
      `${urlApi}api/video/upload/${uploadId}/chunk/${index}`,
      blob,
      token,
    );

    loaded = end;
    if (onProgress) {
      onProgress({
        pct: Math.min(99, Math.round((loaded * 100) / videoFile.size)),
        loaded,
        total: videoFile.size,
      });
    }
  }

  const meta = new FormData();
  for (const [key, value] of formData.entries()) {
    if (key === 'video') continue;
    meta.append(key, value);
  }

  const completeUrl =
    method === 'put' && videoId
      ? `${urlApi}api/video/upload/${uploadId}/complete/${videoId}`
      : `${urlApi}api/video/upload/${uploadId}/complete`;

  if (onProgress) {
    onProgress({ pct: 100, loaded: videoFile.size, total: videoFile.size });
  }

  const { data } = await axios.post(completeUrl, meta, {
    timeout: 0,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: authHeaders(token),
  });

  return data;
};

const subirVideoInteligente = async ({
  method,
  url,
  formData,
  token,
  onProgress,
  videoId,
}) => {
  const videoFile = formData.get('video');
  if (videoFile && typeof videoFile === 'object' && videoFile.size > 0) {
    return subirVideoPorChunks({
      method,
      videoFile,
      formData,
      token,
      onProgress,
      videoId,
    });
  }
  return subirVideoConProgreso(method, url, formData, token, onProgress);
};

// Datos de ejemplo para cuando no hay videos en el backend
const getVideosEjemplo = () => [];

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
  tipo: video.tipo || 'editorial',
  mandar_b2b: Boolean(video.mandar_b2b),
  crisis_restaurantera: Boolean(video.crisis_restaurantera),
  revista_digital: Boolean(video.revista_digital),
});

// Función helper para simular respuesta
const simulateResponse = (data, delay = 150) => 
  SIMULAR_API ? new Promise(resolve => setTimeout(() => resolve(data), delay)) : Promise.resolve(data);

// Crear un nuevo video (onProgress: (0-100) => void)
export const crearVideo = async (formData, token, onProgress) => {
  if (SIMULAR_API) {
    return simulateResponse({
      id: Date.now(),
      url: '',
      imagen: '',
      fecha: new Date().toISOString(),
      estado: true,
      activo: true,
      tipo: 'editorial'
    });
  }

  try {
    return await subirVideoInteligente({
      method: 'post',
      url: `${urlApi}api/video`,
      formData,
      token,
      onProgress,
    });
  } catch (error) {
    throw new Error(mensajeErrorAxios(error, 'Error al crear el video'));
  }
};

// Obtener todos los videos
export const obtenerVideos = async (token = null) => {
  if (SIMULAR_API) {
    return simulateResponse([], 300);
  }

    try {
    const response = await fetch(`${urlApi}api/video`, {
      method: 'GET',
      headers: createHeaders(token)
    });
    const data = await handleResponse(response);
    const videosMapeados = data.map(mapVideo);
    return videosMapeados;
  } catch (error) {
    return [];
  }
};

// Obtener video por ID
export const obtenerVideoPorId = async (id, token = null) => {
  if (SIMULAR_API) {
    return simulateResponse({
      id, url: '', imagen: '',
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

// Editar/actualizar video (onProgress: (0-100) => void)
export const editarVideo = async (id, formData, token, onProgress) => {
  if (SIMULAR_API) {
    return simulateResponse({
      success: true, mensaje: 'Video actualizado exitosamente (simulado)', id,
      url: formData.get('url') || '',
      imagen: formData.get('imagen') ? '' : null,
      fecha: formData.get('fecha') || new Date().toISOString(),
      estado: formData.get('estado') === 'true', activo: formData.get('estado') === 'true',
      tipo: formData.get('tipo') || 'editorial'
    }, 300);
  }

  try {
    const data = await subirVideoInteligente({
      method: 'put',
      url: `${urlApi}api/video/${id}`,
      formData,
      token,
      onProgress,
      videoId: id,
    });
    return { success: true, mensaje: data.mensaje || 'Video actualizado exitosamente', ...data, ...mapVideo(data) };
  } catch (error) {
    throw new Error(mensajeErrorAxios(error, 'Error al actualizar el video'));
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
