import { useFormContext } from 'react-hook-form';

const Contenido = () => {
    const { register, formState: { errors } } = useFormContext();
    return (
        <div className="space-y-2">
            <label htmlFor="contenido" className="block text-sm font-medium text-gray-700">
                Contenido
            </label>
            <textarea
                id="contenido"
                placeholder="Escribe el contenido de tu nota aquí..."
                {...register('contenido', { required: 'El contenido es obligatorio' })}
                className="min-h-[200px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            {errors.contenido && (
                <p className="mt-1 text-sm text-red-600">{errors.contenido.message}</p>
            )}
        </div>
    )
}

export default Contenido;