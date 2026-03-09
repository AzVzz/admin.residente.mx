import React, { useState } from "react";
import {
  FaArrowLeft,
  FaChartBar,
  FaGift,
  FaVideo,
  FaBookOpen,
  FaCalendarAlt,
} from "react-icons/fa";
import { HiOutlineCheckCircle } from "react-icons/hi";

const BENEFICIOS_INFO = [
  {
    key: "estudios_mercado",
    label: "Estudios de Mercado",
    descripcion: "Acceso libre a todo el acero de estudios de mercado de Residente",
    Icono: FaChartBar,
  },
  {
    key: "giveaway",
    label: "Giveaway",
    descripcion: "Publica 1 Giveaway en instagram de Residente. (Premio mínimo a ofrecer $1,800)",
    Icono: FaGift,
  },
  {
    key: "nota_publicitaria",
    label: "Nota / 5 razones",
    descripcion: "Publica 1 nota periodística en el “main” de residente.mx. 5 razones para asistir a tu negocio.",
    Icono: FaVideo,
  },
  {
    key: "revista_residente",
    label: "Revista Residente",
    descripcion: "1 Pagina en Revista Residente. A escoger en 1 de 12 meses",
    Icono: FaBookOpen,
  },
  {
    key: "suscripcion_extra",
    label: "2da Membresia gratis",
    descripcion: "Inscribe gratis a otra marca perteneciente a tu mismo grupo de negocios",
    Icono: FaCalendarAlt,
  },
];

const SelectorBeneficiosB2B = ({
  numMeses,
  beneficiosIniciales = [],
  todosIncluidos = false,
  onConfirmBeneficios,
  onVolver,
}) => {
  const [seleccionados, setSeleccionados] = useState(beneficiosIniciales);

  const meses = parseInt(numMeses, 10) || numMeses;
  const maxSeleccion = todosIncluidos
    ? 5
    : meses === 6
      ? 1
      : meses === 12
        ? 3
        : 2;

  const handleToggle = (key) => {
    // En modo "todos incluidos" las tarjetas no son interactivas
    if (todosIncluidos) return;

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

  const puedeConfirmar = todosIncluidos || seleccionados.length === maxSeleccion;

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

        {todosIncluidos ? (
          <>
            <div className="flex justify-center mb-3">
              <img
                src="https://residente.mx/fotos/fotos-estaticas/CLUB%20RESIDENTE-FACIL.png"
                className="w-110 h-auto object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              ¡Todos los beneficios incluidos!
            </h1>
            <p className="text-gray-600 text-center">
              Tu plan anual de {numMeses} meses incluye los{" "}
              <span className="font-bold">5 beneficios adicionales</span> sin
              costo extra.
            </p>
            <p className="text-sm text-green-600 text-center mt-2 font-medium">
              ✓ Revisa tus beneficios y presiona Continuar
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Elige{" "}
              {maxSeleccion === 1
                ? "tu beneficio"
                : `tus ${maxSeleccion} beneficios`}
            </h1>
            <p className="text-gray-600 text-center">
              Tu plan de {numMeses} meses incluye{" "}
              {maxSeleccion === 1
                ? "1 beneficio a tu eleccion"
                : `${maxSeleccion} beneficios a tu eleccion`}
              . Selecciona{" "}
              {maxSeleccion === 1 ? "el que prefieras" : "los que prefieras"}.
            </p>
            <p className="text-sm text-gray-500 text-center mt-2">
              {seleccionados.length} de {maxSeleccion} seleccionado
              {maxSeleccion > 1 ? "s" : ""}
            </p>
          </>
        )}
      </div>

      {/* Tarjetas de beneficios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {BENEFICIOS_INFO.map((beneficio) => {
          const isSelected =
            todosIncluidos || seleccionados.includes(beneficio.key);
          const isDisabled =
            todosIncluidos ||
            (!isSelected &&
              seleccionados.length >= maxSeleccion &&
              maxSeleccion > 1);

          return (
            <div
              key={beneficio.key}
              onClick={() => !isDisabled && handleToggle(beneficio.key)}
              className={`relative rounded-2xl p-5 transform transition-all duration-300 ease-out
                ${todosIncluidos
                  ? "cursor-default"
                  : isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:scale-105 hover:-translate-y-1 hover:shadow-xl"
                }
                ${isSelected
                  ? "bg-gray-900 text-white border-2 border-black shadow-xl"
                  : "bg-white text-gray-900 border border-gray-200 shadow-lg hover:border-black"
                }`}
            >
              {/* Logo pequeño arriba a la derecha */}
              <div className="absolute top-2 right-2">
                <img
                  src="https://residente.mx/fotos/fotos-estaticas/CLUB%20RESIDENTE-FACIL.png"
                  className="w-36 h-auto object-contain"
                />
              </div>

              {/* Check indicator */}
              <div className="absolute top-2 left-2">
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

              {/* Badge "Incluido" para plan 12 meses */}
              {todosIncluidos && (
                <span className="absolute bottom-3 right-3 text-[10px] font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-full">
                  INCLUIDO
                </span>
              )}
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
            ${puedeConfirmar
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
