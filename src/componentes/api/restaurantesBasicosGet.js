import { urlApi, imgApi } from "./url.js";

export const restaurantesBasicosGet = async () => {
  try {
    // Intentar obtener token de cookie primero, luego de localStorage
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };

    const token =
      getCookie("residente_auth_token") ||
      localStorage.getItem("residente_token");
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${urlApi}api/restaurante/basicos`, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const result = await response.json();
    return result; // Array con id, nombre_restaurante, slug, secciones_categorias
  } catch (error) {
    console.error("Error fetching restaurantes básicos:", error);
    throw error;
  }
};
