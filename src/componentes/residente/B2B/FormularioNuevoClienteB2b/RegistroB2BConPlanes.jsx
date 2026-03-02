import React, { useState, useEffect, Fragment, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SelectorPlanesB2B from "./SelectorPlanesB2B";
import SelectorBeneficiosB2B from "./SelectorBeneficiosB2B";
import FormMain from "./FormMain";
import { Dialog, Transition } from "@headlessui/react";
import { FaArrowLeft } from "react-icons/fa";

import { urlApi } from "../../../api/url";
import {
  registrob2bPost,
  extensionB2bPost,
} from "../../../api/registrob2bPost";
import { loginPost } from "../../../api/loginPost";
import { useAuth } from "../../../Context";

const TODOS_LOS_BENEFICIOS = [
  "estudios_mercado",
  "revista_residente",
  "video_publicitario",
  "giveaway",
  "suscripcion_semestral",
];

const PLAN_PRUEBA_12_MESES = {
  meses: 12,
  mesesTexto: "12 meses",
  priceId: "price_fallback_12",
  precioMensual: 2199,
  precioMensualConIVA: 2550.84,
  nombre: "Plan 12 meses",
  descripcion: "Suscripción por 12 meses",
  moneda: "MXN",
  intervalo: "month",
};

const RegistroB2BConPlanes = ({ modoPrueba = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { saveToken, saveUsuario, usuario } = useAuth();
  const rol = usuario?.rol?.toLowerCase();
  const esSeller = rol === "residente" || rol === "vendedor";
  const planParam = searchParams.get("plan");

  const [planSeleccionado, setPlanSeleccionado] = useState(
    modoPrueba ? PLAN_PRUEBA_12_MESES : null,
  );
  const [preciosDisponibles, setPreciosDisponibles] = useState([]);
  const [loadingPrecios, setLoadingPrecios] = useState(!modoPrueba);
  const [beneficiosSeleccionados, setBeneficiosSeleccionados] = useState([]);
  const [mostrarSelectorBeneficios, setMostrarSelectorBeneficios] =
    useState(false);
  const [nombreRestauranteOtro, setNombreRestauranteOtro] = useState("");

  // Detectar si viene de Stripe con pago exitoso
  const paymentSuccess = searchParams.get("payment_success") === "true";
  const paymentSessionId = searchParams.get("session_id");
  const savedPlan = localStorage.getItem("b2b_plan_seleccionado");

  const [procesandoPago, setProcesandoPago] = useState(paymentSuccess);
  const [mensajeProceso, setMensajeProceso] = useState(
    "Verificando tu pago...",
  );
  const postPaymentRan = useRef(false);

  const [mostrarFormulario, setMostrarFormulario] = useState(
    modoPrueba || (!paymentSuccess && false),
  );

  // Gate de acceso: sin sesion de seller, sin ?plan= y sin payment_success -> bloquear
  if (!modoPrueba && !esSeller && !planParam && !paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
          <p className="text-gray-600">
            Para ver los planes B2B, necesitas un enlace de invitacion de un vendedor.
          </p>
        </div>
      </div>
    );
  }

  // Obtener precios desde el backend
  useEffect(() => {
    const fetchPrecios = async () => {
      setLoadingPrecios(true);
      try {
        const apiUrl = `${urlApi}api/stripe/precios`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.precios && data.precios.length > 0) {
          setPreciosDisponibles(data.precios);

          // Si hay ?plan= param, auto-seleccionar ese plan y mostrar formulario
          if (planParam) {
            const planEncontrado = data.precios.find(p => p.priceId === planParam);
            if (planEncontrado) {
              setPlanSeleccionado(planEncontrado);
              setMostrarFormulario(true);
            }
          }
        }
      } catch (error) {
        // Error obteniendo precios
      } finally {
        setLoadingPrecios(false);
      }
    };

    if (!modoPrueba) {
      fetchPrecios();
    }
  }, [modoPrueba]);

  // Post-pago: procesar automáticamente cuando vuelve de Stripe
  useEffect(() => {
    if (!paymentSuccess || postPaymentRan.current) return;
    postPaymentRan.current = true;

    const procesarPostPago = async () => {
      try {
        // Limpiar query params de la URL
        setSearchParams({});

        const sessionId =
          paymentSessionId || localStorage.getItem("b2b_stripe_session_id");
        if (sessionId) {
          localStorage.setItem("b2b_stripe_session_id", sessionId);
        }

        // Restaurar datos del formulario guardados antes del pago
        const savedFormData = localStorage.getItem("b2b_form_data");
        if (!savedFormData) {
          setMensajeProceso(
            "No se encontraron los datos del formulario. Redirigiendo...",
          );
          await new Promise((r) => setTimeout(r, 1500));
          navigate("/registro", { replace: true });
          return;
        }

        const formData = JSON.parse(savedFormData);

        // Esperar a que Stripe confirme el pago
        setMensajeProceso("Verificando tu pago...");
        if (sessionId) {
          const checkoutApiUrl = `${urlApi}api/stripe/checkout-session/${sessionId}`;
          let pagado = false;
          for (let i = 0; i < 12; i++) {
            try {
              const checkRes = await fetch(checkoutApiUrl);
              const checkData = await checkRes.json();
              if (
                checkData.success &&
                checkData.session?.payment_status === "paid"
              ) {
                pagado = true;
                // Dar tiempo al webhook para procesar
                if (i === 0) await new Promise((r) => setTimeout(r, 2500));
                break;
              }
            } catch (_) {
              /* ignorar */
            }
            await new Promise((r) => setTimeout(r, 1500));
          }
          if (!pagado) {
            setMensajeProceso("El pago aún no se confirma. Redirigiendo...");
            await new Promise((r) => setTimeout(r, 2000));
            navigate("/registro", { replace: true });
            return;
          }
        }

        // Crear/actualizar la cuenta del usuario
        setMensajeProceso("Creando tu cuenta...");
        let usuarioRes;
        try {
          usuarioRes = await registrob2bPost({
            nombre_usuario: formData.nombre_usuario,
            password: formData.password,
            correo: formData.correo,
            stripe_session_id: sessionId || undefined,
          });
        } catch (error) {
          // Si ya existe pero no es temporal, redirigir a login
          if (error.message && error.message.includes("ya existe")) {
            setMensajeProceso(
              "La cuenta ya existe. Redirigiendo a inicio de sesión...",
            );
            localStorage.removeItem("b2b_payment_completed");
            localStorage.removeItem("b2b_stripe_session_id");
            localStorage.removeItem("b2b_form_data");
            localStorage.removeItem("b2b_plan_seleccionado");
            await new Promise((r) => setTimeout(r, 1500));
            navigate("/registro", { replace: true });
            return;
          }
          throw error;
        }

        const usuarioId = usuarioRes.usuario.id;
        const b2bId = usuarioRes.usuario.b2b_id || null;

        // Actualizar datos del B2B
        setMensajeProceso("Configurando tu perfil...");
        try {
          await extensionB2bPost({
            ...(b2bId && { b2b_id: b2bId }),
            usuario_id: usuarioId,
            nombre_responsable_restaurante:
              formData.nombre_responsable_restaurante,
            correo: formData.correo,
            nombre_responsable: formData.nombre_responsable_restaurante,
            telefono: formData.telefono,
            nombre_restaurante: formData.nombre_restaurante,
            rfc: formData.rfc,
            direccion_completa: formData.direccion_completa,
            razon_social: formData.razon_social,
            terminos_condiciones: true,
            stripe_session_id: sessionId || undefined,
          });
        } catch (extError) {
          // Si ya tiene registro B2B, no es error fatal
          if (!extError.message?.includes("ya tiene un registro B2B")) {
            console.warn("Error actualizando B2B:", extError);
          }
        }

        // Login automático
        setMensajeProceso("Iniciando sesión...");
        const loginResp = await loginPost(formData.correo, formData.password);
        saveToken(loginResp.token);
        saveUsuario(loginResp.usuario);

        // Guardar credenciales para mostrar en dashboard
        sessionStorage.setItem(
          "credencialesNuevas",
          JSON.stringify({
            nombre_usuario: formData.nombre_usuario,
            password: formData.password,
            correo: formData.correo,
          }),
        );

        // Limpiar localStorage
        localStorage.removeItem("b2b_payment_completed");
        localStorage.removeItem("b2b_stripe_session_id");
        localStorage.removeItem("b2b_form_data");
        localStorage.removeItem("b2b_plan_seleccionado");

        setMensajeProceso("¡Listo! Redirigiendo...");
        await new Promise((r) => setTimeout(r, 500));
        navigate("/dashboardb2b", { replace: true });
      } catch (error) {
        console.error("Error en proceso post-pago:", error);
        setMensajeProceso(
          "Ocurrió un error. Redirigiendo a inicio de sesión...",
        );
        localStorage.removeItem("b2b_payment_completed");
        localStorage.removeItem("b2b_stripe_session_id");
        localStorage.removeItem("b2b_form_data");
        localStorage.removeItem("b2b_plan_seleccionado");
        await new Promise((r) => setTimeout(r, 2000));
        navigate("/registro", { replace: true });
      }
    };

    procesarPostPago();
  }, [paymentSuccess]);

  const handleSelectPlan = (plan) => {
    // Guardar nombre si viene de "Otro" o de un cliente existente
    if (plan.nombreRestauranteOtro) {
      setNombreRestauranteOtro(plan.nombreRestauranteOtro);
    } else if (plan.nombreCliente) {
      setNombreRestauranteOtro(plan.nombreCliente);
    } else {
      setNombreRestauranteOtro("");
    }
    setPlanSeleccionado(plan);
    const meses = parseInt(plan.meses, 10);

    setBeneficiosSeleccionados(
      meses === 12 ? [...TODOS_LOS_BENEFICIOS] : []
    );
    setMostrarSelectorBeneficios(true);
    setMostrarFormulario(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmBeneficios = (beneficios) => {
    setBeneficiosSeleccionados(beneficios);
    setMostrarSelectorBeneficios(false);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVolverAPlanes = () => {
    setMostrarFormulario(false);
    setMostrarSelectorBeneficios(false);
    setPlanSeleccionado(null);
    setBeneficiosSeleccionados([]);
    setNombreRestauranteOtro(""); // limpiar nombre temporal
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVolverABeneficios = () => {
    setMostrarFormulario(false);
    setMostrarSelectorBeneficios(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pantalla de procesamiento post-pago
  if (procesandoPago) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-yellow-500"></div>
          <p className="text-lg font-medium text-gray-700">{mensajeProceso}</p>
        </div>
      </div>
    );
  }

  // Animación de transición
  return (
    <div className="min-h-screen ">
      {/* Vista de Selector de Planes */}
      <Transition
        show={!mostrarFormulario && !mostrarSelectorBeneficios}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className={`${mostrarFormulario || mostrarSelectorBeneficios ? "hidden" : ""}`}
        >
          <SelectorPlanesB2B
            onSelectPlan={handleSelectPlan}
            planesData={preciosDisponibles}
            loadingPrecios={loadingPrecios}
            esSeller={esSeller}
          />
        </div>
      </Transition>

      {/* Vista de Selector de Beneficios (solo para planes de 6 y 9 meses) */}
      <Transition
        show={mostrarSelectorBeneficios}
        enter="transition-all duration-300"
        enterFrom="opacity-0 translate-x-10"
        enterTo="opacity-100 translate-x-0"
        leave="transition-all duration-200"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 -translate-x-10"
      >
        <div className={`${!mostrarSelectorBeneficios ? "hidden" : ""}`}>
          <SelectorBeneficiosB2B
            numMeses={planSeleccionado?.meses}
            beneficiosIniciales={beneficiosSeleccionados}
            todosIncluidos={parseInt(planSeleccionado?.meses) === 12}
            onConfirmBeneficios={handleConfirmBeneficios}
            onVolver={handleVolverAPlanes}
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
        <div className={`${!mostrarFormulario ? "hidden" : ""} max-w-[850px] mx-auto mb-96 transition-transform`}>
          {/* Header con botón de regreso y plan seleccionado */}
          <div className="">
            <div className="w-full mx-auto md:mt-4 lg:mt-8">
              <div className="flex items-center justify-between">
                {!modoPrueba && esSeller && (
                  <button
                    onClick={handleVolverAPlanes}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <FaArrowLeft className="text-sm" />
                    <span className="font-medium">Regresar</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Formulario B2B */}
          <div className="w-full mx-auto px-4 py-6">
            <FormMainWrapper
              planInicial={planSeleccionado}
              beneficiosSeleccionados={beneficiosSeleccionados}
              nombreRestauranteInicial={nombreRestauranteOtro}
            />
          </div>
        </div>
      </Transition>
    </div>
  );
};

// Wrapper del FormMain que persiste plan y beneficios en localStorage
const FormMainWrapper = ({ planInicial, beneficiosSeleccionados = [], nombreRestauranteInicial = "" }) => {
  useEffect(() => {
    if (planInicial) {
      localStorage.setItem(
        "b2b_plan_seleccionado",
        JSON.stringify({
          meses: planInicial.meses,
          mesesTexto: planInicial.mesesTexto,
          nombre: planInicial.nombre,
          precioMensual: planInicial.precioMensual,
          precioMensualConIVA: planInicial.precioMensualConIVA,
          priceId: planInicial.priceId,
          beneficiosSeleccionados,
        }),
      );
    }
  }, [planInicial, beneficiosSeleccionados]);

  return (
    <FormMain
      planInicial={planInicial}
      beneficiosSeleccionados={beneficiosSeleccionados}
      nombreRestauranteInicial={nombreRestauranteInicial}
    />
  );
};

export default RegistroB2BConPlanes;
