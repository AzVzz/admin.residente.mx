import React, { useState } from "react";
import { Link } from "react-router-dom";
import { urlApi } from "./api/url";
import axios from "axios";
import BotonesAnunciateSuscribirme from "./residente/componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "./residente/componentes/componentesColumna1/Infografia";
import DirectorioVertical from "./residente/componentes/componentesColumna2/DirectorioVertical";
import PortadaRevista from "./residente/componentes/componentesColumna2/PortadaRevista";

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
        <div className="max-w-[1080px] mx-auto py-8">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9">
                <div className="flex flex-col">
                    <div className="mb-8">
                        <h1 className="text-[40px] mb-8 text-center">Recuperar Contraseña</h1>

                        <div className="flex justify-center">
                            <form onSubmit={handleSubmit} className="">
                                <div className="mb-4 max-w-[250px]">
                                    <label
                                        className="space-y-2 font-roman font-bold"
                                        htmlFor="correo"
                                    >
                                        Correo Electrónico
                                    </label>
                                    <input
                                        id="correo"
                                        type="email"
                                        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm max-w-[250px]"
                                        placeholder="tu@email.com"
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[250px] ${loading ? "bg-gray-400 text-gray-600" : "bg-[#fff200] text-black"
                                        }`}
                                >
                                    {loading ? "Enviando..." : "Enviar enlace"}
                                </button>

                                {message && (
                                    <div className="mt-4 text-green-600 font-bold max-w-[250px]">
                                        {message}
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 text-red-600 font-bold max-w-[250px]">{error}</div>
                                )}

                                <div className="mt-4 max-w-[250px] text-center">
                                    <Link to="/registro" className="text-sm font-bold text-black hover:underline">
                                        Volver al registro
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Barra lateral */}
                <div className="flex flex-col items-end justify-start gap-10">
                    <DirectorioVertical />
                    <PortadaRevista />
                    <BotonesAnunciateSuscribirme />
                    <Infografia />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
