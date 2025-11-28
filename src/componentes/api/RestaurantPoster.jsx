import { useState } from 'react';
import { urlApi, imgApi } from '../../componentes/api/url.js'

const RestaurantPoster = ({ children, method = 'POST', slug = null, token = null }) => {
    const [isPosting, setIsPosting] = useState(false);
    const [postError, setPostError] = useState(null);
    const [postResponse, setPostResponse] = useState(null);

    // Función para enviar datos principales
    const postRestaurante = async (payload) => {
        setIsPosting(true);
        setPostError(null);

        try {
            // Construir URL según el método
            let url = `${urlApi}api/restaurante`;
            if (method === 'PUT' && slug) {
                url = `${urlApi}api/restaurante/${slug}`;
            }

            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log("RestaurantPoster: Token received:", token ? "Yes" : "No");
            console.log("RestaurantPoster: Headers:", headers);

            const response = await fetch(url, {
                method: method,
                headers: headers,
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
            const url = `${urlApi}api/restaurante/${restaurantId}/imagenes`;

            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
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
            const url = `${urlApi}api/restaurante/${restaurantId}/fotos-lugar`;

            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
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

    const postLogo = async (restaurantId, formData) => {
        setIsPosting(true);
        try {
            const url = `${urlApi}api/restaurante/${restaurantId}/logo`;

            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en logo (${response.status}): ${errorText}`);
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
        postLogo,
        isPosting,
        postError,
        postResponse,
    });
};

export default RestaurantPoster;