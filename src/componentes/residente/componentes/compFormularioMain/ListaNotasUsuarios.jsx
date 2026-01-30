import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context';
import { useClientesValidos } from '../../../../hooks/useClientesValidos';
import { urlApi, imgApi } from '../../../api/url';
import { Link } from 'react-router-dom';
import { FaUser, FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaExternalLinkAlt, FaBan, FaPowerOff, FaLink } from 'react-icons/fa';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import ModalAsignarRecursos from './ModalAsignarRecursos';

const ListaNotasUsuarios = () => {
  const { token, usuario } = useAuth();
  const { recargarClientes } = useClientesValidos();
  const [usuarios, setUsuarios] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);

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
      'todos': 'Administrador (Todos)',
      'mama-de-rocco': 'Mamá de Rocco',
      'b2b': 'Usuario B2B'
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
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Estados para el modal de asignación de recursos
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [usuarioParaAsignar, setUsuarioParaAsignar] = useState(null);

  // Verificar si el usuario actual es admin/residente
  const esAdmin = usuario?.rol === 'residente' || usuario?.permisos === 'todos' || usuario?.permisos === 'todo';

  // Estados para el formulario de registro/edición
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    correo: '',
    password: '',
    confirmPassword: '',
    permisos: 'todos',
    rol: 'residente',
    estado: 'activo',
    // Campos B2B (UI por ahora)
    nombre_responsable: '',
    email_responsable: '',
    telefono_responsable: '',
    // Campos Vendedor
    nombre_completo: '',
    telefono: '',
    nombre_comercial: '',
    razon_social: '',
    rfc: '',
    direccion: '',
    terminos: false,
    logo_url: null
  });

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [sortOrder, setSortOrder] = useState('fecha_desc');

  // Filtrado y Ordenamiento de usuarios
  const usuariosFiltrados = usuarios.filter(user => {
    // 1. Filtro por búsqueda (nombre o correo)
    const normalizedSearch = searchTerm.toLowerCase();
    const matchSearch =
      (user.nombre_usuario && user.nombre_usuario.toLowerCase().includes(normalizedSearch)) ||
      (user.correo && user.correo.toLowerCase().includes(normalizedSearch));

    if (!matchSearch) return false;

    // 2. Filtro por Rol
    if (filterRol && user.rol !== filterRol) return false;

    return true;
  }).sort((a, b) => {
    // 3. Ordenamiento
    switch (sortOrder) {
      case 'fecha_asc':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'fecha_desc':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'nombre_asc':
        return a.nombre_usuario.localeCompare(b.nombre_usuario);
      case 'nombre_desc':
        return b.nombre_usuario.localeCompare(a.nombre_usuario);
      default:
        return 0;
    }
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    setError('');
    try {
      const [usuariosRes, restaurantesRes] = await Promise.all([
        fetch(`${urlApi}api/usuarios`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${urlApi}api/restaurante/basicos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!usuariosRes.ok) throw new Error('Error al cargar usuarios');

      const usuariosData = await usuariosRes.json();
      setUsuarios(usuariosData);

      if (restaurantesRes.ok) {
        const restaurantesData = await restaurantesRes.json();
        setRestaurantes(restaurantesData);
      }

    } catch (err) {
      setError('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'permisos') {
      let nuevoRol = formData.rol;

      if (value === 'todos') nuevoRol = 'residente';
      else if (value === 'b2b') nuevoRol = 'b2b';
      else if (value === 'vendedor') nuevoRol = 'vendedor';
      else if (value === 'mama-de-rocco') nuevoRol = 'colaborador';
      else nuevoRol = 'invitado'; // Por defecto para nuevo cliente y otros clientes existentes

      setFormData(prev => ({
        ...prev,
        permisos: value,
        rol: nuevoRol
      }));
    } else if (name === 'terminos') {
      setFormData(prev => ({
        ...prev,
        [name]: e.target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_usuario: '',
      correo: '',
      password: '',
      confirmPassword: '',
      permisos: 'todos',
      rol: '',
      estado: 'activo',
      nombre_responsable: '',
      email_responsable: '',
      telefono_responsable: '',
      nombre_comercial: '',
      razon_social: '',
      rfc: '',
      direccion: '',
      terminos: false,
      logo_url: null
    });
    setPermisoPersonalizado('');
    setLogoFile(null);
    setLogoPreview(null);
    setEditingUser(null);
    setShowRegistro(false);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      setFormData(prev => ({ ...prev, logo_url: null }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      e.target.value = '';
      return;
    }

    setLogoFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Subir el logo y obtener la URL
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('imagen', file);

      const uploadResponse = await fetch(`${urlApi}api/uploads/editor-image`, {
        method: 'POST',
        body: formDataUpload
      });

      if (!uploadResponse.ok) {
        let errorMessage = 'Error al subir el logo';
        try {
          const errorData = await uploadResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Error ${uploadResponse.status}: ${uploadResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const uploadData = await uploadResponse.json();

      // El servidor puede devolver la URL en diferentes formatos
      let logoUrl = uploadData.url || uploadData.path || uploadData.imageUrl || uploadData.data?.url;

      if (logoUrl) {
        // Limpiar la URL: eliminar espacios y asegurar formato correcto
        logoUrl = logoUrl.trim().replace(/\s+/g, '');

        // Asegurar que la URL tenga el protocolo correcto
        if (logoUrl.startsWith('http s://')) {
          logoUrl = logoUrl.replace('http s://', 'https://');
        } else if (logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
          // Si es http, convertir a https si es necesario
          logoUrl = logoUrl.replace('http://', 'https://');
        }

        // Validar que sea una URL válida
        try {
          new URL(logoUrl); // Esto lanzará un error si la URL no es válida
        } catch (urlError) {
          throw new Error('La URL del logo no es válida');
        }

        setFormData(prev => ({ ...prev, logo_url: logoUrl }));
        console.log('Logo subido exitosamente. URL:', logoUrl);
        setError(''); // Limpiar errores previos si la subida fue exitosa
      } else {
        throw new Error('No se recibió la URL del logo en la respuesta del servidor');
      }
    } catch (err) {
      setError('Error al subir el logo: ' + err.message);
      setLogoFile(null);
      setLogoPreview(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.nombre_usuario || !formData.password) {
      setError('Nombre de usuario y contraseña son obligatorios');
      return;
    }

    // Validar formato de correo solo si se proporciona uno
    if (formData.correo && formData.correo.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo)) {
        setError('El correo electrónico no tiene un formato válido');
        return;
      }
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

      // Lógica para evitar error de DB con B2B
      // Si el rol es B2B, enviamos permiso 'b2b' (o lo que esté seleccionado)
      let permisosEnvio = formData.permisos === 'nuevo-cliente' ? permisoPersonalizado : formData.permisos;

      // Generar correo automático si no se proporciona uno
      // Usar formato válido de email estándar para evitar problemas con validaciones del backend
      // Asegurar que siempre sea un string válido, nunca null o undefined
      let correoFinal = '';

      // Limpiar y validar el correo ingresado
      if (formData.correo && typeof formData.correo === 'string') {
        const correoLimpio = formData.correo.trim();
        if (correoLimpio !== '' && correoLimpio !== 'null' && correoLimpio !== 'undefined') {
          correoFinal = correoLimpio;
        }
      }

      // Si no hay correo válido, generar uno automático
      if (!correoFinal || correoFinal === '' || correoFinal === null || correoFinal === undefined) {
        // Limpiar el nombre de usuario para usarlo en el correo
        const nombreLimpio = (formData.nombre_usuario || 'usuario')
          .replace(/\s+/g, '')
          .replace(/[^a-zA-Z0-9]/g, '')
          .toLowerCase()
          .substring(0, 50); // Limitar longitud

        // Usar un formato de email estándar que pase validaciones
        correoFinal = `${nombreLimpio || 'usuario'}@no-reply.local`;
      }

      // Validación final: asegurar que el correo nunca sea null, undefined o string vacío
      if (!correoFinal || correoFinal.trim() === '' || correoFinal === null || correoFinal === undefined) {
        correoFinal = `usuario${Date.now()}@no-reply.local`;
      }

      // Validación final antes de enviar
      const datosEnvio = {
        nombre_usuario: formData.nombre_usuario,
        correo: correoFinal,
        password: formData.password,
        permisos: permisosEnvio,
        rol: formData.rol,
        estado: formData.estado,
        restaurante_id: null,
        enviar_correo: false,  // No enviar correo al crear usuario desde admin
        logo_url: formData.logo_url || null,  // Incluir logo_url si existe
        nombre_completo: formData.nombre_completo, // Para Vendedor
        telefono: formData.telefono // Para Vendedor
      };

      // Validación final antes de enviar: asegurar que correo nunca sea null o undefined
      if (!datosEnvio.correo || datosEnvio.correo === null || datosEnvio.correo === undefined || datosEnvio.correo.trim() === '') {
        const nombreLimpio = (formData.nombre_usuario || 'usuario')
          .replace(/\s+/g, '')
          .replace(/[^a-zA-Z0-9]/g, '')
          .toLowerCase()
          .substring(0, 50);
        datosEnvio.correo = `${nombreLimpio || 'usuario'}@no-reply.local`;
      }

      // Convertir a string explícitamente para evitar cualquier problema de tipo
      datosEnvio.correo = String(datosEnvio.correo).trim();

      console.log('Enviando datos:', {
        url,
        method,
        token: token ? 'Token presente' : 'Token faltante',
        correo_original: formData.correo,
        correo_final: datosEnvio.correo,
        tipo_correo: typeof datosEnvio.correo,
        logo_url: datosEnvio.logo_url,
        body: datosEnvio
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosEnvio)
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
    const permisosPredefinidos = ['todos', 'mama-de-rocco', 'b2b'];
    const permisoSeleccionado = permisosPredefinidos.includes(user.permisos) || permisosExistentes.includes(user.permisos)
      ? user.permisos
      : 'nuevo-cliente';

    setFormData({
      nombre_usuario: user.nombre_usuario,
      correo: user.correo || '',
      password: '',
      confirmPassword: '',
      permisos: permisoSeleccionado,
      rol: user.rol || '',
      estado: user.estado || 'activo',
      logo_url: user.logo_url || null
    });

    // Si es un permiso personalizado, ponerlo en el campo de texto
    if (permisoSeleccionado === 'nuevo-cliente') {
      setPermisoPersonalizado(user.permisos);
    } else {
      setPermisoPersonalizado('');
    }

    // Cargar logo existente si hay uno
    if (user.logo_url) {
      setLogoPreview(user.logo_url);
    } else {
      setLogoPreview(null);
    }
    setLogoFile(null); // No hay archivo nuevo al editar

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

  // 🆕 Función para desactivar completamente un usuario B2B
  // Desactiva: suscripción B2B, cupones/tickets, restaurantes y la cuenta de usuario
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
      // 1. Desactivar la suscripción B2B (usuarios_b2b.suscripcion = false)
      const b2bResponse = await fetch(`${urlApi}api/usuariosb2b/desactivar-por-usuario/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ suscripcion: false })
      });

      if (!b2bResponse.ok) {
        console.warn('No se encontró registro B2B o no se pudo actualizar');
      }

      // 2. Desactivar todos los cupones/tickets del usuario (activo_manual = false)
      const ticketsResponse = await fetch(`${urlApi}api/tickets/desactivar-por-usuario/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activo_manual: false })
      });

      if (!ticketsResponse.ok) {
        console.warn('No se encontraron tickets o no se pudieron desactivar');
      }

      // 3. Desactivar el restaurante del usuario (status = 0)
      const restauranteResponse = await fetch(`${urlApi}api/restaurante/desactivar-por-usuario/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 0 })
      });

      if (!restauranteResponse.ok) {
        console.warn('No se encontró restaurante o no se pudo desactivar');
      }

      // 4. Desactivar la cuenta del usuario (estado = 'inactivo')
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

      // Recargar la lista de usuarios
      await cargarUsuarios();
      alert('✅ Usuario B2B desactivado completamente');

    } catch (err) {
      setError('Error al desactivar usuario B2B: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  //const encabezadoTablaUsuarios = {
  //  "Usuario", 
  //  "Cliente",
  //  "Rol",
  //  "Estado",
  //  "Fecha Creación",
  //  "Página Cliente",
  //  "Acciones"
  //}

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaUser className="mr-2" />
          Gestión de Usuarios
        </h2>
        <button
          onClick={() => setShowRegistro(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
        >
          <FaUserPlus className="mr-2" />
          Nuevo Usuario
        </button>
      </div>


      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtrar Usuarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda por nombre/correo */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Buscar por nombre o correo</label>
            <input
              type="text"
              placeholder="Ej: Rocco, usuario@email.com..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Filtro por Rol */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Filtrar por Rol</label>
            <select
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Todos los roles</option>
              <option value="residente">Residente</option>
              <option value="colaborador">Colaborador</option>
              <option value="invitado">Invitado</option>
              <option value="b2b">B2B</option>
              <option value="vendedor">Vendedor</option>
            </select>
          </div>

          {/* Ordenar por */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ordenar por</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="fecha_desc">Fecha: Más recientes primero</option>
              <option value="fecha_asc">Fecha: Más antiguos primero</option>
              <option value="nombre_asc">Nombre: A - Z</option>
              <option value="nombre_desc">Nombre: Z - A</option>
            </select>
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {(searchTerm || filterRol || sortOrder !== 'fecha_desc') && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRol('');
                setSortOrder('fecha_desc');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* Formulario de registro/edición */}
      {showRegistro && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
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
                  Correo Electrónico <span className="text-gray-400 text-xs">(Opcional)</span>
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario/Permiso
                </label>
                <div className="flex space-x-2">
                  <select
                    name="permisos"
                    value={formData.permisos}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="usuario">Invitado</option>
                    <option value="todos">Administrador</option>
                    <option value="mama-de-rocco">Colaborador</option>
                    <option value="b2b">Usuario B2B</option>
                    <option value="vendedor">Vendedor</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Los permisos son los nombres de tus clientes. Cada cliente tendrá acceso solo a su contenido.
                </p>
              </div>

              {formData.permisos === 'vendedor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo (Vendedor)
                    </label>
                    <input
                      type="text"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono (Vendedor)
                    </label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {formData.permisos === 'nuevo-cliente' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subir Archivo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    {logoPreview && (
                      <div className="flex-shrink-0">
                        <img
                          src={logoPreview}
                          alt="Preview del logo"
                          className="h-16 w-16 object-contain border border-gray-300 rounded"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Sube el logo del cliente. Se mostrará en su página.
                  </p>
                </div>
              )}

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
                  Rol
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                  disabled
                >
                  <option value="">Seleccionar Rol</option>
                  <option value="residente">Residente</option>
                  <option value="colaborador">Colaborador</option>
                  <option value="invitado">Invitado</option>
                  <option value="b2b">B2B</option>
                  <option value="vendedor">Vendedor</option>
                </select>
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

            {/* Campos adicionales para B2B */}
            {formData.rol === 'b2b' && (
              <div className="mb-6 border-t pt-4">
                <h4 className="text-md font-bold text-gray-700 mb-4">Información del Negocio (B2B)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Responsable
                    </label>
                    <input
                      type="text"
                      name="nombre_responsable"
                      value={formData.nombre_responsable}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico del Responsable
                    </label>
                    <input
                      type="email"
                      name="email_responsable"
                      value={formData.email_responsable}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono_responsable"
                      value={formData.telefono_responsable}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Comercial
                    </label>
                    <input
                      type="text"
                      name="nombre_comercial"
                      value={formData.nombre_comercial}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razón Social
                    </label>
                    <input
                      type="text"
                      name="razon_social"
                      value={formData.razon_social}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RFC
                    </label>
                    <input
                      type="text"
                      name="rfc"
                      value={formData.rfc}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección Completa
                    </label>
                    <textarea
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Apartado de Tarjeta (Placeholder) */}
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded border border-gray-200">
                    <h5 className="text-sm font-bold text-gray-700 mb-2">Método de Pago (Tarjeta de Crédito/Débito)</h5>
                    <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded text-gray-400">
                      [Aquí irá el componente de pasarela de pago]
                    </div>
                  </div>

                  {/* Términos y Condiciones */}
                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="terminos"
                        checked={formData.terminos}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Acepto los <a href="#" className="text-blue-600 hover:underline">términos y condiciones de uso</a>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                    Rol
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
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No hay usuarios que coincidan con los filtros
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((user) => (
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.rol === 'b2b'
                          ? 'bg-indigo-100 text-indigo-800'
                          : user.permisos === 'todo' || user.permisos === 'todos'
                            ? 'bg-red-100 text-red-800'
                            : user.permisos === 'usuario'
                              ? 'bg-green-100 text-green-800'
                              : user.permisos === 'mama-de-rocco'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                          {user.rol === 'b2b' ? 'Usuario B2B' :
                            user.permisos === 'mama-de-rocco' ? 'Mamá de Rocco' :
                              user.permisos === 'todo' || user.permisos === 'todos' ? 'Administrador' :
                                user.permisos || 'usuario'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {user.rol
                            ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1)
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.estado === 'activo'
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
                        {user.permisos && user.permisos !== 'usuario' && user.permisos !== 'todo' && user.permisos !== 'todos' ? (() => {
                          // Lógica para determinar el enlace
                          let href = `/${user.permisos}`;
                          let disabled = false;

                          if (user.rol === 'b2b') {
                            // Buscar el restaurante asignado a este usuario
                            const restauranteAsignado = restaurantes.find(r => r.usuario_id === user.id);
                            if (restauranteAsignado && restauranteAsignado.slug) {
                              href = `/restaurantes/${restauranteAsignado.slug}`;
                            } else {
                              // Si es B2B pero no tiene restaurante asignado
                              disabled = true;
                            }
                          }

                          if (disabled) {
                            return (
                              <span className="inline-flex items-center px-3 py-1 border border-gray-200 text-xs font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed" title="Sin restaurante asignado">
                                <FaExternalLinkAlt className="mr-1" />
                                Ver Página
                              </span>
                            );
                          }

                          return (
                            <a
                              href={href}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                            >
                              <FaExternalLinkAlt className="mr-1" />
                              Ver Página
                            </a>
                          );
                        })() : (
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
                            className={`${user.estado === 'activo'
                              ? 'text-red-600 hover:text-red-900 cursor-pointer'
                              : 'text-green-600 hover:text-green-900'
                              }`}
                            title={user.estado === 'activo' ? 'Desactivar' : 'Activar'}
                          >
                            {user.estado === 'activo' ? <FaTimes /> : <FaCheck />}
                          </button>
                          {/* Botón especial para desactivar usuarios B2B completamente */}
                          {user.rol === 'b2b' && user.estado === 'activo' && (
                            <button
                              onClick={() => desactivarUsuarioB2B(user)}
                              className="text-orange-600 hover:text-orange-900 cursor-pointer"
                              title="Desactivar B2B Completo (suscripción, cupones, restaurante y cuenta)"
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
                          {/* Botón para asignar recursos (solo admin/residente) */}
                          {esAdmin && (
                            <button
                              onClick={() => {
                                setUsuarioParaAsignar(user);
                                setShowAsignarModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-900 cursor-pointer"
                              title="Asignar Recursos (Restaurante, Cupones)"
                            >
                              <FaLink />
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
        )}
      </div>

      {/* Modal para asignar recursos */}
      <ModalAsignarRecursos
        isOpen={showAsignarModal}
        onClose={() => {
          setShowAsignarModal(false);
          setUsuarioParaAsignar(null);
        }}
        usuario={usuarioParaAsignar}
        token={token}
        onAsignacionExitosa={() => {
          cargarUsuarios();
        }}
      />
    </div>
  );
};

export default ListaNotasUsuarios;
