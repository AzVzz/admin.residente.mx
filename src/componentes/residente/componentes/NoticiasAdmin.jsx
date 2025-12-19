import { useState, useEffect } from 'react';
import { urlApi } from '../../api/url.js';

const NoticiasAdmin = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const API_URL = 'https://admin.residente.mx';

  const fetchNoticias = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/noticias?pageSize=9`);
      const data = await response.json();
      
      if (data.success) {
        setNoticias(data.articles);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  // Guardar UNA noticia como nota
  const guardarComoNota = async (noticia, index, e) => {
    e.stopPropagation(); // Evitar que se abra el link
    e.preventDefault();
    
    setGuardando(index);
    setMensaje(null);

    try {
      const response = await fetch(`${API_URL}/api/noticias/guardar-una`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: noticia.title,
          description: noticia.description,
          content: noticia.content,
          urlToImage: noticia.urlToImage,
          publishedAt: noticia.publishedAt,
          source: noticia.source,
          author: noticia.author
        })
      });

      const data = await response.json();

      if (data.success) {
        setMensaje({ tipo: 'exito', texto: `"${noticia.title.substring(0, 40)}..." guardada como nota` });
        // Quitar la noticia de la lista
        setNoticias(prev => prev.filter((_, i) => i !== index));
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setMensaje(null), 3000);
      } else {
        setMensaje({ tipo: 'error', texto: `Error: ${data.error}` });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: `Error: ${error.message}` });
    } finally {
      setGuardando(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Colores para las categorías
  const getCategoryColor = (source) => {
    const colors = [
      'bg-green-500'
    ];
    const hash = source?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
        <p className="text-gray-600 font-roman">Cargando noticias...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-black text-black"> Noticias </h2>
        <button 
          onClick={fetchNoticias} 
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors font-bold"
        >
          Actualizar
        </button>
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`p-4 rounded-lg mb-4 ${
          mensaje.tipo === 'exito' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {mensaje.texto}
        </div>
      )}

      

      {/* Grid de noticias estilo tarjetas como las notas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {noticias.map((noticia, index) => (
          <NoticiaCard 
            key={index}
            index={index}
            noticia={noticia} 
            formatDate={formatDate}
            getCategoryColor={getCategoryColor}
            onGuardar={guardarComoNota}
            guardando={guardando}
          />
        ))}
      </div>

      {noticias.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay noticias nuevas disponibles</p>
          <button 
            onClick={fetchNoticias}
            className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
};

// Componente de tarjeta con el diseño exacto de las notas
const NoticiaCard = ({ noticia, index, formatDate, getCategoryColor, onGuardar, guardando }) => {
  const categoryColor = getCategoryColor(noticia.source);
  const [imagenError, setImagenError] = useState(false);
  
  // Imagen por defecto
  const imagenDefault = `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
  
  return (
    <div
      className="group relative block rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gray-100"
      style={{ aspectRatio: '4/3' }}
    >
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        {noticia.urlToImage && !imagenError ? (
          <img
            src={noticia.urlToImage}
            alt={noticia.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImagenError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
            <span className="text-6xl opacity-50">📰</span>
          </div>
        )}
        {/* Overlay para mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Contenido superpuesto */}
      <div className="relative h-full flex flex-col justify-between p-3 z-10">
        
        {/* Parte superior: Estado y Categoría */}
        <div className="flex justify-between items-start">
          {/* Datos de la izquierda */}
          <div className="flex flex-col gap-1">
            {/* Etiqueta de estado - Pendiente de importar */}
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-500 text-white font-bold w-fit">
              Pendiente
            </span>
            {/* Fecha */}
            <span className="font-roman font-semibold px-2 py-1 text-xs rounded-full bg-black/40 backdrop-blur-md text-white drop-shadow w-fit">
              {formatDate(noticia.publishedAt)}
            </span>
            {/* Fuente */}
            <span className="font-sans font-semibold px-2 py-1 text-xs rounded-full bg-black/40 backdrop-blur-md text-white drop-shadow w-fit">
              Fuente: {noticia.source || 'Desconocida'}
            </span>
          </div>

          {/* Categoría a la derecha */}
          <div className={`${categoryColor} text-white px-3 py-1 text-sm font-black uppercase tracking-wide`}>
            NOTICIAS
          </div>
        </div>

        {/* Parte inferior: Título y botones */}
        <div className="w-full">
          <div className="bg-white/95 backdrop-blur-sm p-3 rounded">
            <h3 className="text-black text-sm font-black leading-tight line-clamp-2 mb-2">
              {noticia.title}
            </h3>
            
            {/* Botones de acción */}
            <div className="flex gap-2 mt-2">
              <button 
                onClick={(e) => onGuardar(noticia, index, e)}
                disabled={guardando === index}
                className={`flex-1 px-3 py-1.5 rounded font-bold transition-colors text-xs ${
                  guardando === index
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {guardando === index ? 'Guardando...' : 'Guardar como Nota'}
              </button>
              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticiasAdmin;
