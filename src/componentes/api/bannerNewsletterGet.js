import { urlApi } from "./url";

export async function bannerNewsletterGetReciente() {
  const response = await fetch(`${urlApi}api/bannersnewsletter/reciente`);
  if (!response.ok) {
    throw new Error("No se pudo obtener el banner más reciente");
  }
  return await response.json();
}

export async function bannerNewsletterCrear({ texto, imagen }) {
  const formData = new FormData();
  formData.append("texto", texto);
  formData.append("imagen", imagen);

  const response = await fetch(`${urlApi}api/bannersnewsletter`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("No se pudo crear el banner");
  }
  return await response.json();
}