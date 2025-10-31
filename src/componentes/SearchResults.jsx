import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { catalogoNotasGet } from './api/notasPublicadasGet';
import { urlApi, imgApi } from './api/url';

// Función para normalizar texto (quitar acentos, caracteres especiales)
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^\w\s]/g, '') // Quitar caracteres especiales excepto espacios
    .trim();
};

// Función para calcular la distancia de Levenshtein (similitud entre palabras)
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Inicializar matriz
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  // Llenar matriz
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // sustitución
          matrix[i][j - 1] + 1,     // inserción
          matrix[i - 1][j] + 1      // eliminación
        );
      }
    }
  }

  return matrix[len2][len1];
};

// Función para calcular similitud (0-1, donde 1 es idéntico)
const calculateSimilarity = (str1, str2) => {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - (distance / maxLength);
};

// Función de búsqueda difusa que ignora ortografía
const fuzzySearch = (query, text) => {
  if (!query || !text) return 0;
  
  const normalizedQuery = normalizeText(query);
  const normalizedText = normalizeText(text);
  
  // Si la búsqueda exacta encuentra algo, darle máxima prioridad
  if (normalizedText.includes(normalizedQuery)) {
    return 1;
  }
  
  // Dividir en palabras para búsqueda por palabras individuales
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
  const textWords = normalizedText.split(/\s+/).filter(word => word.length > 0);
  
  if (queryWords.length === 0) return 0;
  
  let totalSimilarity = 0;
  let matchedWords = 0;
  
  // Para cada palabra de la consulta, buscar la mejor coincidencia en el texto
  for (const queryWord of queryWords) {
    let bestSimilarity = 0;
    
    for (const textWord of textWords) {
      const similarity = calculateSimilarity(queryWord, textWord);
      bestSimilarity = Math.max(bestSimilarity, similarity);
    }
    
    // Solo contar palabras con similitud mayor a 0.3 (ajustable)
    if (bestSimilarity > 0.3) {
      totalSimilarity += bestSimilarity;
      matchedWords++;
    }
  }
  
  // Retornar promedio de similitud, pero penalizar si no se encontraron todas las palabras
  const wordMatchRatio = matchedWords / queryWords.length;
  return (totalSimilarity / queryWords.length) * wordMatchRatio;
};

const SearchResults = ({ searchTerm, onClose }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchNotas = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obtener todas las notas publicadas
        const data = await catalogoNotasGet(1, 10); // Obtener 10 notas para mostrar inmediatamente
        
        if (data && Array.isArray(data)) {
          if (!searchTerm || searchTerm.trim().length < 2) {
            // Si no hay término de búsqueda, mostrar las primeras 10 notas
            setResults(data);
          } else {
            // Primero intentar búsqueda exacta (insensible a mayúsculas/minúsculas)
            const queryNormalizado = searchTerm.toLowerCase().trim();
            const notasExactas = data.filter(nota => {
              const titulo = (nota.titulo || '').toLowerCase();
              const subtitulo = (nota.subtitulo || '').toLowerCase();
              const autor = (nota.autor || '').toLowerCase();
              const tipoNota = (nota.tipo_nota || '').toLowerCase();
              
              return titulo.includes(queryNormalizado) ||
                     subtitulo.includes(queryNormalizado) ||
                     autor.includes(queryNormalizado) ||
                     tipoNota.includes(queryNormalizado);
            });
            
            // Combinar búsqueda exacta y difusa para mejores resultados
            const notasConSimilitud = data.map(nota => {
              const titulo = nota.titulo || '';
              const subtitulo = nota.subtitulo || '';
              const autor = nota.autor || '';
              const tipoNota = nota.tipo_nota || '';
              
              // Primero verificar búsqueda exacta
              const esExacta = titulo.toLowerCase().includes(queryNormalizado) ||
                              subtitulo.toLowerCase().includes(queryNormalizado) ||
                              autor.toLowerCase().includes(queryNormalizado) ||
                              tipoNota.toLowerCase().includes(queryNormalizado);
              
              if (esExacta) {
                return {
                  ...nota,
                  similitud: 1.0, // Máxima prioridad para coincidencias exactas
                  esExacta: true
                };
              }
              
              // Si no es exacta, calcular similitud difusa
              const similitudTitulo = fuzzySearch(searchTerm, titulo);
              const similitudSubtitulo = fuzzySearch(searchTerm, subtitulo);
              const similitudAutor = fuzzySearch(searchTerm, autor);
              const similitudTipoNota = fuzzySearch(searchTerm, tipoNota);
              
              // Usar la mayor similitud encontrada
              const maxSimilitud = Math.max(
                similitudTitulo,
                similitudSubtitulo,
                similitudAutor,
                similitudTipoNota
              );
              
              return {
                ...nota,
                similitud: maxSimilitud,
                esExacta: false
              };
            });
            
            // Filtrar y ordenar resultados
            const notasFiltradas = notasConSimilitud
              .filter(nota => nota.similitud > 0.3) // Reducir umbral para ser más permisivo
              .sort((a, b) => {
                // Primero las exactas, luego por similitud
                if (a.esExacta && !b.esExacta) return -1;
                if (!a.esExacta && b.esExacta) return 1;
                return b.similitud - a.similitud;
              })
              .map(({ similitud, esExacta, ...nota }) => nota); // Remover campos temporales
            
            // Debug temporal para "tacos"
            if (searchTerm.toLowerCase().includes('taco')) {
              console.log('Búsqueda de tacos:');
              console.log('Total notas:', data.length);
              console.log('Notas con similitud > 0.3:', notasConSimilitud.filter(n => n.similitud > 0.3).length);
              console.log('Resultados filtrados:', notasFiltradas.length);
              console.log('Primeras 3 notas con similitud:', notasConSimilitud
                .filter(n => n.similitud > 0.1)
                .sort((a, b) => b.similitud - a.similitud)
                .slice(0, 3)
                .map(n => ({ titulo: n.titulo, similitud: n.similitud, esExacta: n.esExacta }))
              );
            }
            
            setResults(notasFiltradas);
          }
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error en búsqueda:', err);
        setError('Error al buscar notas');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Si hay término de búsqueda, usar debounce, si no, cargar inmediatamente
    if (searchTerm && searchTerm.trim().length >= 2) {
      const timeoutId = setTimeout(searchNotas, 300);
      return () => clearTimeout(timeoutId);
    } else {
      searchNotas();
    }
  }, [searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (tipoNota) => {
    const colors = {
      'RESTAURANTES': 'bg-orange-200 text-orange-800',
      'Nivel de gasto': 'bg-blue-200 text-blue-800',
      'Premium': 'bg-purple-200 text-purple-800',
      'Lujito': 'bg-pink-200 text-pink-800',
      'Casual': 'bg-green-200 text-green-800',
      'Ahorro': 'bg-yellow-200 text-yellow-800',
      'Antojeria': 'bg-red-200 text-red-800'
    };
    return colors[tipoNota] || 'bg-gray-200 text-gray-800';
  };

  // Mostrar siempre el dropdown cuando hay resultados o está cargando
  if (loading || results.length > 0 || error) {
    // Continuar con el render
  } else {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white/55 border border-gray-200 shadow-xl z-50 max-h-96 overflow-y-auto backdrop-blur-sm min-w-96">
      {loading && (
        <div className="p-4 text-center">
          <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Buscando...</p>
        </div>
      )}

      {error && (
        <div className="p-4 text-center text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="p-4 text-center text-gray-500 text-sm">
          {searchTerm ? (
            <div>
              <p>No se encontraron notas para "{searchTerm}"</p>
              <p className="text-xs mt-1 text-gray-400">
                Intenta con palabras diferentes o verifica la ortografía
              </p>
            </div>
          ) : (
            'No hay notas disponibles'
          )}
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="p-2 gap-2 flex flex-col">
          <div className="text-sm text-gray-500">
            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
          </div>
          {results.map((nota) => (
            <Link
              key={nota.id}
              to={`/notas/${nota.id}`}
              onClick={onClose}
              className="block hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex gap-4">
                {/* Imagen */}
                <div className="flex-shrink-0">
                  <img
                    src={
                      nota.imagen ? 
                        (nota.imagen.startsWith('http') ? nota.imagen : `${urlApi}${nota.imagen}`) :
                        'https://via.placeholder.com/80x80/cccccc/666666?text=Sin+Imagen'
                    }
                    alt={nota.titulo}
                    className="w-20 h-20 object-cover bg-gray-200"
                    onError={(e) => {
                      console.log('Error cargando imagen:', nota.imagen);
                      console.log('URL final intentada:', e.target.src);
                      e.target.src = 'https://via.placeholder.com/80x80/cccccc/666666?text=Error';
                    }}
                    onLoad={(e) => {
                      console.log('Imagen cargada correctamente:', nota.imagen);
                    }}
                  />
                </div>
                
                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-tight">
                    {nota.titulo}
                  </h3>
                  
                  {nota.subtitulo && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                      {nota.subtitulo}
                    </p>
                  )}
                  
                  {/* Tags 
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor('RESTAURANTES')}`}>
                      RESTAURANTES
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor('Nivel de gasto')}`}>
                      Nivel de gasto
                    </span>
                    {nota.tipo_nota && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(nota.tipo_nota)}`}>
                        {nota.tipo_nota}
                      </span>
                    )}
                  </div>*/}
                  
                  {/* Fecha */}
                  {nota.fecha_publicacion && (
                    <p className="text-xs text-gray-400">
                      {formatDate(nota.fecha_publicacion)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
          
          {/* Ver más resultados */}
          {results.length >= 10 && (
            <div className="p-2 border-t border-gray-100">
              <Link
                to={`/buscar?q=${encodeURIComponent(searchTerm)}`}
                onClick={onClose}
                className="block text-center text-sm text-blue-600 hover:text-blue-800 py-2"
              >
                Ver todos los resultados para "{searchTerm}"
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
  