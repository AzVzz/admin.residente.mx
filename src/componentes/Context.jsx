import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";

const AuthContext = createContext();

const tipoNotaPorPermiso = {
  "mama-de-rocco": "Mamá de Rocco",
  "barrio-antiguo": "Barrio Antiguo",
  // agrega más si tienes
};

// Configuración de cookies COMPARTIDAS con astro.residente.mx
// Usamos prefijo residente_ para sesion unificada entre apps
const COOKIE_DOMAIN = ".residente.mx";
const AUTH_COOKIE_NAME = "residente_auth_token";
const USER_COOKIE_NAME = "residente_auth_usuario";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

// Keys de localStorage - compartidas (ambas apps corren en residente.mx)
const TOKEN_STORAGE_KEY = "residente_token";
const USER_STORAGE_KEY = "residente_usuario";

/**
 * Detecta si estamos en localhost o red local
 */
const isLocalhost = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  );
};

/**
 * Parsea document.cookie a un objeto clave-valor.
 * Maneja correctamente tokens JWT que contienen '=' (base64 padding).
 */
const parseCookies = () => {
  if (typeof document === "undefined") return {};
  return document.cookie.split(";").reduce((acc, cookie) => {
    const trimmed = cookie.trim();
    if (!trimmed) return acc;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return acc;
    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1);
    if (key) acc[key] = value;
    return acc;
  }, {});
};

/**
 * Genera la cadena base para cookies segun el entorno
 */
const getCookieBase = () => {
  const isSecure = window.location.protocol === "https:";
  if (isLocalhost()) {
    return `path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }
  return `path=/; domain=${COOKIE_DOMAIN}; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
};

/**
 * Genera la cadena base para eliminar cookies
 */
const getDeleteBase = () => {
  if (isLocalhost()) {
    return "path=/; max-age=0";
  }
  return `path=/; domain=${COOKIE_DOMAIN}; max-age=0`;
};

/**
 * Sincroniza el token y usuario a cookies con dominio compartido
 */
const syncToCookies = (token, usuario) => {
  if (typeof document === "undefined") return;

  const cookieBase = getCookieBase();
  const deleteBase = getDeleteBase();

  if (token) {
    document.cookie = `${AUTH_COOKIE_NAME}=${token}; ${cookieBase}`;
  } else {
    document.cookie = `${AUTH_COOKIE_NAME}=; ${deleteBase}`;
  }

  if (usuario) {
    document.cookie = `${USER_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(usuario))}; ${cookieBase}`;
  } else {
    document.cookie = `${USER_COOKIE_NAME}=; ${deleteBase}`;
  }
};

/**
 * Lee cookies existentes (por si viene de otro subdominio)
 */
const readFromCookies = () => {
  const cookies = parseCookies();

  const token = cookies[AUTH_COOKIE_NAME] || null;
  let usuario = null;

  if (cookies[USER_COOKIE_NAME]) {
    try {
      usuario = JSON.parse(decodeURIComponent(cookies[USER_COOKIE_NAME]));
    } catch (e) {
      console.warn("[Auth] Error parsing usuario cookie");
    }
  }

  return { token, usuario };
};

/**
 * Migracion unica: copia cookies viejas (admin_* / astro_*) a los nuevos nombres
 * unificados (residente_*) y elimina las viejas. Idempotente.
 */
const migrateOldCookies = () => {
  if (typeof document === "undefined") return;

  const cookies = parseCookies();
  const cookieBase = getCookieBase();
  const deleteBase = getDeleteBase();

  const oldTokenNames = ["admin_auth_token", "astro_auth_token"];
  const oldUserNames = ["admin_auth_usuario", "astro_auth_usuario"];

  if (!cookies[AUTH_COOKIE_NAME]) {
    for (const oldName of oldTokenNames) {
      if (cookies[oldName]) {
        document.cookie = `${AUTH_COOKIE_NAME}=${cookies[oldName]}; ${cookieBase}`;
        break;
      }
    }
  }

  if (!cookies[USER_COOKIE_NAME]) {
    for (const oldName of oldUserNames) {
      if (cookies[oldName]) {
        document.cookie = `${USER_COOKIE_NAME}=${cookies[oldName]}; ${cookieBase}`;
        break;
      }
    }
  }

  for (const oldName of [...oldTokenNames, ...oldUserNames]) {
    if (cookies[oldName]) {
      document.cookie = `${oldName}=; ${deleteBase}`;
    }
  }
};

/**
 * Migra keys viejas de localStorage (admin_token, astro_token, etc.)
 * a las nuevas keys unificadas. Ambas apps corren en residente.mx. Idempotente.
 */
const migrateOldLocalStorage = () => {
  if (typeof window === "undefined") return;

  const oldTokenKeys = ["admin_token", "astro_token"];
  const oldUserKeys = ["admin_usuario", "astro_usuario"];

  if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
    for (const oldKey of oldTokenKeys) {
      const value = localStorage.getItem(oldKey);
      if (value) {
        localStorage.setItem(TOKEN_STORAGE_KEY, value);
        break;
      }
    }
  }

  if (!localStorage.getItem(USER_STORAGE_KEY)) {
    for (const oldKey of oldUserKeys) {
      const value = localStorage.getItem(oldKey);
      if (value) {
        localStorage.setItem(USER_STORAGE_KEY, value);
        break;
      }
    }
  }

  for (const oldKey of [...oldTokenKeys, ...oldUserKeys]) {
    localStorage.removeItem(oldKey);
  }
};

/**
 * Lee el token inicial: cookie tiene prioridad en produccion,
 * localStorage como fallback. NO fuerza logout si cookie esta ausente
 * (puede ser un problema de parsing o timing).
 */
const getInitialToken = () => {
  const stored = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!isLocalhost()) {
    const { token: cookieToken } = readFromCookies();

    // Si hay cookie, usarla (fuente de verdad cross-subdomain)
    if (cookieToken) return cookieToken;

    // Si no hay cookie Y no hay localStorage, no hay sesion
    if (!stored) return null;

    // Si no hay cookie pero SI hay localStorage, usar localStorage
    // (puede ser primera visita o cookie aun no sincronizada)
    // NO forzar logout aqui - dejar que syncToCookies lo arregle
    return stored;
  }

  return stored;
};

/**
 * Lee el usuario inicial: cookie tiene prioridad en produccion
 */
const getInitialUsuario = () => {
  if (!isLocalhost()) {
    const { usuario: cookieUsuario } = readFromCookies();
    if (cookieUsuario) return cookieUsuario;
  }

  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  // Migrar datos viejos antes de leer estado
  if (typeof document !== "undefined") {
    migrateOldCookies();
    migrateOldLocalStorage();
  }

  const [token, setToken] = useState(getInitialToken);
  const [usuario, setUsuario] = useState(getInitialUsuario);
  const [tipoNotaUsuario, setTipoNotaUsuario] = useState(() => {
    const u = getInitialUsuario();
    return u ? tipoNotaPorPermiso[u.permisos] || null : null;
  });

  // Refs para evitar stale closures en saveToken/saveUsuario
  const tokenRef = useRef(token);
  const usuarioRef = useRef(usuario);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    usuarioRef.current = usuario;
  }, [usuario]);

  // Sincronizar estado inicial con localStorage y cookies
  useEffect(() => {
    if (token && usuario) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
      syncToCookies(token, usuario);
    } else if (token && !usuario) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else if (!token) {
      // Sin token = sin sesion, limpiar todo
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveToken = useCallback((newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    syncToCookies(newToken, usuarioRef.current);
  }, []);

  const saveUsuario = useCallback((datosUsuario) => {
    setUsuario(datosUsuario);
    if (datosUsuario) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(datosUsuario));
      setTipoNotaUsuario(tipoNotaPorPermiso[datosUsuario.permisos] || null);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      setTipoNotaUsuario(null);
    }
    syncToCookies(tokenRef.current, datosUsuario);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    syncToCookies(null, null);
    // Limpiar cookies legacy
    const deleteBase = getDeleteBase();
    document.cookie = `admin_auth_token=; ${deleteBase}`;
    document.cookie = `admin_auth_usuario=; ${deleteBase}`;
    setToken(null);
    setUsuario(null);
    setTipoNotaUsuario(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        saveToken,
        usuario,
        saveUsuario,
        tipoNotaUsuario,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
