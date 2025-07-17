// src/componentes/api/RestaurantPoster.jsx
import { useState } from 'react';
const RestaurantPoster = ({ children, method = 'POST', slug = null }) => {
    const [isPosting, setIsPosting] = useState(false);
    const [postError, setPostError] = useState(null);
    const [postResponse, setPostResponse] = useState(null);

    // Función para enviar datos principales
    const postRestaurante = async (payload) => {
        setIsPosting(true);
        setPostError(null);

        try {
            // Construir URL según el método
            let url = 'https://estrellasdenuevoleon.com.mx/api/restaurante';
            if (method === 'PUT' && slug) {
                url = `https://estrellasdenuevoleon.com.mx/api/restaurante/${slug}`;
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
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

    // Nueva función para enviar imágenes
    const postImages = async (restaurantId, formData) => {
        setIsPosting(true);
        try {
            // Usar ID en la URL
            const url = `https://estrellasdenuevoleon.com.mx/api/restaurante/${restaurantId}/imagenes`;

            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en imágenes (${response.status}): ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            setPostError(error.message);
            throw error;
        } finally {
            setIsPosting(false);
        }
    };

    const postFotosLugar = async (restaurantId, formData) => {
        setIsPosting(true);
        try {
            const url = `https://estrellasdenuevoleon.com.mx/api/restaurante/${restaurantId}/fotos-lugar`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en fotos lugar (${response.status}): ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            setPostError(error.message);
            throw error;
        } finally {
            setIsPosting(false);
        }
    };

    return children({
        postRestaurante,
        postImages,
        postFotosLugar,
        isPosting,
        postError,
        postResponse,
    });
};

export default RestaurantPoster;