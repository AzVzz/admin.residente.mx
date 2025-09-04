//src/componentes/api/consejerosApi.js
import { urlApi } from './url.js';

// Obtener todos los registros
export const consejerosGet = async () => {
  const res = await fetch(`${urlApi}api/consejeros`);
  if (!res.ok) throw new Error("Error al obtener consejeros");
  return await res.json();
};

// Crear nuevo registro (con foto) - CORREGIDO
export const consejerosPost = async (formData) => {
  try {
    //console.log('=== INICIO ENVÍO API ===');
    //console.log('Formulario recibido:', formData);
    
    // Crear FormData correctamente
    const form = new FormData();
    
    // Agregar campos de texto
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'fotografia') {
          // Agregar archivo
          form.append('fotografia', value);
          //console.log('Archivo agregado:', value.name);
        } else {
          // Agregar campo de texto
          form.append(key, value);
          //console.log(`Campo agregado: ${key} = ${value}`);
        }
      }
    });

    //console.log('FormData creado:', form);
    //console.log('URL de la petición:', `${urlApi}api/consejeros`);

    const res = await fetch(`${urlApi}api/consejeros`, {
      method: "POST",
      body: form,
    });
    
    //console.log('Respuesta del servidor:', res);
    //console.log('Status:', res.status);
    //console.log('Status Text:', res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error del servidor:', errorText);
      throw new Error(`Error del servidor: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const responseData = await res.json();
    //console.log('Respuesta exitosa:', responseData);
    //console.log('=== FIN ENVÍO API ===');
    
    return responseData;
    
  } catch (error) {
    //console.error('Error en consejerosPost:', error);
    throw error;
  }
};