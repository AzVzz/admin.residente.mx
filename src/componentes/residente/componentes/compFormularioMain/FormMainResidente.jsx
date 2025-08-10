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
import PostPrincipal from './componentesMuestraNotas/PostPrincipal.jsx';
import PostLoMasVisto from './componentesMuestraNotas/PostLoMasVisto.jsx';
import PostVertical from './componentesMuestraNotas/PostVertical.jsx';
import PostHorizontal from './componentesMuestraNotas/PostHorizontal.jsx';
import PostLoMasVistoDirectorio from './componentesMuestraNotas/PostLoMasVistoDirectorio.jsx';
import NombreRestaurante from './componentes/NombreRestaurante.jsx';

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


  // Watch para mostrar en tiempo real las notas editandose:
  const titulo = watch('titulo');
  const subtitulo = watch('subtitulo');
  const autor = watch('autor');
  const contenido = watch('contenido');
  const imagen = watch('imagen');
  //const tipoNotaSeleccionada = watch('tipoDeNotaSeleccionada') || tipoNotaUsuario;
  const fechaProgramada = watch('fechaProgramada');

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

      // Guardar nombre_restaurante SOLO si es Restaurantes y destacada
      if ((tipoNotaFinal === "Restaurantes") && datosNota.destacada) {
        datosNota.nombre_restaurante = data.nombre_restaurante || null;
      } else {
        datosNota.nombre_restaurante = null;
      }

      console.log("=== DATOS QUE SE ENVÍAN AL BACKEND ===");
      console.log("datosNota:", datosNota);
      console.log("Estatus final:", datosNota.estatus);
      console.log("programar_publicacion:", datosNota.programar_publicacion);

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

                {/* Solo muestra el selector si NO hay tipoNotaUsuario */}
                <CategoriasTipoNotaSelector
                  tipoDeNota={tipoDeNota}
                  secciones={secciones}
                  ocultarTipoNota={!!tipoNotaUsuario}
                />

                {/* Checkbox para destacar, solo si tipo_nota es Restaurantes */}
                {(tipoNotaSeleccionada === "Restaurantes" || tipoNotaSeleccionada === "Food & Drink") && (
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
      <div className="grid grid-cols-[2.9fr_1.1fr] gap-5 py-6 border-b">
        <PostHorizontal
          titulo={titulo}
          imagen={imagen && typeof imagen === 'object' ? URL.createObjectURL(imagen) : imagen}
          tipoNota={tipoNotaSeleccionada}
        />
        <PostLoMasVistoDirectorio
          tipoDeNota={tipoNotaSeleccionada}
          titulo={titulo}
          imagen={imagen && typeof imagen === 'object' ? URL.createObjectURL(imagen) : imagen}
        />
      </div>
      <div className="grid grid-cols-[2fr_1fr] gap-4 py-6">
        <div>
          <PostPrincipal
            titulo={titulo}
            subtitulo={subtitulo}
            autor={autor}
            contenido={contenido}
            imagen={imagen && typeof imagen === 'object' ? URL.createObjectURL(imagen) : imagen}
            tipoNota={tipoNotaSeleccionada}
            fecha={fechaActual}
          />
        </div>
        <div className="flex flex-col">
          <PostLoMasVisto
            titulo={titulo}
            imagen={imagen && typeof imagen === 'object' ? URL.createObjectURL(imagen) : imagen}
            fecha={fechaActual}
          />
          <PostVertical
            titulo={titulo}
            imagen={imagen && typeof imagen === 'object' ? URL.createObjectURL(imagen) : imagen}
            tipoNota={tipoNotaSeleccionada}
          />
        </div>
      </div>
    </div>
  );
};

export default FormMainResidente;