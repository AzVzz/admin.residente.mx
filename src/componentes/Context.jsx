import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

const tipoNotaPorPermiso = {
    "mama-de-rocco": "Mamá de Rocco",
    "barrio-antiguo": "Barrio Antiguo",
    // agrega más si tienes
};

// Configuración de cookies compartidas entre subdominios
const COOKIE_DOMAIN = '.residente.mx';
const AUTH_COOKIE_NAME = 'auth_token';
const USER_COOKIE_NAME = 'auth_usuario';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

/**
 * Sincroniza el token y usuario a cookies con dominio compartido
 * para que astro.residente.mx pueda leer la sesión
 */
const syncToCookies = (token, usuario) => {
    if (typeof document === 'undefined') return;

    const isSecure = window.location.protocol === 'https:';
    const cookieBase = `path=/; domain=${COOKIE_DOMAIN}; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${isSecure ? '; Secure' : ''}`;

    if (token) {
        document.cookie = `${AUTH_COOKIE_NAME}=${token}; ${cookieBase}`;
    } else {
        document.cookie = `${AUTH_COOKIE_NAME}=; path=/; domain=${COOKIE_DOMAIN}; max-age=0`;
    }

    if (usuario) {
        document.cookie = `${USER_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(usuario))}; ${cookieBase}`;
    } else {
        document.cookie = `${USER_COOKIE_NAME}=; path=/; domain=${COOKIE_DOMAIN}; max-age=0`;
    }
};

/**
 * Lee cookies existentes (por si viene de otro subdominio)
 */
const readFromCookies = () => {
    if (typeof document === 'undefined') return { token: null, usuario: null };

    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    const token = cookies[AUTH_COOKIE_NAME] || null;
    let usuario = null;

    if (cookies[USER_COOKIE_NAME]) {
        try {
            usuario = JSON.parse(decodeURIComponent(cookies[USER_COOKIE_NAME]));
        } catch (e) {
            console.warn('Error parsing usuario cookie');
        }
    }

    return { token, usuario };
};

export const AuthProvider = ({ children }) => {
    // Inicializar desde localStorage primero, luego sincronizar con cookies
    const [token, setToken] = useState(() => {
        const stored = localStorage.getItem('token');
        if (stored) return stored;
        // Fallback: leer de cookies (si viene de otro subdominio)
        const { token: cookieToken } = readFromCookies();
        return cookieToken;
    });

    const [usuario, setUsuario] = useState(() => {
        const stored = localStorage.getItem('usuario');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return null;
            }
        }
        // Fallback: leer de cookies
        const { usuario: cookieUsuario } = readFromCookies();
        return cookieUsuario;
    });

    // Inicializa tipoNotaUsuario basado en el usuario almacenado
    const [tipoNotaUsuario, setTipoNotaUsuario] = useState(() => {
        const stored = localStorage.getItem('usuario');
        if (stored) {
            const usuarioGuardado = JSON.parse(stored);
            return tipoNotaPorPermiso[usuarioGuardado.permisos] || null;
        }
        return null;
    });

    // Sincronizar al montar si hay datos en localStorage pero no en cookies
    useEffect(() => {
        if (token && usuario) {
            syncToCookies(token, usuario);
        }
    }, []);

    const saveToken = (newToken) => {
        setToken(newToken);
        if (newToken) {
            localStorage.setItem('token', newToken);
        } else {
            localStorage.removeItem('token');
        }
        // Sincronizar a cookies
        syncToCookies(newToken, usuario);
    };

    // Guarda el usuario en localStorage y cookies
    const saveUsuario = (datosUsuario) => {
        setUsuario(datosUsuario);
        if (datosUsuario) {
            localStorage.setItem('usuario', JSON.stringify(datosUsuario));
            setTipoNotaUsuario(tipoNotaPorPermiso[datosUsuario.permisos] || null);
        } else {
            localStorage.removeItem('usuario');
            setTipoNotaUsuario(null);
        }
        // Sincronizar a cookies
        syncToCookies(token, datosUsuario);
    };

    // Función para hacer logout completo (localStorage + cookies)
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        syncToCookies(null, null);
        setToken(null);
        setUsuario(null);
        setTipoNotaUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ token, saveToken, usuario, saveUsuario, tipoNotaUsuario, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);