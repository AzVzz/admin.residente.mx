import React, { useState, useEffect, useRef } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { consejerosPost } from "../../../api/consejerosApi.js";
import { useNavigate } from "react-router-dom";
import DirectorioVertical from "../../../residente/componentes/componentesColumna2/DirectorioVertical";
import Infografia from "../../../residente/componentes/componentesColumna1/Infografia";
import BotonesAnunciateSuscribirme from "../../../residente/componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import PortadaRevista from "../componentesColumna2/PortadaRevista";

const OpinionEditorial = () => {
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
        text: "¡Registro enviado exitosamente! Te contactaremos pronto.",
      });
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

      // Redirige después de 2 segundos
      setTimeout(() => {
        navigate("/registro");
      }, 2000);
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
    <div className="max-w-[1080px] mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9">
        {/* Columna principal: formulario */}
        <div>
          <h1 className="text-[24px] leading-[1.2] font-bold mb-4 text-center">
            REGISTRO DE COLABORADORES Y <br />
            CONSEJEROS EDITORIALES
          </h1>
          <p className="mb-4 text-center text-black leading-[1.2] px-5">
            Bienvenido al selecto grupo de críticos, consejeros y analistas de
            la cultura gastronómica de Nuevo León. Ten por seguro que tu
            aportación será parte fundamental del futuro de nuestra industria y
            por ende del destino de nuestro estado.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">
                Código de Acceso*
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                placeholder="Ingresa tu código de invitación"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">
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
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                maxLength={21}
                required
              />
            </div>
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">
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
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                maxLength={4}
                required
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">
                Lugar de nacimiento*
              </label>
              <input
                type="text"
                name="lugar_nacimiento"
                value={formData.lugar_nacimiento}
                onChange={handleInputChange}
                placeholder="Ej. Monterrey, NL"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">
                Curriculum
              </label>
              <textarea
                name="curriculum"
                value={formData.curriculum}
                onChange={handleInputChange}
                placeholder="Describe tu experiencia"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                rows={4}
              />
            </div>
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="@usuario"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">Facebook</label>
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder="facebook.com/usuario"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">
                Otras redes sociales
              </label>
              <input
                type="text"
                name="otras_redes"
                value={formData.otras_redes}
                onChange={handleInputChange}
                placeholder="Enlace o usuario"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">
                Nombre de usuario*
              </label>
              <input
                type="text"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={handleInputChange}
                placeholder="Usuario para acceso"
                className={`bg-white w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 font-family-roman font-bold text-sm ${
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
                  ⚠️ Este nombre de usuario ya está en uso. Por favor, elige
                  otro.
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
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">
                Correo electrónico*
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
                className={`bg-white w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 font-family-roman font-bold text-sm ${
                  emailExists || !emailValid
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                required
              />
              {checkingEmail && (
                <p className="text-gray-500 text-xs mt-1">
                  Verificando correo...
                </p>
              )}
              {!emailValid && !checkingEmail && formData.correo && (
                <p className="text-red-500 text-sm mt-1 font-bold">
                  ⚠️ Formato de correo inválido
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
            </div>
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">
                Contraseña*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="********"
                  className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-xl text-black cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">
                Confirmar Contraseña*
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="********"
                  className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-xl text-black cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <AiOutlineEyeInvisible />
                  ) : (
                    <AiOutlineEye />
                  )}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="space-y-2 font-roman font-bold">
                Subir Fotografía*
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
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
                className={`text-center font-bold mt-4 ${
                  message.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-bold py-2 px-4 rounded mt-4 w-full cursor-pointer ${
                isSubmitting
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-[#fff200] hover:bg-[#e6d900] text-black"
              }`}
            >
              {isSubmitting ? "Procesando..." : "Crear cuenta"}
            </button>
          </form>
        </div>
        {/* Barra lateral */}
        <div className="flex flex-col items-end justify-start gap-10">
          <DirectorioVertical />
          <PortadaRevista />
        </div>
      </div>
    </div>
  );
};

export default OpinionEditorial;
