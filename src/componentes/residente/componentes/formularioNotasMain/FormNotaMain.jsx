import { useForm, FormProvider } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { notaCrear, notaEditar, notaImagenPut } from '../../../../componentes/api/notaCrearPostPut.js';
import { catalogoSeccionesGet, catalogoTipoNotaGet } from '../../../../componentes/api/CatalogoSeccionesGet.js';

const FormNotaMain = () => {
    const { register, handleSubmit, setValue, watch, reset } = useForm();
    const [secciones, setSecciones] = useState([]);
    const [tipoNota, setTipoNota] = useState([]);
    const [imagen, setImagen] = useState(null);


    const titulo = watch('titulo');
    const descripcion = watch('descripcion');
    const categorias = watch('categorias');
    const tipoNotaSeleccionado = watch('tipoNota');
    const descripcionNota = watch('descripcionNota');
    const autor = watch('autor');
    const fechaPublicacion = watch('fechaPublicacion');
    const estatus = watch('estatus');

    // Traer la info de las secciones con las categorias y guardarlo
    useEffect(() => {
        catalogoSeccionesGet().then((data) => setSecciones(data));
        catalogoTipoNotaGet().then((data) => setTipoNota(data));
    }, [])

    // Guarda la info en localStorage para que no se piera
    useEffect(() => {
        if (titulo !== undefined) {
            localStorage.setItem('form_titulo', titulo);
        }
        if (descripcion !== undefined) {
            localStorage.setItem('form_descripcion', descripcion);
        }
        if (categorias !== undefined) {
            localStorage.setItem('form_categorias', JSON.stringify(categorias));
        }
        if (tipoNotaSeleccionado !== undefined) {
            localStorage.setItem('form_tipo_nota', tipoNotaSeleccionado);
        }
        if (descripcionNota !== undefined) {
            localStorage.setItem('form_descripcion_nota', descripcionNota);
        }
        if (autor !== undefined) {
            localStorage.setItem('form_autor', autor);
        }
        if (fechaPublicacion !== undefined) {
            localStorage.setItem('form_fecha_publicacion', fechaPublicacion);
        }
        if (estatus !== undefined) {
            localStorage.setItem('form_estatus', estatus);
        }
    }, [titulo, descripcion, categorias, tipoNotaSeleccionado, descripcionNota,
        autor, fechaPublicacion , estatus]);

    // Al cargar el componente, precargar si hay algo en localStorage
    useEffect(() => {
        // Recuperar los datos del localStorage
        const tituloGuardado = localStorage.getItem('form_titulo');
        const subtituloGuardado = localStorage.getItem('form_descripcion');
        const categoriasGuardadas = localStorage.getItem('form_categorias');
        const tipoNotaGuardado = localStorage.getItem('form_tipo_nota');
        const descripcionNotaGuardado = localStorage.getItem('form_descripcion_nota');
        const autorGuardado = localStorage.getItem('form_autor');
        const fechaPublicacionGuardada = localStorage.getItem('form_fecha_publicacion');
        const estatusGuardado = localStorage.getItem('form_estatus');

        // Si hay datos guardados, precargar los valores en el formulario
        if (tituloGuardado) setValue('titulo', tituloGuardado);
        if (subtituloGuardado) setValue('descripcion', subtituloGuardado);
        if (categoriasGuardadas) setValue('categorias', JSON.parse(categoriasGuardadas));
        if (tipoNotaGuardado) setValue('tipoNota', tipoNotaGuardado);
        if (descripcionNotaGuardado) setValue('descripcionNota', descripcionNotaGuardado);
        if (autorGuardado) setValue('autor', autorGuardado);
        if (fechaPublicacionGuardada) setValue('fechaPublicacion', fechaPublicacionGuardada);
        if (estatusGuardado) setValue('estatus', estatusGuardado);
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
                    {...register('descripcion', { required: 'El subtitulo es obligatorio' })}
                    placeholder="Escribe un subtitulo"
                />
            </div>

            <div>
                <label className="block text-gray-700 mb-1">Autor</label>
                <input
                    type="text"
                    {...register('autor', { required: 'El autor es obligatorio' })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Escribe el nombre del autor"
                />
            </div>

            <div>
                <label className="block text-gray-700 mb-1">Descripcion de la Nota</label>
                <textarea
                    {...register('descripcionNota', { required: 'La descripción es obligatoria' })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Escribe una descripción"
                    rows="4"
                ></textarea>
            </div>

            <div>
                <label className="block text-gray-700 mb-1">Tipo de Nota</label>
                {tipoNota.map((tipo) => ( 
                    <label key={tipo.nombre} className="block">
                        <input
                            type="radio"
                            {...register('tipoNota')}
                            value={tipo.nombre}
                            className="mr-2"
                        />
                        {tipo.nombre}
                    </label>
                ))}
            </div>

            <div>
                <label className="block text-gray-700 mb-1">Imagen de la Nota</label>
                <input
                    type="file"
                    accept="image/*"
                    {...register('imagen')}
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            setImagen(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setValue('imagenPreview', reader.result);
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2"
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

            <div>
                <label className="block text-gray-700 mb-1">Programar Publicacion</label>
                <input
                    type="datetime-local"
                    {...register('fechaPublicacion')}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                />
            </div>
             
            <div>
                <label className="block text-gray-700 mb-1">Estatus</label>
                <select {...register('estatus')} className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="">Selecciona un estatus</option>
                    <option value="borrador">Borrador</option>
                    <option value="publicada">Publicada</option>
                    <option value="privada">Privada</option>
                </select>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Publicar 
            </button>
        </form>
    )
}

export default FormNotaMain;