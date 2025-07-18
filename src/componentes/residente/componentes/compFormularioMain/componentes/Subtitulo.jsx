import { useFormContext } from 'react-hook-form';

const Subtitulo = () => {
    const { register, formState: { errors } } = useFormContext();
    return (
        <div className="space-y-2">
            <label htmlFor="subtitulo" className="block text-sm font-medium text-gray-700">
                Subtítulo
            </label>
            <textarea
                id="subtitulo"
                placeholder="Agrega un subtítulo descriptivo"
                {...register('subtitulo', { required: 'El subtítulo es obligatorio' })}
                rows={1}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 max-h-50 min-h-24 ${
                    errors.subtitulo ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.subtitulo && (
                <p className="mt-1 text-sm text-red-600">{errors.subtitulo.message}</p>
            )}
        </div>
    )
}

export default Subtitulo;