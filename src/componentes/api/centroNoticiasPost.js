import { urlApi } from "./url.js";

/**
 * Envía una noticia desde el formulario público "Centro de Noticias" (sin login).
 * La noticia entra al backend como BORRADOR (destacada_invitado) y queda
 * pendiente de revisión por un editor antes de publicarse.
 *
 * El backend compone el cuerpo de la nota (situación + datos duros + justificación)
 * y agrega un bloque de DATOS INTERNOS (contacto, fecha sugerida, enlace) que el
 * editor debe borrar antes de publicar. Debe llegar al menos material visual:
 * imagen adjunta O enlace (materialLink).
 *
 * @param {Object} d
 * @param {string} d.nombre            - Nombre/marca del negocio (obligatorio).
 * @param {string} d.categoria         - Value de categoría (obligatorio).
 * @param {string} d.situacion         - Novedad a comunicar (obligatorio).
 * @param {string} [d.datosDuros]      - Fecha, hora, dirección, protagonistas.
 * @param {string} d.justificacion     - Por qué es relevante (obligatorio).
 * @param {string} [d.fechaPublicacion]- Fecha sugerida de publicación.
 * @param {string} d.contactoNombre    - Nombre de contacto (obligatorio).
 * @param {string} d.contactoTelefono  - Teléfono directo (obligatorio).
 * @param {string} [d.materialLink]    - Enlace a fotos/logo en alta.
 * @param {string} d.codigo            - Código de acceso anti-spam (obligatorio).
 * @param {File}   [d.imagen]          - Imagen principal (opcional si hay enlace).
 * @returns {Promise<object>} - Respuesta del backend ({ success, message, id, slug }).
 */
export const centroNoticiasEnviar = async ({
  nombre,
  categoria,
  situacion,
  datosDuros,
  justificacion,
  fechaPublicacion,
  contactoNombre,
  contactoTelefono,
  materialLink,
  codigo,
  imagen,
}) => {
  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("categoria", categoria);
  formData.append("situacion", situacion);
  if (datosDuros) formData.append("datos_duros", datosDuros);
  formData.append("justificacion", justificacion);
  if (fechaPublicacion) formData.append("fecha_publicacion", fechaPublicacion);
  formData.append("contacto_nombre", contactoNombre);
  formData.append("contacto_telefono", contactoTelefono);
  if (materialLink) formData.append("material_link", materialLink);
  formData.append("codigo", codigo);
  if (imagen) formData.append("imagen", imagen);

  const response = await fetch(`${urlApi}api/notas/centro-noticias`, {
    method: "POST",
    // Sin header Content-Type: el navegador arma el boundary de multipart.
    // Sin Authorization: es un endpoint público protegido por código.
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Error HTTP: ${response.status}`);
  }
  return data;
};
