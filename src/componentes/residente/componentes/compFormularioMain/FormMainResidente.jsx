import { useForm, FormProvider } from "react-hook-form";
import { useAuth } from "../../../Context";
import Login from "../../../../componentes/Login";

import Autor from "./componentes/Autor";
import Contenido from "./componentes/Contenido";
import OpcionesPublicacion from "./componentes/OpcionesPublicacion";
import Subtitulo from "./componentes/Subtitulo";
import Titulo from "./componentes/Titulo";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  notaCrear,
  notaEditar,
  notaImagenPut,
  notaInstafotoPut,
  notaInstafotoDelete,
} from "../../../../componentes/api/notaCrearPostPut.js";
import { notaDelete } from "../../../api/notaDelete";
import { notaGetById } from "../../../../componentes/api/notasCompletasGet.js";
import {
  catalogoSeccionesGet,
  catalogoTipoNotaGet,
} from "../../../../componentes/api/catalogoSeccionesGet.js";
import CategoriasTipoNotaSelector from "./componentes/CategoriasTipoNotaSelector.jsx";
import ZonasSelector from "./componentes/ZonasSelector.jsx";
import ImagenNotaSelector from "./componentes/ImagenNotaSelector.jsx";
import InstafotoSelector from "./componentes/InstafotoSelector.jsx";
import BotonSubmitNota from "./componentes/BotonSubmitNota.jsx";
import AlertaNota from "./componentes/AlertaNota.jsx";
import FormularioPromoExt from "../../../promociones/componentes/FormularioPromoExt.jsx";
import NombreRestaurante from "./componentes/NombreRestaurante.jsx";
import DetallePost from "../DetallePost.jsx";

const tipoNotaPorPermiso = {
  "mama-de-rocco": "Mamá de Rocco",
  "barrio-antiguo": "Barrio Antiguo",
  // Los demás clientes se generan dinámicamente
};

function formatFecha(fecha) {
  const meses = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];
  const d = new Date(fecha);
  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  const año = d.getFullYear();
  return `${mes} ${dia}, ${año}`;
}

const FormMainResidente = () => {
  const { usuario, token } = useAuth(); // usuario viene del contexto
  const { id } = useParams();
  const navigate = useNavigate();

  // Determina el tipo de nota por el permiso del usuario
  // Generar tipoNotaUsuario dinámicamente basado en los permisos del usuario
  const tipoNotaUsuario = usuario
    ? tipoNotaPorPermiso[usuario.permisos] ||
      (usuario.permisos &&
      usuario.permisos !== "usuario" &&
      usuario.permisos !== "todo" &&
      usuario.permisos !== "todos"
        ? usuario.permisos
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())
        : "")
    : "";

  // Redirect B2B users to their dashboard
  useEffect(() => {
    if (usuario?.rol?.toLowerCase() === "b2b" || usuario?.permisos === "b2b") {
      navigate("/dashboardb2b", { replace: true });
    }
  }, [usuario, navigate]);

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
      titulo: "",
      subtitulo: "",
      autor: "",
      contenido: "",
      sticker: [],
      opcionPublicacion: "publicada",
      fechaProgramada: "",
      tipoDeNotaSeleccionada: tipoNotaUsuario || "",
      categoriasSeleccionadas: {},
      imagen: null,
      instafoto: null,
      programarInstafoto: false,
      fechaProgramadaInstafoto: "",
      destacada: false,
      tiposDeNotaSeleccionadas: "",
      zonas: [],
      seo_alt_text: "",
      seo_title: "",
      seo_keyword: "",
      meta_description: "",
      destacada_invitado: 0,
    },
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
  const titulo = watch("titulo");
  const subtitulo = watch("subtitulo");
  const autor = watch("autor");
  const contenido = watch("contenido");
  const imagen = watch("imagen");
  const instafoto = watch("instafoto");
  const nombreRestaurante = watch("nombre_restaurante");

  function isContenidoVacio(contenido) {
    // Elimina etiquetas HTML y espacios
    const textoPlano = contenido
      ? contenido
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, "")
          .trim()
      : "";
    return !textoPlano;
  }

  // --- Lógica para campos obligatorios ---
  const camposFaltantes = [];
  if (!titulo) camposFaltantes.push("título");
  if (!subtitulo) camposFaltantes.push("subtítulo");
  if (!imagen && !imagenActual) camposFaltantes.push("imagen");
  if (isContenidoVacio(contenido)) camposFaltantes.push("contenido");
  if (!tipoNotaUsuario && !watch("tiposDeNotaSeleccionadas")) {
    camposFaltantes.push("tipo de nota");
  }
  if (
    watch("destacada") &&
    (watch("tiposDeNotaSeleccionadas") === "Restaurantes" ||
      watch("tiposDeNotaSeleccionadas") === "Food & Drink") &&
    !watch("nombre_restaurante")
  ) {
    camposFaltantes.push("nombre del restaurante");
  }
  // Validación de stickers
  const stickersSeleccionados = Array.isArray(watch("sticker"))
    ? watch("sticker")
    : [];
  if (stickersSeleccionados.length < 2) {
    camposFaltantes.push(
      `selecciona ${2 - stickersSeleccionados.length} sticker${
        2 - stickersSeleccionados.length === 1 ? "" : "s"
      }`
    );
  }
  const faltanCamposObligatorios = camposFaltantes.length > 0;

  useEffect(() => {
    if (faltanCamposObligatorios) {
      setValue("opcionPublicacion", "borrador");
    }
  }, [faltanCamposObligatorios, setValue]);

  useEffect(() => {
    if (faltanCamposObligatorios) {
      setValue("opcionPublicacion", "borrador");
    }
  }, [faltanCamposObligatorios, setValue]);

  // --- AUTO-GENERACIÓN SEO (Notas) ---
  const zonas = watch("zonas");
  const tiposDeNotaSeleccionadas = watch("tiposDeNotaSeleccionadas");

  useEffect(() => {
    // Evitar ejecutar si no hay datos mínimos
    if (!titulo) return;

    // Helper para limpiar HTML
    const stripHtml = (html) => {
      if (!html) return "";
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };

    // 1. Obtener valores
    const restaurantName = nombreRestaurante;
    const noteType = tiposDeNotaSeleccionadas || tipoNotaUsuario || "Nota";

    // 2. Generar Formulas

    // Título SEO: If Restaurant ? "{Titulo} - {Restaurant} | Residente" : "{Titulo} | Residente"
    const seoTitle = restaurantName
      ? `${titulo} - ${restaurantName} | Residente`
      : `${titulo} | Residente`;

    // Meta Descripción: Subtitulo (Pri 1) OR Contenido truncado (Pri 2)
    let metaDesc = subtitulo;
    if (!metaDesc && contenido) {
      const cleanContent = stripHtml(contenido);
      metaDesc = cleanContent.substring(0, 155);
    }

    // Palabra Clave: Restaurant (Pri 1) OR Titulo (Pri 2)
    const seoKeyword = restaurantName || titulo;

    // Texto Alt Imagen: "Imagen de {Tipo}: {Titulo} - Residente"
    const altText = `Imagen de ${noteType}: ${titulo} - Residente`;

    // 3. Asignar Valores (Evitando loops si ya son iguales)
    setValue("seo_title", seoTitle);
    setValue("meta_description", metaDesc || "");
    setValue("seo_keyword", seoKeyword);
    setValue("seo_alt_text", altText);
  }, [
    titulo,
    subtitulo,
    nombreRestaurante,
    contenido,
    tiposDeNotaSeleccionadas,
    tipoNotaUsuario,
    setValue,
  ]);
  // -----------------------------------

  useEffect(() => {
    // Limpia la URL anterior si existe
    if (imagenPreviewUrlRef.current) {
      URL.revokeObjectURL(imagenPreviewUrlRef.current);
      imagenPreviewUrlRef.current = null;
    }

    if (imagen && typeof imagen === "object" && imagen instanceof File) {
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

    if (imagen && typeof imagen === "object" && imagen instanceof File) {
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
          catalogoTipoNotaGet(),
        ]);

        setSecciones(seccionesRes);
        setTipoDeNota(tiposNotaRes);
        setCatalogosCargados(true);

        // Inicializar categorías para nuevas notas
        if (!id) {
          const inicialCategorias = {};
          seccionesRes.forEach((seccion) => {
            inicialCategorias[seccion.seccion] = ""; // <-- Ninguna seleccionada
          });
          setValue("categoriasSeleccionadas", inicialCategorias);
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

          if (!data) throw new Error("Nota no encontrada");

          setNotaId(data.id);

          // --- CONVERSIÓN DE FECHA ---
          let fechaProgramada = "";
          if (data.programar_publicacion) {
            try {
              // Crear objeto Date (maneja automáticamente UTC a hora local)
              const fecha = new Date(data.programar_publicacion);

              // Formatear a YYYY-MM-DDTHH:MM para el input datetime-local
              const anio = fecha.getFullYear();
              const mes = String(fecha.getMonth() + 1).padStart(2, "0");
              const dia = String(fecha.getDate()).padStart(2, "0");
              const horas = String(fecha.getHours()).padStart(2, "0");
              const minutos = String(fecha.getMinutes()).padStart(2, "0");

              fechaProgramada = `${anio}-${mes}-${dia}T${horas}:${minutos}`;
            } catch (e) {
              console.error("Error convirtiendo fecha:", e);
              fechaProgramada = "";
            }
          }

          // Resetear formulario con los datos de la nota
          let autor = data.autor;
          if (!autor) {
            // Intenta obtener el usuario de localStorage
            try {
              const usuarioLS = localStorage.getItem("usuario");
              if (usuarioLS) {
                const usuarioObj = JSON.parse(usuarioLS);
                autor = usuarioObj.nombre_usuario || "";
              }
            } catch (e) {
              autor = "";
            }
          }

          let opcionPublicacion = "publicada"; // valor por defecto
          if (data.estatus === "borrador") {
            opcionPublicacion = "borrador";
          } else if (data.programar_publicacion) {
            opcionPublicacion = "programar";
          }

          // --- CONVERSIÓN DE FECHA INSTAFOTO ---
          let fechaProgramadaInstafoto = "";
          if (data.programar_insta_imagen) {
            try {
              const fechaInsta = new Date(data.programar_insta_imagen);
              const anioInsta = fechaInsta.getFullYear();
              const mesInsta = String(fechaInsta.getMonth() + 1).padStart(2, "0");
              const diaInsta = String(fechaInsta.getDate()).padStart(2, "0");
              const horasInsta = String(fechaInsta.getHours()).padStart(2, "0");
              const minutosInsta = String(fechaInsta.getMinutes()).padStart(2, "0");
              fechaProgramadaInstafoto = `${anioInsta}-${mesInsta}-${diaInsta}T${horasInsta}:${minutosInsta}`;
            } catch (e) {
              console.error("Error convirtiendo fecha instafoto:", e);
              fechaProgramadaInstafoto = "";
            }
          }

          reset({
            titulo: data.titulo,
            subtitulo: data.subtitulo,
            autor: autor,
            contenido: data.descripcion || "",
            opcionPublicacion: opcionPublicacion,
            fechaProgramada: fechaProgramada || "",
            tipoDeNotaSeleccionada: tipoNotaUsuario || data.tipo_nota || "",
            categoriasSeleccionadas: Array.isArray(data.secciones_categorias)
              ? data.secciones_categorias.reduce(
                  (acc, { seccion, categoria }) => {
                    acc[seccion] = categoria;
                    return acc;
                  },
                  {}
                )
              : {},
            sticker: data.sticker || "",
            destacada: !!data.destacada,
            destacada_normal: !!data.destacada_normal, // <-- agrega esta línea
            nombre_restaurante: data.nombre_restaurante || "",
            tiposDeNotaSeleccionadas: data.tipo_nota || "",
            zonas: data.zonas
              ? typeof data.zonas === "string"
                ? JSON.parse(data.zonas)
                : data.zonas
              : [],
            seo_alt_text: data.seo_alt_text || "",
            seo_title: data.seo_title || "",
            seo_keyword: data.seo_keyword || "",
            meta_description: data.meta_description || "",
            destacada_invitado: data.destacada_invitado || 0,
            programarInstafoto: !!data.programar_insta_imagen,
            fechaProgramadaInstafoto: fechaProgramadaInstafoto,
          });
          setImagenActual(data.imagen || null);
          setInstafotoActual(data.insta_imagen || null);
        } catch (error) {
          console.error("Error detallado:", error);
          setPostError("Error cargando nota: " + error.message);
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
      setValue("tipoDeNotaSeleccionada", tipoNotaUsuario);
    }
  }, [tipoNotaUsuario, setValue]);

  // Función de envío modificada
  const onSubmit = async (data, actualizarFecha) => {
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
      estadoFinal = "borrador";
    } else if (usuario?.permisos === "todos") {
      estadoFinal =
        data.opcionPublicacion === "programar"
          ? "programada"
          : data.opcionPublicacion === "borrador"
          ? "borrador"
          : "publicada";
    } else {
      estadoFinal =
        data.opcionPublicacion === "programar"
          ? "programada"
          : data.opcionPublicacion === "borrador"
          ? "borrador"
          : "publicada";
    }

    try {
      const seccionesCategorias = Object.entries(data.categoriasSeleccionadas)
        .filter(([_, categoria]) => categoria)
        .map(([seccion, categoria]) => ({ seccion, categoria }));

      const tipoNotaFinal =
        tipoNotaUsuario || data.tiposDeNotaSeleccionadas || null;
      const tipoNotaSecundaria = null;
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
        destacada: data.destacada || false,
        destacada_normal: data.destacada_normal || false,
        destacada_invitado: data.destacada_invitado || 0,
        // NUEVO: Indicar si se debe actualizar la fecha
        actualizar_fecha: actualizarFecha,
        zonas: data.zonas,
        seo_alt_text: data.seo_alt_text,
        seo_title: data.seo_title,
        seo_keyword: data.seo_keyword,
        meta_description: data.meta_description,
      };

      // Solo incluir fechaProgramada si es guardado "actualizada"
      if (actualizarFecha) {
        datosNota.programar_publicacion =
          data.opcionPublicacion === "programar" ? data.fechaProgramada : null;
      }

      // Guardar nombre_restaurante SIEMPRE
      datosNota.nombre_restaurante = data.nombre_restaurante || null;

      // Programar instafoto
      if (data.programarInstafoto && data.fechaProgramadaInstafoto) {
        datosNota.programar_insta_imagen = data.fechaProgramadaInstafoto;
      } else {
        datosNota.programar_insta_imagen = null;
      }

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

      if (data.instafoto && (notaId || resultado.id)) {
        await notaInstafotoPut(notaId || resultado.id, data.instafoto, token);
      }

      setPostResponse(resultado);

      if (estadoFinal === "borrador") {
        setPostResponse({
          ...resultado,
          mensaje:
            "Nota guardada como borrador. Un administrador la revisará y publicará.",
        });
      }

      setTimeout(() => navigate("/dashboard"), 1);
    } catch (error) {
      setPostError(error.message || "Error al guardar la nota");
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
        navigate("/dashboard"); // Redirige a la lista de notas
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
  const tipoNotaSeleccionada =
    watch("tiposDeNotaSeleccionadas") || tipoNotaUsuario;

  const fechaActual = formatFecha(new Date());

  // Llaman a onSubmit con el flag 'actualizarFecha'
  const submitActualizada = methods.handleSubmit((data) =>
    onSubmit(data, true)
  );
  const submitCambios = methods.handleSubmit((data) => onSubmit(data, false));

  return (
    <div className="py-8">
      <div className="mx-auto max-w-[1080px]">
        <FormProvider {...methods}>
          {/* Cambiar el form para usar el handleSubmit genérico */}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="">
              <div className="mb-4 text-center">
                <h1 className="leading-tight text-2xl font-bold">
                  {notaId ? "Editar Nota" : "Nueva Nota"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {notaId
                    ? "Edita la publicación existente"
                    : "Crea una nueva publicación completando los siguientes campos"}
                </p>
              </div>

              <div className="">
                <div className="pb-4">
                  <AlertaNota
                    postResponse={postResponse}
                    postError={postError}
                    notaId={notaId}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4">
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
                </div>

                <CategoriasTipoNotaSelector
                  tipoDeNota={tipoDeNota}
                  secciones={[
                    ...secciones.filter(
                      (s) => s.seccion !== "Zona" && s.seccion !== "Experiencia"
                    ),
                    ...(secciones.find((s) => s.seccion === "Zona")
                      ? [secciones.find((s) => s.seccion === "Zona")]
                      : []),
                    ...secciones.filter((s) => s.seccion === "Experiencia"),
                  ]}
                  ocultarTipoNota={false}
                />

                {/* Mostrar tipo de nota para usuarios sin permisos específicos */}
                {!tipoNotaUsuario && usuario?.permisos !== "todos" && (
                  <div className="mb-6 pb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Tipo de nota:
                    </label>
                    <div className="text-2xl font-bold text-gray-900 bg-white px-4 py-2 rounded-md border border-gray-300">
                      📝 Sin tipo asignado
                    </div>
                  </div>
                )}

                {/* Checkbox para destacar, solo si tipo_nota es Restaurantes */}
                {(() => {
                  const tipoNota = watch("tiposDeNotaSeleccionadas");
                  const esDestacada = watch("destacada");
                  let textoDestacada = "Marcar como destacada";
                  if (tipoNota === "Restaurantes")
                    textoDestacada = "Marcar como restaurante recomendado";
                  if (tipoNota === "Food & Drink")
                    textoDestacada = "Marcar como platillo icónico";

                  if (
                    tipoNota === "Restaurantes" ||
                    tipoNota === "Food & Drink"
                  ) {
                    return (
                      <div className="mb-4 pb-4 flex gap-6">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            {...methods.register("destacada")}
                            className="form-checkbox h-5 w-5 text-yellow-500"
                          />
                          <span className="ml-2 text-gray-700 font-medium">
                            {textoDestacada}
                          </span>
                        </label>
                        {esDestacada && (
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              {...methods.register("destacada_normal")}
                              className="form-checkbox h-5 w-5 text-blue-500"
                            />
                            <span className="ml-2 text-gray-700 font-medium">
                              También mostrar como destacada normal
                            </span>
                          </label>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Checkbox para destacada_invitado - solo visible para usuarios con rol invitado */}
                {(usuario?.rol?.toLowerCase() === "invitado" ||
                  usuario?.rol?.toLowerCase() === "invitados" ||
                  usuario?.permisos?.toLowerCase() === "invitado" ||
                  usuario?.permisos?.toLowerCase() === "invitados") && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={watch("destacada_invitado") === 1}
                        onChange={(e) => {
                          setValue(
                            "destacada_invitado",
                            e.target.checked ? 1 : 0
                          );
                        }}
                        className="form-checkbox h-5 w-5 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
                      />
                      <span className="ml-2 font-roman font-bold text-gray-700">
                        ⭐ Marcar como nota destacada para invitados
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Las notas destacadas aparecen en secciones especiales del
                      sitio
                    </p>
                  </div>
                )}

                <div>
                  <NombreRestaurante />
                </div>
                <div className="pb-4">
                  <Titulo />
                </div>
                <div className="pb-4">
                  <Subtitulo />
                </div>
                <div className="pb-4">
                  <Autor />
                </div>
                <div className="pb-4">
                  <Contenido />
                </div>

                <div className="pb-4">
                  <FormularioPromoExt
                    onStickerSelect={(clave) => setValue("sticker", clave)}
                    stickerSeleccionado={watch("sticker")}
                    maxStickers={2}
                  />
                </div>

                <div className="mt-2 text-sm text-gray-700 pb-4 hidden">
                  Sticker seleccionado: {watch("sticker")}
                </div>

                {/* Opciones de publicación */}
                <div className="mb-6 pb-4 p-4 bg-white rounded-lg">
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-yellow-800 mb-3">
                      Opciones de Publicación
                    </label>

                    {faltanCamposObligatorios && (
                      <div className="mb-2 text-red-600 text-sm font-medium">
                        Si quieres publicar llena los campos faltantes:{" "}
                        {camposFaltantes.join(", ")}
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
                        <label
                          htmlFor="publicar-ahora"
                          className={`text-sm text-yellow-800 cursor-pointer ${
                            faltanCamposObligatorios
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
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
                        <label
                          htmlFor="programar"
                          className={`text-sm text-yellow-800 cursor-pointer ${
                            faltanCamposObligatorios
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          Programar publicación
                        </label>
                      </div>

                      <div className="ml-6 space-y-2">
                        <label
                          htmlFor="fecha-programada"
                          className="block text-xs text-yellow-700"
                        >
                          Fecha y hora de publicación
                        </label>
                        <input
                          id="fecha-programada"
                          type="datetime-local"
                          {...methods.register("fechaProgramada")}
                          className="w-full max-w-xs px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-yellow-500 disabled:bg-yellow-100 disabled:cursor-not-allowed"
                          disabled={watch("opcionPublicacion") !== "programar"}
                          required={watch("opcionPublicacion") === "programar"}
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
                        <label
                          htmlFor="borrador"
                          className="text-sm text-yellow-800 cursor-pointer"
                        >
                          Guardar como borrador
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección SEO Metadata (OCULTA AUTOMÁTICAMENTE) */}
                <div
                  className="mb-6 pb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
                  style={{ display: "none" }}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    SEO Metadata (Opcional)
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Texto Alt de Imagen
                      </label>
                      <input
                        type="text"
                        {...methods.register("seo_alt_text")}
                        placeholder="Descripción para buscadores"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Título SEO
                      </label>
                      <input
                        type="text"
                        {...methods.register("seo_title")}
                        placeholder="Título optimizado para Google"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Palabra Clave
                      </label>
                      <input
                        type="text"
                        {...methods.register("seo_keyword")}
                        placeholder="Keyword principal"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Meta Descripción
                      </label>
                      <textarea
                        {...methods.register("meta_description")}
                        rows={3}
                        placeholder="Resumen corto para resultados de búsqueda"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      />
                    </div>
                  </div>
                </div>

                {/* Botón para eliminar la nota */}
                {notaId && (
                  <div className="flex justify-end pb-4">
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

                <div className="flex w-full gap-5">
                  <BotonSubmitNota
                    isPosting={isPosting}
                    notaId={notaId}
                    guardarComo="actualizada"
                    onClick={submitActualizada}
                    disabled={isPosting}
                  />

                  <BotonSubmitNota
                    isPosting={isPosting}
                    notaId={notaId}
                    guardarComo="cambios"
                    onClick={submitCambios}
                    disabled={isPosting}
                  />
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📱 Vista previa de tu nota
        </h2>

        {titulo || subtitulo || autor || contenido || imagen || instafoto ? (
          <div className="flex justify-center">
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
                    nombre_restaurante: watch("nombre_restaurante"),
                    fecha: fechaActual,
                  }}
                  sinFecha={false}
                />
              </div>
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
