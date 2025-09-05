import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { FiUpload } from 'react-icons/fi';
import { styled } from '@mui/material/styles';
import { consejerosPost } from '../../../api/consejerosApi.js';

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
    backgroundColor: 'transparent',
    '& fieldset': {
      borderColor: '#e0e0e0',
      borderWidth: '1px',
      borderStyle: 'solid',
    },
    '&:hover fieldset': {
      borderColor: '#bdbdbd',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      setMessage({ type: 'error', text: 'Tipo de archivo no permitido. Solo JPG, PNG o WEBP.' });
      return;
    }

    if (file.size > maxBytes) {
      setFotografia(null);
      setMessage({ type: 'error', text: 'La imagen supera el tamaño máximo de 5MB.' });
      return;
    }

    setFotografia(file);
    setMessage({ type: 'success', text: `Archivo seleccionado: ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)` });
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

      //console.log('Datos a enviar:', dataToSend);
      //console.log('URL de la API:', 'https://estrellasdenuevoleon.com.mx/api/consejeros');

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
    <div className="py-8">
      <Box component="form" onSubmit={handleSubmit} sx={{
        p: 2,
        maxWidth: 800,
        mx: "auto",
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 3
      }}>
        {/* Header del formulario */}
        <Box sx={{ textAlign: 'left', mb: 6 }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#000000',
            margin: '0 0 1rem 0',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            REGISTRO CONSEJEROS EDITORIALES
          </h1>
          
          <p style={{
            fontSize: '1.1rem',
            color: '#000000',
            lineHeight: '1.6',
            textAlign: 'left',
            margin: '0'
          }}>
            Bienvenido al selecto grupo de críticos, consejeros y analistas de la cultura gastronómica de Nuevo León. 
            Ten por seguro que tu aportación será parte fundamental del futuro de nuestra industria y por ende del 
            destino de nuestro estado.
          </p>
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

                  {/* Campos obligatorios */}
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
           <StyledTextField 
             id="nombre"
             name="nombre"
             label="Tu nombre **" 
             variant="outlined" 
             value={formData.nombre}
             onChange={handleInputChange}
             required
             fullWidth
           />
           
           <StyledTextField 
             id="correo_electronico"
             name="correo_electronico"
             label="Correo electrónico **" 
             variant="outlined" 
             type="email"
             value={formData.correo_electronico}
             onChange={handleInputChange}
             required
             fullWidth
           />
         </Box>

         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
           <StyledTextField 
             id="anio_nacimiento"
             name="anio_nacimiento"
             label="Año de nacimiento **" 
             variant="outlined" 
             type="number"
             value={formData.anio_nacimiento}
             onChange={handleInputChange}
             required
             fullWidth
           />
           
           <StyledTextField 
             id="lugar_nacimiento"
             name="lugar_nacimiento"
             label="Lugar de nacimiento **" 
             variant="outlined" 
             value={formData.lugar_nacimiento}
             onChange={handleInputChange}
             required
             fullWidth
             margin="normal"
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
               borderColor: '#1976d2',
               color: '#1976d2',
               backgroundColor: 'white', 
               '&:hover': {
                 borderColor: '#1565c0',
                 backgroundColor: '#f5f5f5'
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

         {/* Botón de envío */}
         <Box sx={{ textAlign: 'center', mb: 2 }}>
           <Button
             type="submit"
             variant="contained"
             disabled={isSubmitting}
             sx={{
               backgroundColor: '#1976d2',
               padding: '16px 48px',
               fontSize: '18px',
               fontWeight: 'bold',
               borderRadius: '8px',
               textTransform: 'uppercase',
               width: '100%',
               '&:hover': {
                 backgroundColor: '#1565c0'
               },
               '&:disabled': {
                 backgroundColor: '#bdbdbd'
               }
             }}
           >
             {isSubmitting ? 'Enviando...' : 'ENVIAR SOLICITUD'}
           </Button>
         </Box>
       </Box>
     </div>
   );
 };

export default OpinionEditorial;
