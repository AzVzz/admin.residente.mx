import React from 'react';
import { FaUser, FaCheck, FaTimes, FaBan, FaTrash } from 'react-icons/fa';

const TablaUsuariosB2B = ({ usuarios, toggleUserStatus, desactivarUsuarioB2B, handleDelete }) => {
    return (
        <div className="bg-white overflow-hidden h-full">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3">
                <h3 className="text-white font-semibold">Usuarios B2B</h3>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {usuarios.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-4 py-4 text-center text-gray-500">
                                    No hay usuarios B2B registrados
                                </td>
                            </tr>
                        ) : (
                            usuarios.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FaUser className="h-4 w-4 text-indigo-400 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">
                                                {user.nombre_usuario}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.estado === 'activo'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => toggleUserStatus(user.id, user.estado)}
                                                className={`${user.estado === 'activo'
                                                    ? 'text-red-600 hover:text-red-900'
                                                    : 'text-green-600 hover:text-green-900'
                                                    } cursor-pointer`}
                                                title={user.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                            >
                                                {user.estado === 'activo' ? <FaTimes /> : <FaCheck />}
                                            </button>
                                            {user.estado === 'activo' && (
                                                <button
                                                    onClick={() => desactivarUsuarioB2B(user)}
                                                    className="text-orange-600 hover:text-orange-900 cursor-pointer"
                                                    title="Desactivar B2B Completo"
                                                >
                                                    <FaBan />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-600 hover:text-red-900 cursor-pointer"
                                                title="Eliminar"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TablaUsuariosB2B;
