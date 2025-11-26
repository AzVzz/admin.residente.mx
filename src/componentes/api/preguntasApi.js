import { urlApi, imgApi } from './url.js';

// Crear una nueva pregunta semanal
export async function crearPreguntaTemaSemana({ pregunta, publicar_en, expirar_en }, token) {
  try {
    const response = await fetch(`${urlApi}api/preguntas-tema-semanas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Si tu endpoint es privado, incluye el token de autenticación
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ pregunta, publicar_en, expirar_en })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear la pregunta');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Obtener todas las preguntas semanales
export async function obtenerPreguntasTemaSemana(token) {
  try {
    const response = await fetch(`${urlApi}api/preguntas-tema-semanas`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener las preguntas');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Editar pregunta semanal
export async function editarPreguntaTemaSemana(id, datos, token) {
  try {
    const response = await fetch(`${urlApi}api/preguntas-tema-semanas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datos)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al editar la pregunta');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Borrar pregunta semanal
export async function borrarPreguntaTemaSemana(id, token) {
  try {
    const response = await fetch(`${urlApi}api/preguntas-tema-semanas/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al borrar la pregunta');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}