//src/componentes/api/catalogoSeccionesGet.js
import { urlApi } from './url.js'

export const catalogoSeccionesGet = async () => {
    try {
        const response = await fetch(`${urlApi}api/catalogo/secciones`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error("La API no devolvió success:true");
        return result.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

export const catalogoTipoNotaGet = async () => {
    try {
        const response = await fetch(`${urlApi}api/catalogo/tipo-nota`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error("La API no devolvió success:true");
        return result.data;
    } catch (error) {
        console.error("Error fetching data", error);
        throw error;
    }
}