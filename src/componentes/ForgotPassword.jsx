import React, { useState } from "react";
import { Link } from "react-router-dom";
import { urlApi } from "./api/url";
import axios from "axios";

const ForgotPassword = () => {
    const [correo, setCorreo] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(`${urlApi}api/usuarios/forgot-password`, {
                correo,
            });
            setMessage(response.data.message);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Ocurrió un error al intentar enviar el correo.";
            const errorDetails = err.response?.data?.details ? ` (${err.response.data.details})` : "";
            setError(errorMsg + errorDetails);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xs border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Recuperar Contraseña
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="correo"
                        >
                            Correo Electrónico
                        </label>
                        <input
                            id="correo"
                            type="email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="tu@email.com"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? "Enviando..." : "Enviar enlace"}
                    </button>
                </form>

                {message && (
                    <div className="mt-4 text-green-600 text-center text-sm">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-4 text-red-600 text-center text-sm">{error}</div>
                )}

                <div className="mt-4 text-center">
                    <Link to="/login" className="text-sm text-blue-500 hover:text-blue-800">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
