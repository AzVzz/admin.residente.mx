import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaStore,
  FaBuilding,
  FaCity,
  FaWarehouse,
  FaStoreAlt,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { urlApi } from "../../../api/url.js";
import { useAuth } from "../../../Context";

const NOMBRES_MEMBRESIAS = {
  12: "Membresía Anual",
  //6: "Membresía de 6 Meses",
  //9: "Membresía de 9 Meses",
};

// Texto personalizado para el badge de sucursales
const TEXTO_SUCURSALES = {
  12: "Suscripción Anual",
  //6: "Suscripción 6 Meses",
  //9: "Suscripción 9 Meses",
};

// Función para obtener el nombre de la membresía
const getNombreMembresia = (meses) => {
  return NOMBRES_MEMBRESIAS[parseInt(meses)] || "B2B";
};

// Función para obtener el texto de sucursales
const getTextoSucursales = (meses) => {
  return TEXTO_SUCURSALES[parseInt(meses)] || `${meses} Meses`;
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

const CARACTERISTICAS_BASE = [
  "CLUB DE NEGOCIOS.\nSolo el 2% de NL. Prestigio, descuentos, rifas y eventos",
  "DIRECTORIO. \n20 por categoria. Presencia constante entre consumidores reales de NL",
  "MICROSITIO. \nTu página web en 15 minutos, con cambios ilimitados y métricas",
  "DESCUENTOS. \nTu propio generador de promociones, \nsin limite de publicaciones",
  "PUBLICIDAD. \nTu marca, todos los meses en medios digitales e impresos Residente",
];

const CARACTERISTICAS_POR_PLAN = {
  12: [...CARACTERISTICAS_BASE],
  //6: [...CARACTERISTICAS_BASE],
  //9: [...CARACTERISTICAS_BASE],
};

// Función para obtener características del plan por meses
const getCaracteristicasPorMeses = (meses) => {
  const key = parseInt(meses);
  return CARACTERISTICAS_POR_PLAN[key] || CARACTERISTICAS_POR_PLAN[5];
};

// Componente de Card individual para cada plan
const PlanCard = ({ plan, onSelectPlan }) => {
  const IconoComponent = plan.icono;

  return (
    <div
      className={`group relative rounded-2xl p-6 cursor-pointer transform transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:z-10
        ${plan.destacado
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
          <img
            src="https://residente.mx/fotos/fotos-estaticas/CLUB%20RESIDENTE-FACIL.png"
            className="w-65 h-auto object-contain"
          />
        </div>
      </div>

      {/* Nombre de la membresía */}
      <div className="flex justify-center mb-8 mt-8">
        <div>
          <span className="text-sm font-bold tracking-widest uppercase text-gray-500 block">
            Membresía de
          </span>
          <span className="text-3xl font-black uppercase block text-right">
            {plan.meses} Meses
          </span>
        </div>
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:border-black ${plan.destacado ? "border-black" : "border-gray-300"
            }`}
        >
          <div
            className={`w-3 h-3 rounded-full transition-all duration-300 ${plan.destacado
              ? "bg-black scale-100"
              : "bg-black scale-0 group-hover:scale-100"
              }`}></div>
        </div>
      </div>

      {/* Precio */}
      <div className="mb-4">
        <div className="flex items-center justify-center flex-col">
          <div>
            <span
              className={`text-4xl font-bold transition-all duration-300 ${plan.destacado ? "group-hover:text-black" : "group-hover:text-black"}`}
            >
              ${plan.precioMensual?.toLocaleString("es-MX")}
            </span>
            <span className="text-4xl pl-2">
              al mes
            </span>
          </div>
          <span
            className={`text-[10px] leading-[1] transition-colors duration-300 ${plan.destacado ? "text-gray-300" : "text-gray-500"}`}
          >
            Precio no incluye IVA
          </span>
        </div>
      </div>
      {/* Características */}
      <ul className="space-y-3 mb-11">
        {(() => {
          let currentNumber = 0;
          const total = plan.caracteristicas?.length ?? 0;
          return plan.caracteristicas?.map((caracteristica, idx) => {
            if (caracteristica.includes("──")) {
              return (
                <li key={idx} className="flex justify-center my-2">
                  <div className="w-full border-t border-black"></div>
                </li>
              );
            }
            currentNumber++;
            const isLast = idx === total - 1;
            return (
              <li key={idx} className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-lg
                    ${plan.destacado ? "text-black" : "text-black"}`}
                >
                  {isLast ? "5" : currentNumber}
                </div>
                <span
                  className={`text-sm whitespace-pre-line ${plan.destacado ? "text-gray-200" : "text-black"}`}
                >
                  {(() => {
                    const dotIndex = caracteristica.indexOf('.');
                    if (dotIndex === -1) return caracteristica;

                    const title = caracteristica.substring(0, dotIndex + 1);
                    const description = caracteristica.substring(dotIndex + 1);

                    return (
                      <>
                        <span className="font-bold uppercase">{title}</span>
                        <span className="text-sm leading-tight font-light text-gray-500 font-roman">
                          {description}
                        </span>
                      </>
                    );
                  })()}
                </span>
              </li>
            );
          });
        })()}
      </ul>

      <span className="text-xl text-gray-500 font-roman leading-[1] text-center block mb-4 pt-7 border-t-3 mx-4 border-black">Incrementa los beneficios de <br/> tu suscripción si decides inscribirte durante la cita</span>

      {/* Botón de selección */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelectPlan(plan);
        }}
        className={`text-3xl w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${plan.destacado
          ? " cursor-pointer"
          : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg cursor-pointer"
          }
        }`}
      >
        Más beneficios
      </button>

      {/* Beneficios por plan */}
      <p className="text-xl text-center font-bold transition-all duration-300 group-hover:text-black mt-2">
        {parseInt(plan.meses) === 12 && "Incluye 5 beneficios extra"}
        {/*parseInt(plan.meses) === 6 && "Escoge 1 beneficio extra"*/}
        {/*parseInt(plan.meses) === 9 && "Escoge 2 beneficios extra"*/}
      </p>
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

  // Estados para la opción "Otro" del dropdown
  const [mostrarInputOtro, setMostrarInputOtro] = useState(false);
  const [nombreOtro, setNombreOtro] = useState("");
  const [clienteDuplicado, setClienteDuplicado] = useState(null); // cliente que ya existe

  // Ref para hacer scroll a los planes
  const planesRef = useRef(null);

  // Efecto para scroll automático cuando se muestran los planes
  useEffect(() => {
    if (mostrarPlanes && planesRef.current) {
      setTimeout(() => {
        planesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [mostrarPlanes]);

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
    console.log('🔍 Iniciando carga de clientes en lista...');
    console.log('🔑 Token disponible:', !!token);
    console.log('👤 Usuario:', usuario?.nombre || 'No disponible');
    console.log('🌐 URL API:', `${urlApi}api/clientes-editorial`);

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

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Datos recibidos:', data);
      console.log('📊 Total de clientes:', Array.isArray(data) ? data.length : (data.clientes?.length || 0));

      const clientesArray = Array.isArray(data) ? data : data.clientes || [];
      setClientesVetados(clientesArray);
      setErrorClientes(null);
      console.log('✅ Clientes cargados en estado:', clientesArray.length);
    } catch (err) {
      console.error('❌ Error cargando clientes vetados:', err);
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
    if (clienteId === "__otro__") {
      setMostrarInputOtro(true);
      setClienteSeleccionado("");
      setMostrarPlanes(false);
      setNombreOtro("");
      setClienteDuplicado(null);
      return;
    }
    setMostrarInputOtro(false);
    setNombreOtro("");
    setClienteDuplicado(null);
    setClienteSeleccionado(clienteId);

    if (clienteId) {
      setMostrarPlanes(true);
    } else {
      setMostrarPlanes(false);
    }
  };

  // Normaliza acentos: "limón" → "limon"
  const normalizarTexto = (texto) =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Verifica si el nombre escrito coincide con algún cliente existente (ignora acentos y mayúsculas)
  const handleNombreOtroChange = (valor) => {
    setNombreOtro(valor);
    setClienteDuplicado(null);
    if (!valor.trim()) return;

    const valorNorm = normalizarTexto(valor.trim());
    const encontrado = clientesVetados.find((c) => {
      const clienteNorm = normalizarTexto(c.restaurante || "");

      // Caso 1: el texto tecleado contiene al cliente → siempre es duplicado
      // Ej: "Señor Limón Monterrey" contiene "Señor Limón"
      if (valorNorm.includes(clienteNorm)) return true;

      // Caso 2: el cliente contiene lo tecleado → solo si representa ≥50% del nombre del cliente
      // Evita que "residente" (9 chars) haga match con "presidente intercontinental monterrey" (35 chars)
      if (clienteNorm.includes(valorNorm)) {
        return valorNorm.length / clienteNorm.length >= 0.5;
      }

      return false;
    });
    if (encontrado) {
      setClienteDuplicado(encontrado);
    }
  };

  // Confirmar nuevo cliente ("Otro")
  const handleConfirmarOtro = () => {
    if (!nombreOtro.trim()) return;
    // Mostrar planes con precio normal (sin override de cliente restringido)
    setMostrarPlanes(true);
  };

  // Función para manejar la selección de un plan (agrega info del cliente si hay uno seleccionado)
  const handleSelectPlan = (plan) => {
    if (clienteSeleccionado) {
      const planConCliente = {
        ...plan,
        clienteRestringidoId: clienteSeleccionado,
        esClienteRestringido: true,
        nombreCliente: clientesVetados.find(c => c.id === parseInt(clienteSeleccionado))?.restaurante
      };
      onSelectPlan(planConCliente);
    } else if (mostrarInputOtro && nombreOtro.trim()) {
      // Nuevo cliente tecleado en "Otro": incluir el nombre para pre-rellenar el formulario
      onSelectPlan({ ...plan, nombreRestauranteOtro: nombreOtro.trim() });
    } else {
      onSelectPlan(plan);
    }
  };
  // Filtrar solo los planes de 6, 9 y 12 meses (nuevo modelo)
  const planesPermitidos = [12]; // [6, 9, 12];

  // Precios especiales cuando se selecciona un cliente del dropdown
  const PRECIOS_CLIENTE_RESTRINGIDO = {
    // 6: 7499,
    // 9: 4999,
    12: 3999,
  };

  const planes =
    planesData && planesData.length > 0
      ? planesData
        .filter((plan) => planesPermitidos.includes(parseInt(plan.meses)))
        .map((plan, index) => {
          const mesesNum = parseInt(plan.meses);
          const precioOverride = clienteSeleccionado
            ? PRECIOS_CLIENTE_RESTRINGIDO[mesesNum]
            : null;
          return {
            ...plan,
            id: plan.priceId || index,
            icono: getIconoPorSucursales(plan.meses),
            caracteristicas: getCaracteristicasPorMeses(plan.meses),
            nombreMembresia: plan.nombre || getNombreMembresia(plan.meses),
            textoSucursales: getTextoSucursales(plan.meses),
            destacado: false,
            // Sobreescribir precio si hay cliente seleccionado
            ...(precioOverride !== null && {
              precioMensual: precioOverride,
              precioMensualConIVA: Math.round(precioOverride * 1.16),
              _precioOriginal: plan.precioMensual,
            }),
          };
        })
        .sort((a, b) => parseInt(b.meses) - parseInt(a.meses))
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
        <div className="mb-4 max-w-lg mx-auto">
          <div className="flex items-center justify-center mb-2">
            <label
              htmlFor="clienteVetado"
              className="block text-sm font-medium text-black"
            >
              Nombre del Cliente
            </label>
          </div>

          <div className="flex flex-col gap-3 justify-center items-center">
            <select
              id="clienteVetado"
              value={mostrarInputOtro ? "__otro__" : clienteSeleccionado}
              onChange={(e) => handleClienteChange(e.target.value)}
              disabled={loadingClientes || !!errorClientes}
              className="w-full px-4 py-2 bg-white disabled:cursor-not-allowed"
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
              <option value="__otro__">Otro...</option>
            </select>

            {/* Input para nombre cuando se elige "Otro" */}
            {mostrarInputOtro && (
              <div className="w-full mt-3 animate-fadeIn relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nombreOtro}
                    onChange={(e) => handleNombreOtroChange(e.target.value)}
                    placeholder="Nombre del restaurante"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    autoFocus
                  />
                  <button
                    onClick={handleConfirmarOtro}
                    disabled={!nombreOtro.trim() || !!clienteDuplicado}
                    className="px-4 py-2 bg-gray-900 text-white font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    OK
                  </button>
                </div>

                {/* Popup flotante de duplicado */}
                {clienteDuplicado && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 p-3 bg-yellow-50 border border-yellow-400 rounded-lg flex items-start gap-2 shadow-lg animate-fadeIn">
                    <span className="text-yellow-500 text-lg mt-0.5">⚠️</span>
                    <div>
                      <p className="text-sm font-bold text-yellow-800">
                        Este restaurante ya está registrado
                      </p>
                      <p className="text-xs text-yellow-700 mt-0.5">
                        Se encontró:{" "}
                        <span className="font-semibold">
                          {clienteDuplicado.restaurante}
                        </span>
                        . Selecciónalo desde el dropdown de arriba.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/*<button
              onClick={() => setMostrarPlanes(!mostrarPlanes)}
              className="px-6 py-2 text-sm font-bold text-black bg-[#FFF200] hover:bg-[#FFF200] cursor-pointer drop-shadow-[1.5px_1.5px_0.9px_rgba(0,0,0,0.3)] hover:drop-shadow-[3px_3px_0.9px_rgba(0,0,0,0.3)]"
              type="button"
            >
              {mostrarPlanes ? "Volver" : "Nuevo Cliente"}
            </button>*/}
          </div>

          {/* Mensaje de éxito: cliente seleccionado del dropdown */}
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
                📋 Selecciona un plan para este cliente
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

      {/* Cards de planes - 3 tarjetas: 1, 3 y 5+ sucursales */}
      {/* Solo se muestran si mostrarPlanes es true */}
      <div ref={planesRef} className="scroll-mt-10">
        {mostrarPlanes && (
          <div className="flex justify-center mb-8 animate-fadeIn w-full">
            <div className="w-full max-w-sm">
              {planes.map((plan, index) => (
                <PlanCard
                  key={plan.id || plan.priceId || index}
                  plan={plan}
                  onSelectPlan={handleSelectPlan}
                />
              ))}
            </div>
          </div>
        )}
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
