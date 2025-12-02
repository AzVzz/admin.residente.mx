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
