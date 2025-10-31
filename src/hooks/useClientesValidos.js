import { useState, useEffect } from 'react';
import { useAuth } from '../componentes/Context';
import { urlApi, imgApi } from '../componentes/api/url';

export const useClientesValidos = () => {
  const { token } = useAuth();
  const [clientesValidos, setClientesValidos] = useState(["mama-de-rocco", "barrio-antiguo", "otrocliente", "heybanco"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Always load clients, regardless of authentication status
    cargarClientes();
  }, [token]);

  const cargarClientes = async () => {
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
            .filter((permiso, index, array) => array.indexOf(permiso) === index); // Eliminar duplicados

          // Combinar clientes predefinidos con los de la base de datos
          const clientesPredefinidos = ["mama-de-rocco", "barrio-antiguo", "otrocliente", "heybanco"];
          const todosLosClientes = [
            ...new Set([...clientesPredefinidos, ...permisosUnicos])
          ];
          
          setClientesValidos(todosLosClientes);
        } else {
          console.error('Error al cargar usuarios:', response.status, response.statusText);
          // En caso de error, mantener los clientes predefinidos
          setClientesValidos(["mama-de-rocco", "barrio-antiguo", "otrocliente", "heybanco"]);
        }
      } else {
        // If not authenticated, just use predefined clients
        setClientesValidos(["mama-de-rocco", "barrio-antiguo", "otrocliente", "heybanco"]);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      // En caso de error, mantener los clientes predefinidos
      setClientesValidos(["mama-de-rocco", "barrio-antiguo", "otrocliente", "heybanco"]);
    } finally {
      setLoading(false);
    }
  };

  return { clientesValidos, loading, recargarClientes: cargarClientes };
};
