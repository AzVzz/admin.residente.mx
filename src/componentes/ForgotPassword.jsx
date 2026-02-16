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
      const response = await axios.post(
        `${urlApi}api/usuarios/forgot-password`,
        {
          correo,
        },
      );
      setMessage(response.data.message);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        "Ocurrió un error al intentar enviar el correo.";
      const errorDetails = err.response?.data?.details
        ? ` (${err.response.data.details})`
        : "";
      setError(errorMsg + errorDetails);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto py-8">
      <div className="flex justify-center items-center">
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex justify-center w-full">
              <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 border border-gray-200 w-full max-w-sm"
              >
                <h1 className="text-2xl font-bold text-center mb-2">
                  Recuperar Contraseña
                </h1>
                <p class="text-center text-gray-600 mb-8 text-sm">
                  Ingresa tu correo electrónico y te enviaremos un enlace para
                  restablecer tu contraseña
                </p>
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
                  className={`bg-[#fff200] cursor-pointer text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full drop-shadow-[1.5px_1.5px_0.9px_rgba(0,0,0,0.3)] hover:drop-shadow-[3px_3px_0.9px_rgba(0,0,0,0.3)] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>

                {message && (
                  <div className="mt-4 text-green-600 font-bold text-center text-sm">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="mt-4 text-red-600 font-bold text-center text-sm">
                    {error}
                  </div>
                )}

                <div className="mt-4 text-center">
                  <Link
                    to="/registro"
                    className="text-sm font-bold text-black hover:underline"
                  >
                    Volver al registro
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
