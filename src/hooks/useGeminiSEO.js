import { useState } from 'react';

// Función para obtener un mensaje amigable según el tipo de error
const getMensajeErrorAmigable = (error, response) => {
    // Errores de cuota/límite de requests
    if (error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('quota') ||
        error?.message?.includes('rate limit') ||
        error?.message?.toLowerCase().includes('too many requests') ||
        response?.status === 429) {
        return '🚫 El servicio de optimización con IA no está disponible en este momento. Por favor, intenta de nuevo en unos minutos.';
    }

    // Errores de red/conexión
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return '📡 Error de conexión. Verifica tu conexión a internet e intenta de nuevo.';
    }

    // Servicio no disponible
    if (response?.status >= 500 || error?.message?.includes('503') || error?.message?.includes('500')) {
        return '⚠️ El servicio de IA está temporalmente fuera de servicio. Por favor, intenta más tarde.';
    }

    // Error de autenticación
    if (response?.status === 401 || response?.status === 403) {
        return '🔐 Error de autenticación con el servicio de IA. Contacta al administrador.';
    }

    // Error de timeout
    if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
        return '⏱️ La solicitud tardó demasiado. Por favor, intenta de nuevo.';
    }

    // Error genérico con mensaje personalizado
    if (error?.message && !error.message.includes('Error al optimizar')) {
        return `❌ ${error.message}`;
    }

    // Error genérico
    return '❌ El servicio de optimización no está disponible en este momento. Puedes completar los campos SEO manualmente o intentar más tarde.';
};

export const useGeminiSEO = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const optimizarNota = async (notaData) => {
        setLoading(true);
        setError(null);

        let response;
        try {
            const apiUrl = import.meta.env.DEV
                ? '/api/gemini/optimize-seo-nota'
                : 'https://admin.residente.mx/api/gemini/optimize-seo-nota';

            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notaData)
            });

            const data = await response.json();

            if (!data.success) {
                const mensajeAmigable = getMensajeErrorAmigable({ message: data.error }, response);
                throw new Error(mensajeAmigable);
            }

            return data.seo;
        } catch (err) {
            const mensajeAmigable = err.message.startsWith('🚫') || err.message.startsWith('📡') ||
                err.message.startsWith('⚠️') || err.message.startsWith('🔐') ||
                err.message.startsWith('⏱️') || err.message.startsWith('❌')
                ? err.message
                : getMensajeErrorAmigable(err, response);
            setError(mensajeAmigable);
            throw new Error(mensajeAmigable);
        } finally {
            setLoading(false);
        }
    };

    const optimizarReceta = async (recetaData) => {
        setLoading(true);
        setError(null);

        let response;
        try {
            const apiUrl = import.meta.env.DEV
                ? '/api/gemini/optimize-seo-receta'
                : 'https://admin.residente.mx/api/gemini/optimize-seo-receta';

            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recetaData)
            });

            const data = await response.json();

            if (!data.success) {
                const mensajeAmigable = getMensajeErrorAmigable({ message: data.error }, response);
                throw new Error(mensajeAmigable);
            }

            return data.seo;
        } catch (err) {
            const mensajeAmigable = err.message.startsWith('🚫') || err.message.startsWith('📡') ||
                err.message.startsWith('⚠️') || err.message.startsWith('🔐') ||
                err.message.startsWith('⏱️') || err.message.startsWith('❌')
                ? err.message
                : getMensajeErrorAmigable(err, response);
            setError(mensajeAmigable);
            throw new Error(mensajeAmigable);
        } finally {
            setLoading(false);
        }
    };

    const optimizarRestaurante = async (restauranteData) => {
        setLoading(true);
        setError(null);

        let response;
        try {
            const apiUrl = import.meta.env.DEV
                ? '/api/gemini/optimize-seo-restaurante'
                : 'https://admin.residente.mx/api/gemini/optimize-seo-restaurante';

            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(restauranteData)
            });

            const data = await response.json();

            if (!data.success) {
                const mensajeAmigable = getMensajeErrorAmigable({ message: data.error }, response);
                throw new Error(mensajeAmigable);
            }

            return data.seo;
        } catch (err) {
            const mensajeAmigable = err.message.startsWith('🚫') || err.message.startsWith('📡') ||
                err.message.startsWith('⚠️') || err.message.startsWith('🔐') ||
                err.message.startsWith('⏱️') || err.message.startsWith('❌')
                ? err.message
                : getMensajeErrorAmigable(err, response);
            setError(mensajeAmigable);
            throw new Error(mensajeAmigable);
        } finally {
            setLoading(false);
        }
    };

    const optimizarCupon = async (cuponData) => {
        setLoading(true);
        setError(null);

        let response;
        try {
            const apiUrl = import.meta.env.DEV
                ? '/api/gemini/optimize-seo-cupon'
                : 'https://admin.residente.mx/api/gemini/optimize-seo-cupon';

            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cuponData)
            });

            const data = await response.json();

            if (!data.success) {
                const mensajeAmigable = getMensajeErrorAmigable({ message: data.error }, response);
                throw new Error(mensajeAmigable);
            }

            return data.seo;
        } catch (err) {
            const mensajeAmigable = err.message.startsWith('🚫') || err.message.startsWith('📡') ||
                err.message.startsWith('⚠️') || err.message.startsWith('🔐') ||
                err.message.startsWith('⏱️') || err.message.startsWith('❌')
                ? err.message
                : getMensajeErrorAmigable(err, response);
            setError(mensajeAmigable);
            throw new Error(mensajeAmigable);
        } finally {
            setLoading(false);
        }
    }

    return {
        optimizarNota,
        optimizarReceta,
        optimizarRestaurante,
        optimizarCupon,
        loading,
        error
    };
};
