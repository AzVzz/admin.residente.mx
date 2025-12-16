import { useForm, FormProvider } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import RestaurantPoster from "../api/RestaurantPoster";
import { useEffect, useRef, useMemo } from "react";
import { useAuth } from "../Context";
import Login from "../Login";
import { useFormStorage } from "../../hooks/useFormStorage";

import "./FormularioMain.css";
import TipoRestaurante from "./componentes/TipoRestaurante";
import Categorias from "./componentes/Categorias";
import Informacion from "./componentes/Informacion";
import RedesSociales from "./componentes/RedesSociales";
import OcasionIdeal from "./componentes/OcasionIdeal";
import Sucursales from "./componentes/Sucursales";
import CodigoVestir from "./componentes/CodigoVestir";
import UbicacionPrincipal from "./componentes/UbicacionPrincipal";
import Reconocimientos from "./componentes/Reconocimientos";
import Resenas from "./componentes/Resenas";
import CincoRazones from "./componentes/CincoRazones";
import QuePido from "./componentes/QuePido";
import Testimonios from "./componentes/Testimonios";
import Imagenes from "./componentes/Imagenes";
import Logo from "./componentes/Logo";
import Logros from "./componentes/Logros";
import Historia from "./componentes/Historia";
import ExpertosOpinan from "./componentes/ExpertosOpinan";
import FotosLugar from "./componentes/FotosLugar";
import Colaboraciones from "./componentes/Colaboraciones";
import NuevasSeccionesCategorias from "./componentes/NuevasSeccionesCategorias";

// Helper to get a stable ID for new forms across page reloads
const getNewFormId = () => {
  const NEW_FORM_ID_KEY = "newRestaurantFormId";
  let formId = sessionStorage.getItem(NEW_FORM_ID_KEY);
  if (!formId) {
    formId = `nuevo_${Date.now()}`;
    sessionStorage.setItem(NEW_FORM_ID_KEY, formId);
  }
  return formId;
};

// Definir campos de reseñas
const reseñasFields = [
  "fundadores",
  "atmosfera",
  "receta_especial",
  "platillo_iconico",
  "promocion",
];

const FormularioMain = ({ restaurante, esEdicion }) => {
  const { idNegocio } = useParams();
  const navigate = useNavigate();

  // Usar useMemo para que el ID cambie si cambia el idNegocio (navegación)
  const formId = useMemo(() => {
    return idNegocio || getNewFormId();
  }, [idNegocio]);

  const { usuario, token } = useAuth();
  const { loadedData, saveFormData, removeFormData } = useFormStorage(
    formId,
    { disabled: true } // Deshabilitado para evitar persistencia no deseada
  );

  // Si no hay token, muestra el login
  if (!token) {
    return (
      <div className="max-w-[400px] mx-auto mt-10">
        <Login />
      </div>
    );
  }

  // Verificar roles permitidos
  if (usuario && usuario.rol !== 'residente' && usuario.rol !== 'b2b') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center p-8 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">
            No tienes permisos para crear restaurantes. <br />
            Solo usuarios Residentes y B2B pueden acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  const baseDefaults = {
    sucursales: [],
    tipo_area: [],
    tipo_area_restaurante: [],
    fotos_lugar: restaurante?.fotos_lugar || [],
    fotos_eliminadas: [],
    colaboracion_coca_cola: false,
    colaboracion_modelo: false,
    secciones_categorias: [],
    seo_alt_text: "",
    seo_title: "",
    seo_keyword: "",
    meta_description: "",
    ...restaurante,
  };

  baseDefaults.secciones_categorias = {};

  if (restaurante?.secciones_categorias) {
    restaurante.secciones_categorias.forEach((item) => {
      const { seccion, categoria } = item;

      // Si la sección aún no existe, inicialízala
      if (baseDefaults.secciones_categorias[seccion] === undefined) {
        baseDefaults.secciones_categorias[seccion] = categoria;
        return;
      }

      // Si ya había algo y no es array, conviértelo a array
      if (!Array.isArray(baseDefaults.secciones_categorias[seccion])) {
        baseDefaults.secciones_categorias[seccion] = [
          baseDefaults.secciones_categorias[seccion],
        ];
      }

      // Ahora sí, empuja la nueva categoría
      baseDefaults.secciones_categorias[seccion].push(categoria);
    });
  }


  // Inicializar campo de comida
  baseDefaults.comida = restaurante?.comida
    ? restaurante.comida.join(", ") // Convertir array a string separado por comas
    : "";

  // Inicializar campos de reseñas
  reseñasFields.forEach((field) => {
    // Buscar el valor en el array de reseñas
    const reseñaObj = restaurante?.reseñas?.find((item) => item[field]);
    baseDefaults[field] = reseñaObj ? reseñaObj[field] : "";
  });

  // Inicializar campos de platillos
  for (let i = 1; i <= 6; i++) {
    baseDefaults[`platillo_${i}`] = restaurante?.platillos?.[i - 1] || "";
  }

  // Inicializar campos de testimonios
  for (let i = 1; i <= 3; i++) {
    baseDefaults[`testimonio_descripcion_${i}`] =
      restaurante?.testimonios?.[i - 1]?.descripcion || "";
    baseDefaults[`testimonio_persona_${i}`] =
      restaurante?.testimonios?.[i - 1]?.persona || "";
  }

  // Inicializar campos de logros
  if (restaurante?.logros) {
    restaurante.logros.forEach((logro, index) => {
      const num = index + 1;
      if (num <= 5) {
        baseDefaults[`logro_fecha_${num}`] = logro.fecha.toString();
        baseDefaults[`logro_descripcion_${num}`] = logro.descripcion;
      }
    });
  }

  // Inicializar campos de razones (cinco razones)
  for (let i = 1; i <= 5; i++) {
    const razon = restaurante?.razones?.[i - 1];
    baseDefaults[`razon_titulo_${i}`] = razon?.titulo || "";
    baseDefaults[`razon_descripcion_${i}`] = razon?.descripcion || "";
  }

  // Inicializar campos de experiencia_opinion
  if (
    restaurante?.experiencia_opinion &&
    restaurante.experiencia_opinion.length > 0
  ) {
    const experto = restaurante.experiencia_opinion[0];
    baseDefaults.exp_op_frase = experto.frase || "";
    baseDefaults.exp_op_nombre = experto.nombre || "";
    baseDefaults.exp_op_puesto = experto.puesto || "";
    baseDefaults.exp_op_empresa = experto.empresa || "";
  } else {
    baseDefaults.exp_op_frase = "";
    baseDefaults.exp_op_nombre = "";
    baseDefaults.exp_op_puesto = "";
    baseDefaults.exp_op_empresa = "";
  }

  // Inicializar ocasiones ideales
  if (
    restaurante?.ocasiones_ideales &&
    Array.isArray(restaurante.ocasiones_ideales)
  ) {
    restaurante.ocasiones_ideales.forEach((ocasion, index) => {
      if (index < 3) {
        baseDefaults[`ocasion_ideal_${index + 1}`] = ocasion;
      }
    });
  }

  const methods = useForm({ defaultValues: baseDefaults, mode: "onChange" });
  const { watch, reset, setValue } = methods;

  // Efecto para resetear el formulario cuando los datos del restaurante (props) cambian.
  // Esto es crucial para el modo de edición, para poblar el form después de la carga asíncrona.
  useEffect(() => {
    reset(baseDefaults);
  }, [restaurante, reset]);

  useEffect(() => {
    // Solo resetear el form con datos locales si existen (no es un objeto vacío)
    if (loadedData && Object.keys(loadedData).length > 0) {
      // Esto sobreescribe los datos iniciales con los cambios locales guardados.
      reset(loadedData);
    }
  }, [loadedData, reset]);

  // --- AUTO-GENERACIÓN SEO ---
  const nombreRestaurante = watch('nombre_restaurante');
  const tipoRestaurante = watch('tipo_restaurante');
  const comida = watch('comida');
  const sucursales = watch('sucursales');

  useEffect(() => {
    if (!nombreRestaurante) return;

    // 1. Obtener datos
    const tipo = tipoRestaurante || "";
    // Usamos 'comida' como "Especialidad" o "Tipo de comida" si comida está vacío
    const especialidad = comida || tipo;

    // Zona: Primera sucursal o cadena vacía si no hay
    let zona = "";
    if (Array.isArray(sucursales) && sucursales.length > 0) {
      zona = sucursales[0];
    }

    // 2. Generar Formulas

    // Meta Title: {Nombre del restaurante} - {Tipo de comida}
    // Nota: Usamos tipoRestaurante que suele ser "Pizza", "Tacos", etc.
    const generatedTitle = `${nombreRestaurante} - ${tipo}`;

    // Meta Description: Substring({Menciona la especialidad} + " en " + {Zona}, 0, 155)
    const rawDescription = `${especialidad} en ${zona}`;
    // Si especialidad o zona están vacíos, ajustar para que no quede raro " en "
    const cleanDescription = (!especialidad && !zona) ? "" : rawDescription;
    const generatedDescription = cleanDescription.length > 155
      ? cleanDescription.substring(0, 155) // El user pidió Substring exacto
      : cleanDescription;

    // Focus Keyword: {Nombre del restaurante}
    const generatedKeyword = nombreRestaurante;

    // Image Alt: {Nombre del restaurante} + {Tipo de comida}
    const generatedAltText = `${nombreRestaurante} ${tipo}`;

    // 3. Asignar Valores
    setValue("seo_title", generatedTitle);
    setValue("meta_description", generatedDescription);
    setValue("seo_keyword", generatedKeyword);
    setValue("seo_alt_text", generatedAltText);

  }, [nombreRestaurante, tipoRestaurante, comida, sucursales, setValue]);
  // ---------------------------

  // Auto-guardado: Suscribirse a cambios en el formulario
  useEffect(() => {
    const subscription = watch((value) => {
      saveFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, saveFormData]);

  return (
    <div className="form-container">
      <FormProvider {...methods}>
        <RestaurantPoster
          method={esEdicion ? "PUT" : "POST"}
          slug={restaurante?.slug}
          token={token}
        >
          {({
            postRestaurante,
            postImages,
            postFotosLugar,
            postLogo,
            isPosting,
            postError,
            postResponse,
          }) => {
            const onSubmit = async (data) => {
              try {
                const seccionesCategorias = [];
                if (data.secciones_categorias) {
                  Object.entries(data.secciones_categorias).forEach(([seccion, valor]) => {
                    if (Array.isArray(valor)) {
                      valor.forEach((categoria) =>
                        seccionesCategorias.push({ seccion, categoria })
                      );
                    } else if (valor) {
                      seccionesCategorias.push({ seccion, categoria: valor });
                    }
                  });
                }

                // Helper cleaning function
                const cleanText = (text) => {
                  if (typeof text !== 'string') return text;
                  return text
                    .replace(/[\n\r]+/g, ' ') // Replace newlines with space
                    .replace(/\s+/g, ' ')     // Normalize spaces
                    .replace(/"/g, "'")       // Replace double quotes with single (avoids \" in JSON)
                    .trim();
                };

                // Construir payload
                const payload = {
                  nombre_restaurante: data.nombre_restaurante,
                  fecha_inauguracion: data.fecha_inauguracion,
                  comida: data.comida
                    ? data.comida
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                    : [],
                  telefono: data.telefono,
                  ticket_promedio: data.ticket_promedio,
                  platillo_mas_vendido: data.platillo_mas_vendido,
                  numero_sucursales: data.numero_sucursales,
                  sucursales: data.sucursales,
                  imagenesEliminadas: data.imagenesEliminadas || [],
                  tipo_restaurante: data.tipo_restaurante,
                  categoria: data.categoria,
                  sitio_web: data.sitio_web,
                  rappi_link: data.rappi_link,
                  didi_link: data.didi_link,
                  instagram: data.instagram,
                  facebook: data.facebook,
                  ubereats_link: data.ubereats_link,
                  link_horario: data.link_horario,
                  links: data.links,
                  ocasiones_ideales: [
                    data.ocasion_ideal_1,
                    data.ocasion_ideal_2,
                    data.ocasion_ideal_3,
                  ].filter(Boolean),
                  codigo_vestir: data.codigo_vestir,
                  tipo_area: data.tipo_area,
                  historia: cleanText(data.historia),
                  logros: [],
                  razones: [],
                  platillos: [],
                  testimonios: [],
                  colaboracion_coca_cola: data.colaboracion_coca_cola || false,
                  colaboracion_modelo: data.colaboracion_modelo || false,
                  reseñas: reseñasFields.map((field) => ({
                    [field]: cleanText(data[field]),
                  })),
                  experiencia_opinion: [],
                  reconocimientos: [],
                  experiencia_opinion: [],
                  reconocimientos: [],
                  secciones_categorias: seccionesCategorias,
                  seo_alt_text: data.seo_alt_text,
                  seo_title: data.seo_title,
                  seo_keyword: data.seo_keyword,
                  meta_description: data.meta_description,
                };

                // Construir arrays estructurados
                for (let i = 1; i <= 5; i++) {
                  const fecha = data[`logro_fecha_${i}`];
                  const descripcion = data[`logro_descripcion_${i}`];
                  if (fecha && descripcion) {
                    payload.logros.push({
                      fecha: parseInt(fecha),
                      descripcion: descripcion.substring(0, 60),
                    });
                  }
                }

                for (let i = 1; i <= 5; i++) {
                  const titulo = data[`razon_titulo_${i}`];
                  const descripcion = data[`razon_descripcion_${i}`];
                  if (titulo && descripcion) {
                    payload.razones.push({
                      titulo: titulo,
                      descripcion: descripcion,
                    });
                  }
                }

                for (let i = 1; i <= 6; i++) {
                  const platillo = data[`platillo_${i}`];
                  if (platillo) {
                    payload.platillos.push(platillo);
                  }
                }

                for (let i = 1; i <= 3; i++) {
                  const descripcion = data[`testimonio_descripcion_${i}`];
                  const persona = data[`testimonio_persona_${i}`];
                  if (descripcion && persona) {
                    payload.testimonios.push({
                      descripcion: descripcion,
                      persona: persona,
                    });
                  }
                }

                for (let i = 1; i <= 5; i++) {
                  const titulo = data[`reconocimiento_${i}`];
                  const fecha = data[`fecha_reconocimiento_${i}`];
                  if (titulo && fecha) {
                    payload.reconocimientos.push({
                      titulo: titulo,
                      fecha: fecha,
                    });
                  }
                }

                // Construir objeto de experto
                const frase = data.exp_op_frase;
                const nombre = data.exp_op_nombre;
                const puesto = data.exp_op_puesto;
                const empresa = data.exp_op_empresa;

                if (frase || nombre || puesto || empresa) {
                  payload.experiencia_opinion.push({
                    frase: frase,
                    nombre: nombre,
                    puesto: puesto,
                    empresa: empresa,
                  });
                }

                console.log("Datos que se enviarán al backend:", payload);

                // Enviar datos
                const result = await postRestaurante(payload);

                if (result && result.data && result.data.id) {
                  const restaurantId = result.data.id;

                  // Procesar imágenes
                  const imagenes = data.imagenes || [];
                  const imagenesEliminadas = data.imagenesEliminadas || [];
                  const newImages = imagenes.filter((img) => img instanceof File);

                  // Procesar FOTOS DEL LUGAR
                  const fotosLugar = data.fotos_lugar || [];
                  const fotosEliminadas = data.fotos_eliminadas || [];
                  const nuevasFotos = fotosLugar
                    .filter((foto) => !foto.isExisting && foto.file)
                    .map((foto) => foto.file);
                  const fotosConservadasIds = fotosLugar
                    .filter((foto) => foto.isExisting && !fotosEliminadas.includes(foto.id))
                    .map((foto) => foto.id);
                  const fotosEliminadasIds = data.fotos_eliminadas || [];

                  if (nuevasFotos.length > 0 || fotosEliminadasIds.length > 0) {
                    const formDataFotos = new FormData();
                    nuevasFotos.forEach((file) => {
                      formDataFotos.append("fotos", file);
                    });
                    formDataFotos.append("eliminadas", JSON.stringify(fotosEliminadasIds));
                    formDataFotos.append("conservadas", JSON.stringify(fotosConservadasIds));
                    await postFotosLugar(restaurantId, formDataFotos);
                  }

                  if (newImages.length > 0 || imagenesEliminadas.length > 0) {
                    const formData = new FormData();
                    newImages.forEach((img) => {
                      formData.append("fotos", img);
                    });
                    formData.append("imagenesEliminadas", JSON.stringify(imagenesEliminadas));
                    await postImages(restaurantId, formData);
                  }

                  // Procesar LOGO
                  const logo = data.logo || [];
                  const logoEliminado = data.logoEliminado;
                  const newLogo = logo.length > 0 && logo[0] instanceof File ? logo[0] : null;

                  if (newLogo || logoEliminado) {
                    const formDataLogo = new FormData();
                    if (newLogo) {
                      formDataLogo.append('logo', newLogo);
                    }
                    if (logoEliminado) {
                      formDataLogo.append('eliminar', 'true');
                    }
                    await postLogo(restaurantId, formDataLogo);
                  }

                  removeFormData();
                  if (!esEdicion) {
                    sessionStorage.removeItem("newRestaurantFormId");
                  }
                  console.log("Proceso completo.");

                  const finalSlug = result.data.slug || (esEdicion ? restaurante.slug : null);
                  if (finalSlug) {
                    navigate(`/restaurante/${finalSlug}`);
                  }
                }
              } catch (error) {
                console.error("Error en el envío:", error);
              }
            };

            return (
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <NuevasSeccionesCategorias />
                <Informacion />
                <Logo existingLogo={restaurante?.logo} />
                <Imagenes
                  slug={restaurante?.slug}
                  existingImages={restaurante?.imagenes}
                />
                <FotosLugar 
                  existingFotos={restaurante?.fotos_lugar || []} 
                  restaurantId={idNegocio || restaurante?.id}
                />
                <TipoRestaurante />
                <Categorias />
                <RedesSociales />
                <OcasionIdeal />
                <Sucursales />
                <CodigoVestir />
                <UbicacionPrincipal />{" "}
                {[1, 2, 3, 4, 5].map((num) => (
                  <Reconocimientos key={num} numero={num} />
                ))}
                <Resenas />
                <div className="form-logros">
                  <fieldset>
                    <legend>Escribe 5 logros del restaurante</legend>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Logros key={num} numero={num} />
                    ))}
                  </fieldset>
                </div>
                <Historia />
                <div className="form-cinco-razones">
                  <fieldset>
                    <legend>
                      Describe 5 razones por las que alguién debe asistir a tu
                      restaurante *
                    </legend>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <CincoRazones key={num} numero={num} />
                    ))}
                  </fieldset>
                </div>
                <div className="form-que-pido">
                  <fieldset>
                    <legend>
                      Que pido cuando asisto la primera vez *<br />
                      (4 ó 6 platillos *)
                    </legend>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <QuePido key={num} numero={num} />
                    ))}
                  </fieldset>
                </div>
                <ExpertosOpinan />
                <div className="form-testimonios">
                  <fieldset>
                    <legend>Testimonios *</legend>
                    {[1, 2, 3].map((num) => (
                      <Testimonios key={num} numero={num} />
                    ))}
                  </fieldset>
                </div>
                <Colaboraciones />

                {/* Sección SEO Metadata (OCULTA AUTOMÁTICAMENTE) */}
                <div className="form-seo" style={{ display: 'none' }}>
                  <fieldset>
                    <legend>SEO Metadata (Opcional)</legend>

                    <div className="input-group">
                      <label htmlFor="seo_alt_text">Texto Alt de Imagen</label>
                      <input
                        id="seo_alt_text"
                        type="text"
                        {...methods.register("seo_alt_text")}
                        placeholder="Descripción para buscadores"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="seo_title">Título SEO</label>
                      <input
                        id="seo_title"
                        type="text"
                        {...methods.register("seo_title")}
                        placeholder="Título optimizado para Google"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="seo_keyword">Palabra Clave</label>
                      <input
                        id="seo_keyword"
                        type="text"
                        {...methods.register("seo_keyword")}
                        placeholder="Keyword principal"
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="meta_description">Meta Descripción</label>
                      <textarea
                        id="meta_description"
                        {...methods.register("meta_description")}
                        rows={4}
                        placeholder="Resumen corto para resultados de búsqueda"
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                  </fieldset>
                </div>
                {postError && (
                  <div className="error-message">Error: {postError}</div>
                )}
                {postResponse && (
                  <div className="success-message">
                    ¡Restaurante registrado exitosamente!
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isPosting}
                  className="form-button"
                >
                  {isPosting ? "Enviando..." : "Enviar"}
                </button>
              </form>
            );
          }}
        </RestaurantPoster>
      </FormProvider>
    </div>
  );
};

export default FormularioMain;