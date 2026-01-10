import { useState, useEffect } from 'react';
import { urlApi } from '../../api/url.js';
import { useAuth } from '../../Context';
import EditarNoticia from './EditarNoticia';

const ITEMS_PER_PAGE = 9; // Noticias por página

const NoticiasAdmin = () => {
  const [noticias, setNoticias] = useState([]);
  const [noticiasGuardadas, setNoticiasGuardadas] = useState([]); // Noticias ya guardadas
  const [loading, setLoading] = useState(true);
  const [loadingNotas, setLoadingNotas] = useState(false);
  const [guardando, setGuardando] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('pendientes'); // pendientes, guardadas, todas
  const [filtroFuente, setFiltroFuente] = useState('todas'); // todas o nombre de fuente
  const { usuario } = useAuth(); // Obtener usuario del contexto

  const API_URL = 'https://admin.residente.mx';

  // Obtener noticias ya guardadas de la base de datos
  const fetchNoticiasGuardadas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/noticias/guardadas`);
      const data = await response.json();
      
      if (data.success && data.notas) {
        setNoticiasGuardadas(data.notas);
        return data.notas;
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo noticias guardadas:', error);
      return [];
    }
  };

  const fetchNoticias = async () => {
    setLoading(true);
    try {
      // Primero obtener las ya guardadas
      const guardadas = await fetchNoticiasGuardadas();
      const titulosGuardados = guardadas.map(n => n.titulo?.toLowerCase().trim());
      
      // Luego obtener las nuevas de la API
      const response = await fetch(`${API_URL}/api/noticias?pageSize=100`);
      const data = await response.json();
      
      if (data.success) {
        // Filtrar las que ya están guardadas (por título)
        const noticiasFiltradas = data.articles.filter(article => {
          const tituloArticle = article.title?.toLowerCase().trim();
          return !titulosGuardados.includes(tituloArticle);
        });
        setNoticias(noticiasFiltradas);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar mis notas guardadas (solo si no hay notas locales)
  const fetchMisNotas = async () => {
    // Si ya tenemos notas guardadas localmente, no sobrescribir
    if (misNotas.length > 0) {
      return;
    }
    
    setLoadingNotas(true);
    try {
      const response = await fetch(`${API_URL}/api/noticias/guardadas`);
      
      if (!response.ok) {
        console.log('Endpoint de notas guardadas no disponible');
        // NO resetear misNotas aquí para mantener las guardadas localmente
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.noticias?.length > 0) {
        setMisNotas(data.noticias);
        setCurrentPageNotas(1);
      }
    } catch (error) {
      console.error('Error cargando notas:', error);
      // NO resetear misNotas aquí para mantener las guardadas localmente
    } finally {
      setLoadingNotas(false);
    }
  };

  useEffect(() => {
    fetchNoticias();
    fetchMisNotas(); // Intentar cargar notas guardadas al inicio
  }, []);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroFuente]);

  // Guardar UNA noticia como nota
  const guardarComoNota = async (noticia, index, e) => {
    e.stopPropagation();
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
          author: noticia.author,
          usuario_id: usuario?.id,
          url: noticia.url  
        })
      });

      const data = await response.json();

      if (data.success) {
        setMensaje({ tipo: 'exito', texto: `"${noticia.title.substring(0, 40)}..." guardada como nota` });
        // Mover la noticia a la lista de guardadas
        setNoticiasGuardadas(prev => [...prev, { ...noticia, guardadaEn: new Date() }]);
        // Quitar de la lista de pendientes
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

  const getCategoryColor = (source) => {
    const colors = ['bg-green-500'];
    const hash = source?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  // Cambiar estatus de una nota
  const cambiarEstatus = async (notaId, nuevoEstatus) => {
    // Actualizar localmente primero
    setMisNotas(prev => prev.map(nota => 
      nota.id === notaId ? { ...nota, estatus: nuevoEstatus } : nota
    ));

    // Intentar actualizar en el servidor
    try {
      const response = await fetch(`${API_URL}/api/notas/${notaId}/estatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estatus: nuevoEstatus })
      });

      if (response.ok) {
        setMensaje({ tipo: 'exito', texto: `Estatus cambiado a "${nuevoEstatus}"` });
        setTimeout(() => setMensaje(null), 2000);
      }
    } catch (error) {
      console.log('No se pudo actualizar en servidor, cambio local aplicado');
    }
  };

  // Colores según estatus
  const getEstatusColor = (estatus) => {
    switch (estatus) {
      case 'publicada':
        return 'bg-green-500 text-white';
      case 'revision':
        return 'bg-yellow-500 text-white';
      case 'borrador':
      default:
        return 'bg-gray-500 text-white';
    }
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
      

      {/* Tabs */}
      <div className="flex gap-1 mb-6  p-1 rounded-lg w-fit">
        <button
          onClick={() => setTabActiva('noticias')}
          className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${
            tabActiva === 'noticias'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
           Noticias
          
        </button>
        <button
          onClick={() => setTabActiva('guardadas')}
          className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${
            tabActiva === 'guardadas'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
           Mis Notas Guardadas
          
        </button>
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`p-4 rounded-lg mb-4 ${
          mensaje.tipo === 'exito' 
            ? 'bg-green-100 text-green-800 border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Filtro por estado */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-full bg-white text-gray-700 font-roman cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="pendientes">Pendientes ({noticias.length})</option>
          <option value="guardadas">Guardadas ({noticiasGuardadas.length})</option>
          <option value="todas">Todas ({noticias.length + noticiasGuardadas.length})</option>
        </select>

        {/* Filtro por fuente */}
        <select
          value={filtroFuente}
          onChange={(e) => setFiltroFuente(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-full bg-white text-gray-700 font-roman cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="todas">Todas las fuentes</option>
          {[...new Set([...noticias, ...noticiasGuardadas].map(n => n.source).filter(Boolean))].map(fuente => (
            <option key={fuente} value={fuente}>{fuente}</option>
          ))}
        </select>

        {/* Contador */}
        <span className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 font-roman">
          {filtroEstado === 'guardadas' 
            ? `${noticiasGuardadas.length} guardadas` 
            : filtroEstado === 'pendientes'
            ? `${noticias.length} pendientes`
            : `${noticias.length + noticiasGuardadas.length} total`
          }
        </span>
      </div>

      {/* Grid de noticias estilo tarjetas como las notas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Mostrar noticias pendientes */}
        {(filtroEstado === 'pendientes' || filtroEstado === 'todas') && 
          noticias
            .filter(n => filtroFuente === 'todas' || n.source === filtroFuente)
            .map((noticia, index) => (
              <NoticiaCard 
                key={`pendiente-${index}`}
                index={index}
                noticia={noticia} 
                formatDate={formatDate}
                getCategoryColor={getCategoryColor}
                onGuardar={guardarComoNota}
                guardando={guardando}
                esGuardada={false}
              />
            ))
        }
        
        {/* Mostrar noticias guardadas */}
        {(filtroEstado === 'guardadas' || filtroEstado === 'todas') && 
          noticiasGuardadas
            .filter(n => filtroFuente === 'todas' || n.source === filtroFuente)
            .map((noticia, index) => (
              <NoticiaCard 
                key={`guardada-${index}`}
                index={index}
                noticia={noticia} 
                formatDate={formatDate}
                getCategoryColor={getCategoryColor}
                onGuardar={null}
                guardando={null}
                esGuardada={true}
              />
            ))
        }
      </div>

          {/* Grid de noticias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {noticiasActuales.map((noticia, index) => (
              <NoticiaCard 
                key={startIndex + index}
                index={index}
                noticia={noticia} 
                formatDate={formatDate}
                getCategoryColor={getCategoryColor}
                onGuardar={guardarComoNota}
                guardando={guardando}
                mostrarBotonGuardar={true}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <Paginacion 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Info de paginación */}
          {noticiasFiltradas.length > 0 && (
            <div className="text-center text-gray-600 text-sm mb-4">
              Mostrando {startIndex + 1} - {Math.min(endIndex, noticiasFiltradas.length)} de {noticiasFiltradas.length} noticias
            </div>
          )}

          {todasLasNoticias.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay noticias disponibles</p>
              <button 
                onClick={fetchNoticias}
                className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Reintentar
              </button>
            </div>
          )}
        </>
      )}

     
      {tabActiva === 'guardadas' && (
        <>
          {loadingNotas ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-600 font-roman">Cargando tus notas guardadas...</p>
            </div>
          ) : notaSeleccionada ? (
           
            <EditarNoticia 
              nota={notaSeleccionada}
              onVolver={() => setNotaSeleccionada(null)}
              formatDate={formatDate}
              estatus={notaSeleccionada.estatus}
              onCambiarEstatus={(nuevoEstatus) => {
                cambiarEstatus(notaSeleccionada.id, nuevoEstatus);
                setNotaSeleccionada(prev => ({ ...prev, estatus: nuevoEstatus }));
              }}
            />
          ) : misNotas.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No tienes notas guardadas</h3>
              <p className="text-gray-500 mb-6">
                Ve a la pestaña "Noticias" y guarda las que te interesen
              </p>
              <button 
                onClick={() => setTabActiva('noticias')}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-bold"
              >
                Ver Noticias
              </button>
            </div>
          ) : (
            <>
              {/* Info */}
              <div className="flex items-center justify-between mb-6 py-3 px-1  border-gray-200">
                <span className="text-sm text-gray-500">
                  {misNotas.length} notas guardadas
                </span>
              </div>

              {/* Grid de notas guardadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {notasActuales.map((nota, index) => (
                  <NoticiaCard 
                    key={nota.id || startIndexNotas + index}
                    index={index}
                    noticia={nota} 
                    formatDate={formatDate}
                    getCategoryColor={getCategoryColor}
                    mostrarBotonGuardar={false}
                    esGuardada={true}
                    onCambiarEstatus={cambiarEstatus}
                    getEstatusColor={getEstatusColor}
                    onVerNota={() => setNotaSeleccionada(nota)}
                  />
                ))}
              </div>

              {/* Paginación */}
              {totalPagesNotas > 1 && (
                <Paginacion 
                  currentPage={currentPageNotas}
                  totalPages={totalPagesNotas}
                  onPageChange={setCurrentPageNotas}
                />
              )}

              {/* Info de paginación */}
              {misNotas.length > 0 && (
                <div className="text-center text-gray-600 text-sm mb-4">
                  Mostrando {startIndexNotas + 1} - {Math.min(endIndexNotas, misNotas.length)} de {misNotas.length} notas
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

// Componente de tarjeta con el diseño exacto de las notas
const NoticiaCard = ({ noticia, index, formatDate, getCategoryColor, onGuardar, guardando, esGuardada = false }) => {
  const categoryColor = getCategoryColor(noticia.source);
  const [imagenError, setImagenError] = useState(false);
  
  // Obtener color del borde según estatus
  const getBorderColor = () => {
    if (!esGuardada) return '';
    switch (noticia.estatus) {
      case 'publicada':
        return 'ring-2 ring-green-500';
      case 'revision':
        return 'ring-2 ring-yellow-500';
      case 'borrador':
      default:
        return 'ring-2 ring-gray-400';
    }
  };
  
  return (
    <div
      className={`group relative block rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-gray-100 ${getBorderColor()} ${esGuardada ? 'cursor-pointer' : ''}`}
      style={{ aspectRatio: '4/3' }}
      onClick={esGuardada && onVerNota ? onVerNota : undefined}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Contenido superpuesto */}
      <div className="relative h-full flex flex-col justify-between p-3 z-10">
        
        {/* Parte superior */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            {/* Etiqueta de estado */}
            <span className={`px-2 py-1 text-xs rounded-full font-bold w-fit ${
              esGuardada 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}>
              {esGuardada ? 'Guardada' : 'Pendiente'}
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

          {/* Categoría */}
          <div className={`${categoryColor} text-white px-3 py-1 text-sm font-black uppercase tracking-wide`}>
            NOTICIAS
          </div>
        </div>

        {/* Parte inferior */}
        <div className="w-full">
          <div className="bg-white/95 backdrop-blur-sm p-3 rounded">
            <h3 className="text-black text-sm font-black leading-tight line-clamp-2 mb-2">
              {noticia.title}
            </h3>
            
            {/* Botones de acción */}
            <div className="flex gap-2 mt-2">
              {esGuardada ? (
                <span className="flex-1 px-3 py-1.5 rounded font-bold text-xs bg-green-100 text-green-800 text-center">
                  ✓ Ya guardada
                </span>
              ) : (
                <button 
                  onClick={(e) => onGuardar && onGuardar(noticia, index, e)}
                  disabled={guardando === index}
                  className={`flex-1 px-3 py-1.5 rounded font-bold transition-colors text-xs ${
                    guardando === index
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {guardando === index ? 'Guardando...' : 'Guardar como Nota'}
                </button>
              )}
              
              <a 
                href={noticia.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors text-xs text-center"
              >
                Ver
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticiasAdmin;
