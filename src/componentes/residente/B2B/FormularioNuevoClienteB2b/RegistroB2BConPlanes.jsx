import React, { useState, useEffect, Fragment } from "react";
import SelectorPlanesB2B from "./SelectorPlanesB2B";
import FormMain from "./FormMain";
import { Dialog, Transition } from "@headlessui/react";
import { FaArrowLeft } from "react-icons/fa";

const RegistroB2BConPlanes = () => {
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [preciosDisponibles, setPreciosDisponibles] = useState([]);
  const [loadingPrecios, setLoadingPrecios] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Obtener precios desde el backend
  useEffect(() => {
    const fetchPrecios = async () => {
      setLoadingPrecios(true);
      try {
        const apiUrl = "https://admin.residente.mx/api/stripe/precios";
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success && data.precios && data.precios.length > 0) {
          setPreciosDisponibles(data.precios);
        }
      } catch (error) {
        console.warn("Error obteniendo precios del servidor:", error.message);
      } finally {
        setLoadingPrecios(false);
      }
    };

    fetchPrecios();
  }, []);

  const handleSelectPlan = (plan) => {
    setPlanSeleccionado(plan);
    setMostrarFormulario(true);
    // Scroll al inicio cuando se selecciona un plan
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVolverAPlanes = () => {
    setMostrarFormulario(false);
    setPlanSeleccionado(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Animación de transición
  return (
    <div className="min-h-screen ">
      {/* Vista de Selector de Planes */}
      <Transition
        show={!mostrarFormulario}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className={`${mostrarFormulario ? 'hidden' : ''}`}>
          <SelectorPlanesB2B
            onSelectPlan={handleSelectPlan}
            planesData={preciosDisponibles}
            loadingPrecios={loadingPrecios}
          />
        </div>
      </Transition>

      {/* Vista del Formulario B2B */}
      <Transition
        show={mostrarFormulario}
        enter="transition-all duration-300"
        enterFrom="opacity-0 translate-x-10"
        enterTo="opacity-100 translate-x-0"
        leave="transition-all duration-200"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 -translate-x-10"
      >
        <div className={`${!mostrarFormulario ? 'hidden' : ''}`}>
          {/* Header con botón de regreso y plan seleccionado */}
          <div className="">
            <div className="max-w-[650px] mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleVolverAPlanes}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FaArrowLeft className="text-sm" />
                  <span className="font-medium">Cambiar plan</span>
                </button>
                
                {planSeleccionado && (
                  <div className="flex items-center gap-2  px-4 py-2 rounded-full">
                    <span className="text-sm text-gray-600">Plan:</span>
                    <span className="font-bold text-gray-900">{planSeleccionado.nombre}</span>
                    <span className="text-sm text-gray-600">
                      (${planSeleccionado.precioMensual?.toLocaleString("es-MX")}/mes)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formulario B2B */}
          <div className="max-w-[650px] mx-auto px-4 py-6">
            <FormMainWrapper planInicial={planSeleccionado} />
          </div>
        </div>
      </Transition>
    </div>
  );
};

// Wrapper del FormMain que pre-selecciona el número de sucursales
const FormMainWrapper = ({ planInicial }) => {
  // Importamos y usamos el FormMain original, pasando el plan como contexto
  // El FormMain ya tiene lógica para manejar el número de sucursales
  
  useEffect(() => {
    // Si hay un plan inicial, podríamos setear el localStorage para que FormMain lo use
    if (planInicial) {
      // Guardar la selección del plan para que FormMain lo detecte
      localStorage.setItem("b2b_plan_seleccionado", JSON.stringify({
        sucursales: planInicial.sucursales,
        nombre: planInicial.nombre,
        precioMensual: planInicial.precioMensual,
        precioMensualConIVA: planInicial.precioMensualConIVA,
        priceId: planInicial.priceId,
      }));
    }

    return () => {
      // Limpiar al desmontar
      localStorage.removeItem("b2b_plan_seleccionado");
    };
  }, [planInicial]);

  return <FormMain planInicial={planInicial} />;
};

export default RegistroB2BConPlanes;
