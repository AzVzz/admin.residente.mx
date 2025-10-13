import { urlApi } from './url.js';

// Función para registrar un nuevo usuario
export const registroPost = async (nombre_usuario, password, confirmPassword) => {
    try {
        // Validaciones del lado del cliente
        if (!nombre_usuario || !password || !confirmPassword) {
            throw new Error('Todos los campos son obligatorios');
        }
        
        if (password !== confirmPassword) {
            throw new Error('Las contraseñas no coinciden');
        }
        
        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        
        if (nombre_usuario.length < 3) {
            throw new Error('El nombre de usuario debe tener al menos 3 caracteres');
        }

        const response = await fetch(`${urlApi}api/usuarios/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                nombre_usuario, 
                password,
                confirmPassword 
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al registrar usuario');
        }
        
        const data = await response.json();
        
        // Retorna el objeto completo con token y usuario
        return {
            token: data.token,
            usuario: {
                nombre_usuario,
                permisos: data.permisos || 'usuario'
            }
        };
    } catch (error) {
        throw error;
    }
};
