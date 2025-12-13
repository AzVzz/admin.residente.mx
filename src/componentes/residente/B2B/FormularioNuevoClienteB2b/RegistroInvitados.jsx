import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { registroInvitadosPost } from "../../../api/registrob2bPost";
import { useNavigate } from "react-router-dom";

const RegistroInvitados = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nombre_institucion: "",
        correo: "",
        password: "",
        confirm_password: "",
        codigo: "", // ADDED
    });
    const [logoBase64, setLogoBase64] = useState("");
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoBase64(reader.result.split(",")[1]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMsg("");

        if (formData.password !== formData.confirm_password) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (!formData.nombre_institucion || !formData.correo || !formData.password || !formData.codigo) {
            setError("Todos los campos obligatorios deben ser completados, incluyendo el código de acceso");
            return;
        }

        setLoading(true);
        try {
            const data = await registroInvitadosPost({
                nombre_institucion: formData.nombre_institucion,
                correo: formData.correo,
                password: formData.password,
                logo_base64: logoBase64,
                codigo: formData.codigo, // ADDED
            });

            setMsg("¡Registro exitoso! Redirigiendo...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.message || "Error al registrar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-8 min-h-screen">
            <h1 className="leading-tight text-2xl">Registro de Invitados</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label className="space-y-2 font-roman font-bold">
                        Código de Acceso*
                    </label>
                    <input
                        type="text"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleChange}
                        placeholder="Ingresa tu código de invitación"
                        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                    />
                </div>

                <div>
                    <label className="space-y-2 font-roman font-bold">
                        Nombre de Restaurante*
                    </label>
                    <input
                        type="text"
                        name="nombre_institucion"
                        value={formData.nombre_institucion}
                        onChange={handleChange}
                        placeholder="Ej. Noreste Grill"
                        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                    />
                </div>

                <div>
                    <label className="space-y-2 font-roman font-bold">
                        Correo Electrónico*
                    </label>
                    <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        placeholder="correo@ejemplo.com"
                        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                    />
                </div>

                <div>
                    <label className="space-y-2 font-roman font-bold">
                        Contraseña*
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="********"
                            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm pr-10"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-2 text-xl text-black cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="space-y-2 font-roman font-bold">
                        Confirmar Contraseña*
                    </label>
                    <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        placeholder="********"
                        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                    />
                </div>

                <div>
                    <label className="space-y-2 font-roman font-bold">
                        Subir Logo (Opcional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                    />
                </div>

                {error && <div className="text-red-600 font-bold text-center mt-4">{error}</div>}
                {msg && <div className="text-green-600 font-bold text-center mt-4">{msg}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className={`font-bold py-2 px-4 rounded mt-4 w-full cursor-pointer ${loading
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-[#fff200] hover:bg-[#e6d900] text-black"
                        }`}
                >
                    {loading ? "Procesando..." : "Crear cuenta"}
                </button>
            </form>
        </div>
    );
};

export default RegistroInvitados;
