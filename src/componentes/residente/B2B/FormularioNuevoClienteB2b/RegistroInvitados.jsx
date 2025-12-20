import React, { useState, useEffect, useRef } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { registrarInvitado } from "../../../api/invitadosApi";
import { useNavigate } from "react-router-dom";
import DirectorioVertical from "../../componentes/componentesColumna2/DirectorioVertical";
import Infografia from "../../componentes/componentesColumna1/Infografia";
import BotonesAnunciateSuscribirme from "../../componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import PortadaRevista from "../../componentes/componentesColumna2/PortadaRevista";

const RegistroInvitados = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre_institucion: "",
    correo: "",
    password: "",
    confirm_password: "",
    codigo: "",
  });
  const [logoBase64, setLogoBase64] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [permisoNotas, setPermisoNotas] = useState(false);
  const [permisoRecetas, setPermisoRecetas] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para verificación de correo
  const [emailExists, setEmailExists] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailDebounceRef = useRef(null);

  // Verificar si el correo ya existe (con debounce)
  useEffect(() => {
    if (emailDebounceRef.current) {
      clearTimeout(emailDebounceRef.current);
    }

    const correo = formData.correo.trim();

    // Si no hay correo, resetear estado
    if (!correo) {
      setEmailExists(false);
      setEmailValid(true);
      setCheckingEmail(false);
      return;
    }

    // Validar formato básico antes de hacer petición
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setEmailExists(false);
      setEmailValid(false);
      setCheckingEmail(false);
      return;
    }

    setCheckingEmail(true);
    setEmailValid(true);

    emailDebounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          "https://admin.residente.mx/api/usuarios/verificar-correo",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo }),
          }
        );

        const data = await response.json();
        setEmailExists(data.exists === true);
        setEmailValid(data.valid !== false);
      } catch (error) {
        console.error("Error verificando correo:", error);
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);

    return () => {
      if (emailDebounceRef.current) {
        clearTimeout(emailDebounceRef.current);
      }
    };
  }, [formData.correo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Crear URL de vista previa
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);

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

    if (
      !formData.nombre_institucion ||
      !formData.correo ||
      !formData.password ||
      !formData.codigo ||
      !logoBase64
    ) {
      setError(
        "Todos los campos obligatorios deben ser completados, incluyendo el código de acceso y el logo."
      );
      return;
    }

    // Validar que el correo no exista
    if (emailExists) {
      setError("Este correo ya está registrado. Por favor usa otro.");
      return;
    }

    // Validar formato de correo
    if (!emailValid) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    if (!permisoNotas && !permisoRecetas) {
      setError("Debes seleccionar al menos un permiso: Notas o Recetas.");
      return;
    }

    setLoading(true);
    try {
      const data = await registrarInvitado({
        nombre_institucion: formData.nombre_institucion,
        correo: formData.correo,
        password: formData.password,
        logo_base64: logoBase64,
        codigo: formData.codigo,
        permiso_notas: permisoNotas,
        permiso_recetas: permisoRecetas,
      });

      setMsg("¡Registro exitoso! Redirigiendo...");
      setTimeout(() => navigate("/registro"), 2000);
    } catch (err) {
      setError(err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9">
        {/* Columna principal: formulario */}
        <div>
          <h1 className="text-[40px] leading-[1.2] font-bold mb-4 text-center">
            Registro de Invitados
          </h1>

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

            <div className="mt-4">
              <label className="space-y-2 font-roman font-bold">
                Nombre de Institución o Empresa* (Este será tu nombre de
                usuario)
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

            <div className="mt-4">
              <label className="space-y-2 font-roman font-bold">
                Correo Electrónico*
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="Escribe tu correo electrónico"
                className={`bg-white w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 font-family-roman font-bold text-sm ${
                  emailExists || !emailValid
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {checkingEmail && (
                <p className="text-gray-500 text-xs mt-1">
                  Verificando correo...
                </p>
              )}
              {!emailValid && !checkingEmail && formData.correo && (
                <p className="text-red-500 text-sm mt-1 font-bold">
                  ⚠️ El formato del correo no es válido
                </p>
              )}
              {emailExists && emailValid && !checkingEmail && (
                <p className="text-red-500 text-sm mt-1 font-bold">
                  ⚠️ Este correo ya está registrado. Por favor, usa otro o
                  inicia sesión.
                </p>
              )}
              {!emailExists &&
                emailValid &&
                !checkingEmail &&
                formData.correo &&
                formData.correo.includes("@") && (
                  <p className="text-green-500 text-xs mt-1">
                    ✓ Correo disponible
                  </p>
                )}
              <div className="mb-4"></div>
            </div>

            <div className="mt-4">
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

            <div className="mt-4">
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

            <div className="mt-4">
              <label className="space-y-2 font-roman font-bold">
                Subir Logo*
              </label>

              {/* Mostrar vista previa del logo seleccionado */}
              {logoPreview && (
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-2">Vista previa:</p>
                  <img
                    src={logoPreview}
                    alt="Vista previa del logo"
                    className="max-w-xs max-h-48 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
              />
              <p className="text-xs text-gray-400 font-roman">
                Formato JPG o PNG, máx. 5MB
              </p>
            </div>

            <div className="mt-4">
              <label className="space-y-2 font-roman font-bold block mb-2">
                Permisos de Publicación*
              </label>
              <div className="flex flex-col gap-3 p-4 border border-gray-300 rounded-md bg-white">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permisoNotas}
                    onChange={(e) => setPermisoNotas(e.target.checked)}
                    className="w-5 h-5 accent-[#fff200]"
                  />
                  <span className="font-roman text-sm">Publicar Notas</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permisoRecetas}
                    onChange={(e) => setPermisoRecetas(e.target.checked)}
                    className="w-5 h-5 accent-[#fff200]"
                  />
                  <span className="font-roman text-sm">Publicar Recetas</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selecciona al menos una opción
              </p>
            </div>

            {error && (
              <div className="text-red-600 font-bold text-center mt-4">
                {error}
              </div>
            )}
            {msg && (
              <div className="text-green-600 font-bold text-center mt-4">
                {msg}
              </div>
            )}

            <div className="flex justify-center mt-5">
              <button
                type="submit"
                disabled={loading || emailExists || checkingEmail}
                className={`inline-flex items-center justify-center font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[250px] h-[40px] text-sm uppercase ${
                  loading || emailExists || checkingEmail
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#fff200] text-black"
                }`}
              >
                {loading ? "Procesando..." : "Crear cuenta"}
              </button>
            </div>
          </form>
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

export default RegistroInvitados;
