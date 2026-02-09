import React, { useState, useEffect, useRef } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { consejerosPost } from "../../../api/consejerosApi.js";
import { loginPost } from "../../../api/loginPost";
import { useAuth } from "../../../Context";
import { useNavigate } from "react-router-dom";
import DirectorioVertical from "../../../residente/componentes/componentesColumna2/DirectorioVertical";
import Infografia from "../../../residente/componentes/componentesColumna1/Infografia";
import BotonesAnunciateSuscribirme from "../../../residente/componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import PortadaRevista from "../componentesColumna2/PortadaRevista";

const OpinionEditorial = () => {
  const { saveToken, saveUsuario } = useAuth();
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    password: "",
    confirm_password: "",
    correo: "",
    nombre: "",
    anio_nacimiento: "",
    lugar_nacimiento: "",
    curriculum: "",
    instagram: "",
    facebook: "",
    otras_redes: "",
    codigo: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fotografia, setFotografia] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // Estados para verificación de nombre de usuario
  const [usernameExists, setUsernameExists] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameDebounceRef = useRef(null);

  // Estados para verificación de correo
  const [emailExists, setEmailExists] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailDebounceRef = useRef(null);

  // Verificación de nombre de usuario con debounce
  useEffect(() => {
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    const nombreUsuario = formData.nombre_usuario.trim();

    // Si no hay nombre de usuario, resetear estado
    if (!nombreUsuario || nombreUsuario.length < 3) {
      setUsernameExists(false);
      setCheckingUsername(false);
      return;
    }

    setCheckingUsername(true);

    // Debounce de 500ms para no hacer peticiones en cada tecla
    usernameDebounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          "https://admin.residente.mx/api/usuarios/verificar-nombre-usuario",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre_usuario: nombreUsuario }),
          }
        );

        const data = await response.json();
        setUsernameExists(data.exists === true);
      } catch (error) {
        console.error("Error verificando nombre de usuario:", error);
        setUsernameExists(false);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
      }
    };
  }, [formData.nombre_usuario]);

  // Verificación de correo con debounce
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

    // Validar formato de correo básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setEmailValid(false);
      setEmailExists(false);
      setCheckingEmail(false);
      return;
    }

    setEmailValid(true);
    setCheckingEmail(true);

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

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    const maxBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedMimes.includes(file.type)) {
      setFotografia(null);
      setFotoPreview(null);
      setMessage({
        type: "error",
        text: "Tipo de archivo no permitido. Solo JPG, PNG o WEBP.",
      });
      return;
    }

    if (file.size > maxBytes) {
      setFotografia(null);
      setFotoPreview(null);
      setMessage({
        type: "error",
        text: "La imagen supera el tamaño máximo de 5MB.",
      });
      return;
    }

    setFotografia(file);
    setFotoPreview(URL.createObjectURL(file));
    setMessage({
      type: "success",
      text: `Archivo seleccionado correctamente.`,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.nombre_usuario ||
      !formData.password ||
      !formData.correo ||
      !formData.nombre ||
      !formData.anio_nacimiento ||
      !formData.lugar_nacimiento ||
      !formData.codigo
    ) {
      setMessage({
        type: "error",
        text: "Por favor completa todos los campos obligatorios.",
      });
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const dataToSend = {
        nombre_usuario: formData.nombre_usuario,
        password: formData.password,
        correo: formData.correo,
        nombre: formData.nombre,
        anio_nacimiento: formData.anio_nacimiento,
        lugar_nacimiento: formData.lugar_nacimiento,
        curriculum: formData.curriculum || null,
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        otras_redes: formData.otras_redes || null,
        codigo: formData.codigo,
      };

      if (fotografia) {
        dataToSend.fotografia = fotografia;
      }

      await consejerosPost(dataToSend);

      setMessage({
        type: "success",
        text: "¡Registro exitoso! Iniciando sesión automáticamente...",
      });

      // Guardar credenciales para usar en login automático
      const credencialesParaLogin = {
        nombre_usuario: formData.nombre_usuario,
        password: formData.password,
      };

      setFormData({
        nombre_usuario: "",
        password: "",
        confirm_password: "",
        correo: "",
        nombre: "",
        anio_nacimiento: "",
        lugar_nacimiento: "",
        curriculum: "",
        instagram: "",
        facebook: "",
        otras_redes: "",
        codigo: "",
      });
      setFotografia(null);
      setFotoPreview(null);

      // Esperar un momento para que el backend procese el registro
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Login automático
      try {
        console.log("Intentando login con:", credencialesParaLogin.nombre_usuario);
        const respuesta = await loginPost(credencialesParaLogin.nombre_usuario, credencialesParaLogin.password);
        console.log("Login exitoso:", respuesta);
        saveToken(respuesta.token);
        saveUsuario(respuesta.usuario);

        // Guardar credenciales temporalmente para mostrar en el dashboard
        sessionStorage.setItem(
          "credenciales_nuevas",
          JSON.stringify({
            nombre_usuario: respuesta.usuario.nombre_usuario,
            password: credencialesParaLogin.password,
          })
        );

        setMessage({
          type: "success",
          text: "¡Login exitoso! Redirigiendo al dashboard...",
        });

        // Redirigir al dashboard
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500);
      } catch (loginErr) {
        console.error("Error en login automático:", loginErr);
        // Si falla el login automático, redirigir al login manual
        setMessage({
          type: "success",
          text: "¡Registro exitoso! Redirigiendo al login...",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Error catch:", error);
      let errorMsg = "Error al enviar el formulario.";

      try {
        // Extract JSON part if present
        const jsonStart = error.message.indexOf("{");
        const jsonEnd = error.message.lastIndexOf("}");

        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = error.message.substring(jsonStart, jsonEnd + 1);
          const errObj = JSON.parse(jsonStr);

          if (errObj?.sequelize && Array.isArray(errObj.sequelize)) {
            const violation = errObj.sequelize[0];
            if (violation?.type === "unique violation") {
              if (violation.path === "nombre_usuario") {
                errorMsg =
                  "El nombre de usuario ya existe, pofavor elige otro.";
              } else if (violation.path === "correo") {
                errorMsg = "El correo electrónico ya está registrado.";
              }
            }
          } else if (errObj.error) {
            errorMsg = errObj.error;
          } else if (errObj.details) {
            errorMsg = errObj.details;
          }
        } else {
          // Fallback if no JSON found
          errorMsg = error.message;
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
        errorMsg = error.message;
      }

      setMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-0 sm:max-w-[1080px] mx-auto py-4 sm:py-8">
      <div className="sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:gap-x-15 sm:gap-y-9">
        {/* Columna principal: formulario */}
        <div>
          <h1 className="text-2xl sm:text-[24px] leading-[1.2] font-bold mb-3 sm:mb-4 sm:text-center">
            REGISTRO DE COLABORADORES Y <br />
            CONSEJEROS EDITORIALES
          </h1>
          <p className="mb-4 sm:text-center text-black leading-[1.2] text-sm sm:px-5">
            Bienvenido al selecto grupo de críticos, consejeros y analistas de
            la cultura gastronómica de Nuevo León. Ten por seguro que tu
            aportación será parte fundamental del futuro de nuestra industria y
            por ende del destino de nuestro estado.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-0">
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Código de Acceso*
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                placeholder="Ingresa tu código de invitación"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
                required
              />
            </div>
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Tu nombre*
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 21);
                  setFormData((prev) => ({
                    ...prev,
                    nombre: value,
                  }));
                }}
                placeholder="Ej. Juan Pérez"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
                maxLength={21}
                required
              />
            </div>
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Año de nacimiento*
              </label>
              <input
                type="number"
                name="anio_nacimiento"
                value={formData.anio_nacimiento}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 4);
                  handleInputChange({
                    target: { name: "anio_nacimiento", value },
                  });
                }}
                placeholder="Ej. 1990"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
                maxLength={4}
                required
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Lugar de nacimiento*
              </label>
              <input
                type="text"
                name="lugar_nacimiento"
                value={formData.lugar_nacimiento}
                onChange={handleInputChange}
                placeholder="Ej. Monterrey, NL"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
                required
              />
            </div>
            <div className="sm:mb-4">
              <div className="flex justify-between items-center mb-1 sm:mb-0">
                <label className="block font-roman font-bold text-base sm:text-sm">
                  Curriculum
                </label>
                <span
                  className={`text-xs ${
                    formData.curriculum.length >= 300
                      ? "text-red-500 font-bold"
                      : formData.curriculum.length >= 270
                      ? "text-amber-500"
                      : "text-gray-400"
                  }`}
                >
                  {formData.curriculum.length}/300
                </span>
              </div>
              <textarea
                name="curriculum"
                value={formData.curriculum}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 300);
                  setFormData(prev => ({
                    ...prev,
                    curriculum: value
                  }));
                }}
                placeholder="Describe tu experiencia"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm"
                rows={4}
                maxLength={300}
              />
            </div>
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="@usuario"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
              />
            </div>
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Facebook
              </label>
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder="facebook.com/usuario"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
              />
            </div>
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Otras redes sociales
              </label>
              <input
                type="text"
                name="otras_redes"
                value={formData.otras_redes}
                onChange={handleInputChange}
                placeholder="Enlace o usuario"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
              />
            </div>
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Nombre de usuario*
              </label>
              <input
                type="text"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={handleInputChange}
                placeholder="Usuario para acceso"
                className={`bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border rounded-lg sm:rounded-md focus:outline-none focus:ring-2 font-family-roman text-lg sm:text-sm sm:mb-4 ${
                  usernameExists
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                required
              />
              {checkingUsername && (
                <p className="text-gray-500 text-xs mt-1">
                  Verificando disponibilidad...
                </p>
              )}
              {usernameExists && !checkingUsername && (
                <p className="text-red-500 text-sm mt-1 font-bold">
                  ⚠️ Este nombre de usuario ya está en uso. Por favor, elige otro.
                </p>
              )}
              {!usernameExists &&
                !checkingUsername &&
                formData.nombre_usuario.length >= 3 && (
                  <p className="text-green-500 text-xs mt-1">
                    ✓ Nombre de usuario disponible
                  </p>
                )}
            </div>
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Correo electrónico*
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
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
                <p className="text-red-500 text-sm mt-1 font-bold">⚠️ Formato de correo inválido</p>
              )}
              {emailExists && emailValid && !checkingEmail && (
                <p className="text-red-500 text-sm mt-1 font-bold">
                  ⚠️ Este correo ya está registrado. Por favor, usa otro o inicia sesión.
                </p>
              )}
              {!emailExists && emailValid && !checkingEmail && formData.correo && formData.correo.includes("@") && (
                <p className="text-green-500 text-xs mt-1">✓ Correo disponible</p>
              )}
            </div>
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Contraseña*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="********"
                  className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 pr-14 sm:pr-10 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 sm:right-3 top-1/2 -translate-y-1/2 sm:top-2 sm:translate-y-0 text-2xl sm:text-xl text-gray-600 sm:text-black cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Confirmar Contraseña*
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="********"
                  className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 pr-14 sm:pr-10 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 sm:right-3 top-1/2 -translate-y-1/2 sm:top-2 sm:translate-y-0 text-2xl sm:text-xl text-gray-600 sm:text-black cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </div>
            <div className="sm:mb-4">
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Subir Fotografía*
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm"
              />
            </div>
            {fotoPreview && (
              <div className="text-center mb-2 mt-4">
                <img
                  src={fotoPreview}
                  alt="Vista previa"
                  className="w-full h-28 object-cover mx-auto"
                  style={{ maxWidth: "160px", borderRadius: "8px" }}
                />
                <div className="text-xs text-gray-600 mt-2">
                  Así se verá tu imagen en tu blog de colaborador.
                </div>
              </div>
            )}
            {message.text && (
              <div
                className={`text-center font-bold mt-4 p-4 sm:p-3 rounded-lg sm:rounded ${
                  message.type === "success" 
                    ? "text-green-600 bg-green-50 border border-green-200" 
                    : "text-red-600 bg-red-50 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-bold py-5 sm:py-2 px-4 rounded-xl sm:rounded w-full cursor-pointer text-xl sm:text-base mt-2 sm:mt-4 ${
                isSubmitting
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-[#fff200] hover:bg-[#e6d900] text-black"
              }`}
            >
              {isSubmitting ? "Procesando..." : "Crear cuenta"}
            </button>
          </form>
        </div>
        {/* Barra lateral - solo desktop */}
        <div className="hidden sm:flex flex-col items-end justify-start gap-10">
          <DirectorioVertical />
          <PortadaRevista />
        </div>
      </div>
    </div>
  );
};

export default OpinionEditorial;
