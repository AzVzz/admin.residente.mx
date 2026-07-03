import { useFormContext } from 'react-hook-form';

const Subtitulo = () => {
    const { register, watch, formState: { errors } } = useFormContext();
    const subtituloValue = watch('subtitulo') || '';
    const texto = subtituloValue.trim();
    const numPalabras = texto ? texto.split(/\s+/).length : 0;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label htmlFor="subtitulo" className="block text-sm font-medium text-gray-700">
                    Subtítulo
                </label>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                    {`${numPalabras} ${numPalabras === 1 ? 'palabra' : 'palabras'}`}
                </span>
            </div>
            <textarea
                id="subtitulo"
                placeholder="Agrega un subtítulo"
                {...register('subtitulo',)}
                rows={1}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 h-24 max-h-50 min-h-24 bg-white ${errors.subtitulo ? 'border-red-500' : 'border-gray-300'
                    }`}
            />
            {/*
            {errors.subtitulo && (
                <p className="mt-1 text-sm text-red-600">{errors.subtitulo.message}</p>
            )}
            */}
        </div>
    )
}

export default Subtitulo;