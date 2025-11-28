import { urlApi, imgApi } from './url.js';

// Recibe nombre_usuario y password, hace POST y retorna el token si es exitoso
export const loginPost = async (nombre_usuario, password) => {
    try {
        const response = await fetch(`${urlApi}api/usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre_usuario, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al iniciar sesión');
        }
        const data = await response.json();

        // Retorna el objeto completo con token y usuario
        return {
            token: data.token,
            usuario: data.usuario // ✅ Usar el objeto usuario completo del backend
        };
    } catch (error) {
        throw error;
    }
};