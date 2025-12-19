import { urlApi } from "./url";


export const extensionB2bPost = async (formData) => {
  const response = await fetch(`${urlApi}api/usuariosb2b`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al crear extensión B2B');
  return data;
};

export const registrob2bPost = async (formData) => {
  const response = await fetch(`${urlApi}api/usuarios/registro-formulario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al registrar usuario B2B');
  return data;
};

export const registroInvitadosPost = async (formData) => {
  // Paso 1: Registrar el usuario
  const response = await fetch(`${urlApi}api/usuarios/registro-invitados`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre_usuario: formData.nombre_institucion || formData.nombre_usuario,
      correo: formData.correo,
      password: formData.password,
      logo_base64: formData.logo_base64,
      codigo: formData.codigo,
      permiso_notas: formData.permiso_notas,
      permiso_recetas: formData.permiso_recetas
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al registrar invitado');

  // Paso 2: Guardar permisos en la nueva API /api/invitados
  if (data.usuario && data.usuario.id) {
    try {
      const permisosResponse = await fetch(`${urlApi}api/invitados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: data.usuario.id,
          permiso_notas: formData.permiso_notas,
          permiso_recetas: formData.permiso_recetas
        })
      });
      const permisosData = await permisosResponse.json();
      console.log('Permisos guardados:', permisosData);
    } catch (permisosError) {
      console.error('Error al guardar permisos:', permisosError);
      // No fallar el registro si los permisos no se guardan
    }
  }

  return data;
};
