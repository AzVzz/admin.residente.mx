// src/componentes/residente/componentes/compFormularioMain/FormMainResidente.jsx
import { useForm, FormProvider, Controller } from 'react-hook-form';
import Autor from "./componentes/Autor";
import Contenido from "./componentes/Contenido";
import OpcionesPublicacion from "./componentes/OpcionesPublicacion";
import Subtitulo from "./componentes/Subtitulo";
import Titulo from "./componentes/Titulo";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notaCrear, notaEditar, notaImagenPut } from '../../../../componentes/api/notaCrearPostPut.js';
import { notaGetById } from '../../../../componentes/api/notasCompletasGet.js';
import { catalogoSeccionesGet, catalogoTipoNotaGet } from '../../../../componentes/api/CatalogoSeccionesGet.js';

const FormMainResidente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Configuración de React Hook Form
  const methods = useForm({
    defaultValues: {
      titulo: '',
      subtitulo: '',
      autor: '',
      contenido: '',
      opcionPublicacion: 'publicada',
      fechaProgramada: '',
      tipoDeNotaSeleccionada: '',
      categoriasSeleccionadas: {},
      imagen: null
    }
  });
  
  const { handleSubmit, reset, control, watch, setValue } = methods;
  
  // Estados para manejo de API
  const [notaId, setNotaId] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [tipoDeNota, setTipoDeNota] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState(null);
  const [postResponse, setPostResponse] = useState(null);
  const [cargandoNota, setCargandoNota] = useState(!!id);
  const [catalogosCargados, setCatalogosCargados] = useState(false);

  // Observar cambios en opción de publicación
  const opcionPublicacion = watch('opcionPublicacion');

  // Cargar catálogos
  useEffect(() => {
    const obtenerCatalogos = async () => {
      try {
        const [seccionesRes, tiposNotaRes] = await Promise.all([
          catalogoSeccionesGet(),
          catalogoTipoNotaGet()
        ]);

        setSecciones(seccionesRes);
        setTipoDeNota(tiposNotaRes);
        setCatalogosCargados(true);

        // Inicializar categorías para nuevas notas
        if (!id) {
          const inicialCategorias = {};
          seccionesRes.forEach(seccion => {
            if (seccion.categorias?.length > 0) {
              inicialCategorias[seccion.seccion] = seccion.categorias[0].nombre;
            }
          });
          setValue('categoriasSeleccionadas', inicialCategorias);
        }
      } catch (error) {
        console.error("❌ Error obteniendo catálogos:", error);
      }
    };

    obtenerCatalogos();
  }, [id, setValue]);

  // Cargar nota existente
  useEffect(() => {
    if (id && catalogosCargados) {
      const cargarNota = async () => {
        try {
          const response = await notaGetById(id);
          const data = Array.isArray(response) ? response[0] : response;

          if (!data) throw new Error('Nota no encontrada');

          setNotaId(data.id);
          
          // Resetear formulario con los datos de la nota
          reset({
            titulo: data.titulo,
            subtitulo: data.subtitulo,
            autor: data.autor,
            contenido: data.descripcion,
            opcionPublicacion: data.programar_publicacion ? 'programar' : 'publicada',
            fechaProgramada: data.programar_publicacion || '',
            tipoDeNotaSeleccionada: data.tipo_nota || '',
            categoriasSeleccionadas: data.secciones_categorias?.reduce((acc, { seccion, categoria }) => {
              acc[seccion] = categoria;
              return acc;
            }, {}) || {}
          });
        } catch (error) {
          console.error('Error detallado:', error);
          setPostError('Error cargando nota: ' + error.message);
        } finally {
          setCargandoNota(false);
        }
      };
      cargarNota();
    }
  }, [id, catalogosCargados, reset]);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setIsPosting(true);
    setPostError(null);
    setPostResponse(null);

    try {
      const seccionesCategorias = Object.entries(data.categoriasSeleccionadas)
        .filter(([_, categoria]) => categoria)
        .map(([seccion, categoria]) => ({ seccion, categoria }));

      const datosNota = {
        tipo_nota: data.tipoDeNotaSeleccionada,
        secciones_categorias: seccionesCategorias,
        titulo: data.titulo,
        subtitulo: data.subtitulo,
        autor: data.autor,
        descripcion: data.contenido,
        estatus: "publicada",
        programar_publicacion: data.opcionPublicacion === 'programar' ? data.fechaProgramada : null
      };

      let resultado;
      if (notaId) {
        resultado = await notaEditar(notaId, datosNota);
      } else {
        resultado = await notaCrear(datosNota);
        setNotaId(resultado.id);
      }

      if (data.imagen && (notaId || resultado.id)) {
        await notaImagenPut(notaId || resultado.id, data.imagen);
      }

      setPostResponse(resultado);
      setTimeout(() => navigate('/notas'), 1);
    } catch (error) {
      setPostError(error.message || 'Error al guardar la nota');
    } finally {
      setIsPosting(false);
    }
  };

  if (cargandoNota) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mx-auto">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="text-center px-6 py-6 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800">
                  {notaId ? 'Editar Nota' : 'Nueva Nota'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {notaId ? 'Edita la publicación existente' : 'Crea una nueva publicación completando los siguientes campos'}
                </p>
              </div>

              <div className="px-6 py-6 space-y-6">
                {postResponse && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          {notaId ? '¡Nota actualizada correctamente!' : '¡Nota creada correctamente!'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {postError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          Error: {postError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-5">
                  <div className="p-5 border-1">
                    <p className="mb-1 text-xl">Tipo de Nota</p>
                    {tipoDeNota.map((opcion, idx) => (
                      <label key={idx} className="block mb-2">
                        <Controller
                          name="tipoDeNotaSeleccionada"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="radio"
                              value={opcion.nombre}
                              checked={field.value === opcion.nombre}
                              onChange={() => field.onChange(opcion.nombre)}
                              className="mr-1"
                            />
                          )}
                        />
                        {opcion.nombre}
                      </label>
                    ))}
                  </div>
                  
                  {secciones.map((seccion) => (
                    <div key={seccion.seccion} className="p-5 border-1">
                      <h2 className="font-bold mb-2 text-xl">{seccion.seccion}</h2>
                      {seccion.categorias.map((categoria) => (
                        <label
                          key={`${seccion.seccion}-${categoria.nombre}`}
                          className="block mb-1"
                        >
                          <Controller
                            name={`categoriasSeleccionadas.${seccion.seccion}`}
                            control={control}
                            render={({ field }) => (
                              <input
                                type="radio"
                                value={categoria.nombre}
                                checked={field.value === categoria.nombre}
                                onChange={() => field.onChange(categoria.nombre)}
                                className="mr-2"
                              />
                            )}
                          />
                          {categoria.nombre}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
                
                <Titulo />
                <Subtitulo />
                <Autor />
                <Contenido />
                
                <OpcionesPublicacion
                  opcionSeleccionada={opcionPublicacion}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen de la nota
                  </label>
                  <Controller
                    name="imagen"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files[0])}
                        className="block w-full text-sm text-gray-700"
                      />
                    )}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                    disabled={isPosting}
                  >
                    {isPosting
                      ? (notaId ? 'Actualizando...' : 'Publicando...')
                      : (notaId ? 'Actualizar Nota' : 'Publicar Nota')}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default FormMainResidente;