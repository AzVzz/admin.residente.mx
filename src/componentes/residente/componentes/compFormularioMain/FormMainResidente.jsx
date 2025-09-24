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
import { notaDelete } from "../../../api/notaDelete";
import { notaGetById } from '../../../../componentes/api/notasCompletasGet.js';
import { catalogoSeccionesGet, catalogoTipoNotaGet } from '../../../../componentes/api/CatalogoSeccionesGet.js';
import CategoriasTipoNotaSelector from './componentes/CategoriasTipoNotaSelector.jsx';
import ImagenNotaSelector from './componentes/ImagenNotaSelector.jsx';
import InstafotoSelector from './componentes/InstafotoSelector.jsx';
import BotonSubmitNota from './componentes/BotonSubmitNota.jsx';
import AlertaNota from './componentes/AlertaNota.jsx';
import FormularioPromoExt from '../../../promociones/componentes/FormularioPromoExt.jsx';
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
      <div 
      lassName="max-w-[400px] mx-auto mt-10">
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
      tiposDeNotaSeleccionadas: '',
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


  function isContenidoVacio(contenido) {
    // Elimina etiquetas HTML y espacios
    const textoPlano = contenido
      ? contenido.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim()
      : '';
    return !textoPlano;
  }


  // --- Lógica para campos obligatorios ---
  const camposFaltantes = [];
  if (!titulo) camposFaltantes.push('título');
  if (!subtitulo) camposFaltantes.push('subtítulo');
  if (!imagen && !imagenActual) camposFaltantes.push('imagen');
  if (isContenidoVacio(contenido)) camposFaltantes.push('contenido');
  if (!watch('tiposDeNotaSeleccionadas')) camposFaltantes.push('tipo de nota');
  if (
    watch('destacada') &&
    (watch('tiposDeNotaSeleccionadas') === "Restaurantes" || watch('tiposDeNotaSeleccionadas') === "Food & Drink") &&
    !watch('nombre_restaurante')
  ) {
    camposFaltantes.push('nombre del restaurante');
  }
  // Validación de stickers
  const stickersSeleccionados = Array.isArray(watch('sticker')) ? watch('sticker') : [];
  if (stickersSeleccionados.length < 2) {
    camposFaltantes.push(`selecciona ${2 - stickersSeleccionados.length} sticker${2 - stickersSeleccionados.length === 1 ? '' : 's'}`);
  }
  const faltanCamposObligatorios = camposFaltantes.length > 0;


  useEffect(() => {
    if (faltanCamposObligatorios) {
      setValue('opcionPublicacion', 'borrador');
    }
  }, [faltanCamposObligatorios, setValue]);


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
// --- CONVERSIÓN DE FECHA CORREGIDA ---
let fechaProgramada = '';
if (data.programar_publicacion) {
  try {
    // Crear objeto Date (maneja automáticamente UTC a hora local)
    const fecha = new Date(data.programar_publicacion);
    
    // Formatear a YYYY-MM-DDTHH:MM para el input datetime-local
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    
    fechaProgramada = `${anio}-${mes}-${dia}T${horas}:${minutos}`;
  } catch (e) {
    console.error('Error convirtiendo fecha:', e);
    fechaProgramada = '';
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

          let opcionPublicacion = 'publicada'; // valor por defecto
          if (data.estatus === 'borrador') {
            opcionPublicacion = 'borrador';
          } else if (data.programar_publicacion) {
            opcionPublicacion = 'programar';
          }

          reset({
            titulo: data.titulo,
            subtitulo: data.subtitulo,
            autor: autor,
            contenido: data.descripcion || '',
            opcionPublicacion: opcionPublicacion,
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
            destacada_normal: !!data.destacada_normal, // <-- agrega esta línea
            nombre_restaurante: data.nombre_restaurante || '',
            tiposDeNotaSeleccionadas: data.tipo_nota || '',
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


    // Determinar el estado de la nota según los permisos del usuario y si falta imagen
    let estadoFinal;
    if (
      (!data.imagen && !imagenActual) ||
      !data.titulo ||
      !data.subtitulo ||
      !data.contenido
    ) {
      estadoFinal = 'borrador';
    } else if (usuario?.permisos === 'todos') {
      estadoFinal = data.opcionPublicacion === 'programar'
        ? 'programada'
        : data.opcionPublicacion === 'borrador'
          ? 'borrador'
          : 'publicada';
    } else {
      estadoFinal = 'borrador';
    }


    try {
      const seccionesCategorias = Object.entries(data.categoriasSeleccionadas)
        .filter(([_, categoria]) => categoria)
        .map(([seccion, categoria]) => ({ seccion, categoria }));

      const tipoNotaFinal = tipoNotaUsuario || data.tiposDeNotaSeleccionadas || null;
      const tipoNotaSecundaria = null; // Ya no hay secundaria



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
        destacada_normal: data.destacada_normal || false, // <-- aquí
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

  const [eliminando, setEliminando] = useState(false); // Estado para manejar el proceso de eliminación

  // Función para eliminar la nota
  const eliminarNota = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta nota?")) {
      setEliminando(true);
      try {
        await notaDelete(notaId, token); // Llama a la API para eliminar la nota
        alert("Nota eliminada con éxito.");
        navigate("/notas"); // Redirige a la lista de notas
      } catch (error) {
        alert("Error al eliminar la nota.");
      } finally {
        setEliminando(false);
      }
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
  const tipoNotaSeleccionada = watch('tiposDeNotaSeleccionadas') || tipoNotaUsuario;

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
                      📝 {watch('tiposDeNotaSeleccionadas') || ''}
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
                  const tipoNota = watch('tiposDeNotaSeleccionadas');
                  const esDestacada = watch('destacada');
                  let textoDestacada = "Marcar como destacada";
                  if (tipoNota === "Restaurantes") textoDestacada = "Marcar como restaurante recomendado";
                  if (tipoNota === "Food & Drink") textoDestacada = "Marcar como platillo icónico";
                  
                  if (tipoNota === "Restaurantes" || tipoNota === "Food & Drink") {
                    return (
                      <div className="mb-4 flex gap-6">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            {...methods.register("destacada")}
                            className="form-checkbox h-5 w-5 text-yellow-500"
                          />
                          <span className="ml-2 text-gray-700 font-medium">{textoDestacada}</span>
                        </label>
                        {esDestacada && (
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              {...methods.register("destacada_normal")}
                              className="form-checkbox h-5 w-5 text-blue-500"
                            />
                            <span className="ml-2 text-gray-700 font-medium">También mostrar como destacada normal</span>
                          </label>
                        )}
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
                    {/* --- Mensaje si faltan campos --- */}
                    {faltanCamposObligatorios && (
                      <div className="mb-2 text-red-600 text-sm font-medium">
                        Si quieres publicar llena los campos faltantes: {camposFaltantes.join(', ')}
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="publicar-ahora"
                          value="publicada"
                          {...methods.register("opcionPublicacion")}
                          className="w-4 h-4 text-yellow-600 bg-white border-yellow-300 focus:ring-yellow-500"
                          disabled={faltanCamposObligatorios}
                        />
                        <label htmlFor="publicar-ahora" className={`text-sm text-yellow-800 cursor-pointer ${faltanCamposObligatorios ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                          disabled={faltanCamposObligatorios}
                        />
                        <label htmlFor="programar" className={`text-sm text-yellow-800 cursor-pointer ${faltanCamposObligatorios ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                          disabled={faltanCamposObligatorios}
                        />
                        <label htmlFor="borrador" className="text-sm text-yellow-800 cursor-pointer">
                          Guardar como borrador
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón para eliminar la nota */}
                {notaId && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={eliminarNota}
                      disabled={eliminando}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        eliminando
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {eliminando ? "Eliminando..." : "Eliminar Nota"}
                    </button>
                  </div>
                )}

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

        {/* Solo mostrar vista previa si hay contenido */}
        {(titulo || subtitulo || autor || contenido || imagen || instafoto) ? (
          <div className="flex justify-center">
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
            <div className="flex w-[680px]">
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
          <div className=" shadow-lg border border-gray-200 p-6 text-center text-gray-500">
            <p>Comienza a escribir para ver la vista previa de tu nota</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormMainResidente;