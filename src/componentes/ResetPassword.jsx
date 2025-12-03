import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { urlApi } from "./api/url";
import axios from "axios";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(`${urlApi}api/usuarios/reset-password`, {
                token,
                newPassword,
            });
            // Mostrar el usuario que se actualizó para depuración
            const usuarioActualizado = res.data.debug_info ? res.data.debug_info.usuario : 'Desconocido';
            setMessage(`Contraseña actualizada para el usuario: ${usuarioActualizado}. Redirigiendo...`);

            setTimeout(() => {
                navigate("/login");
            }, 5000);
        } catch (err) {
            setError(
                err.response?.data?.error || "Error al restablecer la contraseña."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xs border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Restablecer Contraseña
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="newPassword"
                        >
                            Nueva Contraseña
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                                placeholder="********"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
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

                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="confirmPassword"
                        >
                            Confirmar Contraseña
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="********"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? "Guardando..." : "Cambiar Contraseña"}
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
            </div>
        </div>
    );
};

export default ResetPassword;
