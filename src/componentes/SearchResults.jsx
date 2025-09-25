import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { catalogoNotasGet } from './api/notasPublicadasGet';
import { urlApi } from './api/url';

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
            // Filtrar localmente por el término de búsqueda
            const queryNormalizado = searchTerm.toLowerCase().trim();
            const notasFiltradas = data.filter(nota => {
              const titulo = (nota.titulo || '').toLowerCase();
              const subtitulo = (nota.subtitulo || '').toLowerCase();
              const autor = (nota.autor || '').toLowerCase();
              const tipoNota = (nota.tipo_nota || '').toLowerCase();
              
              return titulo.includes(queryNormalizado) ||
                     subtitulo.includes(queryNormalizado) ||
                     autor.includes(queryNormalizado) ||
                     tipoNota.includes(queryNormalizado);
            });
            
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
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto backdrop-blur-sm min-w-96">
      {loading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
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
          {searchTerm ? `No se encontraron notas publicadas para "${searchTerm}"` : 'No hay notas disponibles'}
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="p-2">
          <div className="text-xs text-gray-500 mb-2 px-2">
            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
          </div>
          {results.map((nota) => (
            <Link
              key={nota.id}
              to={`/notas/${nota.id}`}
              onClick={onClose}
              className="block p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
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
                    className="w-20 h-20 object-cover rounded bg-gray-200"
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
                  
                  {/* Tags */}
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
                  </div>
                  
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
