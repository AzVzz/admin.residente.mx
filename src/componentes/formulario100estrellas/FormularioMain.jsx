import { useForm, FormProvider } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import RestaurantPoster from "../api/RestaurantPoster";
import { useEffect, useRef, useMemo, useState } from "react";
import { useAuth } from "../Context";
import Login from "../Login";
import { useFormStorage } from "../../hooks/useFormStorage";
import { urlApi } from "../api/url.js";

import "./FormularioMain.css";
import TipoLugar from "./componentes/TipoLugar";
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
import FormularioPromoExt from "../promociones/componentes/FormularioPromoExt.jsx";

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

  // ⚠️ TODOS LOS HOOKS DEBEN ESTAR AL PRINCIPIO ANTES DE CUALQUIER RETURN
  // Estado para verificar si el usuario B2B ya tiene un restaurante
  // Inicializar en true si es B2B en modo creación para que verifique primero
  const [loadingRestauranteCheck, setLoadingRestauranteCheck] = useState(
    usuario?.rol === "b2b" && !esEdicion
  );
  const [tieneRestaurante, setTieneRestaurante] = useState(false);
  const [error403, setError403] = useState(false);

  // Preparar baseDefaults
  const baseDefaults = useMemo(() => {
    // Lista de subcategorías de Food & Drink
    const subcategoriasFoodDrink = ["Postres", "Cafés", "Bares", "Snacks", "Bebidas"];

    // Determinar si el tipo_lugar es una subcategoría de Food & Drink
    let tipoLugarActual = restaurante?.tipo_lugar || "Restaurante";

    // Normalizar capitalización de Tipo de Lugar
    if (tipoLugarActual.toLowerCase() === 'restaurante') tipoLugarActual = "Restaurante";
    if (tipoLugarActual.toLowerCase() === 'food & drink') tipoLugarActual = "Food & Drink";

    // const subcategoriasFoodDrink = ["Postres", "Cafés", "Bares", "Snacks", "Bebidas"]; // Eliminado por duplicado
    const esSubcategoria = subcategoriasFoodDrink.includes(tipoLugarActual);

    const defaults = {
      // Si es una subcategoría, tipo_lugar será "Food & Drink" y sub_tipo_lugar tendrá el valor específico
      tipo_lugar: esSubcategoria ? "Food & Drink" : tipoLugarActual,
      sub_tipo_lugar: esSubcategoria ? tipoLugarActual : "",
      sucursales: [],
      tipo_area: [],
      tipo_area_restaurante: [],
      fotos_lugar: restaurante?.fotos_lugar || [],
      fotos_eliminadas: [],
      colaboracion_coca_cola: false,
      colaboracion_modelo: false,
      colaboracion_heineken: false,
      colaboracion_descuentosx6: false,
      icon: [],
      secciones_categorias: [],
      seo_alt_text: "",
      seo_title: "",
      seo_keyword: "",
      meta_description: "",
      ...restaurante,
    };

    defaults.secciones_categorias = {};

    // Helper para normalizar nombres de secciones (Mapear BD -> Frontend JSON)
    const normalizeSeccionName = (name) => {
      const map = {
        "nivel de gasto": "Nivel de gasto",
        "nivel de precio": "Nivel de gasto",
        "precio": "Nivel de gasto",
        "gasto": "Nivel de gasto",
        "tipo de comida": "Tipo de comida",
        "tipo": "Tipo de comida",
        "zona": "Zona",
        "experiencia": "Experiencia",
        "food & drink": "Food & Drink",
        "ocasión": "Ocasión"
      };
      // Normalización básica: Capitalizar primera letra si no está en el mapa
      const normalized = map[name.toLowerCase()];
      if (normalized) return normalized;

      return name.charAt(0).toUpperCase() + name.slice(1);
    };

    if (restaurante?.secciones_categorias) {
      restaurante.secciones_categorias.forEach((item) => {
        const { seccion, categoria } = item;
        const seccionKey = normalizeSeccionName(seccion);

        // Si la sección aún no existe, inicialízala
        if (defaults.secciones_categorias[seccionKey] === undefined) {
          defaults.secciones_categorias[seccionKey] = categoria;
          return;
        }

        // Si ya había algo y no es array, conviértelo a array
        if (!Array.isArray(defaults.secciones_categorias[seccionKey])) {
          defaults.secciones_categorias[seccionKey] = [
            defaults.secciones_categorias[seccionKey],
          ];
        }

        // Ahora sí, empuja la nueva categoría
        defaults.secciones_categorias[seccionKey].push(categoria);
      });
    }

    // Inicializar campo de comida
    defaults.comida = restaurante?.comida
      ? restaurante.comida.join(", ") // Convertir array a string separado por comas
      : "";

    // Inicializar campos de reseñas
    reseñasFields.forEach((field) => {
      // Buscar el valor en el array de reseñas
      const reseñaObj = restaurante?.reseñas?.find((item) => item[field]);
      defaults[field] = reseñaObj ? reseñaObj[field] : "";
    });

    // Inicializar campos de platillos
    for (let i = 1; i <= 6; i++) {
      defaults[`platillo_${i}`] = restaurante?.platillos?.[i - 1] || "";
    }

    // Inicializar campos de testimonios
    for (let i = 1; i <= 3; i++) {
      defaults[`testimonio_descripcion_${i}`] =
        restaurante?.testimonios?.[i - 1]?.descripcion || "";
      defaults[`testimonio_persona_${i}`] =
        restaurante?.testimonios?.[i - 1]?.persona || "";
    }

    // Inicializar campos de logros
    if (restaurante?.logros) {
      restaurante.logros.forEach((logro, index) => {
        const num = index + 1;
        if (num <= 5) {
          defaults[`logro_fecha_${num}`] = logro.fecha.toString();
          defaults[`logro_descripcion_${num}`] = logro.descripcion;
        }
      });
    }

    // Inicializar campos de reconocimientos
    if (restaurante?.reconocimientos) {
      restaurante.reconocimientos.forEach((reconocimiento, index) => {
        const num = index + 1;
        if (num <= 5) {
          defaults[`reconocimiento_${num}`] = reconocimiento.titulo || "";
          defaults[`fecha_reconocimiento_${num}`] = reconocimiento.fecha?.toString() || "";
        }
      });
    }

    // Inicializar campos de razones (cinco razones)
    for (let i = 1; i <= 5; i++) {
      const razon = restaurante?.razones?.[i - 1];
      defaults[`razon_titulo_${i}`] = razon?.titulo || "";
      defaults[`razon_descripcion_${i}`] = razon?.descripcion || "";
    }

    // Inicializar campos de experiencia_opinion
    if (
      restaurante?.experiencia_opinion &&
      restaurante.experiencia_opinion.length > 0
    ) {
      const experto = restaurante.experiencia_opinion[0];
      defaults.exp_op_frase = experto.frase || "";
      defaults.exp_op_nombre = experto.nombre || "";
      defaults.exp_op_puesto = experto.puesto || "";
      defaults.exp_op_empresa = experto.empresa || "";
    } else {
      defaults.exp_op_frase = "";
      defaults.exp_op_nombre = "";
      defaults.exp_op_puesto = "";
      defaults.exp_op_empresa = "";
    }

    // Inicializar ocasiones ideales
    if (
      restaurante?.ocasiones_ideales &&
      Array.isArray(restaurante.ocasiones_ideales)
    ) {
      restaurante.ocasiones_ideales.forEach((ocasion, index) => {
        if (index < 3) {
          defaults[`ocasion_ideal_${index + 1}`] = ocasion;
        }
      });
    }

    return defaults;
  }, [restaurante]);

  const methods = useForm({ defaultValues: baseDefaults, mode: "onChange" });
  const { watch, reset, setValue } = methods;

  // Efecto para resetear el formulario cuando los datos del restaurante (props) cambian.
  // Esto es crucial para el modo de edición, para poblar el form después de la carga asíncrona.
  useEffect(() => {
    reset(baseDefaults);
  }, [restaurante, reset, baseDefaults]);

  useEffect(() => {
    // Solo resetear el form con datos locales si existen (no es un objeto vacío)
    if (loadedData && Object.keys(loadedData).length > 0) {
      // Esto sobreescribe los datos iniciales con los cambios locales guardados.
      reset(loadedData);
    }
  }, [loadedData, reset]);

  // --- AUTO-GENERACIÓN SEO ---
  const nombreRestaurante = watch("nombre_restaurante");
  const tipoRestaurante = watch("tipo_restaurante");
  const comida = watch("comida");
  const sucursales = watch("sucursales");

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
    const cleanDescription = !especialidad && !zona ? "" : rawDescription;
    const generatedDescription =
      cleanDescription.length > 155
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

  // Verificar si el usuario B2B ya tiene un restaurante (solo para creación, no edición)
  useEffect(() => {
    // Solo verificar si es usuario B2B y NO está en modo edición
    if (usuario?.rol === "b2b" && !esEdicion && token) {
      const verificarRestaurante = async () => {
        setLoadingRestauranteCheck(true);
        try {
          const response = await fetch(`${urlApi}api/restaurante/basicos`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            // Si el usuario tiene algún restaurante registrado
            if (data && data.length > 0) {
              setTieneRestaurante(true);
            } else {
              setTieneRestaurante(false);
            }
          }
        } catch (error) {
          console.error("Error verificando restaurante:", error);
          // En caso de error, permitir el acceso (evitar bloqueos por problemas de red)
          setTieneRestaurante(false);
        } finally {
          setLoadingRestauranteCheck(false);
        }
      };

      verificarRestaurante();
    } else {
      // Si no es B2B o está en modo edición, no necesita verificar
      setLoadingRestauranteCheck(false);
    }
  }, [usuario, token, esEdicion]);

  // --- SINCRONIZAR "Tipo de comida" con "tipo_restaurante" ---
  const tipoComida = watch("secciones_categorias.Tipo de comida");

  useEffect(() => {
    if (tipoComida) {
      setValue("tipo_restaurante", tipoComida);
    }
  }, [tipoComida, setValue]);
  // -----------------------------------------------------------

  // ✅ AHORA SÍ PODEMOS HACER RETURNS CONDICIONALES
  // Si no hay token, muestra el login
  if (!token) {
    return (
      <div className="max-w-[400px] mx-auto mt-10">
        <Login />
      </div>
    );
  }

  // Verificar roles permitidos
  if (usuario && usuario.rol !== "residente" && usuario.rol !== "b2b") {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center p-8 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600">
            No tienes permisos para crear restaurantes. <br />
            Solo usuarios Residentes y B2B pueden acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  // Si es usuario B2B y ya tiene un restaurante, mostrar mensaje
  if ((usuario?.rol === "b2b" && !esEdicion && tieneRestaurante) || error403) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center p-8 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Límite de Restaurantes Alcanzado
          </h2>
          <p className="text-gray-600 mb-4">
            Solo puedes tener un restaurante registrado. <br />
            Para editar tu restaurante existente, ve a tu dashboard.
          </p>
          <button
            onClick={() => navigate("/dashboardb2b")}
            className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Mostrar mientras verifica
  if (loadingRestauranteCheck) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center p-8">
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

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
                // Validación adicional: Si es B2B y ya tiene restaurante, no permitir
                if (usuario?.rol === "b2b" && !esEdicion && tieneRestaurante) {
                  setError403(true);
                  return;
                }

                const seccionesCategorias = [];
                if (data.secciones_categorias) {
                  Object.entries(data.secciones_categorias).forEach(
                    ([seccion, valor]) => {
                      if (Array.isArray(valor)) {
                        valor.forEach((categoria) =>
                          seccionesCategorias.push({ seccion, categoria })
                        );
                      } else if (valor) {
                        seccionesCategorias.push({ seccion, categoria: valor });
                      }
                    }
                  );
                }

                // ✅ Si es Food & Drink con subcategoría, limpiar entradas antiguas y agregar las correctas
                const subcategoriasFoodDrink = ["Postres", "Cafés", "Bares", "Snacks", "Bebidas"];
                // Secciones que deben ser limpiadas cuando se usa Food & Drink
                const seccionesRelacionadasFoodDrink = ["Food & Drink", "Cafés", "Bar", "Postres", "Snacks", "Bebidas", "Cafetería", "Postrería"];

                const subTipoLugar = data.sub_tipo_lugar;
                const zonasSeleccionadas = data.secciones_categorias?.Zona || [];

                if (subTipoLugar && subcategoriasFoodDrink.includes(subTipoLugar)) {
                  // Mapeo de opciones del formulario a nombres de sección en BD
                  const mapeoSeccion = {
                    "Cafés": "Cafés",
                    "Bares": "Bar",
                    "Postres": "Postres",
                    "Snacks": "Snacks",
                    "Bebidas": "Bebidas"
                  };
                  const seccionFinal = mapeoSeccion[subTipoLugar] || subTipoLugar;

                  // ✅ PRIMERO: Eliminar entradas antiguas de Food & Drink y secciones relacionadas
                  const seccionesCategoriasLimpias = seccionesCategorias.filter(
                    item => !seccionesRelacionadasFoodDrink.includes(item.seccion)
                  );

                  // Limpiar el array original y copiar las entradas limpias
                  seccionesCategorias.length = 0;
                  seccionesCategoriasLimpias.forEach(item => seccionesCategorias.push(item));

                  // Agregar entrada original Food & Drink
                  seccionesCategorias.push({
                    seccion: "Food & Drink",
                    categoria: subTipoLugar
                  });

                  // Agregar entradas con las zonas como categorías
                  if (Array.isArray(zonasSeleccionadas) && zonasSeleccionadas.length > 0) {
                    zonasSeleccionadas.forEach(zona => {
                      seccionesCategorias.push({
                        seccion: seccionFinal,
                        categoria: zona
                      });
                    });
                  }
                }

                // Helper cleaning function
                const cleanText = (text) => {
                  if (typeof text !== "string") return text;
                  return text
                    .replace(/[\n\r]+/g, " ") // Replace newlines with space
                    .replace(/\s+/g, " ") // Normalize spaces
                    .replace(/"/g, "'") // Replace double quotes with single (avoids \" in JSON)
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
                  // Si hay sub_tipo_lugar (Postres, Cafés, Bares, etc.), usarlo como tipo_lugar
                  // Si no, usar el tipo_lugar principal (Restaurante o Food & Drink)
                  tipo_lugar: data.sub_tipo_lugar || data.tipo_lugar || "Restaurante",
                  // Si hay sub_tipo_lugar, también enviarlo a tipo_restaurante
                  // Si no, usar el tipo_restaurante que viene del campo "Tipo de comida"
                  tipo_restaurante: data.sub_tipo_lugar || data.tipo_restaurante,
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
                  colaboracion_heineken: data.colaboracion_heineken || false,
                  colaboracion_descuentosx6: data.colaboracion_descuentosx6 || false,
                  icon: data.icon || [],
                  reseñas: reseñasFields.map((field) => ({
                    [field]: cleanText(data[field]),
                  })),
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

                  // Separar imágenes nuevas (Files) de las existentes (con id)
                  const newImages = imagenes.filter(
                    (img) => img instanceof File
                  );

                  // Obtener IDs de imágenes existentes que se conservan
                  const imagenesConservadasIds = imagenes
                    .filter((img) => img?.id && !imagenesEliminadas.includes(img.id))
                    .map((img) => img.id);

                  // Procesar FOTOS DEL LUGAR
                  const fotosLugar = data.fotos_lugar || [];
                  const fotosEliminadas = data.fotos_eliminadas || [];
                  const nuevasFotos = fotosLugar
                    .filter((foto) => !foto.isExisting && foto.file)
                    .map((foto) => foto.file);
                  const fotosConservadasIds = fotosLugar
                    .filter(
                      (foto) =>
                        foto.isExisting && !fotosEliminadas.includes(foto.id)
                    )
                    .map((foto) => foto.id);
                  const fotosEliminadasIds = data.fotos_eliminadas || [];

                  if (nuevasFotos.length > 0 || fotosEliminadasIds.length > 0) {
                    const formDataFotos = new FormData();
                    nuevasFotos.forEach((file) => {
                      formDataFotos.append("fotos", file);
                    });
                    formDataFotos.append(
                      "eliminadas",
                      JSON.stringify(fotosEliminadasIds)
                    );
                    formDataFotos.append(
                      "conservadas",
                      JSON.stringify(fotosConservadasIds)
                    );
                    await postFotosLugar(restaurantId, formDataFotos);
                  }

                  // Enviar imágenes si hay nuevas O si hay que eliminar alguna
                  if (newImages.length > 0 || imagenesEliminadas.length > 0) {
                    const formData = new FormData();
                    newImages.forEach((img) => {
                      formData.append("fotos", img);
                    });
                    // IMPORTANTE: El backend espera 'eliminadas' no 'imagenesEliminadas'
                    formData.append(
                      "eliminadas",
                      JSON.stringify(imagenesEliminadas)
                    );
                    // También enviar las conservadas
                    formData.append(
                      "conservadas",
                      JSON.stringify(imagenesConservadasIds)
                    );
                    await postImages(restaurantId, formData);
                  }

                  // Procesar LOGO
                  const logo = data.logo || [];
                  const logoEliminado = data.logoEliminado;
                  const newLogo =
                    logo.length > 0 && logo[0] instanceof File ? logo[0] : null;

                  if (newLogo || logoEliminado) {
                    const formDataLogo = new FormData();
                    if (newLogo) {
                      formDataLogo.append("logo", newLogo);
                    }
                    if (logoEliminado) {
                      formDataLogo.append("eliminar", "true");
                    }
                    await postLogo(restaurantId, formDataLogo);
                  }

                  removeFormData();
                  if (!esEdicion) {
                    sessionStorage.removeItem("newRestaurantFormId");
                  }
                  console.log("Proceso completo.");

                  const finalSlug =
                    result.data.slug || (esEdicion ? restaurante.slug : null);
                  if (finalSlug) {
                    // Abrir el restaurante en una nueva pestaña en residente.mx
                    // window.open(`https://residente.mx/restaurantes/${finalSlug}`, '_blank');
                    // Si es usuario B2B, redirigir a su dashboard
                    // Si no, redirigir al dashboard general (admin)
                    if (usuario?.rol === 'b2b') {
                      navigate('/dashboardb2b');
                    } else {
                      navigate('/dashboard');
                    }
                  }
                }
              } catch (error) {
                console.error("Error en el envío:", error);
                // Detectar error 403 y mostrar mensaje amigable
                if (error.message && error.message.includes("403")) {
                  setError403(true);
                  setTieneRestaurante(true);
                }
              }
            };

            return (
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <TipoLugar />
                <NuevasSeccionesCategorias />
                <Informacion />
                {/* <Logo existingLogo={restaurante?.logo} /> */}
                <Imagenes
                  slug={restaurante?.slug}
                  existingImages={restaurante?.imagenes}
                />
                <FotosLugar
                  existingFotos={restaurante?.fotos_lugar || []}
                  restaurantId={idNegocio || restaurante?.id}
                />
                {/* <TipoRestaurante /> */}
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

                {/* Selector de Iconos/Stickers */}
                <div className="form-iconos">
                  <fieldset>
                    <legend>Selecciona íconos para tu restaurante</legend>
                    <FormularioPromoExt
                      onStickerSelect={(stickers) => methods.setValue('icon', stickers)}
                      stickerSeleccionado={methods.watch('icon') || []}
                      maxStickers={1}
                    />
                  </fieldset>
                </div>


                {/* Sección SEO Metadata (OCULTA AUTOMÁTICAMENTE) */}
                <div className="form-seo" style={{ display: "none" }}>
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
                        style={{ resize: "vertical" }}
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
