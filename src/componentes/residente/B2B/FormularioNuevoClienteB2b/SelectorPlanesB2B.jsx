import React, { useState, useEffect, useRef } from "react";
import {
  FaStore,
  FaBuilding,
  FaCity,
  FaWarehouse,
  FaStoreAlt,
} from "react-icons/fa";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { IoClose } from "react-icons/io5";

const NOMBRES_MEMBRESIAS = {
  1: "Membresía Básica",
  3: "Membresía Oro",
  5: "Membresía Platino",
  "5+": "Membresía Platino",
};

// Texto personalizado para el badge de sucursales
const TEXTO_SUCURSALES = {
  1: "Suscripción Anual",
  3: "Suscripción Anual",
  5: "Suscripción Anual",
  "5+": "Suscripción Anual",
};

// Función para obtener el nombre de la membresía
const getNombreMembresia = (sucursales) => {
  const key = sucursales === "5+" ? "5+" : parseInt(sucursales);
  return NOMBRES_MEMBRESIAS[key] || "B2B";
};

// Función para obtener el texto de sucursales
const getTextoSucursales = (sucursales) => {
  const key = sucursales === "5+" ? "5+" : parseInt(sucursales);
  return TEXTO_SUCURSALES[key] || `${sucursales} Sucursales`;
};

// Mapeo de iconos según el número de sucursales
const getIconoPorSucursales = (sucursales) => {
  const num = sucursales === "5+" ? 5 : parseInt(sucursales);
  switch (num) {
    case 1:
      return FaStore;
    case 2:
      return FaStoreAlt;
    case 3:
      return FaBuilding;
    case 4:
      return FaWarehouse;
    case 5:
    default:
      return FaCity;
  }
};

const CARACTERISTICAS_POR_PLAN = {
  // Plan 1 sucursal
  1: [
    "Publicidad masiva 'Club Residente'",
    "Presencia en directorio Web",
    "Presencia en directorio Revista",
    "Presencia en directorio Redes Sociales",
    "Presencia en directorio Newsletter",
    "Ticket de Descuento ilimitado",
    "Micrositio individual.Cambios ilimitados",
    "Acervo historico.SEO Google y ChatGPT",
    "Descuentos para tu negocio",
    "Rifas",
  ],
  // Plan 2 sucursales
  2: [
    "2 sucursales incluidas",
    "Perfil de negocio verificado",
    "Publicación en directorio",
    "Soporte prioritario",
    "Estadísticas avanzadas",
  ],
  // Plan 3 sucursales
  3: [
    "Publicidad masiva 'Club Residente'",
    "Presencia en directorio Web",
    "Presencia en directorio Revista",
    "Presencia en directorio Redes Sociales",
    "Presencia en directorio Newsletter",
    "Ticket de Descuento ilimitado",
    "Micrositio individual.Cambios ilimitados",
    "Acervo historico.SEO Google y ChatGPT",
    "Descuentos para tu negocio",
    "Rifas",
    "──────────────────",
    "Estudios de mercado. ilimitado",
    "Acceso a eventos Residente",
  ],
  // Plan 4 sucursales
  4: [
    "4 sucursales incluidas",
    "Perfil de negocio verificado",
    "Publicación en directorio",
    "Soporte prioritario",
    "Estadísticas avanzadas",
    "Promociones especiales",
    "Reportes mensuales",
  ],
  // Plan 5/5+ sucursales
  5: [
    "Publicidad masiva 'Club Residente'",
    "Presencia en directorio Web",
    "Presencia en directorio Revista",
    "Presencia en directorio Redes Sociales",
    "Presencia en directorio Newsletter",
    "Ticket de Descuento ilimitado",
    "Micrositio individual.Cambios ilimitados",
    "Acervo historico.SEO Google y ChatGPT",
    "Descuentos para tu negocio",
    "Rifas",
    "──────────────────",
    "Estudios de mercado. ilimitado",
    "Acceso a eventos Residente",
    "──────────────────",
    "1 Pagina Revista. A escoger en 1 de 12 meses",
  ],
  "5+": [
    "Publicidad masiva 'Club Residente'",
    "Presencia en directorio Web",
    "Presencia en directorio Revista",
    "Presencia en directorio Redes Sociales",
    "Presencia en directorio Newsletter",
    "Ticket de Descuento ilimitado",
    "Micrositio individual.Cambios ilimitados",
    "Acervo historico.SEO Google y ChatGPT",
    "Descuentos para tu negocio",
    "Rifas",
    "──────────────────",
    "Estudios de mercado. ilimitado",
    "Acceso a eventos Residente",
    "──────────────────",
    "1 Pagina Revista. A escoger en 1 de 12 meses",
  ],
};

// Función para obtener características del plan
const getCaracteristicasPorSucursales = (sucursales) => {
  const key = sucursales === "5+" ? "5+" : parseInt(sucursales);
  return CARACTERISTICAS_POR_PLAN[key] || CARACTERISTICAS_POR_PLAN[1];
};

// Componente de Card individual para cada plan
const PlanCard = ({ plan, onSelectPlan }) => {
  const IconoComponent = plan.icono;

  return (
    <div
      className={`group relative rounded-2xl p-6 cursor-pointer transform transition-all duration-300 ease-out
        hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:z-10
        ${
          plan.destacado
            ? "bg-gray-900 text-white border-2 border-black shadow-xl hover:shadow-black/30"
            : "bg-white text-gray-900 border border-gray-200 shadow-lg hover:border-black hover:shadow-black/20"
        }`}
      onClick={() => onSelectPlan(plan)}
    >
      {/* Badge de recomendado */}
      {plan.destacado && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-black text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
            MÁS POPULAR
          </span>
        </div>
      )}

      {/* Header del plan */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 ${plan.destacado ? "bg-yellow-400/20" : "bg-gray-100"}`}
          >
            <IconoComponent
              className={`text-2xl transition-transform duration-300 ${plan.destacado ? "text-black" : "text-gray-700"}`}
            />
          </div>
          <h2 className="text-xl font-bold">{plan.nombreMembresia || "B2B"}</h2>
        </div>
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:border-black ${
            plan.destacado ? "border-black" : "border-gray-300"
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              plan.destacado
                ? "bg-black scale-100"
                : "bg-black scale-0 group-hover:scale-100"
            }`}
          ></div>
        </div>
      </div>

      {/* Precio */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-4xl font-bold transition-all duration-300 ${plan.destacado ? "group-hover:text-black" : "group-hover:text-black"}`}
          >
            ${plan.precioMensual?.toLocaleString("es-MX")}
          </span>
          <span
            className={`text-[20px] transition-colors duration-300 ${plan.destacado ? "text-gray-400" : "text-gray-500"}`}
          >
            + IVA / MES
          </span>
        </div>
      </div>

      {/* Sucursales destacadas */}
      <div
        className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
          plan.destacado
            ? "bg-yellow-400/20 text-yellow-400"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {plan.textoSucursales}
      </div>

      {/* Características */}
      <ul className="space-y-3 mb-6">
        {plan.caracteristicas?.map((caracteristica, idx) =>
          caracteristica.includes("──") ? (
            <li key={idx} className="flex justify-center my-2">
              <div className="w-full border-t border-black"></div>
            </li>
          ) : (
            <li key={idx} className="flex items-start gap-2">
              <HiOutlineCheckCircle
                className={`text-lg mt-0.5 flex-shrink-0 ${
                  plan.destacado ? "text-black" : "text-black"
                }`}
              />
              <span
                className={`text-sm ${plan.destacado ? "text-gray-200" : "text-gray-700"}`}
              >
                {caracteristica}
              </span>
            </li>
          ),
        )}
      </ul>

      {/* Botón de selección */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelectPlan(plan);
        }}
        className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          plan.destacado
            ? " cursor-pointer"
            : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg cursor-pointer"
        }
        }`}
      >
        Seleccionar
      </button>
    </div>
  );
};

// Componente Modal para mostrar el PDF
const ModalPDF = ({ isOpen, onClose, pdfUrl }) => {
  const [pdfError, setPdfError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);

  // Resetear estados cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setPdfError(false);
      setIsLoading(true);

      // Dar tiempo para que cargue el PDF (el iframe manejará su propio estado)
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, pdfUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] m-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            5 Razones para Suscribirte
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Cerrar"
          >
            <IoClose className="text-2xl text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        {/* Contenedor del PDF */}
        <div className="flex-1 overflow-hidden relative bg-gray-100">
          {isLoading && !pdfError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando PDF...</p>
              </div>
            </div>
          )}

          {pdfError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center p-8 max-w-md">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  PDF no encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  El archivo PDF aún no está disponible. Por favor, sube el
                  archivo a la carpeta{" "}
                  <code className="bg-gray-200 px-2 py-1 rounded text-sm">
                    public
                  </code>{" "}
                  con el nombre:
                </p>
                <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-200 px-3 py-2 rounded">
                  {pdfUrl.replace("/", "")}
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#FFF200] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#FFF200]/80 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={`${encodeURI(pdfUrl)}#toolbar=0`}
              className="w-full h-full border-0"
              title="5 Razones para Suscribirte PDF"
              onLoad={handleIframeLoad}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const SelectorPlanesB2B = ({ onSelectPlan, planesData, loadingPrecios }) => {
  // Estado para controlar el modal del PDF
  const [isModalOpen, setIsModalOpen] = useState(false);

  // URL del PDF - ruta completa desde la raíz del servidor

  const pdfUrl =
    "https://residente.mx/fotos/fotos-estaticas/5-razones-para-suscribirte.pdf";
  // Filtrar solo los planes de 1, 3 y 5/5+ sucursales
  const planesPermitidos = [1, 3, 5, "5+"];

  const planes =
    planesData && planesData.length > 0
      ? planesData
          .filter((plan) => planesPermitidos.includes(plan.sucursales))
          .map((plan, index) => ({
            ...plan,
            id: plan.priceId || index,
            icono: getIconoPorSucursales(plan.sucursales),
            caracteristicas: getCaracteristicasPorSucursales(plan.sucursales),
            nombreMembresia: getNombreMembresia(plan.sucursales),
            textoSucursales: getTextoSucursales(plan.sucursales),
            // Sin plan destacado - todas las tarjetas iguales en blanco
            destacado: false,
          }))
      : [];

  if (loadingPrecios) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando planes...</p>
        </div>
      </div>
    );
  }

  // Si no hay planes del backend
  if (planes.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            No se pudieron cargar los planes disponibles.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-300"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <img
          className="w-40 mx-auto mb-6"
          src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/b2b%20logo%20completo.png"
          alt="B2B Logo"
        />
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-6">
          {[
            {
              src: "https://residente.mx/fotos/fotos-estaticas/BannerRegistroB2B/1.png",
              alt: "Banner Registro B2B 1",
            },
            {
              src: "https://residente.mx/fotos/fotos-estaticas/BannerRegistroB2B/2.png",
              alt: "Banner Registro B2B 2",
            },
            {
              src: "https://residente.mx/fotos/fotos-estaticas/BannerRegistroB2B/3.png",
              alt: "Banner Registro B2B 3",
            },
          ].map((banner) => (
            <img
              key={banner.src}
              className="w-155 mx-auto h-auto rounded-xl shadow-sm border border-gray-100 object-cover"
              src={banner.src}
              alt={banner.alt}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Elige tu tipo de membresia para el "Club Residente"
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FFF200] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#FFF200]/80 cursor-pointer transition-all duration-200 hover:scale-105"
        >
          5 RAZONES PARA SUSCRIBIRTE
        </button>
      </div>

      {/* Cards de planes - 3 tarjetas: 1, 3 y 5+ sucursales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {planes.map((plan, index) => (
          <PlanCard
            key={plan.id || plan.priceId || index}
            plan={plan}
            onSelectPlan={onSelectPlan}
          />
        ))}
      </div>

      {/* Modal del PDF */}
      <ModalPDF
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pdfUrl={pdfUrl}
      />
    </div>
  );
};

export default SelectorPlanesB2B;
