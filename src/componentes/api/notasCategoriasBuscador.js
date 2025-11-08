import { urlApi, imgApi } from './url.js';

// Función para obtener notas de los 4 tipos principales
export const obtenerNotasTodasCategorias = async () => {
  try {
    const tiposNota = [
      'restaurantes',
      'food-drink', 
      'antojos',
      'gastro-destinos'
    ];
    
    const todasLasNotas = [];
    
    // Obtener notas de cada tipo
    for (const tipo of tiposNota) {
      try {
        const response = await fetch(`${urlApi}/api/notas/por-tipo-nota/${tipo}`);
        if (response.ok) {
          const notasTipo = await response.json();
          
          // Tomar solo las primeras 6-7 notas de cada tipo para mantener balance
          const notasLimitadas = notasTipo.slice(0, 7).map(nota => {
            // Extraer sección y categoría de secciones_categorias si existe
            let seccion = tipo.charAt(0).toUpperCase() + tipo.slice(1);
            let categoria = 'General';
            
            if (nota.secciones_categorias && nota.secciones_categorias.length > 0) {
              const primeraSeccion = nota.secciones_categorias[0];
              seccion = primeraSeccion.seccion || seccion;
              categoria = primeraSeccion.categoria || categoria;
            }
            
            return {
              ...nota,
              seccion: seccion,
              categoria: categoria,
              tipoNota: tipo
            };
          });
          
          todasLasNotas.push(...notasLimitadas);
        }
      } catch (error) {
        console.error(`Error al obtener notas de ${tipo}:`, error);
      }
    }
    
    // Limitar a 25 notas máximo para mantener rendimiento
    return todasLasNotas.slice(0, 25);
  } catch (error) {
    console.error('Error al obtener notas de todos los tipos:', error);
    return [];
  }
};
