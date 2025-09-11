// src/componentes/residente/componentes/compFormularioMain/componentes/Titulo.jsx
import { useFormContext } from 'react-hook-form';

const Titulo = () => {
  const { register, formState: { errors }, watch, setValue } = useFormContext();
  const tituloValue = watch('titulo') || '';

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length > 165) {
      setValue('titulo', value.slice(0, 165));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Título *
      </label>
      <input
        type="text"
        placeholder="Agrega el título"
        maxLength={165}
        value={tituloValue}
        onChange={handleChange}
        {...register('titulo', {
          maxLength: {
            value: 165,
            message: 'El título solo puede tener 165 caracteres'
          }
        })}
        className={`w-full px-3 py-2 border rounded-md  ${
          errors.titulo ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-gray-500">{tituloValue.length}/165</span>
        {errors.titulo && (
          <p className="text-sm text-red-600">{errors.titulo.message}</p>
        )}
      </div>
    </div>
  );
};

export default Titulo;