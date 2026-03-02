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
import { urlApi } from "../../../api/url";

const FormMain = ({ planInicial = null, beneficiosSeleccionados = [], nombreRestauranteInicial = "" }) => {
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
    {
      meses: 6,
      mesesTexto: "6 meses",
      precioMensual: 4299,
      precioMensualConIVA: 4990.84,
      nombre: "Plan 6 meses",
      priceId: "fallback_6",
    },
    {
      meses: 9,
      mesesTexto: "9 meses",
      precioMensual: 2899,
      precioMensualConIVA: 3362.84,
      nombre: "Plan 9 meses",
      priceId: "fallback_9",
    },
    {
      meses: 12,
      mesesTexto: "12 meses",
      precioMensual: 2199,
      precioMensualConIVA: 2550.84,
      nombre: "Plan 12 meses",
      priceId: "fallback_12",
    },
  ];

  // Estados para número de sucursales y precios
  // Si viene un planInicial, usarlo como valor inicial
  const [numeroSucursales, setNumeroSucursales] = useState(() => {
    if (planInicial?.sucursales) {
      return planInicial.sucursales === "5+" ? 5 : planInicial.sucursales;
    }
    return 1;
  });
  const [preciosDisponibles, setPreciosDisponibles] =
    useState(PRECIOS_FALLBACK);
  const [loadingPrecios, setLoadingPrecios] = useState(true);
  const [precioSeleccionado, setPrecioSeleccionado] = useState(() => {
    if (planInicial) {
      return planInicial;
    }
    return PRECIOS_FALLBACK[0];
  });

  // Detectar si es un cliente restringido del dropdown (no necesita código de acceso)
  const esClienteRestringidoAprobado =
    planInicial?.esClienteRestringido === true;

  // Estados para verificación de nombre de usuario
  const [usernameExists, setUsernameExists] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameDebounceRef = useRef(null);

  // Estados para verificación de restaurante restringido/vetado
  const [restauranteVetado, setRestauranteVetado] = useState(false);
  const [verificandoRestaurante, setVerificandoRestaurante] = useState(false);
  const [mensajeVetado, setMensajeVetado] = useState("");
  const vetadoDebounceRef = useRef(null);

  // Estado para código de acceso (desbloqueo de restringidos)
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [codigoValido, setCodigoValido] = useState(false);
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState("");
  const [restauranteRestringidoId, setRestauranteRestringidoId] =
    useState(null);

  // Código maestro para desbloquear restaurantes vetados
  const CODIGO_MAESTRO = "RESIDENTE";

  // Obtener precios desde el backend al cargar el componente
  useEffect(() => {
    const fetchPrecios = async () => {
      setLoadingPrecios(true);
      try {
        // Siempre usar la URL absoluta del backend
        const apiUrl = `${urlApi}api/stripe/precios`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.precios && data.precios.length > 0) {
          setPreciosDisponibles(data.precios);
          // Si hay un plan inicial, usar ese; si no, usar el de 1 sucursal
          if (planInicial) {
            const precioCoincidente = data.precios.find(
              (p) =>
                p.sucursales === planInicial.sucursales ||
                (planInicial.sucursales === "5+" && p.sucursales === "5+"),
            );
            if (precioCoincidente) {
              setPrecioSeleccionado(precioCoincidente);
            }
          } else {
            const precioInicial = data.precios.find((p) => p.sucursales === 1);
            if (precioInicial) {
              setPrecioSeleccionado(precioInicial);
            }
          }
        } else {
          // Si no hay precios del servidor, usar fallback
          console.warn(
            "No se obtuvieron precios del servidor, usando fallback",
          );
        }
      } catch (error) {
        console.warn(
          "Error obteniendo precios del servidor, usando precios locales:",
          error.message,
        );
        // Los precios de fallback ya están cargados por defecto
      } finally {
        setLoadingPrecios(false);
      }
    };

    fetchPrecios();
  }, [planInicial]);

  // Pre-rellenar nombre_restaurante si viene de la opción "Otro"
  useEffect(() => {
    if (nombreRestauranteInicial) {
      setFormData((prev) => ({ ...prev, nombre_restaurante: nombreRestauranteInicial }));
    }
  }, [nombreRestauranteInicial]);

  // Actualizar cuando cambia el planInicial desde el selector de planes
  useEffect(() => {
    if (planInicial) {
      const sucursales =
        planInicial.sucursales === "5+" ? 5 : planInicial.sucursales;
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
      const precio = preciosDisponibles.find(
        (p) =>
          p.sucursales === sucursalesKey || p.sucursales === numeroSucursales,
      );
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
          `${urlApi}api/usuarios/verificar-nombre-usuario`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre_usuario: nombreUsuario }),
          },
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

  // Función para verificar si el restaurante está restringido
  const verificarRestauranteRestringido = async (nombreRestaurante) => {
    try {
      const apiUrl = `${urlApi}api/clientes-editorial/verificar-restringido`;
      console.log("🔍 Verificando restaurante restringido:", nombreRestaurante);

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_restaurante: nombreRestaurante }),
      });

      if (!res.ok) {
        console.error("❌ Error verificando restringido:", res.status);
        return { restringido: false, encontrado: false };
      }

      const data = await res.json();
      console.log("📦 Respuesta del servidor:", data);
      return data;
    } catch (error) {
      console.error("❌ Error verificando estado del restaurante:", error);
      return { restringido: false, encontrado: false };
    }
  };

  // Verificar si el restaurante está restringido (con debounce)
  useEffect(() => {
    if (vetadoDebounceRef.current) {
      clearTimeout(vetadoDebounceRef.current);
    }

    const nombreRestaurante = formData.nombre_restaurante.trim();

    // Si no hay nombre de restaurante, resetear estado
    if (!nombreRestaurante || nombreRestaurante.length < 3) {
      setRestauranteVetado(false);
      setVerificandoRestaurante(false);
      setMensajeVetado("");
      setCodigoAcceso("");
      setCodigoValido(false);
      setErrorCodigo("");
      setRestauranteRestringidoId(null);
      return;
    }

    // Limpiar estado de código mientras escribe
    setCodigoAcceso("");
    setCodigoValido(false);
    setErrorCodigo("");

    setVerificandoRestaurante(true);

    // Debounce de 800ms (igual que Astro)
    vetadoDebounceRef.current = setTimeout(async () => {
      try {
        console.log("⏰ Ejecutando verificación para:", nombreRestaurante);
        const resultado =
          await verificarRestauranteRestringido(nombreRestaurante);
        console.log("📋 Resultado de verificación:", resultado);

        if (resultado.restringido) {
          console.log("🚫 Restaurante RESTRINGIDO - Mostrando mensaje");
          console.log("📝 ID del restaurante:", resultado.id);
          setRestauranteVetado(true);
          setRestauranteRestringidoId(resultado.id || null);
          setMensajeVetado(
            `Este restaurante no puede registrarse en este momento. Contacta al administrador para más información.`,
          );
        } else {
          setRestauranteVetado(false);
          setRestauranteRestringidoId(null);
          setMensajeVetado("");
        }
      } catch (error) {
        console.error("Error verificando restaurante:", error);
        setRestauranteVetado(false);
      } finally {
        setVerificandoRestaurante(false);
      }
    }, 800);

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
        const response = await fetch(`${urlApi}api/usuarios/verificar-correo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo }),
        });

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
          "⚠️ La creación de cuenta ya está en progreso, ignorando llamada duplicada",
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

        // Esperar a que el pago esté confirmado y el webhook haya procesado
        if (savedSessionId) {
          const checkoutApiUrl = `${urlApi}api/stripe/checkout-session/${savedSessionId}`;
          for (let i = 0; i < 10; i++) {
            try {
              const checkRes = await fetch(checkoutApiUrl);
              const checkData = await checkRes.json();
              if (
                checkData.success &&
                checkData.session?.payment_status === "paid"
              ) {
                // Pago confirmado, dar tiempo al webhook para procesar
                if (i === 0) await new Promise((r) => setTimeout(r, 2000));
                break;
              }
            } catch (_) {
              /* ignorar */
            }
            await new Promise((r) => setTimeout(r, 1500));
          }
        }

        let usuarioRes;
        let usuarioId;

        // Intentar crear el usuario
        try {
          const usuarioData = {
            nombre_usuario: formDataToUse.nombre_usuario,
            password: formDataToUse.password,
            correo: formDataToUse.correo,
            stripe_session_id: savedSessionId || undefined,
          };
          usuarioRes = await registrob2bPost(usuarioData);
          usuarioId = usuarioRes.usuario.id;
        } catch (error) {
          // Si el usuario ya existe, intentar obtener el usuario B2B existente
          if (error.message && error.message.includes("ya existe")) {
            console.log(
              "⚠️ El usuario ya existe, buscando usuario B2B existente...",
            );

            if (savedSessionId) {
              try {
                const apiUrl = `${urlApi}api/stripe/checkout-session/${savedSessionId}`;

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
              "El usuario ya existe. Por favor, inicia sesión o usa otro nombre de usuario.",
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
          }),
        );
        console.log("📝 Guardando credenciales:", {
          nombre_usuario: formDataToUse.nombre_usuario,
          password: formDataToUse.password,
          correo: formDataToUse.correo,
        });

        // Obtener el b2b_id
        // 1. Puede venir de la respuesta de registro (si el webhook ya creo el registro B2B)
        // 2. Intentar desde la session metadata (puede no estar si el webhook no ha corrido)
        // 3. Polling con reintentos si no se encuentra
        let b2bId = null;

        // Intentar desde la respuesta de registro (el backend busca por correo y vincula)
        if (usuarioRes?.usuario?.b2b_id) {
          b2bId = usuarioRes.usuario.b2b_id;
          console.log("✅ b2b_id obtenido desde respuesta de registro:", b2bId);
        }

        // Si no, intentar desde session metadata (con polling para dar tiempo al webhook)
        if (!b2bId && savedSessionId) {
          const apiUrl = `${urlApi}api/stripe/checkout-session/${savedSessionId}`;

          // Intentar hasta 3 veces con 2s de espera entre cada intento
          for (let intento = 0; intento < 3 && !b2bId; intento++) {
            try {
              if (intento > 0) {
                console.log(`⏳ Reintento ${intento}/3 para obtener b2b_id...`);
                await new Promise((r) => setTimeout(r, 2000));
              }
              const sessionRes = await fetch(apiUrl);
              const sessionData = await sessionRes.json();

              if (
                sessionData.success &&
                sessionData.session?.metadata?.b2b_id
              ) {
                b2bId = parseInt(sessionData.session.metadata.b2b_id);
                console.log(
                  "✅ b2b_id obtenido desde session metadata:",
                  b2bId,
                );
              }
            } catch (error) {
              console.warn(
                "⚠️ No se pudo obtener b2b_id desde session:",
                error,
              );
            }
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
            const apiUrl = `${urlApi}api/stripe/associate-session`;

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
          formDataToUse.password,
        );
        saveToken(loginResp.token);
        saveUsuario(loginResp.usuario);
        sessionStorage.setItem(
          "credencialesNuevas",
          JSON.stringify({
            nombre_usuario: formDataToUse.nombre_usuario,
            password: formDataToUse.password,
            correo: formDataToUse.correo,
          }),
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
            "✅ Usuario ya tiene registro B2B, intentando login automático",
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
              formDataToUse.password,
            );
            saveToken(loginResp.token);
            saveUsuario(loginResp.usuario);
            navigate("/dashboard", { replace: true });
            return;
          } catch (loginError) {
            setPaymentError(
              "El usuario ya existe, pero no se pudo iniciar sesión automáticamente. Por favor, inicia sesión manualmente.",
            );
            setTimeout(() => navigate("/login"), 2000);
            return;
          }
        }

        setPaymentError(
          error.message ||
          "Error al crear la cuenta. Por favor, intenta nuevamente.",
        );
        setTimeout(() => setPaymentError(""), 5000);
      } finally {
        setCreatingAccount(false);
      }
    },
    [navigate, stripeSessionId],
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
    // Validar si el restaurante está vetado y no tiene código válido
    // EXCEPCIÓN: Si es un cliente restringido aprobado del dropdown, permitir continuar
    if (restauranteVetado && !codigoValido && !esClienteRestringidoAprobado) {
      setPaymentError(
        "Este restaurante no puede registrarse. Ingresa el código de acceso si lo tienes.",
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
        "Por favor completa todos los campos obligatorios antes de pagar.",
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
      const apiUrl = `${urlApi}api/stripe/create-subscription-session`;

      const baseUrl = `${window.location.origin}${import.meta.env.BASE_URL || "/"}`;
      const successUrl = `${baseUrl}registrob2b?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}registrob2b?payment_canceled=true`;

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
          "Por favor completa todos los campos obligatorios antes de pagar.",
        );
        return;
      }

      // Obtener el número de sucursales del plan seleccionado
      const sucursalesPlan = precioSeleccionado?.sucursales;
      // Convertir "5+" a 5 para el backend
      const numeroSucursalesParaBackend =
        sucursalesPlan === "5+" ? 5 : parseInt(sucursalesPlan) || 1;

      const requestBody = {
        numeroSucursales: numeroSucursalesParaBackend,
        userData: userData,
        customerEmail: formData.correo || "",
        successUrl: successUrl,
        cancelUrl: cancelUrl,
        beneficiosSeleccionados: beneficiosSeleccionados,
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
        error.message || "Error creando la sesión de suscripción.",
      );
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler para verificar el código de acceso y habilitar el restaurante
  const handleVerificarCodigo = async () => {
    setVerificandoCodigo(true);
    setErrorCodigo("");

    // Verificar si el código es correcto
    if (codigoAcceso.trim().toUpperCase() !== CODIGO_MAESTRO) {
      setCodigoValido(false);
      setErrorCodigo(
        "Código inválido. Contacta al administrador para obtener un código válido.",
      );
      setVerificandoCodigo(false);
      return;
    }

    // Si el código es válido, actualizar el estado en el backend
    console.log(
      "🔑 Código correcto! restauranteRestringidoId:",
      restauranteRestringidoId,
    );

    try {
      if (restauranteRestringidoId) {
        console.log(
          "✅ Código válido - Habilitando restaurante ID:",
          restauranteRestringidoId,
        );

        const apiUrl = `${urlApi}api/clientes-editorial/${restauranteRestringidoId}`;
        const res = await fetch(apiUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado_cliente: "HA SIDO CLIENTE" }),
        });

        if (!res.ok) {
          console.error("❌ Error al habilitar restaurante:", res.status);
          setErrorCodigo(
            "Error al habilitar el restaurante. Intenta de nuevo.",
          );
          setVerificandoCodigo(false);
          return;
        }

        const data = await res.json();
        console.log("✅ Restaurante habilitado:", data);
      }

      if (!restauranteRestringidoId) {
        console.log(
          "⚠️ No hay ID del restaurante - El backend no devolvió el ID",
        );
        console.log("⚠️ Permitiendo continuar de todos modos...");
      }

      setCodigoValido(true);
      setErrorCodigo("");
      setRestauranteVetado(false); // Ya no está restringido
      setMensajeVetado("");
    } catch (error) {
      console.error("❌ Error habilitando restaurante:", error);
      setErrorCodigo("Error de conexión. Intenta de nuevo.");
    } finally {
      setVerificandoCodigo(false);
    }
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
          stripe_session_id: savedSessionId || undefined,
        };
        usuarioRes = await registrob2bPost(usuarioData);
        usuarioId = usuarioRes.usuario.id;
      } catch (error) {
        // Si el error es que el usuario ya existe, intentar obtener el usuario B2B existente
        if (error.message && error.message.includes("ya existe")) {
          console.log(
            "⚠️ El usuario ya existe, buscando usuario B2B existente...",
          );

          // Si tenemos session_id, el backend debería poder encontrar el usuario B2B
          // En este caso, solo necesitamos actualizar el usuario B2B con los datos del formulario
          if (savedSessionId) {
            // Intentar obtener el usuario B2B desde el backend usando el session_id
            try {
              const apiUrl = `${urlApi}api/stripe/checkout-session/${savedSessionId}`;

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
            "El usuario ya existe. Por favor, inicia sesión o usa otro nombre de usuario.",
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
        }),
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
          const apiUrl = `${urlApi}api/stripe/checkout-session/${savedSessionId}`;

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
          const apiUrl = `${urlApi}api/stripe/associate-session`;

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
          "El usuario ya existe. Por favor, inicia sesión o elige otro nombre de usuario.",
        );
      } else {
        setPaymentError(
          error.message ||
          "Error al crear la cuenta. Por favor, intenta nuevamente.",
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

      {/* -------------------- Datos Básicos Del Suscriptor -------------------- */}

      <span className="text-4xl pt-4">1. Datos básicos del suscriptor</span>

      <div className="pl-8 pt-4 pb-8">

        {/* Nombre comercial del restaurante */}
        <div>
          <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-xl">
            Nombre comercial del restaurante o establecimiento*
          </label>
          <div className="relative">
            <input
              type="text"
              name="nombre_restaurante"
              value={formData.nombre_restaurante}
              onChange={handleChange}
              placeholder="Nombre del restaurante"
              className={`bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border rounded-lg sm:rounded-md focus:outline-none focus:ring-2 font-family-roman text-lg sm:text-sm ${restauranteVetado && !esClienteRestringidoAprobado
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
                }`}
              required
            />
            {verificandoRestaurante && (
              <span className="absolute right-3 top-2 text-gray-400 text-sm">
                Verificando...
              </span>
            )}
          </div>

          {restauranteVetado &&
            mensajeVetado &&
            !codigoValido &&
            !esClienteRestringidoAprobado && (
              <div className="text-red-600 text-base sm:text-sm mt-2 mb-3 p-4 sm:p-3 bg-red-50 border border-red-200 rounded-lg sm:rounded">
                <p className="mb-3">⚠️ {mensajeVetado}</p>

                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-gray-700 text-base sm:text-sm mb-3 sm:mb-2">
                    ¿Tienes un código de acceso? Ingrésalo aquí:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                    <input
                      type="text"
                      value={codigoAcceso}
                      onChange={(e) => {
                        setCodigoAcceso(e.target.value.toUpperCase());
                        setErrorCodigo("");
                      }}
                      placeholder="CÓDIGO DE ACCESO"
                      className="flex-1 px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg sm:text-sm uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleVerificarCodigo}
                      disabled={!codigoAcceso.trim() || verificandoCodigo}
                      className={`px-6 sm:px-4 py-4 sm:py-2 rounded-lg sm:rounded-md text-base sm:text-sm font-bold ${!codigoAcceso.trim() || verificandoCodigo
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        }`}
                    >
                      {verificandoCodigo ? "Verificando..." : "Verificar"}
                    </button>
                  </div>
                  {errorCodigo && (
                    <p className="text-red-600 text-sm sm:text-xs mt-3 sm:mt-2">
                      {errorCodigo}
                    </p>
                  )}
                </div>
              </div>
            )}
          {restauranteVetado && codigoValido && (
            <div className="text-green-600 text-base sm:text-sm mt-2 mb-3 p-4 sm:p-2 bg-green-50 border border-green-200 rounded-lg sm:rounded">
              ✓ Código válido. Puedes continuar con el registro.
            </div>
          )}
          {!restauranteVetado &&
            !verificandoRestaurante &&
            formData.nombre_restaurante.length >= 3 && (
              <p className="text-green-500 text-xs mt-1">
                ✓ Restaurante disponible para registro
              </p>
            )}
          {!restauranteVetado && formData.nombre_restaurante && (
            <div className="mb-4"></div>
          )}
          {!formData.nombre_restaurante && <div className="mb-4"></div>}
        </div>

        {/* Campo nombre del responsable */}
        <div>
          <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-xl">
            Nombre del responsable*
          </label>
          <input
            type="text"
            name="nombre_responsable_restaurante"
            value={formData.nombre_responsable_restaurante}
            onChange={handleChange}
            placeholder="Nombre del responsable"
            className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm"
            required
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-xl">
            Teléfono*
          </label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Teléfono del restaurante"
            className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm"
            required
          />
        </div>

        {/* Correo */}
        <div>
          <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-xl">
            Correo Electrónico*
          </label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="Escribe tu correo electrónico"
            className={`bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border rounded-lg sm:rounded-md focus:outline-none focus:ring-2 font-family-roman text-lg sm:text-sm ${emailExists || !emailValid
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
              }`}
            required
          />
          {checkingEmail && (
            <p className="text-gray-500 text-xs mt-1">Verificando correo...</p>
          )}
          {!emailValid && !checkingEmail && formData.correo && (
            <p className="text-red-500 text-sm mt-1 font-bold">
              ⚠️ El formato del correo no es válido
            </p>
          )}
          {emailExists && emailValid && !checkingEmail && (
            <p className="text-red-500 text-sm mt-1 font-bold">
              ⚠️ Este correo ya está registrado. Por favor, usa otro o inicia
              sesión.
            </p>
          )}
          {!emailExists &&
            emailValid &&
            !checkingEmail &&
            formData.correo &&
            formData.correo.includes("@") && (
              <p className="text-green-500 text-xs mt-1">✓ Correo disponible</p>
            )}
        </div>

      </div>


      {/* -------------------- Personalización -------------------- */}

      <span className="text-4xl leading-[1]">2. Personalización</span>
      <br/>
      <span>Escoge un usuario y contraseña para acceder a tus métricas y crear tus contenidos.</span>

      <div className="pl-8 pt-4 pb-8">

        {/* Nombre de usuario */}
        <div>
          <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-xl">
            Nombre de usuario*
          </label>
          <input
            type="text"
            name="nombre_usuario"
            value={formData.nombre_usuario}
            onChange={handleChange}
            placeholder="Tu nombre de usuario"
            autoComplete="off"
            className={`bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border rounded-lg sm:rounded-md focus:outline-none focus:ring-2 font-family-roman text-lg sm:text-sm ${usernameExists
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
              }`}
            required
          />
          {checkingUsername && (
            <p className="text-gray-500 text-xs mt-1">
              Verificando disponibilidad...
            </p>
          )}
          {usernameExists && !checkingUsername && (
            <p className="text-red-500 text-sm mt-1 font-bold">
              ⚠️ Este nombre de usuario ya existe. Por favor, elige otro.
            </p>
          )}
          {!usernameExists &&
            !checkingUsername &&
            formData.nombre_usuario.length >= 3 && (
              <p className="text-green-500 text-xs mt-1">
                ✓ Nombre de usuario disponible
              </p>
            )}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-xl">
            Contraseña*
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Escribe tu contraseña"
              autoComplete="new-password"
              className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 pr-14 sm:pr-10 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm
              "
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

        {/* Confirmar Contraseña */}
        <div>
          <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-xl">
            Confirmar Contraseña*
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirma tu contraseña"
              className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 pr-14 sm:pr-10 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm"
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

      </div>




      {/* -------------------- Términos Y Condiciones -------------------- */}

      <span className="text-4xl pb-2 pt-4">3. Términos y condiciones</span>

      <div className="pl-8">

        {/* Checkbox Términos y Condiciones */}
        <div className="flex items-center gap-3 pt-1 pb-4 sm:pt-4 sm:pb-6">
          <input type="checkbox" className="w-6 h-6 cursor-pointer" required />
          <span className="font-roman text-base sm:text-xl">
            He leído y acepto los{" "}
            <button
              type="button"
              className="text-black underline cursor-pointer bg-transparent border-0 p-0 font-bold"
              onClick={() => setShowModal(true)}
            >
              términos y condiciones
            </button>
            *
          </span>
        </div>

        {/* Mensajes y Botón de Pago integrados bajo el checkbox */}
        <div className="mb-6 -mt-2 border-b-1 pb-15">
          {/* Mensajes */}
          {successMsg && (
            <div className="text-green-600 font-bold text-center mt-4 mb-4">
              {successMsg}
            </div>
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

          {/* Botón de Pagar */}
          <button
            type="submit"
            disabled={
              paymentLoading ||
              verificandoRestaurante ||
              (restauranteVetado &&
                !codigoValido &&
                !esClienteRestringidoAprobado) ||
              creatingAccount
            }
            className={`font-bold py-5 sm:py-3 px-4 rounded-xl sm:rounded-md w-full font-roman cursor-pointer bg-[#fff200] text-black text-xl sm:text-lg mt-2 sm:mt-0 drop-shadow-[3px_3px_0.9px_rgba(0,0,0,0.3)] hover:drop-shadow-[5px_5px_0.9px_rgba(0,0,0,0.3)] ${
              paymentLoading ||
              verificandoRestaurante ||
              (restauranteVetado &&
                !codigoValido &&
                !esClienteRestringidoAprobado) ||
              creatingAccount
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {verificandoRestaurante
              ? "Verificando..."
              : paymentLoading || creatingAccount
                ? "Procesando..."
                : restauranteVetado &&
                  !codigoValido &&
                  !esClienteRestringidoAprobado
                  ? "Ingresa código de acceso"
                  : "Ir a Pagar"}
          </button>
        </div>

        <span>Datos de facturación</span>

        {/* Dirección completa del restaurante */}
        <div>
          <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-xl">
            Dirección completa del restaurante*
          </label>
          <input
            type="text"
            name="direccion_completa"
            value={formData.direccion_completa}
            onChange={handleChange}
            placeholder="Calle, número, colonia, municipio, código postal"
            className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm"
            required
          />
        </div>

        {/* RFC */}
        <div>
          <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-xl">
            RFC*
          </label>
          <input
            type="text"
            name="rfc"
            value={formData.rfc}
            onChange={handleChange}
            placeholder="Escribe tu RFC"
            className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm"
            required
          />
        </div>

        {/* Razón Social */}
        <div>
          <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-xl">
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

      </div>







      {/* Selector de número de sucursales - Oculto si viene de las tarjetas de planes */}
      {
        !planInicial && (
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
                onChange={(e) =>
                  setNumeroSucursales(parseInt(e.target.value, 10))
                }
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
        )
      }


    </form>
  );

  return (
    <div className="w-full">
      <div className="flex flex-col">
        {/* Logo - Alineado igual que en Astro */}
        <img
          className="w-50 sm:w-100 pt-3"
          src="https://residente.mx/fotos/fotos-estaticas/CLUB%20RESIDENTE-FACIL.png"
          alt="B2B Logo"
        />
        <span className="text-sm font-roman pb-6 uppercase">Inscríbete en 3 sencillos pasos. <span className="text-xs">(2 Minutos)</span></span>
        {formularioJSX}
      </div>

      {/* Modal Terminos y Condiciones using Headless UI */}
      <Transition appear show={showModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowModal(false)}
        >
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
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowPaymentModal(false)}
        >
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
                      Serás redirigido a Stripe para completar tu suscripción de
                      manera segura.
                    </p>

                    {/* Resumen del plan en el modal - igual que Stripe */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plan:</span>
                          <span className="font-semibold">
                            {precioSeleccionado?.nombre}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sucursales:</span>
                          <span className="font-semibold">
                            {precioSeleccionado?.sucursalesTexto}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="text-gray-600">Precio base:</span>
                          <span className="font-bold text-lg">
                            $
                            {precioSeleccionado?.precioMensual?.toLocaleString(
                              "es-MX",
                            )}{" "}
                            MXN
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">IVA (16%):</span>
                          <span className="font-semibold">
                            +$
                            {(
                              (precioSeleccionado?.precioMensualConIVA || 0) -
                              (precioSeleccionado?.precioMensual || 0)
                            ).toLocaleString("es-MX")}{" "}
                            MXN
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-700 font-semibold">
                            Total mensual:
                          </span>
                          <span className="font-bold text-lg text-green-600">
                            $
                            {precioSeleccionado?.precioMensualConIVA?.toLocaleString(
                              "es-MX",
                            )}{" "}
                            MXN
                          </span>
                        </div>
                      </div>
                    </div>

                    {paymentError && (
                      <p className="text-red-500 text-sm mb-4">
                        {paymentError}
                      </p>
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