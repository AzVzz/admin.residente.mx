import React, { useState } from "react";
import {
  FaChartBar,
  FaBookOpen,
  FaVideo,
  FaGift,
  FaCalendarAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { HiOutlineCheckCircle } from "react-icons/hi";

const BENEFICIOS_INFO = [
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
    label: "Video Publicitario",
    descripcion: "Video publicitario profesional para tu negocio",
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
    label: "Suscripcion Semestral",
    descripcion: "Acceso a beneficios de suscripcion semestral",
    Icono: FaCalendarAlt,
  },
];

const SelectorBeneficiosB2B = ({ numMeses, onConfirmBeneficios, onVolver }) => {
  const [seleccionados, setSeleccionados] = useState([]);

  const maxSeleccion = numMeses === 6 ? 1 : 2;

  const handleToggle = (key) => {
    setSeleccionados((prev) => {
      if (prev.includes(key)) {
        return prev.filter((b) => b !== key);
      }
      if (prev.length >= maxSeleccion) {
        // Para 6 meses (max 1): reemplazar seleccion actual
        if (maxSeleccion === 1) return [key];
        // Para 9 meses (max 2): no permitir mas
        return prev;
      }
      return [...prev, key];
    });
  };

  const puedeConfirmar = seleccionados.length === maxSeleccion;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <FaArrowLeft className="text-sm" />
          <span className="font-medium">Cambiar plan</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Elige {maxSeleccion === 1 ? "tu beneficio" : "tus 2 beneficios"}
        </h1>
        <p className="text-gray-600 text-center">
          Tu plan de {numMeses} meses incluye{" "}
          {maxSeleccion === 1
            ? "1 beneficio a tu eleccion"
            : "2 beneficios a tu eleccion"}
          . Selecciona {maxSeleccion === 1 ? "el que prefieras" : "los que prefieras"}.
        </p>
        <p className="text-sm text-gray-500 text-center mt-2">
          {seleccionados.length} de {maxSeleccion} seleccionado{maxSeleccion > 1 ? "s" : ""}
        </p>
      </div>

      {/* Tarjetas de beneficios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {BENEFICIOS_INFO.map((beneficio) => {
          const isSelected = seleccionados.includes(beneficio.key);
          const isDisabled =
            !isSelected && seleccionados.length >= maxSeleccion && maxSeleccion > 1;

          return (
            <div
              key={beneficio.key}
              onClick={() => !isDisabled && handleToggle(beneficio.key)}
              className={`relative rounded-2xl p-5 cursor-pointer transform transition-all duration-300 ease-out
                ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105 hover:-translate-y-1 hover:shadow-xl"}
                ${
                  isSelected
                    ? "bg-gray-900 text-white border-2 border-black shadow-xl"
                    : "bg-white text-gray-900 border border-gray-200 shadow-lg hover:border-black"
                }`}
            >
              {/* Check indicator */}
              <div className="absolute top-3 right-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                    ${isSelected ? "border-white bg-white" : "border-gray-300"}`}
                >
                  {isSelected && (
                    <HiOutlineCheckCircle className="text-gray-900 text-lg" />
                  )}
                </div>
              </div>

              {/* Icono */}
              <div
                className={`p-3 rounded-lg inline-block mb-3 transition-all duration-300
                  ${isSelected ? "bg-yellow-400/20" : "bg-gray-100"}`}
              >
                <beneficio.Icono
                  className={`text-2xl ${isSelected ? "text-yellow-400" : "text-gray-700"}`}
                />
              </div>

              {/* Titulo */}
              <h3 className="text-lg font-bold mb-1">{beneficio.label}</h3>

              {/* Descripcion */}
              <p
                className={`text-sm ${isSelected ? "text-gray-300" : "text-gray-500"}`}
              >
                {beneficio.descripcion}
              </p>
            </div>
          );
        })}
      </div>

      {/* Boton Continuar */}
      <div className="flex justify-center">
        <button
          onClick={() => puedeConfirmar && onConfirmBeneficios(seleccionados)}
          disabled={!puedeConfirmar}
          className={`px-10 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform
            ${
              puedeConfirmar
                ? "bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 cursor-pointer shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default SelectorBeneficiosB2B;
