import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlApi } from '../../api/url';


const LargeTextInput = ({ id, name, label, placeholder, value, onChange, onBlur, limit, required = true }) => {
  const isOverLimit = value.length > limit;
  const isNearLimit = value.length > limit * 0.8;
  const borderColor = isOverLimit ? 'border-red-500' : isNearLimit ? 'border-yellow-500' : 'border-gray-300';
  const textColor = isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-600' : 'text-gray-600';

  return (
    <div>
      <label htmlFor={id} className="block text-base font-bold text-gray-700 mb-2">{label}{required ? '*' : ''}</label>
      <input 
        id={id} 
        name={name} 
        type="text" 
        value={value} 
        onChange={onChange} 
        onBlur={onBlur} 
        required={required} 
        maxLength={limit} 
        autoComplete="off" 
        autoCorrect="off" 
        autoCapitalize="none" 
        spellCheck={false}
        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition duration-200 bg-white text-black text-base placeholder:text-gray-500 ${borderColor}`}
        placeholder={placeholder} 
      />
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-gray-500">Máximo {limit} caracteres</p>
        <span className={`text-xs font-medium ${textColor}`}>{value.length}/{limit}</span>
      </div>
    </div>
  );
};

const TextAreaField = ({ name, label, placeholder, value, onChange, onBlur, limit, required = true }) => {
  const isOverLimit = value.length > limit;
  const isNearLimit = value.length > limit * 0.8;
  const borderColor = isOverLimit ? 'border-red-500' : isNearLimit ? 'border-yellow-500' : 'border-gray-300';
  const textColor = isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-600' : 'text-gray-600';

  return (
    <div>
      <label htmlFor={name} className="block text-base font-bold text-gray-700 mb-2">{label}*</label>
      <textarea 
        id={name} 
        name={name} 
        value={value} 
        onChange={onChange} 
        onBlur={onBlur} 
        required={required} 
        rows="3" 
        maxLength={limit}
        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition duration-200 bg-white text-black resize-none text-base placeholder:text-gray-500 ${borderColor}`}
        placeholder={placeholder} 
      />
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-gray-500">Máximo {limit} caracteres</p>
        <span className={`text-xs font-medium ${textColor}`}>{value.length}/{limit}</span>
      </div>
    </div>
  );
};

const DateField = ({ name, label, value, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-base font-bold text-gray-700 mb-2">{label}*</label>
    <div className="relative">
      <input 
        type="date" 
        id={name} 
        name={name} 
        value={value} 
        onChange={onChange} 
        required
        className="w-full px-9 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition duration-200 bg-white text-black text-base [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]" 
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={() => document.getElementById(name).showPicker()}>
        <svg className="w-5 h-5 text-gray-600 hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  </div>
);

const FileField = ({ name, label, value, onChange, accept, required = false, description, preview, onRemove }) => (
  <div>
    <label htmlFor={name} className="block text-base font-bold text-gray-700 mb-2">{label}{required ? '*' : ''}</label>
    <div className="relative">
      <input 
        type="file" 
        id={name} 
        name={name} 
        onChange={onChange} 
        accept={accept} 
        required={required}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition duration-200 bg-white text-black text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    {preview && (
      <div className="mt-3 relative">
        <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg border-2 border-gray-300" />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
            title="Eliminar imagen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )}
  </div>
);

const FONT_OPTIONS = [
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Roboto',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Poppins',
  'Raleway'
];

const FormularioBanner = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    institucion: '',
    beneficios: '',
    comentariosRestricciones: '',
    fechaInicio: '',
    fechaFin: '',
    imagenPrincipal: null,  
    logo: null,
    fontFamily: ''
  });

  const [previewPrincipal, setPreviewPrincipal] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const LIMITS = { beneficios: 100, comentarios: 100 };
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const normalizeSpanishText = (rawText, ensureFinalPunctuation = false) => {
    let text = (rawText || '').replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]*([,;:])[ \t]*/g, '$1 ').replace(/[ \t]*\.[ \t]*/g, '. ').replace(/[ \t]+([.!?,;:])/g, '$1').replace(/([.!?]){2,}/g, '$1');
    
    if (ensureFinalPunctuation) text = text.replace(/^\s+|\s+$/g, '');
    if (text.length > 0) text = text.charAt(0).toUpperCase() + text.slice(1);
    if (ensureFinalPunctuation && text && !/[.!?…]$/.test(text.trim())) text += '.';
    
    return text;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files && files[0]) {
      const file = files[0];
      
      // Validar tamaño del archivo
      if (file.size > MAX_FILE_SIZE) {
        setMessage(`El archivo es demasiado grande. Tamaño máximo: 5MB.`);
        e.target.value = '';
        return;
      }
      
      setFormData(prev => ({ ...prev, [name]: file }));
      setMessage('');
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'imagenPrincipal') {
          setPreviewPrincipal(reader.result);
        } else if (name === 'logo') {
          setPreviewLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      const nextValue = ['beneficios', 'comentariosRestricciones'].includes(name) 
        ? normalizeSpanishText(value, false) 
        : value;
      setFormData(prev => ({ ...prev, [name]: nextValue }));
    }
  };

  const handleRemoveImage = (type) => {
    if (type === 'principal') {
      setFormData(prev => ({ ...prev, imagenPrincipal: null }));
      setPreviewPrincipal(null);
    } else if (type === 'logo') {
      setFormData(prev => ({ ...prev, logo: null }));
      setPreviewLogo(null);
    }
  };

  const handleBlurNormalize = (e) => {
    const { name } = e.target;
    setFormData(prev => ({ ...prev, [name]: normalizeSpanishText(prev[name], true) }));
  };

  const subirImagen = async (file, nombre) => {
    const formDataUpload = new FormData();
    formDataUpload.append('imagen', file);

    const response = await fetch(`${urlApi}api/uploads/editor-image`, {
      method: 'POST',
      body: formDataUpload
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { url: data.url || data.path || data.imageUrl || data.data?.url };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      if (formData.beneficios.length > LIMITS.beneficios) {
        setMessage(`El campo "Beneficios" excede el límite de ${LIMITS.beneficios} caracteres`);
        setIsSubmitting(false);
        return;
      }

      if (formData.comentariosRestricciones.length > LIMITS.comentarios) {
        setMessage(`El campo "Comentarios o Restricciones" excede el límite de ${LIMITS.comentarios} caracteres`);
        setIsSubmitting(false);
        return;
      }

      // Subir imágenes si existen
      let imagenPrincipalUrl = null;
      let logoUrl = null;
      try {
        if (formData.imagenPrincipal) {
          const principalResult = await subirImagen(formData.imagenPrincipal, `principal_${Date.now()}`);
          imagenPrincipalUrl = principalResult.url;
        }
        if (formData.logo) {
          const logoResult = await subirImagen(formData.logo, `logo_${Date.now()}`);
          logoUrl = logoResult.url;
        }
      } catch (imageError) {
        setMessage('Error al subir las imágenes: ' + (imageError.message || 'Error desconocido'));
        setIsSubmitting(false);
        return;
      }

      // Aquí puedes agregar la lógica para guardar el banner en tu backend
      // Por ahora solo mostramos un mensaje de éxito
      console.log('Datos del banner:', {
        institucion: formData.institucion,
        beneficios: formData.beneficios,
        comentarios_restricciones: formData.comentariosRestricciones,
        fecha_inicio: formData.fechaInicio,
        fecha_fin: formData.fechaFin,
        imagen_principal: imagenPrincipalUrl,
        logo: logoUrl,
        font_family: formData.fontFamily
      });

      setMessage('¡Banner creado exitosamente!');
      
      // Limpiar formulario
      setFormData({
        institucion: '',
        beneficios: '',
        comentariosRestricciones: '',
        fechaInicio: '',
        fechaFin: '',
        imagenPrincipal: null,
        logo: null,
        fontFamily: ''
      });
      setPreviewPrincipal(null);
      setPreviewLogo(null);

    } catch (error) {
      setMessage('Error al enviar el banner: ' + (error.message || 'Por favor, intenta nuevamente.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
   
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mt-10 mb-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">CREAR BANNER</h2>
            <p className="text-gray-600 text-base">Completa los datos para crear tu banner</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            

            <LargeTextInput 
              id="beneficios" 
              name="beneficios" 
              label="TEXTO DEL BANNER" 
              placeholder="Texto del banner" 
              value={formData.beneficios} 
              onChange={handleChange} 
              onBlur={handleBlurNormalize} 
              limit={LIMITS.beneficios} 
            />

            <div>
              <label htmlFor="fontFamily" className="block text-base font-bold text-gray-700 mb-2">TIPOGRAFÍA*</label>
              <div className="relative">
                <select
                  id="fontFamily"
                  name="fontFamily"
                  value={formData.fontFamily}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition duration-200 bg-white text-black text-base appearance-none"
                >
                  <option value="" disabled>Selecciona una tipografía</option>
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <FileField
              name="imagenPrincipal"
              label="IMAGEN DEL BANNER"
              onChange={handleChange}
              accept="image/*"
              required={true}
              description="JPG, PNG, WEBP (5MB)"
              preview={previewPrincipal}
              onRemove={() => handleRemoveImage('principal')}
            />

            <FileField
              name="logo"
              label="LOGO"
              onChange={handleChange}
              accept="image/*"
              required={false}
              description="JPG, PNG, WEBP (5MB)"
              preview={previewLogo}
              onRemove={() => handleRemoveImage('logo')}
            />


            <TextAreaField 
              name="comentariosRestricciones" 
              label="COMENTARIOS O RESTRICCIONES" 
              placeholder="Describe las limitantes de tu promoción" 
              value={formData.comentariosRestricciones} 
              onChange={handleChange} 
              onBlur={handleBlurNormalize} 
              limit={LIMITS.comentarios} 
            />

            

       
          

            {message && (
              <div className={`p-4 rounded-lg text-center font-medium ${
                message.includes('exitosamente') 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {message}
              </div>
            )}

            <div className="pt-2 flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 font-bold py-4 px-6 rounded-lg transition duration-200 bg-gray-500 text-white hover:bg-gray-600 focus:ring-4 focus:ring-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 font-bold py-4 px-6 rounded-lg transition duration-200 transform shadow-lg text-base ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 hover:scale-105'
                }`}
              >
                {isSubmitting ? 'Enviando...' : 'Crear Banner'}
              </button>
            </div>
          </form>
        </div>
      </div>
    
  );
};

export default FormularioBanner;
