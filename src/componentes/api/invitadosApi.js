// API para registro y gestión de invitados
import { urlApi } from "./url";

/**
 * Paso 1: Crea usuario en usuarios_residente
 * Paso 2: Guarda permisos en usuarios_invitados
 */
export const registrarInvitado = async (formData) => {
    // Paso 1: Registrar el usuario en usuarios_residente
    const registroResponse = await fetch(`${urlApi}api/usuarios/registro-invitados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre_usuario: formData.nombre_institucion || formData.nombre_usuario,
            correo: formData.correo,
            password: formData.password,
            logo_base64: formData.logo_base64,
            codigo: formData.codigo
        })
    });

    const registroData = await registroResponse.json();

    if (!registroResponse.ok) {
        throw new Error(registroData.error || 'Error al registrar invitado');
    }

    // Paso 2: Guardar permisos en usuarios_invitados
    if (registroData.usuario && registroData.usuario.id) {
        const permisosResponse = await fetch(`${urlApi}api/invitados`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: registroData.usuario.id,
                permiso_notas: formData.permiso_notas ? 1 : 0,
                permiso_recetas: formData.permiso_recetas ? 1 : 0
            })
        });

        await permisosResponse.json();
    }

    return registroData;
};

/**
 * Obtener permisos de un invitado por usuario_id
 */
export const obtenerPermisosInvitado = async (usuario_id, token) => {
    const response = await fetch(`${urlApi}api/invitados/usuario/${usuario_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener permisos');
    return data;
};

/**
 * Actualizar permisos de un invitado
 */
export const actualizarPermisosInvitado = async (usuario_id, permisos, token) => {
    const response = await fetch(`${urlApi}api/invitados/${usuario_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            permiso_notas: permisos.permiso_notas ? 1 : 0,
            permiso_recetas: permisos.permiso_recetas ? 1 : 0
        })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al actualizar permisos');
    return data;
};

/**
 * Obtener todos los invitados (admin)
 */
export const obtenerTodosInvitados = async (token) => {
    const response = await fetch(`${urlApi}api/invitados`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al obtener invitados');
    return data;
};
