// Menú del header nuevo. Es el mismo que usa astro.residente.mx (src/sections/Header.astro):
// estático, no depende del endpoint /api/catalogo/headers.
// Si cambia allá, hay que cambiarlo aquí.

export const MENU_DATA = [
  {
    seccion: "Residente",
    submenu: [
      { nombre: "Revista", url: "/restaurant-magazine" },
      { nombre: "Revista digital", url: "/revista-digital" },
      { nombre: "Anúnciate", url: "https://residente.mx/anunciate" },
      { nombre: "Nuestros medios", url: "/medios-de-comunicacion" },
      { nombre: "Soluciones B2B", url: "https://residente.mx/soluciones-para-la-industria" },
      { nombre: "Historia", url: "/Historia" },
      { nombre: "Misión", url: "https://residenteb2b.com/mision" },
    ],
  },
  {
    seccion: "Información",
    submenu: [
      { nombre: "Reflexión", url: "https://residente.mx/reflexion" },
      { nombre: "Noticias", url: "https://residente.mx/notas" },
      { nombre: "Recomendaciones", url: "https://residente.mx/restaurantes-recomendados" },
      { nombre: "Directorios", url: "https://residente.mx/directorio" },
      { nombre: "Reseñas", url: "https://residente.mx/categoria/restaurantes" },
      { nombre: "Comunidad", url: "/#comunidad" },
      { nombre: "Restaurantes", url: "https://residente.mx/categoria/restaurantes" },
      { nombre: "Food & Drink", url: "https://residente.mx/categoria/food-&-drink" },
      { nombre: "Antojos", url: "https://residente.mx/categoria/antojos" },
    ],
  },
  {
    seccion: "Directorios",
    megamenu: [
      {
        titulo: "Directorios gastronómicos zonales",
        items: [
          { nombre: "Zona Tec", url: "/seccion/zona/categoria/zonatec" },
          { nombre: "San Pedro", url: "/seccion/zona/categoria/sanpedro" },
          { nombre: "Norte", url: "/seccion/zona/categoria/norte" },
          { nombre: "Monterrey Centro", url: "/seccion/zona/categoria/monterreycentro" },
          { nombre: "San Nicolás", url: "/seccion/zona/categoria/sannicolas" },
          { nombre: "Carretera", url: "/seccion/zona/categoria/carretera" },
          { nombre: "Cumbres", url: "/seccion/zona/categoria/cumbres" },
          { nombre: "Guadalupe", url: "/seccion/zona/categoria/guadalupe" },
        ],
      },
      {
        titulo: "Directorios restauranteros por tipo de comida",
        items: [
          { nombre: "Mexicana", url: "/seccion/tipodecomida/categoria/mexicana" },
          { nombre: "Tacos", url: "/seccion/tipodecomida/categoria/tacos" },
          { nombre: "Comfort food", url: "/seccion/tipodecomida/categoria/comfortfood" },
          { nombre: "Mariscos", url: "/seccion/tipodecomida/categoria/mariscos" },
          { nombre: "Oriental", url: "/seccion/tipodecomida/categoria/oriental" },
          { nombre: "Carnes", url: "/seccion/tipodecomida/categoria/carnes" },
          { nombre: "Italiano y pizza", url: "/seccion/tipodecomida/categoria/italianoypizza" },
          { nombre: "Internacional", url: "/seccion/tipodecomida/categoria/internacional" },
        ],
      },
      {
        titulo: "Directorios restauranteros por precio",
        items: [
          { nombre: "Premium", url: "/seccion/niveldegasto/categoria/premium" },
          { nombre: "Cadenas", url: "/seccion/niveldegasto/categoria/cadenas" },
          { nombre: "Únicos", url: "/seccion/niveldegasto/categoria/unicos" },
          { nombre: "Casual", url: "/seccion/niveldegasto/categoria/casual" },
          { nombre: "Taquerías", url: "/taquerias" },
          { nombre: "Cafés", url: "/cafes" },
        ],
      },
      {
        titulo: "Directorios de alimentos y bebidas",
        items: [
          { nombre: "Cafés y bebidas", url: "" },
          { nombre: "Postres y pan", url: "" },
          { nombre: "Antros y bares", url: "" },
          { nombre: "Snacks y nieves", url: "" },
        ],
      },
      {
        titulo: "Directorios de información útil",
        items: [
          { nombre: "Descuentos", url: "/descuentos" },
          { nombre: "Cursos y talleres", url: "/cursos-talleres" },
          { nombre: "Eventos", url: "/eventos-colaboradores" },
          { nombre: "Guías rápidas", url: "/infografias" },
        ],
      },
      {
        titulo: "Directorios de experiencias gastronómicas",
        items: [
          { nombre: "De negocios", url: "/seccion/experiencia/categoria/denegocios" },
          { nombre: "Afición", url: "/seccion/experiencia/categoria/aficion" },
          { nombre: "Saludable", url: "/seccion/experiencia/categoria/saludable" },
          { nombre: "Desayuno", url: "/seccion/experiencia/categoria/desayuno" },
          { nombre: "Único", url: "/seccion/experiencia/categoria/unico" },
        ],
      },
      {
        titulo: "Directorios de rutas gastronómicas",
        items: [
          { nombre: "Taquerías de Nuevo León", url: "/taquerias" },
          { nombre: "Ruta de Cantinas de Nuevo León", url: "/cantinas" },
          { nombre: "Reposterías Icónicas de Nuevo León", url: "/reposterias" },
          { nombre: "Cafés Independientes de Nuevo León", url: "/cafes" },
          { nombre: "Panaderías de Colonia de Nuevo León", url: "/panaderias-colonia" },
          { nombre: "Ruta de Mercados en Nuevo León", url: "/mercados" },
          { nombre: "Restaurantes en hoteles", url: "/hoteles" },
          { nombre: "Recorridos regionales", url: "/recorridos-gastronomicos" },
        ],
      },
    ],
  },
  {
    seccion: "Guías zonales",
    submenu: [
      { nombre: "Zona Tec", url: "https://residente.mx/seccion/zona/categoria/zonatec" },
      { nombre: "Cumbres", url: "https://residente.mx/seccion/zona/categoria/cumbres" },
      { nombre: "San Pedro", url: "https://residente.mx/seccion/zona/categoria/sanpedro" },
      { nombre: "Guadalupe", url: "https://residente.mx/seccion/zona/categoria/guadalupe" },
      { nombre: "Monterrey", url: "https://residente.mx/seccion/zona/categoria/monterreycentro" },
      { nombre: "Norte", url: "https://residente.mx/seccion/zona/categoria/norte" },
      { nombre: "Carretera", url: "https://residente.mx/seccion/zona/categoria/carretera" },
      { nombre: "San Nicolás", url: "https://residente.mx/seccion/zona/categoria/sannicolas" },
    ],
  },
  {
    seccion: "Proyectos culturales",
    submenu: [
      { nombre: "Estrellas de Nuevo León", url: "/estrellas-de-nuevo-leon" },
      { nombre: "Etiqueta Restaurantera", url: "https://residente.mx/etiqueta-restaurantera" },
      { nombre: "Cultura de la carne", url: "https://residente.mx/cultura-de-la-carne" },
      { nombre: "Rostros detrás del sabor", url: "/rostros-detras-del-sabor" },
      { nombre: "Platillos icónicos de Nuevo León", url: "/platillos-iconicos" },
      { nombre: "Heroes del Servicio Coca-Cola", url: "https://residente.mx/heroes-del-servicio-coca-cola-2025" },
    ],
  },
  {
    seccion: "Recetarios",
    submenu: [
      { nombre: "PatoLobo", url: "https://residente.mx/patolobo" },
      { nombre: "Mamá de Rocco", url: "https://residente.mx/mama-de-rocco" },
      { nombre: "Recetario de influencers", url: "https://residente.mx/recetario-residente" },
    ],
  },
];

export const MEGAMENU_COLUMNAS = [
  "minmax(min-content, 135px)",
  "minmax(min-content, 160px)",
  "minmax(min-content, 135px)",
  "minmax(min-content, 125px)",
  "minmax(min-content, 130px)",
  "minmax(min-content, 130px)",
  "minmax(min-content, 175px)",
];

export const MEGAMENU_TITULOS = {
  "Directorio gastronómico zonal": ["DIRECTORIOS", "GASTRONÓMICOS", "ZONAL"],
  "Directorio restaurantero tipo de comida": ["DIRECTORIOS", "RESTAURANTEROS", "TIPO DE COMIDA"],
  "Directorio restaurantero por precio": ["DIRECTORIOS", "RESTAURANTERO", "POR PRECIO"],
  "Directorio de alimentos y bebidas": ["DIRECTORIOS", "DE ALIMENTOS", "Y BEBIDAS"],
  "Directorio de información útil": ["DIRECTORIOS", "DE INFORMACIÓN", "ÚTIL"],
  "Directorio de rutas gastronómicas": ["DIRECTORIOS", "DE RUTAS", "GASTRONÓMICAS"],
  "Directorios de rutas gastronómicas": ["DIRECTORIOS", "DE RUTAS", "GASTRONÓMICAS"],
};

export const MENU_CATEGORIAS = [
  { label: "Premium", href: "/seccion/niveldegasto/categoria/premium" },
  { label: "Cadenas", href: "/seccion/niveldegasto/categoria/cadenas" },
  { label: "Únicos", href: "/seccion/niveldegasto/categoria/unicos" },
  { label: "Casual", href: "/seccion/niveldegasto/categoria/casual" },
  { label: "Taquerías", href: "/taquerias" },
  { label: "Cafés", href: "/cafes" },
  { label: "Mundo Dulce", href: "/reposterias" },
  { label: "Antros y Bares", href: "/cantinas" },
];

export const MENU_SECCIONES = [
  { label: "Noticias", href: "/noticias" },
  { label: "Lo mejor", href: "/recomendaciones" },
  { label: "Ideas", href: "/reflexion" },
  { label: "Directorios", href: "/", megaMenu: true },
  { label: "Premios", href: "/premios" },
  { label: "Rutas", href: "/rutas" },
  { label: "Comunidad", href: "/comunidad" },
  { label: "Ahorra", href: "/descuentos" },
  { label: "Eventos", href: "/eventos-colaboradores" },
];

export const ABRIR_EN_NUEVA_PESTANA = ["Misión", "Anúnciate", "Anunciate"];

// "Zona de Nuevo León" → "Zona" (se quita el sufijo "de/en/por Nuevo León")
export const quitarSufijoNL = (nombre) => {
  const m = nombre.match(/^(.+)\s+(de Nuevo León|en Nuevo León|por Nuevo León)$/i);
  return m ? m[1] : nombre;
};
