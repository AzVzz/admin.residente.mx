import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaStore,
  FaBuilding,
  FaCity,
  FaWarehouse,
  FaStoreAlt,
} from "react-icons/fa";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { urlApi } from "../../../api/url.js";
import { useAuth } from "../../../Context";

// Planes por meses: 6, 9, 12 (cobro mensual, renovación al cumplir los meses)
const NOMBRES_MEMBRESIAS = {
  6: "Plan 6 meses",
  9: "Plan 9 meses",
  12: "Plan 12 meses",
};

const TEXTO_MESES = {
  6: "6 meses (cobro mensual)",
  9: "9 meses (cobro mensual)",
  12: "12 meses (cobro mensual)",
};

const getNombreMembresia = (meses) => {
  const key = parseInt(meses, 10);
  return NOMBRES_MEMBRESIAS[key] || `Plan ${meses} meses`;
};

const getTextoMeses = (meses) => {
  const key = parseInt(meses, 10);
  return TEXTO_MESES[key] || `${meses} meses`;
};

const getIconoPorMeses = (meses) => {
  const num = parseInt(meses, 10);
  switch (num) {
    case 6:
      return FaStore;
    case 9:
      return FaBuilding;
    case 12:
    default:
      return FaCity;
  }
};

const CARACTERISTICAS_POR_PLAN = {
  6: [
    "Publicidad masiva 'Club Residente'",
    "Presencia en directorio Web, Revista, Redes, Newsletter",
    "Ticket de Descuento ilimitado",
    "Micrositio individual. Cambios ilimitados",
    "Acervo historico. SEO Google y ChatGPT",
    "Descuentos para tu negocio. Rifas",
    "──────────────────",
    "Elige 1 beneficio adicional",
  ],
  9: [
    "Todo lo del plan 6 meses",
    "──────────────────",
    "Elige 2 beneficios adicionales",
  ],
  12: [
    "Todo lo del plan 9 meses",
    "──────────────────",
    "Los 5 beneficios adicionales incluidos",
  ],
};

const getCaracteristicasPorMeses = (meses) => {
  const key = parseInt(meses, 10);
  return CARACTERISTICAS_POR_PLAN[key] || CARACTERISTICAS_POR_PLAN[12];
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

      {/* Duración del plan */}
      <div
        className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
          plan.destacado
            ? "bg-yellow-400/20 text-yellow-400"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {plan.textoMeses}
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

  // Estados para el dropdown de clientes vetados
  const [clientesVetados, setClientesVetados] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [errorClientes, setErrorClientes] = useState(null);
  const { token, usuario } = useAuth();

  // Estado para mostrar/ocultar las tarjetas de planes
  const [mostrarPlanes, setMostrarPlanes] = useState(false);

  // Función para truncar texto largo
  const truncarTexto = (texto, maxLength = 50) => {
    if (!texto) return "Sin nombre";
    return texto.length > maxLength
      ? texto.substring(0, maxLength) + "..."
      : texto;
  };

  // URL del PDF - ruta completa desde la raíz del servidor
  const pdfUrl =
    "https://residente.mx/fotos/fotos-estaticas/5-razones-para-suscribirte.pdf";

  // Función para cargar clientes vetados
  const fetchClientesVetados = useCallback(async () => {
    if (!token) {
      setErrorClientes("No hay sesión activa. Por favor inicia sesión.");
      return;
    }
    setLoadingClientes(true);
    setErrorClientes(null);
    try {
      const response = await fetch(`${urlApi}api/clientes-editorial`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const clientesArray = Array.isArray(data) ? data : data.clientes || [];
      setClientesVetados(clientesArray);
      setErrorClientes(null);
    } catch (err) {
      setErrorClientes(err.message);
    } finally {
      setLoadingClientes(false);
    }
  }, [token, usuario]);

  // Cargar clientes vetados de la API
  useEffect(() => {
    fetchClientesVetados();
  }, [fetchClientesVetados]);

  // Función para manejar la selección de cliente del dropdown
  const handleClienteChange = (clienteId) => {
    setClienteSeleccionado(clienteId);

    if (clienteId) {
      setMostrarPlanes(false);
      const planMasCaro = planes.find((p) => p.meses === 12);
      if (planMasCaro) {
        const planConCliente = {
          ...planMasCaro,
          clienteRestringidoId: clienteId,
          esClienteRestringido: true,
          nombreCliente: clientesVetados.find(
            (c) => c.id === parseInt(clienteId),
          )?.restaurante,
        };
        onSelectPlan(planConCliente);
      }
    } else {
      // Si deselecciona (vuelve a "Seleccionar"), no hacer nada
      setMostrarPlanes(false);
    }
  };
  const planesPermitidos = [6, 9, 12];

  const planes =
    planesData && planesData.length > 0
      ? planesData
          .filter((plan) => planesPermitidos.includes(plan.meses))
          .map((plan, index) => ({
            ...plan,
            id: plan.priceId || index,
            icono: getIconoPorMeses(plan.meses),
            caracteristicas: getCaracteristicasPorMeses(plan.meses),
            nombreMembresia: getNombreMembresia(plan.meses),
            textoMeses: plan.mesesTexto || getTextoMeses(plan.meses),
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
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-10">
        {/* Dropdown de Clientes Vetados con botón */}
        <div className="mb-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-2">
            <label
              htmlFor="clienteVetado"
              className="block text-sm font-medium text-black"
            >
              Nombre del Cliente
            </label>
          </div>

          <div className="flex gap-3 justify-center items-center">
            <select
              id="clienteVetado"
              value={clienteSeleccionado}
              onChange={(e) => handleClienteChange(e.target.value)}
              disabled={loadingClientes || !!errorClientes}
              className="w-full max-w-md px-4 py-2 bg-white disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingClientes
                  ? "Cargando..."
                  : errorClientes
                    ? "Error al cargar"
                    : `Seleccionar (${clientesVetados.length})`}
              </option>
              {clientesVetados.map((cliente) => {
                const nombreRestaurante = cliente.restaurante || "Sin nombre";
                return (
                  <option
                    key={cliente.id}
                    value={cliente.id}
                    title={nombreRestaurante}
                  >
                    {truncarTexto(nombreRestaurante, 50)}
                  </option>
                );
              })}
            </select>

            <button
              onClick={() => setMostrarPlanes(!mostrarPlanes)}
              className="px-6 py-2 text-sm font-bold text-black bg-[#FFF200] hover:bg-[#FFF200] cursor-pointer drop-shadow-[1.5px_1.5px_0.9px_rgba(0,0,0,0.3)] hover:drop-shadow-[3px_3px_0.9px_rgba(0,0,0,0.3)]"
              type="button"
            >
              {mostrarPlanes ? "Volver" : "Nuevo Cliente"}
            </button>
          </div>

          {/* Mensaje de éxito compacto */}
          {clienteSeleccionado && !errorClientes && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-xs text-green-700 font-medium">
                ✓{" "}
                {
                  clientesVetados.find(
                    (c) => c.id === parseInt(clienteSeleccionado),
                  )?.restaurante
                }
              </p>
              <p className="text-xs text-green-600 mt-1">
                📋 Membresía asignada:{" "}
                <span className="font-bold">Plan 12 meses</span>
              </p>
            </div>
          )}

          {/* Mensaje de error compacto */}
          {errorClientes && (
            <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-600 mb-1">⚠️ {errorClientes}</p>
              <button
                onClick={fetchClientesVetados}
                className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700"
                type="button"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-6">
          <div className="w-full max-w-2xl mx-auto">
            <img
              src="https://residente.mx/fotos/fotos-estaticas/CLUB%20RESIDENTE%20(9)_page-0001.jpg"
              alt="Club Residente"
              className="w-full h-auto rounded-md shadow-lg"
            />
          </div>
        </div>
        <div className="w-full max-w-2xl mx-auto mb-4">
          <img
            src="https://residente.mx/fotos/fotos-estaticas/banners/BANNER%20PARA%20GUÍA%20FIFA.jpeg"
            alt="Banner Guía FIFA"
            className="w-full h-auto "
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Elige tu tipo de membresia para el "Club Residente"
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#FFF200] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#FFF200]/80 cursor-pointer transition-all duration-200 hover:scale-105 drop-shadow-[1.5px_1.5px_0.9px_rgba(0,0,0,0.3)] hover:drop-shadow-[3px_3px_0.9px_rgba(0,0,0,0.3)]"
        >
          5 RAZONES PARA SUSCRIBIRTE
        </button>
      </div>

      {/* Cards de planes - 3 tarjetas: 6, 9 y 12 meses */}
      {/* Solo se muestran si mostrarPlanes es true */}
      {mostrarPlanes && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeIn">
          {planes.map((plan, index) => (
            <PlanCard
              key={plan.id || plan.priceId || index}
              plan={plan}
              onSelectPlan={onSelectPlan}
            />
          ))}
        </div>
      )}

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
