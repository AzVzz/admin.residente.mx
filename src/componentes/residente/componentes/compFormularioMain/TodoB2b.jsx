import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../Context';
import { urlApi } from '../../../api/url';
import { IoStorefront } from 'react-icons/io5';
import TablaUsuariosB2B from './TodoB2bComponentes/TablaUsuariosB2B';
import FormGoogleAnalytics from './TodoB2bComponentes/FormGoogleAnalytics';
import HistorialGoogleAnalytics from './TodoB2bComponentes/HistorialGoogleAnalytics';

const TodoB2b = () => {
    const { token } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const historialRef = useRef(null);

    // Función para refrescar el historial cuando se guarda
    const handleAnalyticsSave = () => {
        if (historialRef.current) {
            historialRef.current.refrescar();
        }
    };

    // Cargar usuarios B2B al montar el componente
    useEffect(() => {
        cargarUsuariosB2B();
    }, []);

    const cargarUsuariosB2B = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${urlApi}api/usuarios`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar usuarios');
            }

            const data = await response.json();
            // Filtrar solo usuarios B2B (rol = 'b2b')
            const usuariosB2B = data.filter(user =>
                user.rol?.toLowerCase() === 'b2b' || user.permisos?.toLowerCase() === 'b2b'
            );
            setUsuarios(usuariosB2B);
        } catch (err) {
            setError('Error al cargar usuarios B2B: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const response = await fetch(`${urlApi}api/usuarios/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estado: currentStatus === 'activo' ? 'inactivo' : 'activo'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cambiar estado del usuario');
            }

            await cargarUsuariosB2B();
        } catch (err) {
            setError(err.message);
        }
    };

    // Función para desactivar completamente un usuario B2B
    const desactivarUsuarioB2B = async (user) => {
        const mensaje = `¿Estás seguro de que quieres DESACTIVAR COMPLETAMENTE a este usuario B2B?

Esto desactivará:
• Su suscripción B2B
• Todos sus cupones/tickets
• Su restaurante
• Su cuenta de usuario

Usuario: ${user.nombre_usuario}
Correo: ${user.correo || 'N/A'}

Esta acción puede ser revertida activando manualmente cada elemento.`;

        if (!window.confirm(mensaje)) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Desactivar la suscripción B2B
            await fetch(`${urlApi}api/usuariosb2b/desactivar-por-usuario/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ suscripcion: false })
            });

            // 2. Desactivar todos los cupones/tickets del usuario
            await fetch(`${urlApi}api/tickets/desactivar-por-usuario/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ activo_manual: false })
            });

            // 3. Desactivar el restaurante del usuario
            await fetch(`${urlApi}api/restaurante/desactivar-por-usuario/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 0 })
            });

            // 4. Desactivar la cuenta del usuario
            const usuarioResponse = await fetch(`${urlApi}api/usuarios/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: 'inactivo' })
            });

            if (!usuarioResponse.ok) {
                const errorData = await usuarioResponse.json();
                throw new Error(errorData.error || 'Error al desactivar la cuenta del usuario');
            }

            await cargarUsuariosB2B();
            alert('✅ Usuario B2B desactivado completamente');

        } catch (err) {
            setError('Error al desactivar usuario B2B: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario B2B?')) {
            return;
        }

        try {
            const response = await fetch(`${urlApi}api/usuarios/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar usuario');
            }

            await cargarUsuariosB2B();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <IoStorefront className="mr-2" />
                    Panel B2B
                </h2>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {usuarios.length} usuarios
                </span>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-600">Cargando...</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {/* Fila superior: 2 cuadros */}
                    <div className="grid grid-cols-2">
                        <div className="bg-white min-h-[150px] overflow-hidden">
                            <HistorialGoogleAnalytics ref={historialRef} />
                        </div>
                        <div className="bg-white min-h-[150px] overflow-hidden">
                            <FormGoogleAnalytics onSave={handleAnalyticsSave} />
                        </div>
                    </div>

                    {/* Fila inferior: 3 cuadros */}
                    <div className="grid grid-cols-3">
                        <div className="bg-white p-6 min-h-[200px]">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Cuadro 3</h3>
                            <p className="text-gray-500">Contenido del cuadro 3</p>
                        </div>
                        <div className="bg-white p-6 min-h-[200px]">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Cuadro 4</h3>
                            <p className="text-gray-500">Contenido del cuadro 4</p>
                        </div>
                        {/* Cuadro 5: Tabla de usuarios B2B */}
                        <div className="min-h-[200px]">
                            <TablaUsuariosB2B
                                usuarios={usuarios}
                                toggleUserStatus={toggleUserStatus}
                                desactivarUsuarioB2B={desactivarUsuarioB2B}
                                handleDelete={handleDelete}
                            />
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default TodoB2b;

