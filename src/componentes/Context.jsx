import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

const tipoNotaPorPermiso = {
    "mama-de-rocco": "Mamá de Rocco",
    "barrio-antiguo": "Barrio Antiguo",
    // agrega más si tienes
};

// Configuración de cookies y localStorage SEPARADAS de astro.residente.mx
// Usamos prefijo admin_ para evitar conflictos
const COOKIE_DOMAIN = '.residente.mx';
const AUTH_COOKIE_NAME = 'admin_auth_token';
const USER_COOKIE_NAME = 'admin_auth_usuario';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

// Keys de localStorage - También separadas
const TOKEN_STORAGE_KEY = 'admin_token';
const USER_STORAGE_KEY = 'admin_usuario';

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
    // Inicializar desde cookies primero (prioridad en producción)
    const [token, setToken] = useState(() => {
        // En localhost, localStorage tiene prioridad (cookies pueden fallar sin dominio)
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const stored = localStorage.getItem(TOKEN_STORAGE_KEY);

        if (!isLocalhost) {
            const { token: cookieToken } = readFromCookies();

            // Si hay cookie y es diferente (o local está vacío), cookie gana
            if (cookieToken && cookieToken !== stored) {
                return cookieToken;
            }
            // Si no hay cookie per local existe -> Logout (se cerró en otro lado)
            if (!cookieToken && stored) {
                return null;
            }
        }

        // Fallback: localStorage
        return stored;
    });

    const [usuario, setUsuario] = useState(() => {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const stored = localStorage.getItem(USER_STORAGE_KEY);

        if (!isLocalhost) {
            const { usuario: cookieUsuario } = readFromCookies();
            if (cookieUsuario) return cookieUsuario;
        }

        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return null;
            }
        }
        return null;
    });

    // Inicializa tipoNotaUsuario basado en el usuario almacenado
    const [tipoNotaUsuario, setTipoNotaUsuario] = useState(() => {
        if (usuario) {
            return tipoNotaPorPermiso[usuario.permisos] || null;
        }
        return null;
    });

    // Sincronizar estado inicial con localStorage si cambió por cookies
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

        // Si el estado actual (token) es diferente al stored, actualizar stored
        if (token && token !== storedToken) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
            if (usuario) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
            // También asegurar cookie
            syncToCookies(token, usuario);
        } else if (!token && storedToken) {
            // Si estado es null pero stored tenía algo, limpiar stored
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
        } else if (token && usuario) {
            // Asegurar cookie en mount
            syncToCookies(token, usuario);
        }
    }, []);

    const saveToken = (newToken) => {
        setToken(newToken);
        if (newToken) {
            localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        } else {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
        // Sincronizar a cookies
        syncToCookies(newToken, usuario);
    };

    // Guarda el usuario en localStorage y cookies
    const saveUsuario = (datosUsuario) => {
        setUsuario(datosUsuario);
        if (datosUsuario) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(datosUsuario));
            setTipoNotaUsuario(tipoNotaPorPermiso[datosUsuario.permisos] || null);
        } else {
            localStorage.removeItem(USER_STORAGE_KEY);
            setTipoNotaUsuario(null);
        }
        // Sincronizar a cookies
        syncToCookies(token, datosUsuario);
    };

    // Función para hacer logout completo (localStorage + cookies)
    const logout = () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
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