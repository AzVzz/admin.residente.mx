import { useState } from 'react';

export const useGeminiSEO = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const optimizarNota = async (notaData) => {
        setLoading(true);
        setError(null);

        try {
            const apiUrl = import.meta.env.DEV
                ? '/api/gemini/optimize-seo-nota'
                : 'https://admin.residente.mx/api/gemini/optimize-seo-nota';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notaData)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al optimizar con IA');
            }

            return data.seo;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const optimizarReceta = async (recetaData) => {
        setLoading(true);
        setError(null);

        try {
            const apiUrl = import.meta.env.DEV
                ? '/api/gemini/optimize-seo-receta'
                : 'https://admin.residente.mx/api/gemini/optimize-seo-receta';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recetaData)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al optimizar con IA');
            }

            return data.seo;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        optimizarNota,
        optimizarReceta,
        loading,
        error
    };
};
