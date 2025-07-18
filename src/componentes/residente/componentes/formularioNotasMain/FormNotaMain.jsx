import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { notaCrear, notaEditar } from '../../../../componentes/api/notaCrearPostPut.js';
import { catalogoSeccionesGet } from '../../../../componentes/api/CatalogoSeccionesGet.js';
import { notasPublicadasPorId } from '../../../../componentes/api/notasPublicadasGet.js';

const FormNotaMain = () => {
    const { id } = useParams(); // Si hay id, es edición
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            categorias: {} // <-- Esto es clave
        }
    });
    const [secciones, setSecciones] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [formReady, setFormReady] = useState(false);

    // Traer secciones y categorías
    useEffect(() => {
        catalogoSeccionesGet().then((data) => {
            setSecciones(data);
            if (!id) {
                const categoriasVacias = {};
                data.forEach(seccion => {
                    categoriasVacias[seccion.seccion] = "";
                });
                reset({
                    categorias: categoriasVacias
                });
            }
            setFormReady(true); // <-- Solo aquí
        });
    }, [id, reset]);

    // Si hay id, traer la nota y setear los valores
    useEffect(() => {
        if (id) {
            setCargando(true);
            notasPublicadasPorId(id)
                .then((nota) => {
                    setValue('titulo', nota.titulo || '');
                    setValue('descripcion', nota.descripcion || '');
                    // Si tienes categorías guardadas en la nota, setéalas aquí
                    if (nota.categorias) {
                        Object.entries(nota.categorias).forEach(([seccion, categoria]) => {
                            setValue(`categorias.${seccion}`, categoria);
                        });
                    }
                })
                .catch(() => setMensaje('Error al cargar la nota'))
                .finally(() => setCargando(false));
        }
    }, [id, setValue]);

    const onSubmit = async (data) => {
        setMensaje('');
        try {
            if (id) {
                await notaEditar(id, {
                    titulo: data.titulo,
                    descripcion: data.descripcion,
                    categorias: data.categorias || {},
                });
                setMensaje('Nota editada con éxito');
            } else {
                await notaCrear({
                    titulo: data.titulo,
                    descripcion: data.descripcion,
                    categorias: data.categorias || {},
                });
                setMensaje('Nota creada con éxito');
                reset();
            }
        } catch (error) {
            setMensaje('Error al guardar la nota');
        }
    };

    if (cargando || !formReady) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-w-lg mx-auto bg-white rounded shadow">
            {mensaje && (
                <div className={`p-2 rounded text-center ${mensaje.includes('éxito') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {mensaje}
                </div>
            )}

            <div>
                <label className="block text-gray-700 mb-1">Título de la Nota</label>
                <input
                    type="text"
                    {...register('titulo', { required: 'El título es obligatorio' })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Escribe un título"
                />
                {errors.titulo && <span className="text-red-500 text-sm">{errors.titulo.message}</span>}
            </div>

            <div>
                <label className="block text-gray-700 mb-1">Subtítulo de la Nota</label>
                <input
                    type="text"
                    {...register('descripcion', { required: 'El subtítulo es obligatorio' })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Escribe un subtítulo"
                />
                {errors.descripcion && <span className="text-red-500 text-sm">{errors.descripcion.message}</span>}
            </div>

            {secciones.map((seccion) => (
                <div key={seccion.seccion}>
                    <h2 className="font-bold">{seccion.seccion}</h2>
                    {/* Radio oculto para que no haya selección por defecto */}
                    <input
                        type="radio"
                        {...register(`categorias.${seccion.seccion}`, { required: true })}
                        value=""
                        style={{ display: 'none' }}
                    />
                    {seccion.categorias.map((categoria) => (
                        <label key={categoria.nombre} className="mr-4">
                            <input
                                type="radio"
                                {...register(`categorias.${seccion.seccion}`, { required: true })}
                                value={categoria.nombre}
                                className="mr-1"
                            />
                            {categoria.nombre}
                        </label>
                    ))}
                    {errors.categorias && errors.categorias[seccion.seccion] && (
                        <span className="text-red-500 text-sm ml-2">Selecciona una categoría</span>
                    )}
                </div>
            ))}

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                {id ? 'Actualizar Nota' : 'Publicar Nota'}
            </button>
        </form>
    );
};

export default FormNotaMain;