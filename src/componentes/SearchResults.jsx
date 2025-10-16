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
        let data;
        if (!searchTerm || searchTerm.trim().length < 2) {
          // Sin búsqueda: solo muestra las 10 más recientes
          data = await catalogoNotasGet(1, 10);
        } else {
          // Con búsqueda: pide a la API los resultados filtrados
          data = await catalogoNotasGet(1, 10, searchTerm.trim());
        }
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error en búsqueda:', err);
        setError('Error al buscar notas');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce solo si hay búsqueda
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
          {searchTerm ? `No se encontraron notas publicadas para "${searchTerm}"` : 'No hay notas disponibles'}
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
        </div>
      )}
    </div>
  );
};

export default SearchResults;
