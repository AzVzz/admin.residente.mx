// src/componentes/residente/componentes/compFormularioMain/componentes/Titulo.jsx
import { useFormContext } from 'react-hook-form';

const Titulo = () => {
  const { register, formState: { errors } } = useFormContext();
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Título *
      </label>
      <input
        type="text"
        {...register('titulo', { required: 'El título es obligatorio' })}
        className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
          errors.titulo ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {errors.titulo && (
        <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
      )}
    </div>
  );
};

export default Titulo;