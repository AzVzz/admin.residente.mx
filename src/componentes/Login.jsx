import React, { useState, useEffect } from "react";
import { loginPost } from "./api/loginPost";
import { useAuth } from "./Context";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaUser } from "react-icons/fa6";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [nombre_usuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { saveToken, saveUsuario, token, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --------- helpers ---------
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const getFallbackByRole = (rol, permisos) => {
    const r = rol?.toLowerCase();
    if (r === "b2b") return "/dashboardb2b";
    if (r === "vendedor") return "/dashboard";
    // Para usuarios "residente", "invitado" o "colaborador", redirigir a /notas
    if (r === "residente" || r === "invitado" || r === "colaborador") return "/notas";
    return "/"; // otros roles
  };

  const rutaPermitidaParaRol = (rol, path, permisos) => {
    const r = rol?.toLowerCase();
    if (!path) return false;

    if (r === "b2b") {
      return path.startsWith("/dashboardb2b");
    }

    if (r === "vendedor") {
      return path.startsWith("/dashboard");
    }

    // residente, invitado y colaborador pueden ir a /notas y lo que cuelgue de ahí
    if (r === "residente" || r === "invitado" || r === "colaborador") {
      return path.startsWith("/notas");
    }

    return false;
  };

  // Si el token existe pero está expirado, limpia el contexto
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      saveToken(null);
      saveUsuario(null);
    }
  }, [token, saveToken, saveUsuario]);

  // Si ya está logeado y el token es válido, muestra el usuario
  if (usuario && token && !isTokenExpired(token)) {
    return (
      <span className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold text-white bg-black">
        <FaUser className="text-sm -mt-0.5 mr-2" />
        <span className="flex items-center mr-2">
          {usuario?.nombre_usuario}
        </span>
        <span className="text-xs uppercase tracking-wide">
          {usuario.rol}
        </span>
      </span>
    );
  }

  // Si no está logeado y no está en /login, redirige a /login con redirectTo
  useEffect(() => {
    if (!usuario && location.pathname !== "/login") {
      navigate(
        `/login?redirectTo=${encodeURIComponent(location.pathname)}`,
        { replace: true }
      );
    }
  }, [usuario, location, navigate]);

  // --------- handleSubmit con redirección por rol y mensaje de no-permiso ---------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const respuesta = await loginPost(nombre_usuario, password);
      saveToken(respuesta.token);
      saveUsuario(respuesta.usuario);
      setSuccess(true);

      const rol = respuesta.usuario?.rol;
      const permisos = respuesta.usuario?.permisos;
      const redirectToParam = new URLSearchParams(location.search).get(
        "redirectTo"
      );

      let destino;

      if (
        redirectToParam &&
        rutaPermitidaParaRol(rol, redirectToParam, permisos)
      ) {
        // La ruta que quería sí está permitida para su rol
        destino = redirectToParam;
      } else {
        if (redirectToParam && !rutaPermitidaParaRol(rol, redirectToParam, permisos)) {
          // Quería entrar a algo que NO puede
          setError(
            "No tienes permiso para acceder a esa sección. Te enviamos a tu panel principal."
          );
        }
        // Fallback según rol y permisos
        destino = getFallbackByRole(rol, permisos);
      }

      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };


  // Formulario de login centrado solo en /login
  if (location.pathname === "/login") {
    return (

      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex justify-center mb-4">
          <img
            src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/logo-r-residente-negro.webp"
            alt="Logo Residente"
            className="h-16 w-auto"
          />
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xs border border-gray-200"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Iniciar Sesión
          </h2>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="usuario"
            >
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Usuario"
              value={nombre_usuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline pr-10"
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
            className="bg-[#fff200] hover:bg-[#fff200] cursor-pointer text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Iniciar sesión
          </button>

          <div className="mt-4 text-center">
            <Link
              to="/recuperar-password"
              className="inline-block align-baseline font-bold text-sm text-black hover:text-black"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <div className="mt-4 text-red-600 text-center">{error}</div>
          )}
          {success && token && (
            <div className="mt-4 text-green-600 text-center">
              ¡Sesión iniciada correctamente!
            </div>
          )}
        </form>
      </div>
    );
  }

  return null;
};

export default Login;
