import React, { useState, useEffect } from "react";
import { loginPost } from "./api/loginPost";
import { useAuth } from "./Context";
import { FaUser } from "react-icons/fa6";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export default function LoginForm({
  onSuccess, // callback opcional
  showLoggedBadge = true, // si quieres mostrar el badge cuando ya está logeado
}) {
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const { saveToken, saveUsuario, token, usuario } = useAuth();

  // Leer correo/usuario de los parámetros de la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const correoParam = params.get('correo') || params.get('usuario');
    if (correoParam) {
      setIdentificador(correoParam);
      setShowWelcome(true);
    }
  }, []);

  // si token expiró, limpia
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      saveToken(null);
      saveUsuario(null);
    }
  }, [token, saveToken, saveUsuario]);

  // si ya está logeado y quieres badge
  if (showLoggedBadge && usuario && token && !isTokenExpired(token)) {
    return (
      <span className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold text-white bg-black">
        <FaUser className="text-sm -mt-0.5 mr-2" />
        <span className="flex items-center mr-2">
          {usuario?.nombre_usuario}
        </span>
        <span className="text-xs uppercase tracking-wide">{usuario.rol}</span>
      </span>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // evita doble submit

    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const respuesta = await loginPost(identificador, password);
      saveToken(respuesta.token);
      saveUsuario(respuesta.usuario);
      setSuccess(true);

      onSuccess?.(respuesta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="">
        <h2 className="leading-tight text-4xl text-center mb-4">Iniciar Sesión</h2>

        {showWelcome && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-center max-w-[250px]">
            ¡Cuenta creada! Ingresa tu contraseña para continuar.
          </div>
        )}

        <div className="mb-4 max-w-[250px]">
          <label className="space-y-2 font-roman font-bold" htmlFor="usuario">
            Correo o usuario
          </label>

          <input
            id="usuario"
            type="text"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm max-w-[250px]"
            placeholder="Correo o nombre de usuario"
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="mb-4 max-w-[250px]">
          <label className="space-y-2 font-roman font-bold" htmlFor="password">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm max-w-[250px]"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center h-10 px-2 text-gray-500"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <FaRegEye className="h-5 w-5" />
              ) : (
                <FaRegEyeSlash className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[250px] ${loading
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
            : "bg-[#fff200] text-black"
            }`}
        >
          {loading ? "Iniciando..." : "Iniciar sesión"}
        </button>

        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
        {success && token && (
          <div className="mt-4 text-green-600 text-center">
            ¡Sesión iniciada correctamente!
          </div>
        )}

        <div className="mt-4 text-center">
          <a href="/recuperar-password" className="text-sm font-bold text-black hover:underline cursor-pointer">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </form>
    </div>
  );
}