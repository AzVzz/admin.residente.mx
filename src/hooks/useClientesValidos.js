import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../componentes/Context';
import { urlApi, imgApi } from '../componentes/api/url';

// =============================================================================
// CACHÉ A NIVEL DE MÓDULO - Persiste entre navegaciones
// =============================================================================
let clientesCache = null;
let cacheTime = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutos

export const clearClientesCache = () => {
  clientesCache = null;
  cacheTime = 0;
};

const isCacheValid = () => {
  return clientesCache && Date.now() - cacheTime < CACHE_TTL;
};

// =============================================================================
// HOOK
// =============================================================================

export const useClientesValidos = () => {
  const { token } = useAuth();
  const [clientesValidos, setClientesValidos] = useState(
    clientesCache || ["mama-de-rocco", "barrio-antiguo", "otrocliente", "heybanco"]
  );
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Si tenemos caché válido, usarlo directamente
    if (isCacheValid()) {
      setClientesValidos(clientesCache);
      return;
    }

    // Evitar múltiples fetches simultáneos
    if (fetchedRef.current) return;

    cargarClientes();
  }, [token]);

  const cargarClientes = async () => {
    // Segunda verificación de caché (por si cambió mientras se ejecutaba)
    if (isCacheValid()) {
      setClientesValidos(clientesCache);
      return;
    }

    fetchedRef.current = true;
    setLoading(true);

    try {
      // If user is authenticated, try to get additional clients from API
      if (token) {
        const response = await fetch(`${urlApi}api/usuarios`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const usuarios = await response.json();
          const permisosUnicos = usuarios
            .map(user => user.permisos)
            .filter(permiso => permiso && permiso !== 'usuario' && permiso !== 'todo' && permiso !== 'todos')
            .filter((permiso, index, array) => array.indexOf(permiso) === index);

          const clientesPredefinidos = ["mama-de-rocco", "barrio-antiguo", "otrocliente", "heybanco"];
          const todosLosClientes = [
            ...new Set([...clientesPredefinidos, ...permisosUnicos])
          ];

          // Guardar en caché
          clientesCache = todosLosClientes;
          cacheTime = Date.now();

          setClientesValidos(todosLosClientes);
        } else {
          console.error('Error al cargar usuarios:', response.status, response.statusText);
          setClientesValidos(["mama-de-rocco", "barrio-antiguo", "otrocliente", "heybanco"]);
        }
      } else {
        // If not authenticated, just use predefined clients
        const clientesPredefinidos = ["mama-de-rocco", "barrio-antiguo", "otrocliente", "heybanco"];
        clientesCache = clientesPredefinidos;
        cacheTime = Date.now();
        setClientesValidos(clientesPredefinidos);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setClientesValidos(["mama-de-rocco", "barrio-antiguo", "otrocliente", "heybanco"]);
    } finally {
      setLoading(false);
      fetchedRef.current = false;
    }
  };

  return { clientesValidos, loading, recargarClientes: cargarClientes };
};
