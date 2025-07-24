import React, { useState } from "react";
import { loginPost } from "./api/loginPost";
import { useAuth } from "./Context";
import { useNavigate } from "react-router-dom";

const Login = ({ redirectTo = "/notas" }) => {
    const [nombre_usuario, setNombreUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const { saveToken, saveUsuario, token } = useAuth(); // ← FALTABA IMPORTAR saveUsuario
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        try {
            const respuesta = await loginPost(nombre_usuario, password);
            saveToken(respuesta.token);
            saveUsuario(respuesta.usuario); // Guarda el usuario completo
            setSuccess(true);
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err.message);
        }
    };

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
                    <input
                        id="password"
                        type="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Contraseña"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
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
};

export default Login;