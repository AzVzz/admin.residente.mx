import { useState, useEffect } from 'react';
import { urlApi } from '../../api/url.js';
import { useAuth } from '../../Context';
import EditarNoticia from './EditarNoticia';

const ITEMS_PER_PAGE = 9; // Noticias por página

const NoticiasAdmin = () => {
  const [todasLasNoticias, setTodasLasNoticias] = useState([]);
  const [misNotas, setMisNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingNotas, setLoadingNotas] = useState(false);
  const [guardando, setGuardando] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageNotas, setCurrentPageNotas] = useState(1);
  
  // Tab activa: 'noticias' o 'guardadas'
  const [tabActiva, setTabActiva] = useState('noticias');
  
  // Nota seleccionada para ver detalle
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);
  
  // Estados para filtros
  const [filtroFuente, setFiltroFuente] = useState('todas');
  
  const { usuario } = useAuth();

  const API_URL = 'https://admin.residente.mx';

  // Obtener lista única de fuentes para el filtro
  const fuentesUnicas = [...new Set(todasLasNoticias.map(n => n.source).filter(Boolean))].sort();

  // Aplicar filtros
  const noticiasFiltradas = todasLasNoticias.filter(noticia => {
    if (filtroFuente !== 'todas' && noticia.source !== filtroFuente) return false;
    return true;
  });

  // Calcular paginación para noticias
  const totalPages = Math.ceil(noticiasFiltradas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const noticiasActuales = noticiasFiltradas.slice(startIndex, endIndex);

  // Calcular paginación para mis notas
  const totalPagesNotas = Math.ceil(misNotas.length / ITEMS_PER_PAGE);
  const startIndexNotas = (currentPageNotas - 1) * ITEMS_PER_PAGE;
  const endIndexNotas = startIndexNotas + ITEMS_PER_PAGE;
  const notasActuales = misNotas.slice(startIndexNotas, endIndexNotas);

  // Cargar noticias de la API
  const fetchNoticias = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/noticias?pageSize=100`);
      const data = await response.json();
      
      if (data.success) {
        setTodasLasNoticias(data.articles);
        setCurrentPage(1);
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
        // Agregar a mis notas localmente con estatus por defecto
        setMisNotas(prev => [{ ...noticia, id: data.id, estatus: 'borrador' }, ...prev]);
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

    
      {tabActiva === 'noticias' && (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3 mb-6 py-3 px-1">
            <div className="relative inline-block">
              <select
                value={filtroFuente}
                onChange={(e) => setFiltroFuente(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-8 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer"
              >
                <option value="todas">Todas las fuentes</option>
                {fuentesUnicas.map(fuente => (
                  <option key={fuente} value={fuente}>{fuente}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            
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

// Componente de Paginación reutilizable
const Paginacion = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center items-center gap-4 mb-8">
    <button
      onClick={() => onPageChange(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className={`px-4 py-2 rounded font-bold transition-colors ${
        currentPage === 1
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-black text-white hover:bg-gray-800'
      }`}
    >
      ← Anterior
    </button>
    
    <div className="flex items-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(page => {
          return page === 1 || 
                 page === totalPages || 
                 Math.abs(page - currentPage) <= 2;
        })
        .map((page, idx, arr) => {
          const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;
          return (
            <span key={page} className="flex items-center gap-2">
              {showEllipsisBefore && <span className="text-gray-500">...</span>}
              <button
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 rounded font-bold transition-colors ${
                  page === currentPage
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            </span>
          );
        })}
    </div>

    <button
      onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className={`px-4 py-2 rounded font-bold transition-colors ${
        currentPage === totalPages
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-black text-white hover:bg-gray-800'
      }`}
    >
      Siguiente →
    </button>
  </div>
);

// Componente de tarjeta
const NoticiaCard = ({ noticia, index, formatDate, getCategoryColor, onGuardar, guardando, mostrarBotonGuardar = true, esGuardada = false, onCambiarEstatus, getEstatusColor, onVerNota }) => {
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
            
            {/* Botón de guardar */}
            {mostrarBotonGuardar && (
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
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticiasAdmin;
