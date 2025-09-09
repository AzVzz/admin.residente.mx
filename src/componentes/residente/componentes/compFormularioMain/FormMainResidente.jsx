import { useForm, FormProvider } from 'react-hook-form';
import { useAuth } from '../../../Context';
import Login from '../../../../componentes/login';

import Autor from "./componentes/Autor";
import Contenido from "./componentes/Contenido";
import OpcionesPublicacion from "./componentes/OpcionesPublicacion";
import Subtitulo from "./componentes/Subtitulo";
import Titulo from "./componentes/Titulo";
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notaCrear, notaEditar, notaImagenPut, notaInstafotoPut, notaInstafotoDelete } from '../../../../componentes/api/notaCrearPostPut.js';
import { notaGetById } from '../../../../componentes/api/notasCompletasGet.js';
import { catalogoSeccionesGet, catalogoTipoNotaGet } from '../../../../componentes/api/CatalogoSeccionesGet.js';
import CategoriasTipoNotaSelector from './componentes/CategoriasTipoNotaSelector.jsx';
import ImagenNotaSelector from './componentes/ImagenNotaSelector.jsx';
import InstafotoSelector from './componentes/InstafotoSelector.jsx';
import BotonSubmitNota from './componentes/BotonSubmitNota.jsx';
import AlertaNota from './componentes/AlertaNota.jsx';
import FormularioPromoExt from '../../../promociones/componentes/FormularioPromoExt.jsx';
import PostPrincipal from './componentesMuestraNotas/PostPrincipal.jsx';
import PostLoMasVisto from './componentesMuestraNotas/PostLoMasVisto.jsx';
import PostVertical from './componentesMuestraNotas/PostVertical.jsx';
import PostHorizontal from './componentesMuestraNotas/PostHorizontal.jsx';
import PostLoMasVistoDirectorio from './componentesMuestraNotas/PostLoMasVistoDirectorio.jsx';
import NombreRestaurante from './componentes/NombreRestaurante.jsx';
import DetallePost from '../DetallePost.jsx';

const tipoNotaPorPermiso = {
  "mama-de-rocco": "Mamá de Rocco",
  "barrio-antiguo": "Barrio Antiguo",
  // agrega más si tienes
};

function formatFecha(fecha) {
  const meses = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
  ];
  const d = new Date(fecha);
  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  const año = d.getFullYear();
  return `${mes} ${dia}, ${año}`;
}

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
      instafoto: null,
      destacada: false,
      tiposDeNotaSeleccionadas: [],
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
  const [instafotoActual, setInstafotoActual] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const imagenPreviewUrlRef = useRef(null);


  // Watch para mostrar en tiempo real las notas editandose:
  const titulo = watch('titulo');
  const subtitulo = watch('subtitulo');
  const autor = watch('autor');
  const contenido = watch('contenido');
  const imagen = watch('imagen');
  const instafoto = watch('instafoto');
  //const tipoNotaSeleccionada = watch('tipoDeNotaSeleccionada') || tipoNotaUsuario;
  const fechaProgramada = watch('fechaProgramada');

  // Observar cambios en opción de publicación
  const opcionPublicacion = watch('opcionPublicacion');

  useEffect(() => {
    // Limpia la URL anterior si existe
    if (imagenPreviewUrlRef.current) {
      URL.revokeObjectURL(imagenPreviewUrlRef.current);
      imagenPreviewUrlRef.current = null;
    }

    if (imagen && typeof imagen === 'object' && imagen instanceof File) {
      const url = URL.createObjectURL(imagen);
      setImagenPreview(url);
      imagenPreviewUrlRef.current = url;
    } else if (imagen) {
      setImagenPreview(imagen);
    } else if (imagenActual) {
      setImagenPreview(imagenActual);
    } else {
      setImagenPreview(null);
    }
  }, [imagen, imagenActual]);



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

          // --- CONVERSIÓN DE FECHA ---
          let fechaProgramada = '';
          if (data.programar_publicacion) {
            // Si ya viene en formato ISO (ej: 2025-08-05T15:00), úsalo directo
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(data.programar_publicacion)) {
              fechaProgramada = data.programar_publicacion.slice(0, 16);
            } else if (/\d{2}\/\d{2}\/\d{4}/.test(data.programar_publicacion)) {
              // Convierte "05/08/2025 03:00 p.m." a "2025-08-05T15:00"
              try {
                const [dia, mes, anioHora] = data.programar_publicacion.split('/');
                const [anio, horaMinAMPM] = anioHora.trim().split(' ');
                let [hora, minuto] = horaMinAMPM.split(':');
                let ampm = horaMinAMPM.toLowerCase().includes('p.m.') ? 'PM' : 'AM';
                hora = parseInt(hora, 10);
                if (ampm === 'PM' && hora < 12) hora += 12;
                if (ampm === 'AM' && hora === 12) hora = 0;
                fechaProgramada = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${hora.toString().padStart(2, '0')}:${minuto}`;
              } catch (e) {
                fechaProgramada = '';
              }
            }
          }

          // Resetear formulario con los datos de la nota
          let autor = data.autor;
          if (!autor) {
            // Intenta obtener el usuario de localStorage
            try {
              const usuarioLS = localStorage.getItem('usuario');
              if (usuarioLS) {
                const usuarioObj = JSON.parse(usuarioLS);
                autor = usuarioObj.nombre_usuario || '';
              }
            } catch (e) {
              autor = '';
            }
          }

          reset({
            titulo: data.titulo,
            subtitulo: data.subtitulo,
            autor: autor, // <--- aquí ya va el nombre si estaba vacío
            contenido: data.descripcion,
            opcionPublicacion: data.programar_publicacion ? 'programar' : 'publicada',
            fechaProgramada: fechaProgramada || '',
            tipoDeNotaSeleccionada: tipoNotaUsuario || data.tipo_nota || '',
            categoriasSeleccionadas: Array.isArray(data.secciones_categorias)
              ? data.secciones_categorias.reduce((acc, { seccion, categoria }) => {
                acc[seccion] = categoria;
                return acc;
              }, {})
              : {},
            sticker: data.sticker || '',
            destacada: !!data.destacada,
            nombre_restaurante: data.nombre_restaurante || '',
            tiposDeNotaSeleccionadas: [
              data.tipo_nota || '',
              data.tipo_nota2 || ''
            ].filter(Boolean),
          });
          setImagenActual(data.imagen || null);
          setInstafotoActual(data.insta_imagen || null);
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

      const tiposSeleccionados = data.tiposDeNotaSeleccionadas || [];
      const tipoNotaFinal = tipoNotaUsuario || tiposSeleccionados[0] || null;
      const tipoNotaSecundaria = tiposSeleccionados[1] || null;

      // Determinar el estado de la nota según los permisos del usuario
      let estadoFinal;
      if (usuario?.permisos === 'todos') {
        // Usuarios con permisos completos pueden elegir el estado
        estadoFinal = data.opcionPublicacion === 'programar'
          ? 'programada'
          : data.opcionPublicacion === 'borrador'
            ? 'borrador'
            : 'publicada';
      } else {
        // Usuarios con acceso limitado siempre suben en borrador
        estadoFinal = 'borrador';
      }

      const datosNota = {
        tipo_nota: tipoNotaFinal,
        tipo_nota2: tipoNotaSecundaria,
        secciones_categorias: seccionesCategorias,
        titulo: data.titulo,
        subtitulo: data.subtitulo,
        autor: data.autor,
        descripcion: data.contenido,
        sticker: data.sticker,
        estatus: estadoFinal,
        programar_publicacion: data.opcionPublicacion === 'programar' ? data.fechaProgramada : null,
        destacada: data.destacada || false,
      };

      // Guardar nombre_restaurante SOLO si es Restaurantes y destacada
      if (
        (tipoNotaFinal === "Restaurantes" || tipoNotaFinal === "Food & Drink") &&
        datosNota.destacada
      ) {
        datosNota.nombre_restaurante = data.nombre_restaurante || null;
      } else {
        datosNota.nombre_restaurante = null;
      }

      //console.log("=== DATOS QUE SE ENVÍAN AL BACKEND ===");
      //console.log("datosNota:", datosNota);
      //console.log("Estatus final:", datosNota.estatus);
      //console.log("programar_publicacion:", datosNota.programar_publicacion);
      //console.log("Usuario permisos:", usuario?.permisos);

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

      // Manejar la instafoto de manera similar a la imagen principal
      if (data.instafoto && (notaId || resultado.id)) {
        await notaInstafotoPut(notaId || resultado.id, data.instafoto, token);
      }

      setPostResponse(resultado);

      // Mostrar mensaje diferente según el estado
      if (estadoFinal === 'borrador') {
        setPostResponse({
          ...resultado,
          mensaje: 'Nota guardada como borrador. Un administrador la revisará y publicará.'
        });
      }

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

  const fechaActual = formatFecha(new Date());

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

                <InstafotoSelector
                  instafotoActual={instafotoActual}
                  notaId={notaId}
                  onInstafotoEliminada={() => setInstafotoActual(null)}
                />

                {/* Filtros completamente ocultos para todos los usuarios */}
                {/* <CategoriasTipoNotaSelector
                  tipoDeNota={tipoDeNota}
                  secciones={secciones}
                  ocultarTipoNota={!!tipoNotaUsuario}
                /> */}

                {/* Si hay tipoNotaUsuario, muéstralo como texto prominente */}
                {tipoNotaUsuario && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-medium text-blue-800 mb-2">Tipo de nota:</label>
                    <div className="text-2xl font-bold text-blue-900 bg-white px-4 py-2 rounded-md border border-blue-300">
                      📝 {tipoNotaUsuario}
                    </div>
                  </div>
                )}

                {/* Mostrar tipo de nota para usuarios con permisos 'todos' */}
                {!tipoNotaUsuario && usuario?.permisos === 'todos' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <label className="block text-sm font-medium text-green-800 mb-2">Tipo de nota:</label>
                    <div className="text-2xl font-bold text-green-900 bg-white px-4 py-2 rounded-md border border-green-300">
                      📝 {(watch('tiposDeNotaSeleccionadas') || []).join(' / ') || ''}
                    </div>
                  </div>
                )}

                {/* Mostrar tipo de nota para usuarios sin permisos específicos */}
                {!tipoNotaUsuario && usuario?.permisos !== 'todos' && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-800 mb-2">Tipo de nota:</label>
                    <div className="text-2xl font-bold text-gray-900 bg-white px-4 py-2 rounded-md border border-gray-300">
                      📝 Sin tipo asignado
                    </div>
                  </div>
                )}

                {/* Secciones de filtros restauradas para usuarios con permisos 'todos' */}
                {usuario?.permisos === 'todos' && (
                  <CategoriasTipoNotaSelector
                    tipoDeNota={tipoDeNota}
                    secciones={secciones}
                    ocultarTipoNota={!!tipoNotaUsuario}
                  />
                )}

                {/* Checkbox para destacar, solo si tipo_nota es Restaurantes */}
                {(() => {
                  const tipos = watch('tiposDeNotaSeleccionadas') || [];
                  // Solo mostrar si incluye Restaurantes o Food & Drink
                  if (tipos.includes("Restaurantes") || tipos.includes("Food & Drink")) {
                    return (
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
                    );
                  }
                  return null;
                })()}

                <NombreRestaurante />

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

                {/* Opciones de publicación */}
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800 mb-4">
                  </div>

                  {/* Opciones de publicación */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-yellow-800 mb-3">
                      Opciones de Publicación
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="publicar-ahora"
                          value="publicada"
                          {...methods.register("opcionPublicacion")}
                          className="w-4 h-4 text-yellow-600 bg-white border-yellow-300 focus:ring-yellow-500"
                        />
                        <label htmlFor="publicar-ahora" className="text-sm text-yellow-800 cursor-pointer">
                          Publicar ahora
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="programar"
                          value="programar"
                          {...methods.register("opcionPublicacion")}
                          className="w-4 h-4 text-yellow-600 bg-white border-yellow-300 focus:ring-yellow-500"
                        />
                        <label htmlFor="programar" className="text-sm text-yellow-800 cursor-pointer">
                          Programar publicación
                        </label>
                      </div>

                      <div className="ml-6 space-y-2">
                        <label htmlFor="fecha-programada" className="block text-xs text-yellow-700">
                          Fecha y hora de publicación
                        </label>
                        <input
                          id="fecha-programada"
                          type="datetime-local"
                          {...methods.register("fechaProgramada")}
                          className="w-full max-w-xs px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-yellow-100 disabled:cursor-not-allowed"
                          disabled={watch('opcionPublicacion') !== "programar"}
                          required={watch('opcionPublicacion') === "programar"}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="borrador"
                          value="borrador"
                          {...methods.register("opcionPublicacion")}
                          className="w-4 h-4 text-yellow-600 bg-white border-yellow-300 focus:ring-yellow-500"
                        />
                        <label htmlFor="borrador" className="text-sm text-yellow-800 cursor-pointer">
                          Guardar como borrador
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <BotonSubmitNota
                  isPosting={isPosting}
                  notaId={notaId}
                />

              </div>
            </div>
          </form>
        </FormProvider>
      </div>

      {/* Vista previa de cómo se verá la nota */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📱 Vista previa de tu nota
        </h2>

        <div className="flex justify-center">
          {/* Solo mostrar vista previa si hay contenido */}
          {(titulo || subtitulo || autor || contenido || imagen || instafoto) ? (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              {/*<div className="grid grid-cols-[2.9fr_1.1fr] gap-5 py-6 border-b">
              <PostHorizontal
                titulo={titulo || 'Título de ejemplo'}
                imagen={imagen && typeof imagen === 'object' ? URL.createObjectURL(imagen) : imagen}
                tipoNota={(watch('tiposDeNotaSeleccionadas') || []).join(' / ') || 'Tipo de nota'}
              />
              <PostLoMasVistoDirectorio
                tipoDeNota={tipoNotaSeleccionada || 'Tipo de nota'}
                titulo={titulo || 'Título de ejemplo'}
                imagen={imagen && typeof imagen === 'object' ? URL.createObjectURL(imagen) : imagen}
              />
            </div>*/}
              <div className="grid grid-cols-[2fr_1fr] gap-4 py-6">
                <div>
                  <DetallePost
                    post={{
                      titulo,
                      subtitulo,
                      autor,
                      descripcion: contenido,
                      imagen: imagenPreview,
                      tipo_nota: tipoNotaSeleccionada,
                      nombre_restaurante: watch('nombre_restaurante'),
                      fecha: fechaActual,
                    }}
                    sinFecha={false}
                  />
                </div>
                {/*<div className="flex flex-col">
                <PostLoMasVisto
                  titulo={titulo || 'Título de ejemplo'}
                  imagen={imagen && typeof imagen === 'object' ? URL.createObjectURL(imagen) : imagen}
                  fecha={fechaActual}
                />
                <PostVertical
                  titulo={titulo || 'Título de ejemplo'}
                  imagen={imagen && typeof imagen === 'object' ? URL.createObjectURL(imagen) : imagen}
                  tipoNota={tipoNotaSeleccionada || 'Tipo de nota'}
                />
              </div>*/}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center text-gray-500">
              <p>Comienza a escribir para ver la vista previa de tu nota</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormMainResidente;