import { useState, useEffect } from 'react';
import { urlApi } from '../../api/url.js';
import { useAuth } from '../../Context';
import { FaSearch, FaFilter, FaCheckCircle, FaTimesCircle, FaBan, FaUserCheck } from 'react-icons/fa';

const ITEMS_PER_PAGE = 25;

const ClientesVetados = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const { token } = useAuth();

  // Obtener lista única de tipos para el filtro
  const tiposUnicos = [...new Set(clientes.map(c => c.tipo).filter(Boolean))].sort();

  // Aplicar filtros
  const clientesFiltrados = clientes.filter(cliente => {
    // Filtro de búsqueda
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      const coincide = 
        (cliente.restaurante?.toLowerCase().includes(termino)) ||
        (cliente.telefono?.toLowerCase().includes(termino)) ||
        (cliente.tipo?.toLowerCase().includes(termino));
      if (!coincide) return false;
    }
    
    // Filtro por estado
    if (filtroEstado !== 'todos') {
      if (filtroEstado === 'cliente' && cliente.estado_cliente !== 'HA SIDO CLIENTE') return false;
      if (filtroEstado === 'no_cliente' && cliente.estado_cliente !== 'NO HA SIDO CLIENTE') return false;
    }
    
    // Filtro por tipo
    if (filtroTipo !== 'todos' && cliente.tipo !== filtroTipo) return false;
    
    return true;
  });

  // Calcular paginación
  const totalPages = Math.ceil(clientesFiltrados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const clientesActuales = clientesFiltrados.slice(startIndex, endIndex);

  // Cargar clientes de la API
  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${urlApi}api/clientes-editorial`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setClientes(Array.isArray(data) ? data : data.clientes || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error cargando clientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado de cliente
  const actualizarEstado = async (id, nuevoEstado) => {
    setGuardando(true);
    try {
      const response = await fetch(`${urlApi}api/clientes-editorial/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado_cliente: nuevoEstado })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar');
      }
      
      // Actualizar localmente
      setClientes(prev => prev.map(c => 
        c.id === id ? { ...c, estado_cliente: nuevoEstado } : c
      ));
      
      setMensaje({ tipo: 'exito', texto: 'Estado actualizado correctamente' });
    } catch (err) {
      console.error('Error actualizando:', err);
      setMensaje({ tipo: 'error', texto: 'Error al actualizar el estado' });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, filtroEstado, filtroTipo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700 mb-2">Error al cargar los datos</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchClientes}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Clientes Editorial (Restringidos)</h1>
      
      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`mb-4 p-3 rounded-lg ${
          mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {mensaje.texto}
        </div>
      )}
     
      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Restaurante</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Teléfono</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientesActuales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron registros
                  </td>
                </tr>
              ) : (
                clientesActuales.map((cliente, index) => (
                  <tr 
                    key={cliente.id} 
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">{cliente.id}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700">
                        {cliente.tipo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {cliente.restaurante || 'Sin nombre'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {cliente.telefono || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${
                        cliente.estado_cliente === 'HA SIDO CLIENTE' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {cliente.estado_cliente === 'HA SIDO CLIENTE' ? (
                          <FaCheckCircle />
                        ) : (
                          <FaTimesCircle />
                        )}
                        {cliente.estado_cliente === 'HA SIDO CLIENTE' ? 'HABILITADO' : 'RESTINGIDO'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {cliente.estado_cliente === 'HA SIDO CLIENTE' ? (
                        <button
                          onClick={() => actualizarEstado(cliente.id, 'NO HA SIDO CLIENTE')}
                          disabled={guardando}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50 text-sm font-medium cursor-pointer"
                          title="Restringir cliente"
                        >
                          <FaBan />
                          Restringir
                        </button>
                      ) : (
                        <button
                          onClick={() => actualizarEstado(cliente.id, 'HA SIDO CLIENTE')}
                          disabled={guardando}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition disabled:opacity-50 text-sm font-medium cursor-pointer"
                          title="Habilitar cliente"
                        >
                          <FaUserCheck />
                          Habilitar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Primera
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Siguiente
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Última
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientesVetados;

