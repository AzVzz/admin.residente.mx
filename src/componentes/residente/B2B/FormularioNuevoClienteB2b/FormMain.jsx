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

const FormMain = () => {
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

  // Estados para verificación de nombre de usuario
  const [usernameExists, setUsernameExists] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameDebounceRef = useRef(null);

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

        // Redirigir a registro
        window.location.href = "/registro";
      } catch (error) {
        console.error("Error en handleCreateAccountAfterPayment:", error);

        // Si el usuario ya tiene registro B2B, significa que ya está creado - redirigir de todas formas
        if (
          error.message &&
          (error.message.includes("ya tiene un registro B2B") ||
            error.message.includes("ya existe"))
        ) {
          console.log(
            "✅ Usuario ya tiene registro B2B, redirigiendo a /registro"
          );
          // Limpiar localStorage
          localStorage.removeItem("b2b_payment_completed");
          localStorage.removeItem("b2b_stripe_session_id");
          localStorage.removeItem("b2b_form_data");
          // Redirigir de todas formas
          window.location.href = "/registro";
          return;
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

      const requestBody = {
        priceId: "price_1SY9IGRzQ7oLCa50mibJc2n3", // ✅ OBLIGATORIO
        userData: userData, // ✅ OBLIGATORIO (el backend lo usa para crear el usuario)
        customerEmail: formData.correo || "", // Opcional pero recomendado
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
        confirm_password: "", // <-- limpiar el nuevo campo
      });
      // Limpiar el estado de pago después de crear la cuenta exitosamente
      setPaymentCompleted(false);
      setStripeSessionId("");
      localStorage.removeItem("b2b_payment_completed");
      localStorage.removeItem("b2b_stripe_session_id");
      localStorage.removeItem("b2b_stripe_session_id");
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

  return (
    <div className="grid grid-cols-[minmax(680px,2fr)_minmax(350px,1fr)] gap-x-12 gap-y-9 max-w-[1400px] mx-auto py-8">
      <div className="flex flex-col left-column translate-x-[-200px]">
        <img
          className="w-25 pb-5"
          src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/b2b%20logo%20completo.png"
        />

        <h1 className="leading-tight text-2xl mb-4">Suscripción B2B</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {/* Campo nombre del responsable */}
          <div>
            <label className="space-y-2 font-roman font-bold ">
              Nombre del responsable*
            </label>
            <input
              type="text"
              name="nombre_responsable_restaurante"
              value={formData.nombre_responsable_restaurante}
              onChange={handleChange}
              placeholder="Nombre del responsable"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm mb-4"
            />
          </div>

          <div>
            <label className="space-y-2 font-roman font-bold">
              Nombre comercial del restaurante*
            </label>
            <input
              type="text"
              name="nombre_restaurante"
              value={formData.nombre_restaurante}
              onChange={handleChange}
              placeholder="Nombre del restaurante"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm mb-4"
            />
          </div>

          <div>
            <label className="space-y-2 font-roman font-bold">Teléfono*</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Teléfono del restaurante"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm mb-4"
            />
          </div>

          <div>
            <label className="space-y-2 font-roman font-bold">
              Correo Electrónico*
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="Escribe tu correo electrónico"
              className={`bg-white w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 font-family-roman font-bold text-sm ${
                emailExists || !emailValid
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {checkingEmail && (
              <p className="text-gray-500 text-xs mt-1">
                Verificando correo...
              </p>
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
                <p className="text-green-500 text-xs mt-1">
                  ✓ Correo disponible
                </p>
              )}
            <div className="mb-4"></div>
          </div>

          <div>
            <label className="space-y-2 font-roman font-bold">RFC*</label>
            <input
              type="text"
              name="rfc"
              value={formData.rfc}
              onChange={handleChange}
              placeholder="Escribe tu RFC"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm mb-4"
            />
          </div>

          <div>
            <label className="space-y-2 font-roman font-bold">
              Dirección completa del restaurante*
            </label>
            <input
              type="text"
              name="direccion_completa"
              value={formData.direccion_completa}
              onChange={handleChange}
              placeholder="Calle, número, colonia, municipio, código postal"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm mb-4"
            />
          </div>

          <div>
            <label className="space-y-2 font-roman font-bold">
              Razón Social*
            </label>
            <input
              type="text"
              name="razon_social"
              value={formData.razon_social}
              onChange={handleChange}
              placeholder="Escribe la razón social"
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm mb-4"
            />
          </div>

          <div>
            <label className="space-y-2 font-roman font-bold">
              Nombre de usuario*
            </label>
            <input
              type="text"
              name="nombre_usuario"
              value={formData.nombre_usuario}
              onChange={handleChange}
              placeholder="Tu nombre de usuario"
              className={`bg-white w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 font-family-roman font-bold text-sm ${
                usernameExists
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
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
            <div className="mb-4"></div>
          </div>

          <div>
            <label className="space-y-2 font-roman font-bold">
              Contraseña*
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Escribe  contraseña"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm mb-4"
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-xl text-black cursor-pointer"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="space-y-2 font-roman font-bold">
              Confirmar Contraseña*
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirma tu contraseña"
                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm mb-4"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-xl text-black cursor-pointer"
                onClick={() => setShowConfirmPassword((v) => !v)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible />
                ) : (
                  <AiOutlineEye />
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <input type="checkbox" className="w-6 h-6 mr-2 cursor-pointer" />
            <span className="font-roman font-bold">
              Acepto los{" "}
              <span
                className="text-black underline cursor-pointer"
                onClick={() => setShowModal(true)}
                tabIndex={0}
                role="button"
              >
                Términos y Condiciones
              </span>
              *
            </span>
          </div>

          {/* Mensaje de exito */}
          {successMsg && (
            <div className="text-green-600 font-bold text-center mt-4">
              {successMsg}
            </div>
          )}

          {/* Mensaje de pago completado */}
          {paymentCompleted && creatingAccount && (
            <div className="text-blue-600 font-bold text-center mt-4 mb-4">
              <div>✓ Pago completado exitosamente. Creando tu cuenta...</div>
            </div>
          )}

          {/* Mensaje de error */}
          {paymentError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
              <p className="font-bold">Error:</p>
              <p>{paymentError}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col items-center gap-4 mt-6">
            {/* Botón de Pagar */}
            <button
              type="button"
              onClick={handlePaymentClick}
              disabled={paymentLoading || creatingAccount}
              className="inline-flex items-center justify-center font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[250px] h-[40px] bg-[#fff200] text-black text-sm uppercase disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {paymentLoading || creatingAccount ? "Procesando..." : "Pagar"}
            </button>
          </div>
        </form>

        {/* Modal de Checkout de Stripe */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded shadow-lg max-w-lg w-full p-8 relative">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-600 cursor-pointer hover:text-gray-800 z-10"
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentLoading(false);
                  setPaymentError("");
                }}
              >
                ×
              </button>

              <div className="mt-2">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Checkout de Pago
                </h2>

                {paymentError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-bold">Error:</p>
                    <p>{paymentError}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <p className="text-xl font-semibold mb-2 text-gray-800">
                      B2B Residente
                    </p>
                    <p className="text-3xl font-bold text-black mb-2">
                      $2,199.00 MXN
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Suscripción mensual
                    </p>
                    <p className="text-sm text-green-600 font-semibold italic">
                      Más IVA
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-semibold">B2B Residente</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Periodo:</span>
                    <span className="font-semibold">Mensual</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-lg text-black">
                      $2,199.00 MXN
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={paymentLoading}
                    className="bg-[#fff200] hover:bg-[#fff200] text-black font-bold py-3 px-6 rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {paymentLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Procesando...
                      </span>
                    ) : (
                      "Continuar al Pago"
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentLoading(false);
                      setPaymentError("");
                    }}
                    disabled={paymentLoading}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded disabled:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                  <p>
                    Serás redirigido a Stripe para completar el pago de forma
                    segura.
                  </p>
                  <p className="mt-1">
                    Una vez completado el pago, tu cuenta se creará
                    automáticamente y serás redirigido al dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Términos y Condiciones */}
        <Transition appear show={showModal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[9999]"
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
              <div className="fixed inset-0 bg-black/60" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-[#fff200] p-4 shadow-2xl transition-all relative">
                    {/* Botón X para cerrar */}
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute top-4 right-4 text-black hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      aria-label="Cerrar modal"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    {/* Título */}
                    <Dialog.Title className="text-2xl font-bold mb-2 pr-8">
                      Términos y Condiciones
                    </Dialog.Title>

                    {/* Contenido scrolleable */}
                    <div className="max-h-[60vh] overflow-y-auto pr-2 scroll-modal">
                      <TerminosyCondiciones />
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
      {/* Barra lateral */}
      <div className="flex flex-col items-end justify-start gap-10 translate-x-[-200px]">
        <DirectorioVertical />
        <PortadaRevista />
      </div>
    </div>
  );
};

export default FormMain;
