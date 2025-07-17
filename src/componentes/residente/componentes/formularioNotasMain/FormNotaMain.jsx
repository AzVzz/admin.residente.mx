import { useForm, FormProvider } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { notaCrear, notaEditar, notaImagenPut } from '../../../../componentes/api/notaCrearPostPut.js';
import { catalogoSeccionesGet } from '../../../../componentes/api/CatalogoSeccionesGet.js';

const FormNotaMain = () => {
    const { register, handleSubmit, setValue, watch, reset } = useForm();
    const [secciones, setSecciones] = useState([]);

    const titulo = watch('titulo');
    const descripcion = watch('descripcion');
    const seccionCategoria = watch({});

    // Traer la info de las secciones con las categorias y guardarlo
    useEffect(() => {
        catalogoSeccionesGet().then((data) => setSecciones(data));
    }, [])

    // Guarda la info en localStorage para que no se piera
    useEffect(() => {
        if (titulo !== undefined) {
            localStorage.setItem('form_titulo', titulo);
        }
        if (descripcion !== undefined) {
            localStorage.setItem('form_descripcion', descripcion);
        }
        if (seccionCategoria !== undefined) {
            localStorage.setItem('form_secciones_categorias', JSON.stringify(seccionCategoria));
        }
    }, [titulo, descripcion, seccionCategoria]);

    // Al cargar el componente, precargar si hay algo en localStorage
    useEffect(() => {
        const tituloGuardado = localStorage.getItem('form_titulo');
        const subtituloGuardado = localStorage.getItem('form_descripcion');
        if (tituloGuardado) setValue('titulo', tituloGuardado);
        if (subtituloGuardado) setValue('descripcion', subtituloGuardado);
    }, [setValue]);

    // Al momento de enviar el formulario
    const onSubmit = async (data) => {
        try {
            const response = await notaCrear({
                titulo: data.titulo
            });
            console.log('✅ Nota creada correctamente:', response);
            alert('Nota creada con éxito');
            reset();
        } catch (error) {
            console.error('❌ Error al crear la nota:', error);
            alert('Error al crear la nota');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-w-lg mx-auto bg-white rounded shadow">
            <div>
                <label className="block text-gray-700 mb-1">Título de la Nota</label>
                <input
                    type="text"
                    {...register('titulo', { required: 'El título es obligatorio' })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Escribe un título"
                />
            </div>

            <div>
                <label>Subtitulo de la Nota</label>
                <input
                    type="text"
                    {...register('descripcion', { required: 'El sub...' })}
                    placeholder="Escribe un subtitulo"
                />
            </div>

            {secciones.map((seccion) => (
                <div key={seccion.seccion}>
                    <h2>{seccion.seccion}</h2>
                    {seccion.categorias.map((categoria) => (
                        <label key={categoria.nombre}>
                            <input
                                type="radio"
                                {...register(`categorias.${seccion.seccion}`)}
                                value={categoria.nombre}
                            />
                            {categoria.nombre}
                        </label>
                    ))}
                </div>
            ))}

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Publicar
            </button>
        </form>
    )
}

export default FormNotaMain;