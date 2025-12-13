import React, { useState, useEffect } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { consejerosPost } from '../../../api/consejerosApi.js';
import { useNavigate } from "react-router-dom";
import DirectorioVertical from '../../../residente/componentes/componentesColumna2/DirectorioVertical';
import Infografia from '../../../residente/componentes/componentesColumna1/Infografia';
import BotonesAnunciateSuscribirme from '../../../residente/componentes/componentesColumna1/BotonesAnunciateSuscribirme';
import PortadaRevista from "../componentesColumna2/PortadaRevista";

const OpinionEditorial = () => {
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    password: '',
    confirm_password: '',
    correo: '',
    nombre: '',
    anio_nacimiento: '',
    lugar_nacimiento: '',
    curriculum: '',
    instagram: '',
    facebook: '',
    otras_redes: '',
    codigo: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fotografia, setFotografia] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxBytes = 5 * 1024 * 1024; // 5MB

    if (!allowedMimes.includes(file.type)) {
      setFotografia(null);
      setFotoPreview(null);
      setMessage({ type: 'error', text: 'Tipo de archivo no permitido. Solo JPG, PNG o WEBP.' });
      return;
    }

    if (file.size > maxBytes) {
      setFotografia(null);
      setFotoPreview(null);
      setMessage({ type: 'error', text: 'La imagen supera el tamaño máximo de 5MB.' });
      return;
    }

    setFotografia(file);
    setFotoPreview(URL.createObjectURL(file));
    setMessage({ type: 'success', text: `Archivo seleccionado correctamente.` });
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
      setMessage({ type: 'error', text: 'Por favor completa todos los campos obligatorios.' });
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

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
        codigo: formData.codigo
      };

      if (fotografia) {
        dataToSend.fotografia = fotografia;
      }

      await consejerosPost(dataToSend);

      setMessage({
        type: 'success',
        text: '¡Registro enviado exitosamente! Te contactaremos pronto.'
      });
      setFormData({
        nombre_usuario: '',
        password: '',
        confirm_password: '',
        correo: '',
        nombre: '',
        anio_nacimiento: '',
        lugar_nacimiento: '',
        curriculum: '',
        instagram: '',
        facebook: '',
        otras_redes: '',
        codigo: ''
      });
      setFotografia(null);
      setFotoPreview(null);

      // Redirige después de 2 segundos
      setTimeout(() => {
        navigate('/registro');
      }, 2000);
    } catch (error) {
      console.error("Error catch:", error);
      let errorMsg = "Error al enviar el formulario.";

      try {
        // Extract JSON part if present
        const jsonStart = error.message.indexOf('{');
        const jsonEnd = error.message.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = error.message.substring(jsonStart, jsonEnd + 1);
          const errObj = JSON.parse(jsonStr);

          if (errObj?.sequelize && Array.isArray(errObj.sequelize)) {
            const violation = errObj.sequelize[0];
            if (violation?.type === "unique violation") {
              if (violation.path === "nombre_usuario") {
                errorMsg = "El nombre de usuario ya existe, pofavor elige otro.";
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
        type: 'error',
        text: errorMsg
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
            REGISTRO DE COLABORADORES Y <br />CONSEJEROS EDITORIALES
          </h1>
          <p className="mb-4 text-center text-black leading-[1.2] px-5">
            Bienvenido al selecto grupo de críticos, consejeros y analistas de la cultura gastronómica de Nuevo León.
            Ten por seguro que tu aportación será parte fundamental del futuro de nuestra industria y por ende del
            destino de nuestro estado.
          </p>
          <form onSubmit={handleSubmit}>
            <div>
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
            <div>
              <label className="space-y-2 font-roman font-bold">
                Tu nombre*
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={e => {
                  const value = e.target.value.slice(0, 21);
                  setFormData(prev => ({
                    ...prev,
                    nombre: value
                  }));
                }}
                placeholder="Ej. Juan Pérez"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                maxLength={21}
                required
              />
            </div>
            <div>
              <label className="space-y-2 font-roman font-bold">
                Año de nacimiento*
              </label>
              <input
                type="number"
                name="anio_nacimiento"
                value={formData.anio_nacimiento}
                onChange={e => {
                  const value = e.target.value.slice(0, 4);
                  handleInputChange({ target: { name: 'anio_nacimiento', value } });
                }}
                placeholder="Ej. 1990"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                maxLength={4}
                required
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div>
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
            <div>
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
            <div>
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
            <div>
              <label className="space-y-2 font-roman font-bold">
                Facebook
              </label>
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                placeholder="facebook.com/usuario"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
              />
            </div>
            <div>
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
            <div>
              <label className="space-y-2 font-roman font-bold">
                Nombre de usuario*
              </label>
              <input
                type="text"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={handleInputChange}
                placeholder="Usuario para acceso"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                required
              />
            </div>
            <div>
              <label className="space-y-2 font-roman font-bold">
                Correo electrónico*
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                required
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
            <div>
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
                  {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="space-y-2 font-roman font-bold">
                Subir Fotografía (Opcional)
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
                  style={{ maxWidth: '160px', borderRadius: '8px' }}
                />
                <div className="text-xs text-gray-600 mt-2">
                  Así se verá tu imagen en tu blog de colaborador.
                </div>
              </div>
            )}
            {message.text && (
              <div className={`text-center font-bold mt-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-bold py-2 px-4 rounded mt-4 w-full cursor-pointer ${isSubmitting
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
          <BotonesAnunciateSuscribirme />
          <Infografia />
        </div>
      </div>
    </div>
  );
};

export default OpinionEditorial;