import { useState } from 'react';

const NotaPoster = ({ children, method = 'POST', id = null }) => {
    const [isPosting, setIsPosting] = useState(false);
    const [postError, setPostError] = useState(null);
    const [postResponse, setPostResponse] = useState(null);

    // Función para enviar datos de la nota
    const postNota = async (payload) => {
        setIsPosting(true);
        setPostError(null);
        setPostResponse(null);

        try {
            // Construir URL según el método
            let url = 'https://estrellasdenuevoleon.com.mx/api/notas';
            if (id && method === 'PUT') {
                url = `${url}/${id}`;
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...payload,
                    seccion: 'nota',        // Valor por defecto
                    categoria: 'Genuino'    // Valor por defecto
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setPostResponse(result);
            return result;
        } catch (error) {
            setPostError(error.message);
            throw error;
        } finally {
            setIsPosting(false);
        }
    };

    return children({
        postNota,
        isPosting,
        postError,
        postResponse
    });
};

export default NotaPoster;