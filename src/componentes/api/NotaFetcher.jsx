import { useState, useEffect } from 'react';

const NotaFetcher = ({ children }) => {
    const [notas, setNotas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Función para obtener las notas
    const obtenerNotas = async (page = 1, limit = 20) => {
        setCargando(true);
        setError(null);
        try {
            const response = await fetch(`https://p.residente.mx/api/notas/todas?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();
            setNotas(data.notas); // Ajusta según la respuesta de tu API
            return data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setCargando(false);
        }
    };

    // Obtener notas al montar el componente
    useEffect(() => {
        obtenerNotas();
    }, []);

    return children({
        notas,
        cargando,
        error,
        recargarNotas: obtenerNotas
    });
};

export default NotaFetcher;