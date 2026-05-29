import { useState, useEffect } from 'react';
import { urlApi } from '../../api/url.js';
import { useAuth } from '../../Context';
import { FaCheckCircle, FaTimesCircle, FaBan, FaUserCheck, FaEdit, FaLink, FaCopy } from 'react-icons/fa';

const ITEMS_PER_PAGE = 25;
const IVA = 0.16;

// Base del link propio de registro/pago (mismo origen que el form B2B)
const linkEditorial = (token) =>
  `${window.location.origin}/admin/registrob2b?editorial_token=${token}`;

const formatoPesos = (centavos) =>
  centavos
    ? `$${(centavos / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
    : '—';

const ClientesVetados = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [orden, setOrden] = useState('recientes');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [editando, setEditando] = useState(null); // cliente en edición (modal)

  const { token } = useAuth();

  const tiposUnicos = [...new Set(clientes.map(c => c.tipo).filter(Boolean))].sort();

  const clientesFiltrados = clientes.filter(cliente => {
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      const coincide =
        (cliente.restaurante?.toLowerCase().includes(termino)) ||
        (cliente.telefono?.toLowerCase().includes(termino)) ||
        (cliente.tipo?.toLowerCase().includes(termino));
      if (!coincide) return false;
    }
    if (filtroEstado !== 'todos') {
      if (filtroEstado === 'cliente' && cliente.estado_cliente !== 'HA SIDO CLIENTE') return false;
      if (filtroEstado === 'no_cliente' && cliente.estado_cliente !== 'NO HA SIDO CLIENTE') return false;
    }
    if (filtroTipo !== 'todos' && cliente.tipo !== filtroTipo) return false;
    return true;
  });

  const clientesOrdenados = [...clientesFiltrados].sort((a, b) =>
    orden === 'recientes' ? b.id - a.id : a.id - b.id
  );

  const totalPages = Math.ceil(clientesOrdenados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const clientesActuales = clientesOrdenados.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const flash = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3000);
  };

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${urlApi}api/clientes-editorial`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
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

  // PUT genérico: actualiza campos del cliente y refleja en estado local
  const actualizarCliente = async (id, cambios) => {
    setGuardando(true);
    try {
      const response = await fetch(`${urlApi}api/clientes-editorial/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios)
      });
      if (!response.ok) throw new Error('Error al actualizar');
      const data = await response.json().catch(() => ({}));
      setClientes(prev => prev.map(c =>
        c.id === id
          ? { ...c, ...cambios, ...(data.enlace_token && { enlace_token: data.enlace_token }) }
          : c
      ));
      flash('exito', 'Guardado correctamente');
      return data;
    } catch (err) {
      console.error('Error actualizando:', err);
      flash('error', 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const actualizarEstado = (id, nuevoEstado) =>
    actualizarCliente(id, { estado_cliente: nuevoEstado });

  // Generar (si falta) y copiar el link propio
  const copiarLink = async (cliente) => {
    let token_ = cliente.enlace_token;
    if (!token_) {
      const data = await actualizarCliente(cliente.id, { generar_enlace: true });
      token_ = data?.enlace_token;
    }
    if (!token_) return;
    try {
      await navigator.clipboard.writeText(linkEditorial(token_));
      flash('exito', 'Link copiado al portapapeles');
    } catch {
      flash('error', 'No se pudo copiar. Link: ' + linkEditorial(token_));
    }
  };

  const guardarEdicion = async () => {
    if (!editando) return;
    if (!editando.restaurante) {
      flash('error', 'El nombre del restaurante es obligatorio');
      return;
    }
    const datos = {
      restaurante: editando.restaurante,
      telefono: editando.telefono || null,
      tipo: editando.tipo || null,
      restaurante_id: editando.restaurante_id ? parseInt(editando.restaurante_id, 10) : null,
      precio_mensual_centavos: editando.precio_pesos
        ? Math.round(parseFloat(editando.precio_pesos) * 100)
        : null,
      meses_compromiso: editando.meses_compromiso ? parseInt(editando.meses_compromiso, 10) : 12,
      precio_dinamico_activo: editando.precio_dinamico_activo ? 1 : 0,
      nombre_plan: editando.nombre_plan || null,
    };

    if (editando.id) {
      await actualizarCliente(editando.id, datos);
    } else {
      // Crear nuevo cliente editorial
      setGuardando(true);
      try {
        const response = await fetch(`${urlApi}api/clientes-editorial`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...datos, estado_cliente: editando.estado_cliente || 'NO HA SIDO CLIENTE' })
        });
        if (!response.ok) throw new Error('Error al crear');
        flash('exito', 'Cliente creado correctamente');
        await fetchClientes();
      } catch (err) {
        console.error('Error creando:', err);
        flash('error', 'Error al crear el cliente');
      } finally {
        setGuardando(false);
      }
    }
    setEditando(null);
  };

  const abrirEdicion = (c) => setEditando({
    ...c,
    precio_pesos: c.precio_mensual_centavos ? (c.precio_mensual_centavos / 100).toFixed(2) : '',
    precio_dinamico_activo: !!c.precio_dinamico_activo,
  });

  const abrirNuevo = () => setEditando({
    id: null,
    restaurante: '',
    telefono: '',
    tipo: '',
    restaurante_id: '',
    precio_pesos: '',
    meses_compromiso: 12,
    precio_dinamico_activo: true,
    nombre_plan: '',
    estado_cliente: 'NO HA SIDO CLIENTE',
  });

  useEffect(() => { fetchClientes(); }, []);
  useEffect(() => { setCurrentPage(1); }, [busqueda, filtroEstado, filtroTipo]);

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
        <button onClick={fetchClientes} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clientes Editorial (Restringidos)</h1>
        <button onClick={abrirNuevo}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition text-sm font-medium">
          + Nuevo cliente
        </button>
      </div>

      {mensaje && (
        <div className={`mb-4 p-3 rounded-lg ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Buscador + filtros + orden */}
      <div className="bg-white rounded-lg shadow p-3 mb-4 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar restaurante, teléfono o tipo..."
          className="flex-1 min-w-[200px] px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="todos">Todos los estados</option>
          <option value="cliente">Habilitados</option>
          <option value="no_cliente">Restringidos</option>
        </select>
        {tiposUnicos.length > 0 && (
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="todos">Todos los tipos</option>
            {tiposUnicos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <select value={orden} onChange={(e) => setOrden(e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="recientes">Más recientes</option>
          <option value="antiguos">Más antiguos</option>
        </select>
        <span className="text-sm text-gray-500 ml-auto">{clientesOrdenados.length} resultados</span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Restaurante</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Teléfono</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Precio/mes</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Dinámico</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientesActuales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No se encontraron registros</td>
                </tr>
              ) : (
                clientesActuales.map((cliente, index) => (
                  <tr key={cliente.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                    <td className="px-4 py-3 text-sm text-gray-600">{cliente.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{cliente.restaurante || 'Sin nombre'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{cliente.telefono || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatoPesos(cliente.precio_mensual_centavos)}
                      {cliente.precio_mensual_centavos ? (
                        <span className="block text-[10px] text-gray-400">
                          c/IVA ${((cliente.precio_mensual_centavos / 100) * (1 + IVA)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {cliente.precio_dinamico_activo ? (
                        <span className="inline-block px-2 py-1 text-[10px] font-semibold rounded bg-green-100 text-green-700">ACTIVO</span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-[10px] font-semibold rounded bg-gray-100 text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${cliente.estado_cliente === 'HA SIDO CLIENTE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {cliente.estado_cliente === 'HA SIDO CLIENTE' ? <FaCheckCircle /> : <FaTimesCircle />}
                        {cliente.estado_cliente === 'HA SIDO CLIENTE' ? 'HABILITADO' : 'RESTRINGIDO'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button onClick={() => abrirEdicion(cliente)} disabled={guardando}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition disabled:opacity-50 text-sm font-medium cursor-pointer" title="Editar">
                          <FaEdit /> Editar
                        </button>
                        <button onClick={() => copiarLink(cliente)} disabled={guardando}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition disabled:opacity-50 text-sm font-medium cursor-pointer"
                          title="Generar/Copiar link propio">
                          {cliente.enlace_token ? <FaCopy /> : <FaLink />} Link
                        </button>
                        {cliente.estado_cliente === 'HA SIDO CLIENTE' ? (
                          <button onClick={() => actualizarEstado(cliente.id, 'NO HA SIDO CLIENTE')} disabled={guardando}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50 text-sm font-medium cursor-pointer" title="Restringir">
                            <FaBan /> Restringir
                          </button>
                        ) : (
                          <button onClick={() => actualizarEstado(cliente.id, 'HA SIDO CLIENTE')} disabled={guardando}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition disabled:opacity-50 text-sm font-medium cursor-pointer" title="Habilitar">
                            <FaUserCheck /> Habilitar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-600">Página {currentPage} de {totalPages}</div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-100">Primera</button>
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-100">Anterior</button>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-100">Siguiente</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-100">Última</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {editando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditando(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editando.id ? `Editar cliente #${editando.id}` : 'Nuevo cliente editorial'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del restaurante</label>
                <input type="text" value={editando.restaurante || ''} onChange={(e) => setEditando({ ...editando, restaurante: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" value={editando.telefono || ''} onChange={(e) => setEditando({ ...editando, telefono: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <input type="text" value={editando.tipo || ''} onChange={(e) => setEditando({ ...editando, tipo: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio mensual (MXN, sin IVA)</label>
                  <input type="number" step="0.01" min="0" value={editando.precio_pesos}
                    onChange={(e) => setEditando({ ...editando, precio_pesos: e.target.value })}
                    placeholder="Ej. 2199.00"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  {editando.precio_pesos ? (
                    <p className="text-[11px] text-gray-500 mt-1">
                      c/IVA: ${(parseFloat(editando.precio_pesos || 0) * (1 + IVA)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meses compromiso</label>
                  <input type="number" min="1" value={editando.meses_compromiso || 12}
                    onChange={(e) => setEditando({ ...editando, meses_compromiso: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID restaurante (opcional)</label>
                  <input type="number" value={editando.restaurante_id || ''} onChange={(e) => setEditando({ ...editando, restaurante_id: e.target.value })}
                    placeholder="estrellas_new.id"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del plan (opcional)</label>
                  <input type="text" value={editando.nombre_plan || ''} onChange={(e) => setEditando({ ...editando, nombre_plan: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input type="checkbox" checked={editando.precio_dinamico_activo}
                  onChange={(e) => setEditando({ ...editando, precio_dinamico_activo: e.target.checked })} />
                Precio dinámico activo (habilita el cobro por el link propio)
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditando(null)} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100">Cancelar</button>
              <button onClick={guardarEdicion} disabled={guardando}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesVetados;
