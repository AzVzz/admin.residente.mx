import React, { useState, useEffect } from "react";
import { loginPost } from "./api/loginPost";
import { useAuth } from "./Context";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser } from "react-icons/fa6";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Login = ({ redirectTo }) => {
    const [nombre_usuario, setNombreUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { saveToken, saveUsuario, token, usuario } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Si ya está logeado, muestra el usuario
    if (usuario) {
        return (
            <span className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold text-white bg-black">
                <FaUser className="text-sm -mt-0.5 mr-2" />
                <span className="flex items-center">{usuario?.nombre_usuario}</span>
            </span>
        );
    }

    // Si no está logeado y no está en /login, redirige a /login con redirectTo
    useEffect(() => {
        if (!usuario && location.pathname !== "/login") {
            navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`, { replace: true });
        }
    }, [usuario, location, navigate]);

    // Obtén la ruta a la que regresar después de login
    const redirectAfterLogin = redirectTo || new URLSearchParams(location.search).get("redirectTo") || "/notas";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        try {
            const respuesta = await loginPost(nombre_usuario, password);
            saveToken(respuesta.token);
            saveUsuario(respuesta.usuario);
            setSuccess(true);
            navigate(redirectAfterLogin, { replace: true });
        } catch (err) {
            setError(err.message);
        }
    };

    // Formulario de login centrado solo en /login
    if (location.pathname === "/login") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xs border border-gray-200"
                >
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="usuario">
                            Usuario
                        </label>
                        <input
                            id="usuario"
                            type="text"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Usuario"
                            value={nombre_usuario}
                            onChange={e => setNombreUsuario(e.target.value)}
                            autoComplete="username"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline pr-10"
                                placeholder="Contraseña"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                className="absolute inset-y-0 right-0 flex items-center h-10 px-2 text-gray-500"
                                onClick={() => setShowPassword(v => !v)}
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
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                    >
                        Iniciar sesión
                    </button>
                    {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
                    {success && token && (
                        <div className="mt-4 text-green-600 text-center">¡Sesión iniciada correctamente!</div>
                    )}
                </form>
            </div>
        );
    }

    // Si no está logeado y no está en /login, no muestra nada (redirige)
    return null;
};

export default Login;