import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import TerminosyCondiciones from "./TerminosyCondiciones";
import { extensionB2bPost, registrob2bPost } from "../../../api/registrob2bPost";

const FormMain = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre_responsable_restaurante: "",
    nombre_restaurante: "",
    telefono: "",
    correo: "",
    rfc: "",
    direccion_completa: "",
    razon_social: "",
    nombre_usuario: "",
    password: "",
  });
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const usuarioData = {
        nombre_usuario: formData.nombre_usuario,
        password: formData.password,
      };
      const usuarioRes = await registrob2bPost(usuarioData);

      const b2bData = {
        usuario_id: usuarioRes.usuario.id,
        nombre_responsable_restaurante: formData.nombre_responsable_restaurante,
        nombre_responsable: formData.nombre_responsable_restaurante,
        correo: formData.correo,
        telefono: formData.telefono,
        nombre_restaurante: formData.nombre_restaurante,
        rfc: formData.rfc,
        direccion_completa: formData.direccion_completa,
        razon_social: formData.razon_social,
        terminos_condiciones: true,
      };
      await extensionB2bPost(b2bData);

      setSuccessMsg("¡Registro exitoso!");
      setFormData({
        nombre_responsable_restaurante: "",
        nombre_restaurante: "",
        telefono: "",
        correo: "",
        rfc: "",
        direccion_completa: "",
        razon_social: "",
        nombre_usuario: "",
        password: "",
      });
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="py-8">
      <img
        className="w-25 pb-5"
        src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/b2b%20logo%20completo.png"
      />

      <h1 className="leading-tight text-2xl">Suscripción B2B</h1>

      <form onSubmit={handleSubmit}>
        {/* Campo nombre del responsable */}
        <div>
          <label className="space-y-2 font-roman font-bold">
            Nombre del responsable*
          </label>
          <input
            type="text"
            name="nombre_responsable_restaurante"
            value={formData.nombre_responsable_restaurante}
            onChange={handleChange}
            placeholder="Nombre del responsable"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        <div>
          <label className="space-y-2 font-roman font-bold">
            Nombre comercial del restaurante*
          </label>
          <input
            type="text"
            name="nombre_restaurante"
            value={formData.nombre_restaurante}
            onChange={handleChange}
            placeholder="Nombre del restaurante"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        <div>
          <label className="space-y-2 font-roman font-bold">
            Teléfono*
          </label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Teléfono del restaurante"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        <div>
          <label className="space-y-2 font-roman font-bold">
            Correo Electrónico*
          </label>
          <input
            type="text"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="Escribe tu correo electrónico"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        <div>
          <label className="space-y-2 font-roman font-bold">
            RFC*
          </label>
          <input
            type="text"
            name="rfc"
            value={formData.rfc}
            onChange={handleChange}
            placeholder="Escribe tu RFC"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        <div>
          <label className="space-y-2 font-roman font-bold">
            Dirección completa del restaurante*
          </label>
          <input
            type="text"
            name="direccion_completa"
            value={formData.direccion_completa}
            onChange={handleChange}
            placeholder="Calle, número, colonia, municipio, código postal"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        <div>
          <label className="space-y-2 font-roman font-bold">
            Razón Social*
          </label>
          <input
            type="text"
            name="razon_social"
            value={formData.razon_social}
            onChange={handleChange}
            placeholder="Escribe la razón social"
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
          />
        </div>

        <div>
          <label className="space-y-2 font-roman font-bold">
            Nombre de usuario*
          </label>
          <input
            type="text"
            name="nombre_usuario"
            value={formData.nombre_usuario}
            onChange={handleChange}
            placeholder="Tu nombre de usuario"
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
              placeholder="Escribe  contraseña"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-xl text-black cursor-pointer"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center space-y-2 font-roman font-bold space-x-2">
            <input type="checkbox" className="w-6 h-6" />
            <span>
              Acepto los{" "}
              <span
                className="text-blue-600 underline cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                Términos y Condiciones
              </span>
              *
            </span>
          </label>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded shadow-lg max-w-lg w-full p-6 relative overflow-y-auto max-h-[80vh]">
              <button
                className="absolute top-2 right-3 text-xl text-gray-600 cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
              <TerminosyCondiciones />
            </div>
          </div>
        )}

        {/* Mensaje de exito */}
        {successMsg && (
          <div className="text-green-600 font-bold text-center mt-4">{successMsg}</div>
        )}

        <button type="submit">
          <div className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6 w-full cursor-pointer">
            Crear cuenta
          </div>
        </button>
      </form>
    </div>
  );
};

export default FormMain;
