import { useState, useEffect } from 'react';
import { urlApi } from '../../componentes/api/url.js'

const SeccionesDataFetcher = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${urlApi}/api/catalogo/secciones`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const jsonData = await response.json();
                setData(jsonData.data); // Accedemos a jsonData.data para obtener el array
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Función para exportar los datos (para usar en otros componentes)
    const getData = () => {
        return {
            data,
            loading,
            error
        };
    };

    if (loading) {
        return (
            <div className="p-4">
                <p className="text-blue-500">Cargando datos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="text-red-700">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Datos de la API</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
};

// Exportamos el componente y también una función para acceder a los datos
export default SeccionesDataFetcher;
export const useJsonData = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${urlApi}/api/catalogo/secciones`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const jsonData = await response.json();
                setData(jsonData.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};