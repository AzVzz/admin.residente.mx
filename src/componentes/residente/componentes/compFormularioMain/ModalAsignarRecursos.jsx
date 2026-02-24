import React, { useState, useEffect } from 'react';
import { FaTimes, FaUtensils, FaTicketAlt, FaSpinner, FaCheck, FaExternalLinkAlt, FaTrash, FaExchangeAlt } from 'react-icons/fa';
import { urlApi } from '../../../api/url';

/**
 * Modal para asignar/reasignar recursos (restaurantes, cupones) a un usuario
 * Permite reasignar recursos de un usuario a otro
 * Solo visible para usuarios con rol residente o permisos 'todos'
 */
const ModalAsignarRecursos = ({
    isOpen,
    onClose,
    usuario,
    token,
    onAsignacionExitosa
}) => {
    const [activeTab, setActiveTab] = useState('restaurantes');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Todos los recursos (para el dropdown)
    const [todosRestaurantes, setTodosRestaurantes] = useState([]);
    const [todosCupones, setTodosCupones] = useState([]);

    // Recursos asignados al usuario actual
    const [restaurantesAsignados, setRestaurantesAsignados] = useState([]);
    const [ticketsAsignados, setTicketsAsignados] = useState([]);

    // Mapa de usuarios para mostrar nombres
    const [usuariosMap, setUsuariosMap] = useState({});

    // Selección actual
    const [restauranteSeleccionado, setRestauranteSeleccionado] = useState('');
    const [ticketSeleccionado, setTicketSeleccionado] = useState('');

    useEffect(() => {
        if (isOpen && usuario) {
            cargarDatos();
        }
    }, [isOpen, usuario]);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            // Cargar todos los recursos usando APIs existentes
            const [restResponse, ticketsResponse, usuariosResponse] = await Promise.all([
                fetch(`${urlApi}api/restaurante/basicos`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${urlApi}api/tickets/todas`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${urlApi}api/usuarios`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (restResponse.ok) {
                const data = await restResponse.json();
                setTodosRestaurantes(data);
                // Filtrar los asignados al usuario actual
                setRestaurantesAsignados(data.filter(r => r.usuario_id === usuario.id));
            }

            if (ticketsResponse.ok) {
                const data = await ticketsResponse.json();
                setTodosCupones(data);
                // Filtrar los asignados al usuario actual
                setTicketsAsignados(data.filter(t => t.user_id === usuario.id));
            }

            if (usuariosResponse.ok) {
                const usuarios = await usuariosResponse.json();
                // Crear mapa id -> nombre_usuario
                const map = {};
                usuarios.forEach(u => {
                    map[u.id] = u.nombre_usuario || u.email || `Usuario ${u.id}`;
                });
                setUsuariosMap(map);
            }
        } catch (err) {
            setError('Error al cargar los recursos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getOwnerLabel = (ownerId) => {
        if (!ownerId) return '(Sin asignar)';
        if (ownerId === usuario.id) return '(Ya asignado)';
        return `(De: ${usuariosMap[ownerId] || `Usuario ${ownerId}`})`;
    };

    const asignarRestaurante = async () => {
        if (!restauranteSeleccionado) return;

        const restaurante = todosRestaurantes.find(r => r.id === parseInt(restauranteSeleccionado));
        if (!restaurante) return;

        setLoading(true);
        setError('');
        try {
            // Usar PUT a /api/restaurante/:slug con usuario_id
            const response = await fetch(`${urlApi}api/restaurante/${restaurante.slug}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usuario_id: usuario.id
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al asignar restaurante');
            }

            const wasReassigned = restaurante.usuario_id && restaurante.usuario_id !== usuario.id;
            setSuccessMessage(wasReassigned
                ? `Restaurante reasignado desde ${usuariosMap[restaurante.usuario_id] || 'otro usuario'}`
                : 'Restaurante asignado correctamente'
            );
            setRestauranteSeleccionado('');
            await cargarDatos();
            onAsignacionExitosa?.();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const desasignarRestaurante = async (restaurante) => {
        if (!window.confirm('¿Estás seguro de desvincular este restaurante del usuario?')) return;

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${urlApi}api/restaurante/${restaurante.slug}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usuario_id: null
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al desvincular restaurante');
            }

            setSuccessMessage('Restaurante desvinculado correctamente');
            await cargarDatos();
            onAsignacionExitosa?.();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const asignarTicket = async () => {
        if (!ticketSeleccionado) return;

        const ticket = todosCupones.find(t => t.id === parseInt(ticketSeleccionado));
        if (!ticket) return;

        setLoading(true);
        setError('');
        try {
            // Usar PUT a /api/tickets/:id con user_id
            const response = await fetch(`${urlApi}api/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: usuario.id
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al asignar cupón');
            }

            const wasReassigned = ticket.user_id && ticket.user_id !== usuario.id;
            setSuccessMessage(wasReassigned
                ? `Cupón reasignado desde ${usuariosMap[ticket.user_id] || 'otro usuario'}`
                : 'Cupón asignado correctamente'
            );
            setTicketSeleccionado('');
            await cargarDatos();
            onAsignacionExitosa?.();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const desasignarTicket = async (ticketId) => {
        if (!window.confirm('¿Estás seguro de desvincular este cupón del usuario?')) return;

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${urlApi}api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: null
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al desvincular cupón');
            }

            setSuccessMessage('Cupón desvinculado correctamente');
            await cargarDatos();
            onAsignacionExitosa?.();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Estado para búsqueda
    const [busquedaRecurso, setBusquedaRecurso] = useState('');

    // Filtrar restaurantes para el dropdown (excluir los ya asignados a este usuario y aplicar búsqueda)
    const restaurantesParaDropdown = usuario ? todosRestaurantes.filter(r => {
        const noAsignado = r.usuario_id !== usuario.id;
        const coincideBusqueda = busquedaRecurso === '' ||
            r.nombre_restaurante.toLowerCase().includes(busquedaRecurso.toLowerCase());
        return noAsignado && coincideBusqueda;
    }) : [];

    // Filtrar cupones para el dropdown
    const ticketsParaDropdown = usuario ? todosCupones.filter(t => {
        const noAsignado = t.user_id !== usuario.id;
        const coincideBusqueda = busquedaRecurso === '' ||
            t.titulo.toLowerCase().includes(busquedaRecurso.toLowerCase()) ||
            (t.nombre_restaurante && t.nombre_restaurante.toLowerCase().includes(busquedaRecurso.toLowerCase()));
        return noAsignado && coincideBusqueda;
    }) : [];

    if (!isOpen || !usuario) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">
                        Asignar Recursos a: {usuario?.nombre_usuario}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => { setActiveTab('restaurantes'); setBusquedaRecurso(''); }}
                        className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'restaurantes'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <FaUtensils />
                        Restaurantes ({restaurantesAsignados.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('cupones'); setBusquedaRecurso(''); }}
                        className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'cupones'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <FaTicketAlt />
                        Cupones ({ticketsAsignados.length})
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {/* Messages */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 flex items-center gap-2">
                            <FaCheck /> {successMessage}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
                            <span className="ml-2">Cargando...</span>
                        </div>
                    ) : (
                        <>
                            {/* Tab: Restaurantes */}
                            {activeTab === 'restaurantes' && (
                                <div>
                                    {/* Asignar nuevo */}
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <FaExchangeAlt className="text-blue-500" />
                                            Asignar / Reasignar Restaurante
                                        </h3>

                                        {/* Buscador */}
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                placeholder="🔍 Buscar restaurante..."
                                                value={busquedaRecurso}
                                                onChange={(e) => setBusquedaRecurso(e.target.value)}
                                                className="w-full border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <select
                                                value={restauranteSeleccionado}
                                                onChange={(e) => setRestauranteSeleccionado(e.target.value)}
                                                className="flex-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="">Seleccionar restaurante...</option>
                                                {restaurantesParaDropdown.map((r) => (
                                                    <option key={r.id} value={r.id}>
                                                        {r.nombre_restaurante} {getOwnerLabel(r.usuario_id)}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={asignarRestaurante}
                                                disabled={!restauranteSeleccionado || loading}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center gap-2"
                                            >
                                                <FaCheck /> Asignar
                                            </button>
                                        </div>
                                        {restaurantesParaDropdown.length === 0 && (
                                            <p className="text-gray-500 text-sm mt-2">
                                                {busquedaRecurso ? 'No se encontraron restaurantes con esa búsqueda' : 'Todos los restaurantes disponible ya están asignados'}
                                            </p>
                                        )}
                                        <p className="text-gray-400 text-xs mt-2">
                                            💡 Los restaurantes asignados a otros usuarios se reasignarán automáticamente
                                        </p>
                                    </div>

                                    {/* Lista de asignados */}
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2">
                                            Restaurantes Asignados ({restaurantesAsignados.length})
                                        </h3>
                                        {restaurantesAsignados.length === 0 ? (
                                            <p className="text-gray-500 text-sm">Este usuario no tiene restaurantes asignados</p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {restaurantesAsignados.map((r) => (
                                                    <li key={r.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
                                                        <div className="flex items-center gap-3">
                                                            <FaUtensils className="text-gray-400" />
                                                            <div>
                                                                <span className="font-medium">{r.nombre_restaurante}</span>
                                                                {r.tipo_lugar && (
                                                                    <span className="text-gray-500 text-sm ml-2">({r.tipo_lugar})</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={`https://residente.mx/${r.slug}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                                title="Ver página"
                                                            >
                                                                <FaExternalLinkAlt />
                                                            </a>
                                                            <button
                                                                onClick={() => desasignarRestaurante(r)}
                                                                className="text-red-600 hover:text-red-800 p-1"
                                                                title="Desvincular"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab: Cupones */}
                            {activeTab === 'cupones' && (
                                <div>
                                    {/* Asignar nuevo */}
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <FaExchangeAlt className="text-blue-500" />
                                            Asignar / Reasignar Cupón
                                        </h3>

                                        {/* Buscador */}
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                placeholder="Buscar cupón..."
                                                value={busquedaRecurso}
                                                onChange={(e) => setBusquedaRecurso(e.target.value)}
                                                className="w-full border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <select
                                                value={ticketSeleccionado}
                                                onChange={(e) => setTicketSeleccionado(e.target.value)}
                                                className="flex-1 min-w-0 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="">Seleccionar cupón...</option>
                                                {ticketsParaDropdown.map((t) => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.titulo} {t.nombre_restaurante ? `[Restaurante: ${t.nombre_restaurante}]` : ''} {getOwnerLabel(t.user_id)}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={asignarTicket}
                                                disabled={!ticketSeleccionado || loading}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap"
                                            >
                                                <FaCheck /> Asignar
                                            </button>
                                        </div>
                                        {ticketsParaDropdown.length === 0 && (
                                            <p className="text-gray-500 text-sm mt-2">Todos los cupones ya están asignados a este usuario</p>
                                        )}
                                        <p className="text-gray-400 text-xs mt-2">
                                            💡 Los cupones asignados a otros usuarios se reasignarán automáticamente
                                        </p>
                                    </div>

                                    {/* Lista de asignados */}
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-2">
                                            Cupones Asignados ({ticketsAsignados.length})
                                        </h3>
                                        {ticketsAsignados.length === 0 ? (
                                            <p className="text-gray-500 text-sm">Este usuario no tiene cupones asignados</p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {ticketsAsignados.map((t) => (
                                                    <li key={t.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
                                                        <div className="flex items-center gap-3">
                                                            <FaTicketAlt className={t.activo_manual ? "text-green-500" : "text-gray-400"} />
                                                            <div>
                                                                <span className="font-medium">{t.titulo}</span>
                                                                {t.nombre_restaurante && (
                                                                    <span className="text-gray-500 text-sm ml-2">- {t.nombre_restaurante}</span>
                                                                )}
                                                                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${t.activo_manual
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-gray-200 text-gray-600'
                                                                    }`}>
                                                                    {t.activo_manual ? 'Activo' : 'Inactivo'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => desasignarTicket(t.id)}
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                            title="Desvincular"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAsignarRecursos;
