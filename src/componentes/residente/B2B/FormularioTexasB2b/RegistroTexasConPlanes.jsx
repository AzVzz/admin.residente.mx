import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { urlApi } from "../../../api/url";
import {
  extensionB2bPost,
  registrob2bPost,
} from "../../../api/registrob2bPost";
import { loginPost } from "../../../api/loginPost";
import { useAuth } from "../../../Context";
import SelectorPlanesTexas from "./SelectorPlanesTexas";
import FormTexas from "./FormTexas";

const RegistroTexasConPlanes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { saveToken, saveUsuario } = useAuth();

  const paymentSuccess = searchParams.get("payment_success") === "true";
  const paymentSessionId = searchParams.get("session_id");
  const savedPlan = localStorage.getItem("b2b_texas_plan");

  const [precios, setPrecios] = useState([]);
  const [loadingPrecios, setLoadingPrecios] = useState(true);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(
    paymentSuccess && !!savedPlan,
  );
  const [procesandoPago, setProcesandoPago] = useState(paymentSuccess);
  const [mensajeProceso, setMensajeProceso] = useState("Verifying your payment…");
  const postPaymentRan = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mostrarFormulario, procesandoPago]);

  useEffect(() => {
    const fetchPrecios = async () => {
      setLoadingPrecios(true);
      try {
        const res = await fetch(`${urlApi}api/stripe/precios-texas`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.precios)) {
          setPrecios(data.precios);
        }
      } catch (err) {
        console.error("[Texas B2B] Error loading prices:", err);
      } finally {
        setLoadingPrecios(false);
      }
    };
    fetchPrecios();
  }, []);

  useEffect(() => {
    if (!paymentSuccess || postPaymentRan.current) return;
    postPaymentRan.current = true;

    const procesarPostPago = async () => {
      try {
        setSearchParams({});

        const sessionId =
          paymentSessionId || localStorage.getItem("b2b_texas_stripe_session_id");
        if (sessionId) {
          localStorage.setItem("b2b_texas_stripe_session_id", sessionId);
        }

        const savedFormData = localStorage.getItem("b2b_texas_form_data");
        if (!savedFormData) {
          setMensajeProceso("Form data missing. Redirecting…");
          await new Promise((r) => setTimeout(r, 1500));
          navigate("/registro", { replace: true });
          return;
        }

        const formData = JSON.parse(savedFormData);

        setMensajeProceso("Verifying your payment…");
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
                if (i === 0) await new Promise((r) => setTimeout(r, 2500));
                break;
              }
            } catch (_) {
              /* ignore */
            }
            await new Promise((r) => setTimeout(r, 1500));
          }
          if (!pagado) {
            setMensajeProceso("Payment not confirmed yet. Redirecting…");
            await new Promise((r) => setTimeout(r, 2000));
            navigate("/registro", { replace: true });
            return;
          }
        }

        setMensajeProceso("Creating your account…");
        let usuarioRes;
        try {
          usuarioRes = await registrob2bPost({
            nombre_usuario: formData.nombre_usuario,
            password: formData.password,
            correo: formData.correo,
            stripe_session_id: sessionId || undefined,
          });
        } catch (error) {
          if (error.message && error.message.includes("ya existe")) {
            setMensajeProceso("Account already exists. Redirecting to login…");
            localStorage.removeItem("b2b_texas_form_data");
            localStorage.removeItem("b2b_texas_plan");
            localStorage.removeItem("b2b_texas_stripe_session_id");
            await new Promise((r) => setTimeout(r, 1500));
            navigate("/registro", { replace: true });
            return;
          }
          throw error;
        }

        const usuarioId = usuarioRes.usuario.id;
        const b2bId = usuarioRes.usuario.b2b_id || null;

        setMensajeProceso("Signing you in…");
        let loginResp = null;
        const MAX_INTENTOS = 5;
        for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
          try {
            loginResp = await loginPost(formData.correo, formData.password);
            break;
          } catch (loginError) {
            if (
              loginError.message?.includes("inactivo") &&
              intento < MAX_INTENTOS
            ) {
              setMensajeProceso(
                `Activating your account… (${intento}/${MAX_INTENTOS})`,
              );
              await new Promise((r) => setTimeout(r, 3000));
            } else {
              throw loginError;
            }
          }
        }
        if (!loginResp) throw new Error("Could not sign in");
        saveToken(loginResp.token);
        saveUsuario(loginResp.usuario);

        setMensajeProceso("Setting up your profile…");
        try {
          await extensionB2bPost(
            {
              ...(b2bId && { b2b_id: b2bId }),
              usuario_id: usuarioId,
              nombre_responsable_restaurante: formData.nombre_restaurante,
              correo: formData.correo,
              nombre_responsable: formData.nombre_responsable_restaurante,
              telefono: formData.telefono,
              nombre_restaurante: formData.nombre_restaurante,
              direccion_completa: [
                formData.market,
                formData.category,
                formData.website,
              ]
                .filter(Boolean)
                .join(" · "),
              terminos_condiciones: true,
              stripe_session_id: sessionId || undefined,
            },
            loginResp.token,
          );
        } catch (extError) {
          if (!extError.message?.includes("ya tiene un registro B2B")) {
            console.warn("Error updating B2B Texas:", extError);
          }
        }

        localStorage.removeItem("b2b_texas_form_data");
        localStorage.removeItem("b2b_texas_plan");
        localStorage.removeItem("b2b_texas_stripe_session_id");

        setMensajeProceso("Welcome! Redirecting to your dashboard…");
        await new Promise((r) => setTimeout(r, 1000));
        navigate("/dashboardb2b", { replace: true });
      } catch (err) {
        console.error("[Texas B2B] post-payment error:", err);
        setMensajeProceso(
          err.message || "Something went wrong after payment. Please contact support.",
        );
        setProcesandoPago(false);
        setMostrarFormulario(true);
      }
    };

    procesarPostPago();
  }, [
    paymentSuccess,
    paymentSessionId,
    navigate,
    saveToken,
    saveUsuario,
    setSearchParams,
  ]);

  useEffect(() => {
    if (mostrarFormulario && !planSeleccionado && savedPlan) {
      try {
        setPlanSeleccionado(JSON.parse(savedPlan));
      } catch (_) {
        setMostrarFormulario(false);
      }
    }
  }, [mostrarFormulario, planSeleccionado, savedPlan]);

  if (procesandoPago) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="w-10 h-10 border-4 border-[#fff200] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-semibold text-center">{mensajeProceso}</p>
      </div>
    );
  }

  if (mostrarFormulario && planSeleccionado) {
    return (
      <FormTexas
        plan={planSeleccionado}
        onBack={() => {
          setMostrarFormulario(false);
          setPlanSeleccionado(null);
        }}
      />
    );
  }

  return (
    <SelectorPlanesTexas
      precios={precios}
      loading={loadingPrecios}
      onSelectPlan={(plan) => {
        setPlanSeleccionado(plan);
        setMostrarFormulario(true);
        localStorage.setItem("b2b_texas_plan", JSON.stringify(plan));
      }}
    />
  );
};

export default RegistroTexasConPlanes;
