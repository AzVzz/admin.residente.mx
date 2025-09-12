// src/componentes/api/PromoPoster.jsx
import { useState } from 'react';

const PromoPoster = ({ children, method = 'POST', id = null }) => {
    const [isPosting, setIsPosting] = useState(false);
    const [postError, setPostError] = useState(null);
    const [postResponse, setPostResponse] = useState(null);

    const postPromo = async (payload) => {
        setIsPosting(true);
        setPostError(null);

        try {
            // Construir URL según el método
            let url = 'https://p.residente.mx/api/promociones';
            if (method === 'PUT' && id) {
                url = `https://p.residente.mx/api/promociones/${id}`;
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
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
        postPromo,
        isPosting,
        postError,
        postResponse,
    });
};

export default PromoPoster;