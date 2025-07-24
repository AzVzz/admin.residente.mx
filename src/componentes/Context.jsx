import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

const tipoNotaPorPermiso = {
    "mama-de-rocco": "Mamá de Rocco",
    "barrio-antiguo": "Barrio Antiguo",
    // agrega más si tienes
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [usuario, setUsuario] = useState(() => {
        const stored = localStorage.getItem('usuario');
        return stored ? JSON.parse(stored) : null;
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

    const saveToken = (newToken) => {
        setToken(newToken);
        if (newToken) {
            localStorage.setItem('token', newToken);
        } else {
            localStorage.removeItem('token');
        }
    };

    // Guarda el usuario en localStorage también
    const saveUsuario = (datosUsuario) => {
        setUsuario(datosUsuario);
        if (datosUsuario) {
           // localStorage.setItem('usuario', JSON.stringify(datosUsuario));
            setTipoNotaUsuario(tipoNotaPorPermiso[datosUsuario.permisos] || null);
        } else {
            //localStorage.removeItem('usuario');
            setTipoNotaUsuario(null);
        }
    };

    return (
        <AuthContext.Provider value={{ token, saveToken, usuario, saveUsuario, tipoNotaUsuario }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);