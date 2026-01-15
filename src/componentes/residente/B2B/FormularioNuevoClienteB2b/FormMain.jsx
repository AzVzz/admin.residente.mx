import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import TerminosyCondiciones from "./TerminosyCondiciones";
import {
  extensionB2bPost,
  registrob2bPost,
} from "../../../api/registrob2bPost";
import DirectorioVertical from "../../componentes/componentesColumna2/DirectorioVertical";
import PortadaRevista from "../../componentes/componentesColumna2/PortadaRevista";
import BotonesAnunciateSuscribirme from "../../componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import { Dialog, Transition } from "@headlessui/react";
import { loginPost } from "../../../api/loginPost";
import { useAuth } from "../../../Context";

const FormMain = ({ planInicial = null }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // <-- nuevo estado
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [stripeSessionId, setStripeSessionId] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [formData, setFormData] = useState({
    nombre_responsable_restaurante: "",
    nombre_restaurante: "",
    telefono: "",
    correo: "",
    rfc: "",
    direccion_completa: "",
    razon_social: "",
    nombre_usuario: "",
    password: "",
    confirm_password: "", // <-- nuevo campo
  });
  const [successMsg, setSuccessMsg] = useState("");
  const accountCreationInProgress = useRef(false);
  const { saveToken, saveUsuario } = useAuth();

  // Precios de fallback (se usan si el endpoint no está disponible)
  const PRECIOS_FALLBACK = [
    { sucursales: 1, sucursalesTexto: "1 sucursal", precioMensual: 2199, precioMensualConIVA: 2550.84, nombre: "Plan 1 Sucursal", priceId: "fallback_1" },
    { sucursales: 2, sucursalesTexto: "2 sucursales", precioMensual: 2599, precioMensualConIVA: 3014.84, nombre: "Plan 2 Sucursales", priceId: "fallback_2" },
    { sucursales: 3, sucursalesTexto: "3 sucursales", precioMensual: 3599, precioMensualConIVA: 4174.84, nombre: "Plan 3 Sucursales", priceId: "fallback_3" },
    { sucursales: 4, sucursalesTexto: "4 sucursales", precioMensual: 3999, precioMensualConIVA: 4638.84, nombre: "Plan 4 Sucursales", priceId: "fallback_4" },
    { sucursales: "5+", sucursalesTexto: "5 o más sucursales", precioMensual: 4599, precioMensualConIVA: 5334.84, nombre: "Plan 5+ Sucursales", priceId: "fallback_5" },
  ];

  // Estados para número de sucursales y precios
  // Si viene un planInicial, usarlo como valor inicial
  const [numeroSucursales, setNumeroSucursales] = useState(() => {
    if (planInicial?.sucursales) {
      return planInicial.sucursales === "5+" ? 5 : planInicial.sucursales;
    }
    return 1;
  });
  const [preciosDisponibles, setPreciosDisponibles] = useState(PRECIOS_FALLBACK);
  const [loadingPrecios, setLoadingPrecios] = useState(true);
  const [precioSeleccionado, setPrecioSeleccionado] = useState(() => {
    if (planInicial) {
      return planInicial;
    }
    return PRECIOS_FALLBACK[0];
  });

  // Estados para verificación de nombre de usuario
  const [usernameExists, setUsernameExists] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameDebounceRef = useRef(null);

  // Estados para verificación de cliente vetado
  const [clienteVetado, setClienteVetado] = useState(false);
  const [checkingVetado, setCheckingVetado] = useState(false);
  const vetadoDebounceRef = useRef(null);

  // Obtener precios desde el backend al cargar el componente
  useEffect(() => {
    const fetchPrecios = async () => {
      setLoadingPrecios(true);
      try {
        // Siempre usar la URL absoluta del backend
        const apiUrl = "https://admin.residente.mx/api/stripe/precios";

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.precios && data.precios.length > 0) {
          setPreciosDisponibles(data.precios);
          // Si hay un plan inicial, usar ese; si no, usar el de 1 sucursal
          if (planInicial) {
            const precioCoincidente = data.precios.find(p =>
              p.sucursales === planInicial.sucursales ||
              (planInicial.sucursales === "5+" && p.sucursales === "5+")
            );
            if (precioCoincidente) {
              setPrecioSeleccionado(precioCoincidente);
            }
          } else {
            const precioInicial = data.precios.find(p => p.sucursales === 1);
            if (precioInicial) {
              setPrecioSeleccionado(precioInicial);
            }
          }
        } else {
          // Si no hay precios del servidor, usar fallback
          console.warn("No se obtuvieron precios del servidor, usando fallback");
        }
      } catch (error) {
        console.warn("Error obteniendo precios del servidor, usando precios locales:", error.message);
        // Los precios de fallback ya están cargados por defecto
      } finally {
        setLoadingPrecios(false);
      }
    };

    fetchPrecios();
  }, [planInicial]);

  // Actualizar cuando cambia el planInicial desde el selector de planes
  useEffect(() => {
    if (planInicial) {
      const sucursales = planInicial.sucursales === "5+" ? 5 : planInicial.sucursales;
      setNumeroSucursales(sucursales);
      setPrecioSeleccionado(planInicial);
    }
  }, [planInicial]);

  // Actualizar precio seleccionado cuando cambia el número de sucursales
  useEffect(() => {
    if (preciosDisponibles.length > 0) {
      // Buscar el precio correspondiente al número de sucursales
      // Si es 5 o más, usar el precio de "5+"
      const sucursalesKey = numeroSucursales >= 5 ? "5+" : numeroSucursales;
      const precio = preciosDisponibles.find(p => p.sucursales === sucursalesKey || p.sucursales === numeroSucursales);
      if (precio) {
        setPrecioSeleccionado(precio);
      }
    }
  }, [numeroSucursales, preciosDisponibles]);

  // Verificar si el nombre de usuario ya existe (con debounce)
  useEffect(() => {
    // Limpiar timeout anterior
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    const nombreUsuario = formData.nombre_usuario.trim();

    // Si no hay nombre de usuario, resetear estado
    if (!nombreUsuario || nombreUsuario.length < 3) {
      setUsernameExists(false);
      setCheckingUsername(false);
      return;
    }

    setCheckingUsername(true);

    // Debounce de 500ms para no hacer peticiones en cada tecla
    usernameDebounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          "https://admin.residente.mx/api/usuarios/verificar-nombre-usuario",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre_usuario: nombreUsuario }),
          }
        );

        const data = await response.json();
        setUsernameExists(data.exists === true);
      } catch (error) {
        console.error("Error verificando nombre de usuario:", error);
        setUsernameExists(false);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    // Cleanup
    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
      }
    };
  }, [formData.nombre_usuario]);

  // Verificar si el restaurante está vetado (con debounce)
  useEffect(() => {
    if (vetadoDebounceRef.current) {
      clearTimeout(vetadoDebounceRef.current);
    }

    const nombreRestaurante = formData.nombre_restaurante.trim();

    // Si no hay nombre de restaurante, resetear estado
    if (!nombreRestaurante || nombreRestaurante.length < 3) {
      setClienteVetado(false);
      setCheckingVetado(false);
      return;
    }

    setCheckingVetado(true);

    // Debounce de 500ms
    vetadoDebounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          "https://admin.residente.mx/api/clientes-editorial/verificar-vetado",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre_restaurante: nombreRestaurante }),
          }
        );

        const data = await response.json();
        setClienteVetado(data.vetado === true);
      } catch (error) {
        console.error("Error verificando cliente vetado:", error);
        setClienteVetado(false);
      } finally {
        setCheckingVetado(false);
      }
    }, 500);

    return () => {
      if (vetadoDebounceRef.current) {
        clearTimeout(vetadoDebounceRef.current);
      }
    };
  }, [formData.nombre_restaurante]);

  // Estados para verificación de correo
  const [emailExists, setEmailExists] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailDebounceRef = useRef(null);

  // Verificar si el correo ya existe (con debounce)
  useEffect(() => {
    if (emailDebounceRef.current) {
      clearTimeout(emailDebounceRef.current);
    }

    const correo = formData.correo.trim();

    // Si no hay correo, resetear estado
    if (!correo) {
      setEmailExists(false);
      setEmailValid(true);
      setCheckingEmail(false);
      return;
    }

    // Validar formato básico antes de hacer petición
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setEmailExists(false);
      setEmailValid(false);
      setCheckingEmail(false);
      return;
    }

    setCheckingEmail(true);
    setEmailValid(true);

    emailDebounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          "https://admin.residente.mx/api/usuarios/verificar-correo",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo }),
          }
        );

        const data = await response.json();
        setEmailExists(data.exists === true);
        setEmailValid(data.valid !== false);
      } catch (error) {
        console.error("Error verificando correo:", error);
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);

    return () => {
      if (emailDebounceRef.current) {
        clearTimeout(emailDebounceRef.current);
      }
    };
  }, [formData.correo]);

  const handleCreateAccountAfterPayment = useCallback(
    async (formDataToUse, sessionId) => {
      // Prevenir ejecuciones duplicadas
      if (accountCreationInProgress.current) {
        console.log(
          "⚠️ La creación de cuenta ya está en progreso, ignorando llamada duplicada"
        );
        return;
      }

      accountCreationInProgress.current = true;
      setCreatingAccount(true);
      setPaymentError("");

      try {
        // Obtener el session_id de Stripe
        const savedSessionId =
          sessionId ||
          localStorage.getItem("b2b_stripe_session_id") ||
          stripeSessionId;

        let usuarioRes;
        let usuarioId;

        // Intentar crear el usuario
        try {
          const usuarioData = {
            nombre_usuario: formDataToUse.nombre_usuario,
            password: formDataToUse.password,
            correo: formDataToUse.correo,
          };
          usuarioRes = await registrob2bPost(usuarioData);
          usuarioId = usuarioRes.usuario.id;
        } catch (error) {
          // Si el usuario ya existe, intentar obtener el usuario B2B existente
          if (error.message && error.message.includes("ya existe")) {
            console.log(
              "⚠️ El usuario ya existe, buscando usuario B2B existente..."
            );

            if (savedSessionId) {
              try {
                const apiUrl = import.meta.env.DEV
                  ? "/api/stripe/checkout-session/" + savedSessionId
                  : "https://admin.residente.mx/api/stripe/checkout-session/" +
                  savedSessionId;

                const sessionRes = await fetch(apiUrl);
                const sessionData = await sessionRes.json();

                if (
                  sessionData.success &&
                  sessionData.session?.metadata?.b2b_id
                ) {
                  const b2bId = parseInt(sessionData.session.metadata.b2b_id);

                  const b2bData = {
                    b2b_id: b2bId,
                    nombre_responsable_restaurante:
                      formDataToUse.nombre_responsable_restaurante,
                    correo: formDataToUse.correo,
                    nombre_responsable:
                      formDataToUse.nombre_responsable_restaurante,
                    telefono: formDataToUse.telefono,
                    nombre_restaurante: formDataToUse.nombre_restaurante,
                    rfc: formDataToUse.rfc,
                    direccion_completa: formDataToUse.direccion_completa,
                    razon_social: formDataToUse.razon_social,
                    terminos_condiciones: true,
                    stripe_session_id: savedSessionId,
                  };

                  await extensionB2bPost(b2bData);

                  // Limpiar el estado de pago
                  setPaymentCompleted(false);
                  setStripeSessionId("");
                  localStorage.removeItem("b2b_payment_completed");
                  localStorage.removeItem("b2b_stripe_session_id");

                  // Redirigir a registro
                  window.location.href = "/registro";
                }
              } catch (sessionError) {
                console.error("Error obteniendo sesión:", sessionError);
              }
            }

            setPaymentError(
              "El usuario ya existe. Por favor, inicia sesión o usa otro nombre de usuario."
            );
            setTimeout(() => setPaymentError(""), 5000);
            return;
          } else {
            throw error;
          }
        }

        // Si llegamos aquí, el usuario se creó exitosamente
        usuarioId = usuarioRes.usuario.id;

        // Guardar credenciales para el modal del dashboard
        sessionStorage.setItem(
          "credencialesNuevas",
          JSON.stringify({
            nombre_usuario: formDataToUse.nombre_usuario,
            password: formDataToUse.password,
            correo: formDataToUse.correo,
          })
        );
        console.log("📝 Guardando credenciales:", {
          nombre_usuario: formDataToUse.nombre_usuario,
          password: formDataToUse.password,
          correo: formDataToUse.correo,
        });

        // Obtener el b2b_id desde el session_id si existe
        let b2bId = null;
        if (savedSessionId) {
          try {
            const apiUrl = import.meta.env.DEV
              ? "/api/stripe/checkout-session/" + savedSessionId
              : "https://admin.residente.mx/api/stripe/checkout-session/" +
              savedSessionId;

            const sessionRes = await fetch(apiUrl);
            const sessionData = await sessionRes.json();

            if (sessionData.success && sessionData.session?.metadata?.b2b_id) {
              b2bId = parseInt(sessionData.session.metadata.b2b_id);
              console.log("✅ b2b_id obtenido desde session:", b2bId);
            }
          } catch (error) {
            console.warn("⚠️ No se pudo obtener b2b_id desde session:", error);
          }
        }

        const b2bData = {
          ...(b2bId && { b2b_id: b2bId }),
          usuario_id: usuarioId,
          nombre_responsable_restaurante:
            formDataToUse.nombre_responsable_restaurante,
          correo: formDataToUse.correo,
          nombre_responsable: formDataToUse.nombre_responsable_restaurante,
          telefono: formDataToUse.telefono,
          nombre_restaurante: formDataToUse.nombre_restaurante,
          rfc: formDataToUse.rfc,
          direccion_completa: formDataToUse.direccion_completa,
          razon_social: formDataToUse.razon_social,
          terminos_condiciones: true,
          stripe_session_id: savedSessionId || undefined,
        };

        console.log("📤 Enviando datos a /api/usuariosb2b:", {
          b2b_id: b2bId,
          usuario_id: usuarioId,
          correo: formDataToUse.correo,
          stripe_session_id: savedSessionId,
        });

        const b2bRes = await extensionB2bPost(b2bData);

        console.log("✅ Respuesta del backend usuariosb2b:", b2bRes);

        // Si tenemos session_id y el backend no lo procesó, intentar asociarlo manualmente
        if (savedSessionId) {
          try {
            const apiUrl = import.meta.env.DEV
              ? "/api/stripe/associate-session"
              : "https://admin.residente.mx/api/stripe/associate-session";

            await fetch(apiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                stripe_session_id: savedSessionId,
                b2b_id: b2bRes?.id || b2bRes?.usuario?.id,
              }),
            });
          } catch (error) {
            console.warn("No se pudo asociar la sesión de Stripe:", error);
          }
        }

        // Limpiar el estado de pago después de crear la cuenta exitosamente
        setPaymentCompleted(false);
        setStripeSessionId("");
        localStorage.removeItem("b2b_payment_completed");
        localStorage.removeItem("b2b_stripe_session_id");
        localStorage.removeItem("b2b_form_data");
        localStorage.removeItem("b2b_plan_seleccionado");

        // Login automático
        const loginResp = await loginPost(
          formDataToUse.correo,
          formDataToUse.password
        );
        saveToken(loginResp.token);
        saveUsuario(loginResp.usuario);
        sessionStorage.setItem(
          "credencialesNuevas",
          JSON.stringify({
            nombre_usuario: formDataToUse.nombre_usuario,
            password: formDataToUse.password,
            correo: formDataToUse.correo,
          })
        );
        navigate("/dashboardb2b");

        return; // <-- Importante para que no siga ejecutando el resto

        // window.location.href = "/registro"; // <-- Quita o comenta esta línea
      } catch (error) {
        console.error("Error en handleCreateAccountAfterPayment:", error);

        // Si el usuario ya tiene registro B2B, significa que ya está creado - redirigir de todas formas
        if (
          error.message &&
          (error.message.includes("ya tiene un registro B2B") ||
            error.message.includes("ya existe"))
        ) {
          console.log(
            "✅ Usuario ya tiene registro B2B, intentando login automático"
          );
          // Limpiar localStorage
          localStorage.removeItem("b2b_payment_completed");
          localStorage.removeItem("b2b_stripe_session_id");
          localStorage.removeItem("b2b_form_data");
          localStorage.removeItem("b2b_plan_seleccionado");

          // Intentar login automático
          try {
            const loginResp = await loginPost(
              formDataToUse.correo,
              formDataToUse.password
            );
            saveToken(loginResp.token);
            saveUsuario(loginResp.usuario);
            navigate("/dashboard", { replace: true });
            return;
          } catch (loginError) {
            setPaymentError(
              "El usuario ya existe, pero no se pudo iniciar sesión automáticamente. Por favor, inicia sesión manualmente."
            );
            setTimeout(() => navigate("/login"), 2000);
            return;
          }
        }

        setPaymentError(
          error.message ||
          "Error al crear la cuenta. Por favor, intenta nuevamente."
        );
        setTimeout(() => setPaymentError(""), 5000);
      } finally {
        setCreatingAccount(false);
      }
    },
    [navigate, stripeSessionId]
  );

  // Verificar si el pago fue completado al cargar el componente
  useEffect(() => {
    // Verificar query params primero (si viene del checkout)
    const paymentSuccess = searchParams.get("payment_success");
    const paymentCanceled = searchParams.get("payment_canceled");

    if (paymentSuccess === "true") {
      const sessionId = searchParams.get("session_id");
      setPaymentCompleted(true);
      setShowPaymentModal(false);
      setPaymentLoading(false);
      setStripeSessionId(sessionId || "");
      // Limpiar el query param
      setSearchParams({});
      // Guardar en localStorage para persistencia
      localStorage.setItem("b2b_payment_completed", "true");
      if (sessionId) {
        localStorage.setItem("b2b_stripe_session_id", sessionId);
      }

      // Restaurar los datos del formulario si existen
      const savedFormData = localStorage.getItem("b2b_form_data");
      if (savedFormData && !accountCreationInProgress.current) {
        try {
          const parsedData = JSON.parse(savedFormData);
          setFormData(parsedData);
          // Limpiar los datos guardados después de restaurarlos
          localStorage.removeItem("b2b_form_data");

          // Crear la cuenta automáticamente después del pago
          handleCreateAccountAfterPayment(parsedData, sessionId);
        } catch (error) {
          console.error("Error al restaurar datos del formulario:", error);
        }
      }
    } else if (paymentCanceled === "true") {
      setShowPaymentModal(false);
      setPaymentLoading(false);
      setPaymentCompleted(false);
      setSearchParams({});
      // Limpiar localStorage cuando se cancela el pago
      localStorage.removeItem("b2b_payment_completed");
      localStorage.removeItem("b2b_stripe_session_id");
    } else {
      // Verificar localStorage como respaldo, pero solo si hay session_id válido
      const storedPayment = localStorage.getItem("b2b_payment_completed");
      const storedSessionId = localStorage.getItem("b2b_stripe_session_id");

      // Solo marcar como completado si hay tanto el flag como un session_id válido
      if (
        storedPayment === "true" &&
        storedSessionId &&
        storedSessionId.trim() !== ""
      ) {
        setPaymentCompleted(true);
        setStripeSessionId(storedSessionId);
      } else {
        // Si no hay session_id válido, limpiar el estado completamente
        setPaymentCompleted(false);
        setStripeSessionId("");
        localStorage.removeItem("b2b_payment_completed");
        localStorage.removeItem("b2b_stripe_session_id");
      }
    }

    // Escuchar mensajes de la ventana del checkout (si se abre en popup)
    const handleMessage = (event) => {
      if (event.data && event.data.type === "STRIPE_CHECKOUT_SUCCESS") {
        const sessionId = event.data.sessionId || "";
        setPaymentCompleted(true);
        setShowPaymentModal(false);
        setPaymentLoading(false);
        setStripeSessionId(sessionId);
        localStorage.setItem("b2b_payment_completed", "true");
        if (sessionId) {
          localStorage.setItem("b2b_stripe_session_id", sessionId);
        }

        // Crear la cuenta automáticamente después del pago
        const savedFormData = localStorage.getItem("b2b_form_data");
        if (savedFormData && !accountCreationInProgress.current) {
          try {
            const parsedData = JSON.parse(savedFormData);
            setFormData(parsedData);
            handleCreateAccountAfterPayment(parsedData, sessionId);
          } catch (error) {
            console.error("Error al restaurar datos del formulario:", error);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [searchParams, setSearchParams]);

  const handlePaymentClick = () => {
    // Validar si el restaurante está vetado
    if (clienteVetado) {
      setPaymentError(
        "Este restaurante no puede registrarse. Contacta a un administrador."
      );
      return;
    }

    // Validar campos obligatorios antes de mostrar el modal
    if (
      !formData.nombre_responsable_restaurante ||
      !formData.correo ||
      !formData.nombre_usuario ||
      !formData.password
    ) {
      setPaymentError(
        "Por favor completa todos los campos obligatorios antes de pagar."
      );
      return;
    }
    // Mostrar el modal de checkout
    setShowPaymentModal(true);
    setPaymentError("");
  };

  const handleProceedToCheckout = async () => {
    setPaymentLoading(true);
    setPaymentError("");

    try {
      // Guardar el estado del formulario en localStorage antes de ir al checkout
      localStorage.setItem("b2b_form_data", JSON.stringify(formData));

      // Crear sesión de suscripción
      const apiUrl = import.meta.env.DEV
        ? "/api/stripe/create-subscription-session"
        : "https://admin.residente.mx/api/stripe/create-subscription-session";

      const successUrl = `${window.location.origin}/registrob2b?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/registrob2b?payment_canceled=true`;

      // Preparar los datos del usuario para enviar al backend
      // Formato exacto requerido por el backend
      const userData = {
        nombre_responsable_restaurante: formData.nombre_responsable_restaurante, // ✅ OBLIGATORIO
        correo: formData.correo, // ✅ OBLIGATORIO
        telefono: formData.telefono || null, // Opcional
        nombre_responsable: formData.nombre_responsable_restaurante || null,
        razon_social: formData.razon_social || null,
        rfc: formData.rfc || null,
        direccion_completa: formData.direccion_completa || null,
        terminos_condiciones: true,
        fecha_aceptacion_terminos: new Date().toISOString(),
      };

      // Validar campos obligatorios
      if (!userData.nombre_responsable_restaurante || !userData.correo) {
        setPaymentLoading(false);
        setPaymentError(
          "Por favor completa todos los campos obligatorios antes de pagar."
        );
        return;
      }

      // Obtener el número de sucursales del plan seleccionado
      const sucursalesPlan = precioSeleccionado?.sucursales;
      // Convertir "5+" a 5 para el backend
      const numeroSucursalesParaBackend = sucursalesPlan === "5+" ? 5 : parseInt(sucursalesPlan) || 1;

      const requestBody = {
        // El backend usa numeroSucursales para obtener el priceId correcto
        numeroSucursales: numeroSucursalesParaBackend,
        userData: userData,
        customerEmail: formData.correo || "",
        successUrl: successUrl,
        cancelUrl: cancelUrl,
      };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();

      if (data.url) {
        // Redirigir directamente a Stripe Checkout
        // Stripe manejará la redirección y cuando se complete el pago,
        // redirigirá de vuelta a nuestra successUrl
        window.location.href = data.url;
      } else {
        setPaymentLoading(false);
        setPaymentError("Error: No se recibió la URL del checkout.");
      }
    } catch (error) {
      setPaymentLoading(false);
      setPaymentError(
        error.message || "Error creando la sesión de suscripción."
      );
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirm_password) {
      setPaymentError("Las contraseñas no coinciden.");
      setTimeout(() => setPaymentError(""), 5000);
      return;
    }

    try {
      // Obtener el session_id de Stripe si existe
      const savedSessionId =
        localStorage.getItem("b2b_stripe_session_id") || stripeSessionId;

      let usuarioRes;
      let usuarioId;

      // Intentar crear el usuario, pero si ya existe, intentar obtenerlo o actualizar
      try {
        const usuarioData = {
          nombre_usuario: formData.nombre_usuario,
          password: formData.password,
          correo: formData.correo,
        };
        usuarioRes = await registrob2bPost(usuarioData);
        usuarioId = usuarioRes.usuario.id;
      } catch (error) {
        // Si el error es que el usuario ya existe, intentar obtener el usuario B2B existente
        if (error.message && error.message.includes("ya existe")) {
          console.log(
            "⚠️ El usuario ya existe, buscando usuario B2B existente..."
          );

          // Si tenemos session_id, el backend debería poder encontrar el usuario B2B
          // En este caso, solo necesitamos actualizar el usuario B2B con los datos del formulario
          if (savedSessionId) {
            // Intentar obtener el usuario B2B desde el backend usando el session_id
            try {
              const apiUrl = import.meta.env.DEV
                ? "/api/stripe/checkout-session/" + savedSessionId
                : "https://admin.residente.mx/api/stripe/checkout-session/" +
                savedSessionId;

              const sessionRes = await fetch(apiUrl);
              const sessionData = await sessionRes.json();

              if (
                sessionData.success &&
                sessionData.session?.metadata?.b2b_id
              ) {
                const b2bId = parseInt(sessionData.session.metadata.b2b_id);

                // ⭐ CRÍTICO: Necesitamos obtener el usuario_id del usuario existente
                // Por ahora, intentar obtenerlo desde el backend o usar el correo para buscarlo
                // Actualizar el usuario B2B existente con los datos del formulario
                const b2bData = {
                  b2b_id: b2bId, // Especificar que es una actualización
                  // ⚠️ IMPORTANTE: El backend debe buscar el usuario_id por correo o nombre_usuario
                  // Por ahora, el backend debería poder encontrarlo si busca por correo
                  nombre_responsable_restaurante:
                    formData.nombre_responsable_restaurante,
                  correo: formData.correo, // ⭐ CRÍTICO: Para que el backend pueda buscar el usuario_id
                  nombre_responsable: formData.nombre_responsable_restaurante,
                  telefono: formData.telefono,
                  nombre_restaurante: formData.nombre_restaurante,
                  rfc: formData.rfc,
                  direccion_completa: formData.direccion_completa,
                  razon_social: formData.razon_social,
                  terminos_condiciones: true,
                  stripe_session_id: savedSessionId,
                };

                const b2bRes = await extensionB2bPost(b2bData);

                setSuccessMsg("¡Cuenta actualizada exitosamente!");
                setPaymentCompleted(false);
                localStorage.removeItem("b2b_payment_completed");
                localStorage.removeItem("b2b_stripe_session_id");
                setTimeout(() => setSuccessMsg(""), 3000);
                return;
              }
            } catch (sessionError) {
              console.error("Error obteniendo sesión:", sessionError);
            }
          }

          // Si no podemos obtener el usuario B2B, mostrar error más específico
          setSuccessMsg("");
          setPaymentError(
            "El usuario ya existe. Por favor, inicia sesión o usa otro nombre de usuario."
          );
          setTimeout(() => setPaymentError(""), 5000);
          return;
        } else {
          // Si es otro error, lanzarlo
          throw error;
        }
      }

      // Si llegamos aquí, el usuario se creó exitosamente
      usuarioId = usuarioRes.usuario.id;

      // Guardar credenciales para el modal del dashboard
      sessionStorage.setItem(
        "credencialesNuevas",
        JSON.stringify({
          nombre_usuario: formData.nombre_usuario,
          password: formData.password,
          correo: formData.correo,
        })
      );
      console.log("📝 Guardando credenciales:", {
        nombre_usuario: formData.nombre_usuario,
        password: formData.password,
        correo: formData.correo,
      });

      // ⭐ CRÍTICO: Obtener el b2b_id desde el session_id si existe
      // El backend ya creó un registro cuando se pagó, necesitamos actualizarlo, no crear uno nuevo
      let b2bId = null;
      if (savedSessionId) {
        try {
          const apiUrl = import.meta.env.DEV
            ? "/api/stripe/checkout-session/" + savedSessionId
            : "https://admin.residente.mx/api/stripe/checkout-session/" +
            savedSessionId;

          const sessionRes = await fetch(apiUrl);
          const sessionData = await sessionRes.json();

          if (sessionData.success && sessionData.session?.metadata?.b2b_id) {
            b2bId = parseInt(sessionData.session.metadata.b2b_id);
            console.log("✅ b2b_id obtenido desde session:", b2bId);
          }
        } catch (error) {
          console.warn("⚠️ No se pudo obtener b2b_id desde session:", error);
        }
      }

      const b2bData = {
        ...(b2bId && { b2b_id: b2bId }), // ⭐ CRÍTICO: Si hay b2b_id, enviarlo para actualizar el registro existente
        usuario_id: usuarioId, // ⭐ CRÍTICO: El ID del usuario creado en tabla usuarios
        nombre_responsable_restaurante: formData.nombre_responsable_restaurante,
        correo: formData.correo, // IMPORTANTE: Para que el backend pueda buscar el registro si no hay b2b_id
        nombre_responsable: formData.nombre_responsable_restaurante,
        telefono: formData.telefono,
        nombre_restaurante: formData.nombre_restaurante,
        rfc: formData.rfc,
        direccion_completa: formData.direccion_completa,
        razon_social: formData.razon_social,
        terminos_condiciones: true,
        stripe_session_id: savedSessionId || undefined, // IMPORTANTE: Para que el backend pueda buscar el registro
      };

      console.log("📤 Enviando datos a /api/usuariosb2b:", {
        b2b_id: b2bId,
        usuario_id: usuarioId,
        correo: formData.correo,
        stripe_session_id: savedSessionId,
      });

      const b2bRes = await extensionB2bPost(b2bData);

      console.log("✅ Respuesta del backend usuariosb2b:", b2bRes);

      // Si tenemos session_id y el backend no lo procesó, intentar asociarlo manualmente
      if (savedSessionId) {
        try {
          const apiUrl = import.meta.env.DEV
            ? "/api/stripe/associate-session"
            : "https://admin.residente.mx/api/stripe/associate-session";

          await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stripe_session_id: savedSessionId,
              b2b_id: b2bRes?.id || b2bRes?.usuario?.id,
            }),
          });
        } catch (error) {
          console.warn("No se pudo asociar la sesión de Stripe:", error);
          // No fallar si no se puede asociar, el webhook lo hará eventualmente
        }
      }

      setSuccessMsg("¡Registro exitoso!");
      setFormData({
        nombre_responsable_restaurante: "",
        nombre_restaurante: "",
        telefono: "",
        correo: "",
        rfc: "",
        direccion_completa: "",
        razon_social: "",
        nombre_usuario: "",
        password: "",
        confirm_password: "",
      });
      // Limpiar el estado de pago después de crear la cuenta exitosamente
      setPaymentCompleted(false);
      setStripeSessionId("");
      localStorage.removeItem("b2b_payment_completed");
      localStorage.removeItem("b2b_stripe_session_id");
      localStorage.removeItem("b2b_plan_seleccionado");
      setTimeout(() => {
        setSuccessMsg("");
        window.location.href = "/login";
      }, 3000);
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      // Mostrar error más amigable al usuario
      if (error.message && error.message.includes("ya existe")) {
        setPaymentError(
          "El usuario ya existe. Por favor, inicia sesión o elige otro nombre de usuario."
        );
      } else {
        setPaymentError(
          error.message ||
          "Error al crear la cuenta. Por favor, intenta nuevamente."
        );
      }
      setTimeout(() => setPaymentError(""), 5000);
    }
  };

  // Efecto para manejar el scroll del body al abrir/cerrar el modal
  useEffect(() => {
    if (showModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    // Limpieza por si el componente se desmonta con el modal abierto
    return () => document.body.classList.remove("overflow-hidden");
  }, [showModal]);

  // JSX del formulario (inline para evitar re-renders que pierden el foco)
  const formularioJSX = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handlePaymentClick();
      }}
      className="space-y-3 sm:space-y-0"
    >
      {/* Campo nombre del responsable */}
      <div>
        <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
          Nombre del responsable*
        </label>
        <input
          type="text"
          name="nombre_responsable_restaurante"
          value={formData.nombre_responsable_restaurante}
          onChange={handleChange}
          placeholder="Nombre del responsable"
          className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
          required
        />
      </div>

      <div>
        <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
          Nombre comercial del restaurante*
        </label>
        <div className="relative">
          <input
            type="text"
            name="nombre_restaurante"
            value={formData.nombre_restaurante}
            onChange={handleChange}
            placeholder="Nombre del restaurante"
            className={`bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border rounded-lg sm:rounded-md focus:outline-none focus:ring-2 font-family-roman text-lg sm:text-sm ${clienteVetado
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
              }`}
            required
          />
          {checkingVetado && (
            <span className="absolute right-3 top-2 text-gray-400 text-sm">
              Verificando...
            </span>
          )}
        </div>
        {clienteVetado && !checkingVetado && (
          <div className="text-red-600 text-base sm:text-sm mt-2 mb-3 p-4 sm:p-3 bg-red-50 border border-red-200 rounded-lg sm:rounded">
            <p className="mb-3">⚠️ Este restaurante no puede registrarse en este momento.</p>
            <p className="text-red-500 text-sm sm:text-xs">Por favor, contacta a un administrador para más información.</p>
          </div>
        )}
        {!clienteVetado && !checkingVetado && formData.nombre_restaurante.length >= 3 && (
          <p className="text-green-500 text-xs mt-1">✓ Restaurante disponible para registro</p>
        )}
        {!clienteVetado && formData.nombre_restaurante && <div className="mb-4"></div>}
        {!formData.nombre_restaurante && <div className="mb-4"></div>}
      </div>

      <div>
        <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
          Teléfono*
        </label>
        <input
          type="text"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="Teléfono del restaurante"
          className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
          required
        />
      </div>

      <div>
        <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
          Correo Electrónico*
        </label>
        <input
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          placeholder="Escribe tu correo electrónico"
          className={`bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border rounded-lg sm:rounded-md focus:outline-none focus:ring-2 font-family-roman text-lg sm:text-sm sm:mb-4 ${emailExists || !emailValid
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
            }`}
          required
        />
        {checkingEmail && <p className="text-gray-500 text-xs mt-1">Verificando correo...</p>}
        {!emailValid && !checkingEmail && formData.correo && (
          <p className="text-red-500 text-sm mt-1 font-bold">⚠️ El formato del correo no es válido</p>
        )}
        {emailExists && emailValid && !checkingEmail && (
          <p className="text-red-500 text-sm mt-1 font-bold">⚠️ Este correo ya está registrado. Por favor, usa otro o inicia sesión.</p>
        )}
        {!emailExists && emailValid && !checkingEmail && formData.correo && formData.correo.includes("@") && (
          <p className="text-green-500 text-xs mt-1">✓ Correo disponible</p>
        )}
      </div>

      <div>
        <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
          RFC*
        </label>
        <input
          type="text"
          name="rfc"
          value={formData.rfc}
          onChange={handleChange}
          placeholder="Escribe tu RFC"
          className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
          required
        />
      </div>

      <div>
        <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
          Dirección completa del restaurante*
        </label>
        <input
          type="text"
          name="direccion_completa"
          value={formData.direccion_completa}
          onChange={handleChange}
          placeholder="Calle, número, colonia, municipio, código postal"
          className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
          required
        />
      </div>

      <div>
        <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
          Razón Social*
        </label>
        <input
          type="text"
          name="razon_social"
          value={formData.razon_social}
          onChange={handleChange}
          placeholder="Escribe la razón social"
          className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
          required
        />
      </div>

      <div>
        <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
          Nombre de usuario*
        </label>
        <input
          type="text"
          name="nombre_usuario"
          value={formData.nombre_usuario}
          onChange={handleChange}
          placeholder="Tu nombre de usuario"
          className={`bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border rounded-lg sm:rounded-md focus:outline-none focus:ring-2 font-family-roman text-lg sm:text-sm sm:mb-4 ${usernameExists
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
            }`}
          required
        />
        {checkingUsername && <p className="text-gray-500 text-xs mt-1">Verificando disponibilidad...</p>}
        {usernameExists && !checkingUsername && (
          <p className="text-red-500 text-sm mt-1 font-bold">⚠️ Este nombre de usuario ya existe. Por favor, elige otro.</p>
        )}
        {!usernameExists && !checkingUsername && formData.nombre_usuario.length >= 3 && (
          <p className="text-green-500 text-xs mt-1">✓ Nombre de usuario disponible</p>
        )}
      </div>

      <div>
        <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
          Contraseña*
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Escribe tu contraseña"
            className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 pr-14 sm:pr-10 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
            required
          />
          <button
            type="button"
            className="absolute right-4 sm:right-3 top-1/2 -translate-y-1/2 sm:top-2 sm:translate-y-0 text-2xl sm:text-xl text-gray-600 sm:text-black cursor-pointer"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
        </div>
      </div>

      <div>
        <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
          Confirmar Contraseña*
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="Confirma tu contraseña"
            className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 pr-14 sm:pr-10 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
            required
          />
          <button
            type="button"
            className="absolute right-4 sm:right-3 top-1/2 -translate-y-1/2 sm:top-2 sm:translate-y-0 text-2xl sm:text-xl text-gray-600 sm:text-black cursor-pointer"
            onClick={() => setShowConfirmPassword((v) => !v)}
            tabIndex={-1}
          >
            {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
        </div>
      </div>

      {/* Selector de número de sucursales - Oculto si viene de las tarjetas de planes */}
      {!planInicial && (
        <div className="sm:mb-4">
          <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
            Número de sucursales*
          </label>
          {loadingPrecios ? (
            <div className="bg-gray-100 w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md text-gray-500 text-lg sm:text-sm">
              Cargando precios...
            </div>
          ) : (
            <select
              value={numeroSucursales}
              onChange={(e) => setNumeroSucursales(parseInt(e.target.value, 10))}
              className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-lg sm:text-sm cursor-pointer"
            >
              {preciosDisponibles.map((precio) => (
                <option
                  key={precio.priceId}
                  value={precio.sucursales === "5+" ? 5 : precio.sucursales}
                >
                  {precio.sucursalesTexto}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 pt-1 sm:mt-4 sm:mb-6">
        <input type="checkbox" className="w-6 h-6 cursor-pointer" required />
        <span className="font-roman text-base sm:text-sm">
          Acepto los{" "}
          <button
            type="button"
            className="text-black underline cursor-pointer bg-transparent border-0 p-0 font-bold"
            onClick={() => setShowModal(true)}
          >
            Términos y Condiciones
          </button>
          *
        </span>
      </div>

      {/* Mensajes */}
      {successMsg && (
        <div className="text-green-600 font-bold text-center mt-4">{successMsg}</div>
      )}

      {paymentCompleted && creatingAccount && (
        <div className="text-blue-600 font-bold text-center mt-4 mb-4">
          <div>✓ Pago completado exitosamente. Creando tu cuenta...</div>
        </div>
      )}

      {paymentError && (
        <div className="text-red-600 font-bold text-center mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          {paymentError}
        </div>
      )}

      {/* Botón de Pagar - Igual que Astro */}
      <button
        type="submit"
        disabled={paymentLoading || creatingAccount || clienteVetado}
        className={`font-bold  py-5 sm:py-2 px-4 rounded-xl sm:rounded w-full font-roman cursor-pointer bg-[#fff200] text-black text-xl sm:text-base mt-2 sm:mt-0 ${(paymentLoading || creatingAccount || clienteVetado) ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-400"
          }`}
      >
        {clienteVetado ? "No disponible" : paymentLoading || creatingAccount ? "Procesando..." : "Ir a Pagar"}
      </button>
    </form>
  );

  return (
    <div className="w-full">
      <div className="flex flex-col">
        {/* Logo - Alineado igual que en Astro */}
        <img
          className="w-32 sm:w-25 pt-3 pb-5 sm:pb-7 sm:mx-auto"
          src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/b2b%20logo%20completo.png"
          alt="B2B Logo"
        />

        <h1 className="leading-tight text-3xl sm:text-2xl mb-3 sm:mb-4 font-bold">Suscripción B2B</h1>

        {formularioJSX}
      </div>

      {/* Modal Terminos y Condiciones using Headless UI */}
      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Términos y Condiciones
                  </Dialog.Title>
                  <div className="mt-2 max-h-[60vh] overflow-y-auto">
                    <TerminosyCondiciones />
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setShowModal(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Payment Modal */}
      <Transition appear show={showPaymentModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowPaymentModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Confirmar Pago
                  </Dialog.Title>
                  <div className="mt-2 text-start">
                    <p className="text-sm text-gray-500 mb-4">
                      Serás redirigido a Stripe para completar tu suscripción de manera segura.
                    </p>

                    {/* Resumen del plan en el modal - igual que Stripe */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plan:</span>
                          <span className="font-semibold">{precioSeleccionado?.nombre}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sucursales:</span>
                          <span className="font-semibold">{precioSeleccionado?.sucursalesTexto}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="text-gray-600">Precio base:</span>
                          <span className="font-bold text-lg">
                            ${precioSeleccionado?.precioMensual?.toLocaleString('es-MX')} MXN
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">IVA (16%):</span>
                          <span className="font-semibold">
                            +${((precioSeleccionado?.precioMensualConIVA || 0) - (precioSeleccionado?.precioMensual || 0)).toLocaleString('es-MX')} MXN
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-700 font-semibold">Total mensual:</span>
                          <span className="font-bold text-lg text-green-600">
                            ${precioSeleccionado?.precioMensualConIVA?.toLocaleString('es-MX')} MXN
                          </span>
                        </div>
                      </div>
                    </div>

                    {paymentError && (
                      <p className="text-red-500 text-sm mb-4">{paymentError}</p>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                      onClick={() => setShowPaymentModal(false)}
                      disabled={paymentLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500"
                      onClick={handleProceedToCheckout}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? "Cargando..." : "Continuar a Stripe"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default FormMain;