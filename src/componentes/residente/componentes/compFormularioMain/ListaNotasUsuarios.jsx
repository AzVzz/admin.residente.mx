import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context';
import { useClientesValidos } from '../../../../hooks/useClientesValidos';
import { urlApi, imgApi } from '../../../api/url';
import { Link } from 'react-router-dom';
import { FaUser, FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

const ListaNotasUsuarios = () => {
  const { token, usuario } = useAuth();
  const { recargarClientes } = useClientesValidos();
  const [usuarios, setUsuarios] = useState([]);
  
  // Obtener permisos únicos de los usuarios existentes
  const obtenerPermisosUnicos = () => {
    const permisos = usuarios.map(user => user.permisos).filter(Boolean);
    const permisosUnicos = [...new Set(permisos)];
    return permisosUnicos;
  };

  const permisosExistentes = obtenerPermisosUnicos();

  // Función para formatear nombres de permisos
  const formatearPermiso = (permiso) => {
    const nombresPermisos = {
      'usuario': 'Usuario General',
      'todo': 'Administrador (Todo)',
      'mama-de-rocco': 'Mamá de Rocco',
      'barrio-antiguo': 'Barrio Antiguo'
    };
    
    return nombresPermisos[permiso] || permiso.charAt(0).toUpperCase() + permiso.slice(1).replace(/-/g, ' ');
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegistro, setShowRegistro] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [permisoPersonalizado, setPermisoPersonalizado] = useState('');

  // Estados para el formulario de registro/edición
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    password: '',
    confirmPassword: '',
    permisos: 'usuario',
    estado: 'activo'
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
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
      setUsuarios(data);
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      nombre_usuario: '',
      password: '',
      confirmPassword: '',
      permisos: 'usuario',
      estado: 'activo'
    });
    setPermisoPersonalizado('');
    setEditingUser(null);
    setShowRegistro(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.nombre_usuario || !formData.password) {
      setError('Nombre de usuario y contraseña son obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.permisos === 'nuevo-cliente' && !permisoPersonalizado.trim()) {
      setError('Debes escribir el nombre del cliente');
      return;
    }

    try {
      const url = editingUser 
        ? `${urlApi}api/usuarios/${editingUser.id}`
        : `${urlApi}api/usuarios`;
      
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre_usuario: formData.nombre_usuario,
          password: formData.password,
          permisos: formData.permisos === 'nuevo-cliente' ? permisoPersonalizado : formData.permisos,
          estado: formData.estado
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar la solicitud');
      }

      // Recargar la lista de usuarios y clientes
      await cargarUsuarios();
      await recargarClientes();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    
    // Si el permiso no está en las opciones predefinidas, usar "nuevo-cliente"
    const permisosPredefinidos = ['usuario', 'todo', 'todos', 'mama-de-rocco', 'barrio-antiguo'];
    const permisoSeleccionado = permisosPredefinidos.includes(user.permisos) || permisosExistentes.includes(user.permisos)
      ? user.permisos 
      : 'nuevo-cliente';
    
    setFormData({
      nombre_usuario: user.nombre_usuario,
      password: '',
      confirmPassword: '',
      permisos: permisoSeleccionado,
      estado: user.estado || 'activo'
    });
    
    // Si es un permiso personalizado, ponerlo en el campo de texto
    if (permisoSeleccionado === 'nuevo-cliente') {
      setPermisoPersonalizado(user.permisos);
    } else {
      setPermisoPersonalizado('');
    }
    
    setShowRegistro(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
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

      await cargarUsuarios();
      await recargarClientes();
    } catch (err) {
      setError(err.message);
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

      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaUser className="mr-2" />
          Gestión de Clientes
        </h2>
        <button
          onClick={() => setShowRegistro(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
        >
          <FaUserPlus className="mr-2" />
          Nuevo Cliente
        </button>
      </div>


      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Formulario de registro/edición */}
      {showRegistro && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Cliente'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  name="nombre_usuario"
                  value={formData.nombre_usuario}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente/Permiso
                </label>
                <div className="flex space-x-2">
                  <select
                    name="permisos"
                    value={formData.permisos}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="usuario">Usuario General</option>
                    <option value="todo">Administrador (Todo)</option>
                    <option value="todos">Administrador (Todos)</option>
                    <option value="mama-de-rocco">Mamá de Rocco</option>
                    <option value="barrio-antiguo">Barrio Antiguo</option>
                    
                    {/* Mostrar permisos existentes que no están en las opciones predefinidas */}
                    {permisosExistentes
                      .filter(permiso => !['usuario', 'todo', 'todos', 'mama-de-rocco', 'barrio-antiguo'].includes(permiso))
                      .map(permiso => (
                        <option key={permiso} value={permiso}>
                          {formatearPermiso(permiso)}
                        </option>
                      ))
                    }
                    
                    <option value="nuevo-cliente">+ Nuevo Cliente</option>
                  </select>
                  {formData.permisos === 'nuevo-cliente' && (
                    <input
                      type="text"
                      value={permisoPersonalizado}
                      onChange={(e) => setPermisoPersonalizado(e.target.value)}
                      placeholder="Nombre del cliente (ej: restaurante-nuevo)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Los permisos son los nombres de tus clientes. Cada cliente tendrá acceso solo a su contenido.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editingUser && '(dejar vacío para mantener la actual)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!editingUser}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                  >
                    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingUser ? 'Actualizar' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="bg-white border rounded-lg shadow-md">
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Página Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  usuarios.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUser className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.nombre_usuario}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.permisos === 'todo' || user.permisos === 'todos'
                            ? 'bg-red-100 text-red-800'
                            : user.permisos === 'usuario'
                            ? 'bg-green-100 text-green-800'
                            : user.permisos === 'mama-de-rocco'
                            ? 'bg-purple-100 text-purple-800'
                            : user.permisos === 'barrio-antiguo'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.permisos === 'mama-de-rocco' ? 'Mamá de Rocco' :
                           user.permisos === 'barrio-antiguo' ? 'Barrio Antiguo' :
                           user.permisos === 'todo' || user.permisos === 'todos' ? 'Administrador' :
                           user.permisos === 'usuario' ? 'Usuario General' :
                           user.permisos || 'usuario'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.estado === 'activo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.permisos && user.permisos !== 'usuario' && user.permisos !== 'todo' && user.permisos !== 'todos' ? (
                          <Link
                            to={`/${user.permisos}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaExternalLinkAlt className="mr-1" />
                            Ver Página
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer"
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id, user.estado)}
                            className={`${
                              user.estado === 'activo'
                                ? 'text-red-600 hover:text-red-900 cursor-pointer'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={user.estado === 'activo' ? 'Desactivar' : 'Activar'}
                          >
                            {user.estado === 'activo' ? <FaTimes /> : <FaCheck />}
                          </button>
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
        )}
      </div>
    </div>
  );
};

export default ListaNotasUsuarios;
