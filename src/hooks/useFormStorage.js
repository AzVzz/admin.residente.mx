
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'formCompletoData';

/**
 * Hook personalizado para gestionar el estado de un formulario en localStorage,
 * aislado por un ID único.
 *
 * @param {string} formId - El identificador único para los datos de este formulario.
 * @returns {{
 *   loadedData: object | null,
 *   saveFormData: (data: object) => void,
 *   removeFormData: () => void
 * }}
 *   - loadedData: Los datos recuperados del storage para el formId. Es null hasta que se carga.
 *   - saveFormData: Función para guardar los datos del formulario actual.
 *   - removeFormData: Función para eliminar los datos del formulario actual del storage.
 */
export const useFormStorage = (formId, options = {}) => {
  const { disabled = false } = options;
  const [loadedData, setLoadedData] = useState(null);

  // Si el hook está deshabilitado, no hace nada.
  if (disabled) {
    return {
      loadedData: null,
      saveFormData: () => {}, // Función vacía
      removeFormData: () => {}, // Función vacía
    };
  }

  // Efecto para cargar los datos iniciales desde localStorage cuando el componente se monta.
  useEffect(() => {
    if (!formId || disabled) return; // No hacer nada si no hay ID o está deshabilitado

    try {
      const allFormsDataString = localStorage.getItem(STORAGE_KEY);
      if (allFormsDataString) {
        const allFormsData = JSON.parse(allFormsDataString);
        // Establece los datos para este ID de formulario si existen, de lo contrario null.
        setLoadedData(allFormsData[formId] || null);
      } else {
        // Si la clave principal no existe, no hay datos cargados.
        setLoadedData(null);
      }
    } catch (error) {
      console.error("Error al leer desde localStorage:", error);
      setLoadedData(null); // En caso de error, no hay datos cargados.
    }
  }, [formId, disabled]);

  /**
   * Guarda los datos del formulario actual en localStorage.
   * Mantiene los datos de otros formularios intactos.
   */
  const saveFormData = useCallback((currentData) => {
    if (!formId || disabled) return;

    try {
      const allFormsDataString = localStorage.getItem(STORAGE_KEY);
      const allFormsData = allFormsDataString ? JSON.parse(allFormsDataString) : {};

      // Actualiza solo los datos para el formId actual
      const updatedAllFormsData = {
        ...allFormsData,
        [formId]: currentData,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAllFormsData));
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
    }
  }, [formId, disabled]);

  /**
   * Elimina los datos del formulario actual de localStorage.
   * Útil para limpiar el storage después de un envío exitoso.
   */
  const removeFormData = useCallback(() => {
    if (!formId || disabled) return;

    try {
      const allFormsDataString = localStorage.getItem(STORAGE_KEY);
      if (allFormsDataString) {
        const allFormsData = JSON.parse(allFormsDataString);
        
        // Elimina la propiedad correspondiente al formId
        delete allFormsData[formId];

        // Si quedan otros formularios, guarda el objeto actualizado.
        // Si no, elimina la clave principal para mantener limpio el storage.
        if (Object.keys(allFormsData).length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allFormsData));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error al eliminar desde localStorage:", error);
    }
  }, [formId, disabled]);

  return { loadedData, saveFormData, removeFormData };
};
