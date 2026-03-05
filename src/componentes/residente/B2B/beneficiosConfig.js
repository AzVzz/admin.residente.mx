import {
  FaChartBar,
  FaBookOpen,
  FaVideo,
  FaGift,
  FaCalendarAlt,
} from "react-icons/fa";

// Catálogo único de beneficios B2B
export const BENEFICIOS_INFO = [
  {
    key: "estudios_mercado",
    label: "Estudios de Mercado",
    descripcion: "Acceso a estudios de mercado ilimitados para tu negocio",
    Icono: FaChartBar,
  },
  {
    key: "revista_residente",
    label: "Revista Residente",
    descripcion: "1 Pagina en Revista Residente. A escoger en 1 de 12 meses",
    Icono: FaBookOpen,
  },
  {
    key: "video_publicitario",
    label: "Nota / 5 razones",
    descripcion:
      "Publica una nota periodística en el main de residente.mx con 5 razones para asistir a tu negocio",
    Icono: FaVideo,
  },
  {
    key: "giveaway",
    label: "Giveaway",
    descripcion: "Participacion en giveaways y sorteos exclusivos",
    Icono: FaGift,
  },
  {
    key: "suscripcion_semestral",
    label: "2da Membresía gratis",
    descripcion:
      "Inscribe gratis a otra marca perteneciente a tu mismo grupo de negocios",
    Icono: FaCalendarAlt,
  },
];

// Helper para obtener solo los beneficios activos desde un registro B2B
export const getBeneficiosActivos = (b2bUser) =>
  b2bUser ? BENEFICIOS_INFO.filter((b) => b2bUser[b.key]) : [];

