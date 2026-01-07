import React, { useState, useEffect, useRef } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { registrarInvitado } from "../../../api/invitadosApi";
import { loginPost } from "../../../api/loginPost";
import { useAuth } from "../../../Context";
import { useNavigate } from "react-router-dom";
import DirectorioVertical from "../../componentes/componentesColumna2/DirectorioVertical";
import Infografia from "../../componentes/componentesColumna1/Infografia";
import BotonesAnunciateSuscribirme from "../../componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import PortadaRevista from "../../componentes/componentesColumna2/PortadaRevista";

const RegistroInvitados = () => {
  const navigate = useNavigate();
  const { saveToken, saveUsuario } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      // 1. Registrar al invitado
      await registrarInvitado({
        nombre_institucion: formData.nombre_institucion,
        correo: formData.correo,
        password: formData.password,
        logo_base64: logoBase64,
        codigo: formData.codigo,
        permiso_notas: permisoNotas,
        permiso_recetas: permisoRecetas,
      });

      setMsg("¡Registro exitoso! Iniciando sesión automáticamente...");

      // 2. Hacer login automático con las credenciales recién creadas
      try {
        const respuesta = await loginPost(formData.correo, formData.password);
        saveToken(respuesta.token);
        saveUsuario(respuesta.usuario);

        // 3. Guardar credenciales temporalmente para mostrar en el dashboard
        sessionStorage.setItem(
          "credenciales_nuevas",
          JSON.stringify({
            nombre_usuario: respuesta.usuario.nombre_usuario,
            password: formData.password,
            nombre_institucion: formData.nombre_institucion,
          })
        );

        // 4. Redirigir al dashboard
        setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      } catch (loginErr) {
        // Si falla el login automático, redirigir al login manual
        setMsg("¡Registro exitoso! Redirigiendo al login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-0 sm:max-w-[1080px] mx-auto py-4 sm:py-8">
      <div className="sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:gap-x-15 sm:gap-y-9">
        {/* Columna principal: formulario */}
        <div>
          <h1 className="text-3xl sm:text-2xl leading-[1.2] font-bold mb-3 sm:mb-4">
            Registro de Invitado
          </h1>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-0">
            {/* Nombre de Institución */}
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Nombre de Institución *
              </label>
              <input
                type="text"
                name="nombre_institucion"
                value={formData.nombre_institucion}
                onChange={handleChange}
                placeholder="Nombre de tu institución"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
                required
              />
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Correo electrónico *
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className={`bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border rounded-lg sm:rounded-md focus:outline-none focus:ring-2 font-family-roman text-lg sm:text-sm sm:mb-4 ${
                  emailExists || !emailValid
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                required
              />
              {checkingEmail && <p className="text-gray-500 text-xs mt-1">Verificando correo...</p>}
              {!emailValid && !checkingEmail && formData.correo && (
                <p className="text-red-500 text-sm mt-1 font-bold">⚠️ El formato del correo no es válido</p>
              )}
              {emailExists && emailValid && !checkingEmail && (
                <p className="text-red-500 text-sm mt-1 font-bold">⚠️ Este correo ya está registrado. Por favor, usa otro o inicia sesión.</p>
              )}
              {!emailExists && emailValid && !checkingEmail && formData.correo && formData.correo.includes("@") && (
                <p className="text-green-500 text-xs mt-1">✓ Correo disponible</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 pr-14 sm:pr-10 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 sm:right-3 top-1/2 -translate-y-1/2 sm:top-2 sm:translate-y-0 text-2xl sm:text-xl text-gray-600 sm:text-black cursor-pointer"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirma tu contraseña"
                  className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 pr-14 sm:pr-10 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 sm:right-3 top-1/2 -translate-y-1/2 sm:top-2 sm:translate-y-0 text-2xl sm:text-xl text-gray-600 sm:text-black cursor-pointer"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </div>

            {/* Código de Acceso */}
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Código de acceso *
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="Ingresa tu código de invitación"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Necesitas un código de invitación para registrarte
              </p>
            </div>

            {/* Permisos de Publicación - Fondo amarillo en móvil */}
            <div className="bg-white sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none sm:mb-4">
              <label className="block mb-3 sm:mb-2 font-roman font-bold text-base sm:text-sm">
                ¿Qué contenido publicarás? *
              </label>
              <div className="flex flex-col gap-3 sm:p-4 sm:border sm:border-gray-300 sm:rounded-md sm:bg-white">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permisoNotas}
                    onChange={(e) => setPermisoNotas(e.target.checked)}
                    className="w-6 sm:w-5 h-6 sm:h-5 accent-black sm:accent-[#fff200]"
                  />
                  <span className="text-base sm:text-sm font-roman">Publicar Notas</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permisoRecetas}
                    onChange={(e) => setPermisoRecetas(e.target.checked)}
                    className="w-6 sm:w-5 h-6 sm:h-5 accent-black sm:accent-[#fff200]"
                  />
                  <span className="text-base sm:text-sm font-roman">Publicar Recetas</span>
                </label>
              </div>
              <p className="text-red-600 sm:text-gray-500 text-xs mt-2 sm:mt-1">
                Debes seleccionar al menos una opción.
              </p>
            </div>

            {/* Subir Logo */}
            <div className="sm:mb-4">
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Logo de tu institución (Obligatorio)
              </label>

              {logoPreview && (
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-2 hidden sm:block">Vista previa:</p>
                  <img
                    src={logoPreview}
                    alt="Vista previa del logo"
                    className="max-w-[120px] sm:max-w-xs max-h-24 sm:max-h-48 object-contain rounded border border-gray-300"
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />
              <p className="text-xs text-gray-400 font-roman mt-1">
                Formato JPG o PNG, máx. 5MB
              </p>
            </div>

            {/* Mensajes de error/éxito */}
            {error && (
              <div className="text-red-600 text-base sm:text-sm font-bold text-center mt-4 p-4 sm:p-3 bg-red-50 border border-red-200 rounded-lg sm:rounded">
                {error}
              </div>
            )}
            {msg && (
              <div className="text-green-600 text-base sm:text-sm font-bold text-center mt-4 p-4 sm:p-3 bg-green-50 border border-green-200 rounded-lg sm:rounded">
                {msg}
              </div>
            )}

            {/* Botón de enviar - Igual que B2B */}
            <button
              type="submit"
              disabled={loading || emailExists || checkingEmail}
              className={`font-bold py-5 sm:py-2 px-4 rounded-xl sm:rounded w-full font-roman cursor-pointer bg-[#fff200] text-black text-xl sm:text-base mt-2 sm:mt-0 ${
                (loading || emailExists || checkingEmail) ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-400"
              }`}
            >
              {loading ? "Procesando..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        {/* Barra lateral - solo desktop */}
        <div className="hidden sm:flex flex-col items-end justify-start gap-10">
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
