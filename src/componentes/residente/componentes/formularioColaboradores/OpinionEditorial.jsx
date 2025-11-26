import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { FiUpload } from 'react-icons/fi';
import { styled } from '@mui/material/styles';
import { consejerosPost } from '../../../api/consejerosApi.js';
import DirectorioVertical from '../../../residente/componentes/componentesColumna2/DirectorioVertical';
import Infografia from '../../../residente/componentes/componentesColumna1/Infografia';
import BotonesAnunciateSuscribirme from '../../../residente/componentes/componentesColumna1/BotonesAnunciateSuscribirme';
import PortadaRevista from "../componentesColumna2/PortadaRevista";


// Input oculto para subir archivos
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Estilos personalizados para los campos - directamente sobre fondo amarillo
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white', // igual que RespuestasSemana
    '& fieldset': {
      borderColor: '#e0e0e0',
      borderWidth: '1px',
      borderStyle: 'solid',
    },
    '&:hover fieldset': {
      borderColor: '#bdbdbd',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3b3b3c', // gris oscuro igual que RespuestasSemana
    },
  },
  '& .MuiInputLabel-root': {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  '& .MuiInputBase-input': {
    fontSize: '16px',
    padding: '12px 14px',
    color: '#000000',
  },
});

const OpinionEditorial = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo_electronico: '',
    anio_nacimiento: '',
    lugar_nacimiento: '',
    curriculum: '',
    instagram: '',
    facebook: '',
    otras_redes: ''
  });

  const [fotografia, setFotografia] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000); // 3 segundos
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

    // Validación de campos obligatorios
    if (!formData.nombre || !formData.correo_electronico || !formData.anio_nacimiento || !formData.lugar_nacimiento) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos obligatorios.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Preparar datos para la API - SOLO los campos que espera tu API
      const dataToSend = {
        nombre: formData.nombre,
        correo_electronico: formData.correo_electronico,
        anio_nacimiento: formData.anio_nacimiento,
        lugar_nacimiento: formData.lugar_nacimiento,
        curriculum: formData.curriculum || null,
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        otras_redes: formData.otras_redes || null
      };

      // Agregar la imagen si existe
      if (fotografia) {
        dataToSend.fotografia = fotografia;
      }

      const response = await consejerosPost(dataToSend);

      //console.log('Respuesta exitosa:', response);

      setMessage({
        type: 'success',
        text: '¡Registro enviado exitosamente! Te contactaremos pronto.'
      });

      // Limpiar formulario
      setFormData({
        nombre: '',
        correo_electronico: '',
        anio_nacimiento: '',
        lugar_nacimiento: '',
        curriculum: '',
        instagram: '',
        facebook: '',
        otras_redes: ''
      });
      setFotografia(null);
      setFotoPreview(null);

    } catch (error) {
      console.error('Error completo:', error);
      console.error('Mensaje del error:', error.message);
      console.error('Stack del error:', error.stack);

      setMessage({
        type: 'error',
        text: `Error al enviar el formulario: ${error.message}`
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
          <Box component="form" onSubmit={handleSubmit} sx={{
            p: 2,
            maxWidth: 800,
            mx: "auto",
            backgroundColor: "transparent"
          }}>
            {/* Header del formulario */}
            <Box sx={{ textAlign: 'left', mb: 6 }}>
              <h1 className="text-[24px] leading-[1.2] font-bold mb-4 text-center">
                REGISTRO DE COLABORADORES Y CONSEJEROS EDITORIALES
              </h1>

              <p className="mb-4 text-center text-black leading-[1.2] px-5">
                Bienvenido al selecto grupo de críticos, consejeros y analistas de la cultura gastronómica de Nuevo León.
                Ten por seguro que tu aportación será parte fundamental del futuro de nuestra industria y por ende del
                destino de nuestro estado.
              </p>
            </Box>
            {/* Campos obligatorios */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
              <StyledTextField
                id="nombre"
                name="nombre"
                label="Tu nombre *"
                variant="outlined"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b3b3c', // gris oscuro
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3b3b3c', // gris oscuro
                  }
                }}
              />

              <StyledTextField
                id="correo_electronico"
                name="correo_electronico"
                label="Correo electrónico *"
                variant="outlined"
                type="email"
                value={formData.correo_electronico}
                onChange={handleInputChange}
                required
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b3b3c', // gris oscuro
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3b3b3c', // gris oscuro
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
              <StyledTextField
                id="anio_nacimiento"
                name="anio_nacimiento"
                label="Año de nacimiento *"
                variant="outlined"
                type="number"
                value={formData.anio_nacimiento}
                onChange={e => {
                  const value = e.target.value.slice(0, 4);
                  handleInputChange({ target: { name: 'anio_nacimiento', value } });
                }}
                required
                fullWidth
                inputProps={{
                  maxLength: 4,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  // Oculta los botones en Chrome, Edge y Safari
                  style: { MozAppearance: 'textfield' }
                }}
                sx={{
                  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b3b3c', // gris oscuro
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3b3b3c', // gris oscuro
                  }
                }}
              />


              <StyledTextField
                id="lugar_nacimiento"
                name="lugar_nacimiento"
                label="Lugar de nacimiento *"
                variant="outlined"
                value={formData.lugar_nacimiento}
                onChange={handleInputChange}
                required
                fullWidth
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b3b3c', // gris oscuro
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3b3b3c', // gris oscuro
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <StyledTextField
                id="curriculum"
                name="curriculum"
                label="Curriculum"
                multiline
                rows={6}
                value={formData.curriculum}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b3b3c', // gris oscuro
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3b3b3c', // gris oscuro
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
              <StyledTextField
                id="instagram"
                name="instagram"
                label="Instagram"
                variant="outlined"
                value={formData.instagram}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b3b3c', // gris oscuro
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3b3b3c', // gris oscuro
                  }
                }}
              />

              <StyledTextField
                id="facebook"
                name="facebook"
                label="Facebook"
                variant="outlined"
                value={formData.facebook}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b3b3c', // gris oscuro
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3b3b3c', // gris oscuro
                  }
                }}
              />

              <StyledTextField
                id="otras_redes"
                name="otras_redes"
                label="Otras redes sociales"
                variant="outlined"
                value={formData.otras_redes}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b3b3c', // gris oscuro
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3b3b3c', // gris oscuro
                  }
                }}
              />
            </Box>

            {/* Botón para subir archivos */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<FiUpload />}
                disabled={isSubmitting}
                sx={{
                  borderColor: '#fff300',
                  color: '#000',
                  backgroundColor: '#fff300',
                  '&:hover': {
                    borderColor: '#fff300',
                    backgroundColor: '#dbcf27ff'
                  },
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                {fotografia ? fotografia.name : 'SUBIR FOTOGRAFÍA'}
                <VisuallyHiddenInput
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>

            {/* Vista previa de la fotografía seleccionada */}
            {fotoPreview && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img
                  src={fotoPreview}
                  alt="Vista previa"
                  className="w-full h-28 object-cover"
                  style={{ maxWidth: '160px', borderRadius: '8px', margin: '0 auto' }}
                />
                <div style={{ fontSize: '13px', color: '#555', marginTop: '8px' }}>
                  Así se verá tu imagen en tu perfil público
                </div>
              </Box>
            )}

            {/* Botón de envío */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  backgroundColor: '#fff300',
                  color: '#000',
                  padding: '16px 48px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  textTransform: 'uppercase',
                  width: '100%',
                  '&:hover': {
                    backgroundColor: '#dbcf27ff',
                  },
                  '&:disabled': {
                    backgroundColor: '#222',
                    color: '#fff300'
                  }
                }}
              >
                {isSubmitting ? 'Enviando...' : 'ENVIAR SOLICITUD'}
              </Button>
            </Box>
            {/* Mensaje de estado */}
            {message.text && (
              <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,
                backgroundColor: message.type === 'success' ? '#e8f5e8' : '#ffebee',
                color: message.type === 'success' ? '#2e7d32' : '#c62828',
                border: `1px solid ${message.type === 'success' ? '#4caf50' : '#f44336'}`,
                textAlign: 'center'
              }}>
                {message.text}
              </Box>
            )}
          </Box>
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