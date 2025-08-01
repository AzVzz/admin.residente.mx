import { useForm, FormProvider } from 'react-hook-form';
import { useAuth } from '../../../Context';
import Login from '../../../../componentes/login';

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
import CategoriasTipoNotaSelector from './componentes/CategoriasTipoNotaSelector.jsx';
import ImagenNotaSelector from './componentes/ImagenNotaSelector.jsx';
import BotonSubmitNota from './componentes/BotonSubmitNota.jsx';
import AlertaNota from './componentes/AlertaNota.jsx';
import FormularioPromoExt from '../../../promociones/componentes/FormularioPromoExt.jsx';

const tipoNotaPorPermiso = {
  "mama-de-rocco": "Mamá de Rocco",
  "barrio-antiguo": "Barrio Antiguo",
  // agrega más si tienes
};

const FormMainResidente = () => {
  const { usuario, token } = useAuth(); // usuario viene del contexto

  // Determina el tipo de nota por el permiso del usuario
  const tipoNotaUsuario = usuario ? tipoNotaPorPermiso[usuario.permisos] : '';

  const { id } = useParams();
  const navigate = useNavigate();

  

  // Si no hay token, muestra el login
  if (!token) {
    return (
      <div className="max-w-[400px] mx-auto mt-10">
        <Login />
      </div>
    );
  }

  // Configuración de React Hook Form
  const methods = useForm({
    defaultValues: {
      titulo: '',
      subtitulo: '',
      autor: '',
      contenido: '',
      sticker: [],
      opcionPublicacion: 'publicada',
      fechaProgramada: '',
      tipoDeNotaSeleccionada: tipoNotaUsuario || '',
      categoriasSeleccionadas: {},
      imagen: null,
      destacada: false
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
  const [imagenActual, setImagenActual] = useState(null);

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
            inicialCategorias[seccion.seccion] = ""; // <-- Ninguna seleccionada
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
            tipoDeNotaSeleccionada: tipoNotaUsuario || data.tipo_nota || '',
            categoriasSeleccionadas: Array.isArray(data.secciones_categorias)
              ? data.secciones_categorias.reduce((acc, { seccion, categoria }) => {
                acc[seccion] = categoria;
                return acc;
              }, {})
              : {},
            sticker: data.sticker || '',
          });
          setImagenActual(data.imagen || null);
        } catch (error) {
          console.error('Error detallado:', error);
          setPostError('Error cargando nota: ' + error.message);
        } finally {
          setCargandoNota(false);
        }
      };
      cargarNota();
    }
  }, [id, catalogosCargados, reset, tipoNotaUsuario]);

  // 2. Cuando obtengas tipoNotaUsuario del contexto, actualiza el valor del formulario
  useEffect(() => {
    // Si hay tipoNotaUsuario, fuerza el valor en el formulario
    if (tipoNotaUsuario) {
      setValue('tipoDeNotaSeleccionada', tipoNotaUsuario);
    }
  }, [tipoNotaUsuario, setValue]);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setIsPosting(true);
    setPostError(null);
    setPostResponse(null);

    try {
      const seccionesCategorias = Object.entries(data.categoriasSeleccionadas)
        .filter(([_, categoria]) => categoria)
        .map(([seccion, categoria]) => ({ seccion, categoria }));

      // Fuerza el tipo de nota correcto
      const tipoNotaFinal = tipoNotaUsuario || data.tipoDeNotaSeleccionada;

      const datosNota = {
        tipo_nota: tipoNotaFinal,
        secciones_categorias: seccionesCategorias,
        titulo: data.titulo,
        subtitulo: data.subtitulo,
        autor: data.autor,
        descripcion: data.contenido,
        sticker: data.sticker,
        estatus:
          data.opcionPublicacion === 'programar'
            ? 'programada'
            : data.opcionPublicacion === 'borrador'
              ? 'borrador'
              : 'publicada',
        programar_publicacion: data.opcionPublicacion === 'programar' ? data.fechaProgramada : null,
        destacada: data.destacada || false,
      };

      let resultado;
      if (notaId) {
        resultado = await notaEditar(notaId, datosNota, token);
      } else {
        resultado = await notaCrear(datosNota, token);
        setNotaId(resultado.id);
      }

      if (data.imagen && (notaId || resultado.id)) {
        await notaImagenPut(notaId || resultado.id, data.imagen, token);
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

  // Obteniendo el valor seleccionado del tipo de nota
  const tipoNotaSeleccionada = watch('tipoDeNotaSeleccionada') || tipoNotaUsuario;

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
                <AlertaNota postResponse={postResponse} postError={postError} notaId={notaId} />

                <ImagenNotaSelector
                  imagenActual={imagenActual}
                  notaId={notaId}
                  onImagenEliminada={() => setImagenActual(null)}
                />

                {/* Solo muestra el selector si NO hay tipoNotaUsuario */}
                <CategoriasTipoNotaSelector
                  tipoDeNota={tipoDeNota}
                  secciones={secciones}
                  ocultarTipoNota={!!tipoNotaUsuario}
                />

                {/* Checkbox para destacar, solo si tipo_nota es Restaurantes */}
                {(tipoNotaSeleccionada === "Restaurantes") && (
                  <div className="mb-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        {...methods.register("destacada")}
                        className="form-checkbox h-5 w-5 text-yellow-500"
                      />
                      <span className="ml-2 text-gray-700 font-medium">Marcar como destacada</span>
                    </label>
                  </div>
                )}

                {/* Si hay tipoNotaUsuario, muéstralo como texto */}
                {tipoNotaUsuario && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Tipo de nota:</label>
                    <div className="text-lg font-bold">{tipoNotaUsuario}</div>
                  </div>
                )}

                <Titulo />

                <Subtitulo />

                <Autor />

                <Contenido />

                <FormularioPromoExt
                  onStickerSelect={clave => setValue('sticker', clave)}
                  stickerSeleccionado={watch('sticker')}
                  maxStickers={2}
                />
                {/* Mostrar el sticker seleccionado */}
                <div className="mt-2 text-sm text-gray-700">
                  Sticker seleccionado: {watch('sticker')}
                </div>

                <OpcionesPublicacion
                  opcionSeleccionada={opcionPublicacion}
                  onOpcionChange={value => setValue('opcionPublicacion', value)}
                  fechaProgramada={watch('fechaProgramada')}
                  onFechaChange={value => setValue('fechaProgramada', value)}
                />

                <BotonSubmitNota
                  isPosting={isPosting}
                  notaId={notaId}
                />
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default FormMainResidente;