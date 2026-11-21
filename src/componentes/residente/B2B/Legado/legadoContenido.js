// Contenido del Media Kit NORESTE 2027 (de la slide 2 en adelante).
// Se separa del componente para poder corregir textos sin tocar el diseño.

// ───── Slide 2: Selección por invitación (Libro 1: Legado) ─────
export const CRITERIOS_LEGADO = [
  { titulo: "Longevidad (30%)", texto: "antigüedad, continuidad y permanencia en el mercado." },
  { titulo: "Tradición (30%)", texto: "conservación de recetas, productos, identidad y costumbres gastronómicas." },
  { titulo: "Fuerza cultural (25%)", texto: "reconocimiento colectivo e influencia en la vida cotidiana de Nuevo León." },
  { titulo: "Legado social (15%)", texto: "impacto generacional, historia familiar y aportación a la comunidad." },
];

export const CRITERIO_COMERCIAL_LEGADO =
  "prioridad para empresas con cuatro o más sucursales, estructura empresarial y capacidad potencial para invertir $100,000 en su participación. Se admiten excepciones cuando el valor histórico y cultural lo justifique.";

export const CANDIDATOS_LEGADO = [
  { nombre: "Taquerías", cantidad: 4, items: ["Taquería La Mexicana", "Tacos Don Pancho", "Taquería Juárez", "Tacos Lara"] },
  {
    nombre: "Cadenas",
    cantidad: 14,
    items: [
      "El Pollo Loco", "Tortas Bernal", "Pescadería Martínez Tijerina", "Palax", "Tamales Salinas",
      "La S Central (La Siberia)", "El Papalote", "Las Alitas", "Josephino’s Pizza", "Restaurant García",
      "Los Generales", "Merendero Tino", "Tortas Alex", "Gorditas Doña Tota",
    ],
  },
  { nombre: "Mundo dulce", cantidad: 4, items: ["Helados Sultana", "Pastelería Lety", "Pastelería Caty", "Panadería La Superior"] },
  {
    nombre: "Grandes restaurantes",
    cantidad: 8,
    items: [
      "El Gaucho", "San Carlos", "El Rey del Cabrito", "Las Pampas (Garza Sada)", "Restaurante El Mirador",
      "Los Cabritos Alameda", "Los Fresnos", "El Gran Pastor",
    ],
  },
  { nombre: "Únicos", cantidad: 3, items: ["Yama-to", "Mariscos La Jaibita", "Mariscos La Anacua"] },
  { nombre: "Antros y bares", cantidad: 4, items: ["Indio Azteca", "Salón Pezina", "Restaurante Bar Zacatecas", "Pilo’s Bar"] },
  { nombre: "Cafés", cantidad: 4, items: ["Manolín", "Restaurante AL", "La Puntada", "Restaurante Rubio"] },
  { nombre: "Casuales", cantidad: 2, items: ["Joker", "Los Legendarios"] },
];

export const RESUMEN_LEGADO = {
  filas: [
    ["Taquerías", 4], ["Cadenas", 14], ["Mundo dulce", 4], ["Grandes restaurantes", 8],
    ["Únicos", 3], ["Antros y bares", 4], ["Cafés", 4], ["Casuales", 2],
  ],
  total: 43,
};

export const OBJETIVOS_LEGADO = {
  editorial: "seleccionar 25 empresas que representen el legado histórico, gastronómico, cultural y social de Nuevo León.",
  comercial:
    "obtener 25 participaciones de $100,000 cada una, equivalentes a $2,500,000 en ingresos brutos para el proyecto editorial.",
};

// ───── Slides 4 a 7: Canasto de valor ─────
export const CANASTO = [
  {
    etiqueta: "01 / Canasto de valor",
    titulo: "El libro",
    imagen: "libro-interior.webp",
    ancho: 1037,
    alto: 767,
    alt: "Interior del libro NORESTE: LEGADO con el ejemplo de Pangea",
    items: [
      "10 páginas editoriales dedicadas exclusivamente a tu restaurante.",
      "Fotografía impecable de platillos, espacios, detalles, fundador y equipo.",
      "Una narrativa que contará tu historia, tu legado y tu lugar en la identidad gastronómica del noreste.",
      "Presencia de logotipo, retratos, interiores y elementos distintivos de tu marca.",
      "Participación dentro de un libro de pasta dura, cosido, de 23 x 30 cm.",
      "Tiraje de 1,000 ejemplares para NORESTE: LEGADO.",
      "10 ejemplares incluidos para tu restaurante.",
    ],
  },
  {
    etiqueta: "02 / Canasto de valor",
    titulo: "Presencia digital",
    imagen: "presencia-digital.webp",
    ancho: 836,
    alto: 680,
    alt: "Página de Residente en computadora y celular con NORESTE: LEGADO",
    items: [
      "Una de las 50 semanas editoriales de 2027, elegida por tu restaurante.",
      "Portada protagonista durante 7 días, acompañada de otros temas de interés general.",
      "Réplica digital dentro de la página especial de la colección en Residente.",
      "Entrevista en video en formato largo.",
      "Versión corta del video para redes sociales.",
      "Difusión en Instagram, Facebook y newsletter de Residente.",
      "Presencia permanente dentro del archivo digital de la colección.",
    ],
  },
  {
    etiqueta: "03 / Canasto de valor",
    titulo: "Proyección",
    tituloDorado: "mediática",
    imagen: "proyeccion-mediatica.webp",
    ancho: 768,
    alto: 918,
    alt: "Cobertura de prensa en un restaurante con el libro NORESTE: LEGADO en la mesa",
    items: [
      "Difusión desde las propias plataformas de Residente.",
      "Gestión de cobertura en periódicos, revistas, radio y medios digitales de Nuevo León.",
      "Gestión de presencia en medios nacionales impresos, digitales y radio.",
      "Activación con 50 microinfluencers y 10 influencers.",
      "Envío del libro a críticos gastronómicos importantes del mundo y medios especializados.",
      "Envío a líderes de Estados Unidos y Canadá.",
      "Entrega a oficinas de turismo y convenciones de Texas y estados fronterizos.",
      "Distribución entre empresarios, políticos y líderes de opinión de Nuevo León.",
      "La cobertura editorial de terceros se buscará, pero no puede garantizarse.",
    ],
  },
  {
    etiqueta: "04 / Canasto de valor",
    titulo: "Gala de reconocimiento",
    imagen: "gala.webp",
    ancho: 776,
    alto: 868,
    maxAncho: 430, // esta foto se muestra más chica que las demás
    alt: "Gala de presentación de NORESTE: LEGADO y NORESTE: VANGUARDIA",
    items: [
      "Presentación oficial de NORESTE: LEGADO y NORESTE: VANGUARDIA.",
      "Entrega de libros y reconocimientos el 26 de noviembre de 2027.",
      "Asistencia de los 50 restaurantes seleccionados, medios y público relacionado con la gastronomía.",
      "Cada restaurante podrá invitar libremente a sus acompañantes, sujeto al aforo general del evento.",
      "Una noche de prestigio, visibilidad y celebración para quienes forman parte de la colección.",
      "Los libros estarán a la venta en $1,000 por volumen o $1,500 por la colección.",
      "Las ganancias netas de la venta se destinarán a una fundación de niños con cáncer.",
    ],
  },
];

// ───── Arquitectura editorial: así participa cada restaurante (10 páginas) ─────
const FOTOS = "https://residente.mx/fotos/fotos-estaticas/dashboard";

export const ARQUITECTURA = [
  {
    paginas: "Páginas 1–2",
    titulo: "Apertura fotográfica",
    texto: "Una entrada poderosa que presenta al restaurante con una fotografía emblemática de su fachada y su logotipo de forma discreta.",
    imagen: `${FOTOS}/C14F0B99-5282-43DD-8D57-45B028F454C1-1795287373371.webp`,
    alto: 991,
  },
  {
    paginas: "Páginas 3–4",
    titulo: "Historia y fundador",
    texto: "El origen, la evolución y la visión del restaurante, con retratos de sus fundadores y un texto narrativo editorial.",
    imagen: `${FOTOS}/F8EBB9A3-1D0A-4B84-8EDE-7E0167ECC723-1795287389767.webp`,
    alto: 997,
  },
  {
    paginas: "Páginas 5–6",
    titulo: "Cocina y platillos",
    texto: "La propuesta gastronómica del restaurante, con fotografía de platillos e ilustración en tinta que refuerza su identidad y territorio.",
    imagen: `${FOTOS}/A11D5A34-A0C4-4168-BC41-0F113BB77191-1795287420346.webp`,
    alto: 998,
  },
  {
    paginas: "Páginas 7–8",
    titulo: "Espacio, atmósfera y gente",
    texto: "El interior, la atmósfera y la vida del restaurante, con imágenes del espacio, el servicio y su equipo.",
    imagen: `${FOTOS}/9489D9BA-A9D7-480B-BE7A-C91A0E01E515-1795287434717.webp`,
    alto: 989,
  },
  {
    paginas: "Páginas 9–10",
    titulo: "Legado / Propuesta",
    texto: "El cierre editorial: su huella, propuesta actual y datos clave, con una ilustración en tinta y su logotipo discreto.",
    imagen: `${FOTOS}/DC552E81-4B43-4348-8E34-820E547B61AD-1795287453364.webp`,
    alto: 991,
  },
];

export const APARECERA_CON = [
  "Fotos de personas",
  "Fotos del restaurante",
  "Texto editorial",
  "Una ilustración en tinta",
  "Su logotipo discreto",
];
