import { useFormContext } from 'react-hook-form';

const Autor = () => {
    const { register, formState: { errors } } = useFormContext();
    return (
        <div className="space-y-2">
            <label htmlFor="autor" className="block text-sm font-medium text-gray-700">
                Autor
            </label>
            <input
                id="autor"
                type="text"
                placeholder="Nombre del autor"
                {...register('autor', { required: 'El autor es obligatorio' })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.autor ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.autor && (
                <p className="mt-1 text-sm text-red-600">{errors.autor.message}</p>
            )}
        </div>
    )
}

export default Autor;