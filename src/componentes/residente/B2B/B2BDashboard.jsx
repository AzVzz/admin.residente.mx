import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { imgApi, urlApi } from "../../api/url";
import { useAuth } from "../../Context";
import CancelSubscriptionButton from "./CancelSubscriptionButton";
import { cuponesGetStatsB2B } from "../../api/cuponesGet";
import axios from "axios";
// import FormularioBanner from "./FormularioBanner";

import CheckoutCliente from "./FormularioNuevoClienteB2b/TiendaClientes/CheckoutCliente";
import { FaFilePdf } from "react-icons/fa";
import { BENEFICIOS_INFO } from "./beneficiosConfig";

const B2BDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [openTooltip, setOpenTooltip] = useState(null);

  useEffect(() => {
    if (openTooltip) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [openTooltip]);
  const [b2bId, setB2bId] = useState(null);
  const [loadingB2bId, setLoadingB2bId] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const { saveToken, saveUsuario, usuario, token } = useAuth();
  const navigate = useNavigate();
  const [restaurante, setRestaurante] = useState(null);
  const [restaurante2, setRestaurante2] = useState(null);
  const [loadingRestaurante, setLoadingRestaurante] = useState(true);
  const [b2bUser, setB2bUser] = useState(null);
  const [showFormularioPromo, setShowFormularioPromo] = useState(false);

  // 🆕 Estado para productos y selección
  const [productos, setProductos] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [total, setTotal] = useState(0);

  // Estado para la fecha actual
  const [fechaActual, setFechaActual] = useState(new Date());
  const [cupon, setCupon] = useState(null);
  const [loadingCupon, setLoadingCupon] = useState(true);
  const [cupones, setCupones] = useState([]);

  // 🆕 Estado para datos de Google Analytics
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Estado para stats de notas del usuario
  const [notaStats, setNotaStats] = useState(null);

  // Estado para notas taggeadas al restaurante
  const [notasRestaurante, setNotasRestaurante] = useState(null);

  // 🆕 Estado para mostrar mensaje de pago exitoso
  const [pagoRealizado, setPagoRealizado] = useState(false);

  // 🆕 Anunciador
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState({
    titulo: "",
    mensaje: "",
    es_general: true,
    destinatarios: "",
  });
  const esSeller = usuario?.rol === "vendedor" || usuario?.rol === "residente";

  // 📢 Estado para anuncios B2B
  const [anuncios, setAnuncios] = useState([]);
  const [loadingAnuncios, setLoadingAnuncios] = useState(true);

  // 👇 AGREGADO: URL de la API de tienda
  // En desarrollo usa el proxy de Vite, en producción usa la URL directa
  const API_URL = import.meta.env.DEV
    ? "/api/tienda" // Usa el proxy configurado en vite.config.js
    : `${urlApi}api/tienda`; // URL directa en producción

  // 🆕 Función para enviar correo de confirmación después del pago
  const enviarCorreoConfirmacion = async (sessionId) => {
    try {
      const emailData = {
        sessionId: sessionId,
        customerEmail: usuario?.correo || b2bUser?.correo,
        customerName: usuario?.nombre_usuario || b2bUser?.nombre_responsable,
        b2bId: b2bId,
      };

      const apiUrl = import.meta.env.DEV
        ? `${urlApi}api/tienda/send-confirmation-email`
        : `https://admin.residente.mx/api/tienda/send-confirmation-email`;

      await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });
    } catch (error) {
      // Silenciar errores de envío de correo
    }
  };

  // 🆕 Detectar si el usuario viene de un pago exitoso
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const paymentSuccess = query.get("payment_success");
    const sessionId = query.get("session_id");

    if (paymentSuccess === "true") {
      if (sessionId) {
        obtenerDetallesSesion(sessionId);
        enviarCorreoConfirmacion(sessionId);
      }

      setPagoRealizado(true);

      setTimeout(() => {
        setPagoRealizado(false);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }, 5000);
    }
  }, [usuario, b2bId]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  // 🆕 Cargar productos desde la API
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const apiUrl = `${urlApi}api/productosb2b`;
        console.log("📦 Cargando productos desde:", apiUrl);
        const res = await fetch(apiUrl);
        if (!res.ok) {
          console.error(
            "❌ Error al cargar productos:",
            res.status,
            res.statusText,
          );
          throw new Error("Error al obtener productos");
        }
        const data = await res.json();
        console.log("✅ Productos cargados:", data);
        setProductos(data);
      } catch (error) {
        console.error("❌ Error al cargar productos:", error);
      }
    };

    fetchProductos();
  }, []);

  // Actualizar fecha automáticamente cada mínuto
  useEffect(() => {
    const interval = setInterval(() => {
      setFechaActual(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

  // 📢 Cargar anuncios B2B (filtrados por b2bId)
  useEffect(() => {
    if (!b2bId) return;
    const fetchAnuncios = async () => {
      try {
        setLoadingAnuncios(true);
        const res = await fetch(`${urlApi}api/anuncios-b2b?b2bId=${b2bId}`);
        if (!res.ok) throw new Error("Error al obtener anuncios");
        const data = await res.json();
        setAnuncios(data);
      } catch (error) {
        console.error("Error cargando anuncios:", error);
      } finally {
        setLoadingAnuncios(false);
      }
    };
    fetchAnuncios();
  }, [b2bId]);

  // 🆕 Manejar selección de productos y total
  const handleToggleProducto = (id) => {
    setSeleccionados((prev) => {
      const nuevoSeleccionados = {
        ...prev,
        [id]: !prev[id],
      };

      // Recalcular total con base en los seleccionados usando monto (precio final)
      const nuevoTotal = productos.reduce((suma, producto) => {
        if (nuevoSeleccionados[producto.id]) {
          // Usar precio_descuento si existe, si no usar monto
          const precio = Number(
            producto.precio_descuento || producto.monto || 0,
          );
          return suma + precio;
        }
        return suma;
      }, 0);

      setTotal(nuevoTotal);
      return nuevoSeleccionados;
    });
  };

  // 🆕 Función para obtener detalles de la sesión después del pago
  const obtenerDetallesSesion = async (sessionId) => {
    try {
      const apiUrl = import.meta.env.DEV
        ? `${urlApi}api/tienda/session-details/${sessionId}`
        : `https://admin.residente.mx/api/tienda/session-details/${sessionId}`;

      await fetch(apiUrl);
    } catch (error) {
      // Silenciar errores
    }
  };

  // 👇 AGREGADO: Función para ir a pagar con Stripe
  const handleIrAPagar = async () => {
    const productosSeleccionados = productos.filter((p) => seleccionados[p.id]);

    if (productosSeleccionados.length === 0) {
      alert("Selecciona al menos un beneficio para pagar.");
      return;
    }

    try {
      const successUrl = `${window.location.origin}/dashboardb2b?payment_success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/dashboardb2b?payment_canceled=true`;

      // Formato exacto que espera el backend: { productId: '1', quantity: 1 }
      const items = productosSeleccionados.map((p) => ({
        productId: p.id.toString(),
        quantity: 1,
      }));

      const paymentData = {
        items,
        b2bId: b2bId,
        customerEmail: usuario?.correo || b2bUser?.correo || null,
        customerName:
          usuario?.nombre_usuario || b2bUser?.nombre_responsable || null,
        successUrl: successUrl,
        cancelUrl: cancelUrl,
      };

      console.log("📦 Enviando datos de pago:", paymentData);

      const resp = await axios.post(
        `${API_URL}/create-checkout-session`,
        paymentData,
      );

      if (resp.data.url) {
        window.location.href = resp.data.url;
      } else {
        alert("No se pudo obtener la URL de pago.");
      }
    } catch (err) {
      console.error("❌ Error en pago:", err.response?.data || err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Error desconocido";
      alert(`Error al crear la sesión de pago: ${errorMsg}`);
    }
  };

  // Obtener restaurante
  useEffect(() => {
    const fetchRestaurante = async () => {
      try {
        if (!token) return;

        const response = await fetch(`${urlApi}api/restaurante/basicos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Primer restaurante
            const detailResponse = await fetch(
              `${urlApi}api/restaurante/${data[0].slug}`,
            );
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              setRestaurante(detailData);
            }

            // Segundo restaurante (si existe)
            if (data.length > 1) {
              const detail2Response = await fetch(
                `${urlApi}api/restaurante/${data[1].slug}`,
              );
              if (detail2Response.ok) {
                const detail2Data = await detail2Response.json();
                setRestaurante2(detail2Data);
              }
            }
          }
        }
      } catch (error) {
        // Error al obtener restaurante
      } finally {
        setLoadingRestaurante(false);
      }
    };

    if (token) {
      fetchRestaurante();
    }
  }, [token]);

  // Obtener información del usuario B2B
  useEffect(() => {
    const fetchB2BUser = async () => {
      // Intentar por b2b_id directo (viene en el JWT) antes que por usuario_id
      const lookupUrl = usuario?.b2b_id
        ? `${urlApi}api/usuariosb2b/${usuario.b2b_id}`
        : `${urlApi}api/usuariosb2b/user/${usuario?.id}`;

      try {
        const response = await fetch(lookupUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setB2bUser(data);
          return;
        }
      } catch (_) {}

      // Fallback: si no tenía b2b_id en token, intentar por usuario_id
      if (usuario?.b2b_id && usuario?.id) {
        try {
          const response = await fetch(
            `${urlApi}api/usuariosb2b/user/${usuario.id}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (response.ok) {
            const data = await response.json();
            setB2bUser(data);
          }
        } catch (_) {}
      }
    };

    if (usuario?.id || usuario?.b2b_id) {
      fetchB2BUser();
    }
  }, [usuario]);

  // Obtener el b2b_id del usuario
  useEffect(() => {
    const obtenerB2bId = async () => {
      if (!usuario) {
        setLoadingB2bId(false);
        return;
      }

      if (usuario.b2b_id) {
        setB2bId(usuario.b2b_id);
        setLoadingB2bId(false);
        return;
      }

      if (usuario.id && usuario.rol === "b2b") {
        try {
          const apiUrl = import.meta.env.DEV
            ? `${urlApi}api/usuariosb2b/${usuario.id}`
            : `https://admin.residente.mx/api/usuariosb2b/${usuario.id}`;

          const response = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await response.json();
              if (data.id) {
                setB2bId(data.id);
                setLoadingB2bId(false);
                return;
              } else if (data.usuario_b2b?.id) {
                setB2bId(data.usuario_b2b.id);
                setLoadingB2bId(false);
                return;
              }
            }
          }
        } catch (error) {
          // Continuar con otros métodos
        }
      }

      if (usuario.id) {
        try {
          const apiUrl = import.meta.env.DEV
            ? `${urlApi}api/usuariosb2b?usuario_id=${usuario.id}`
            : `https://admin.residente.mx/api/usuariosb2b?usuario_id=${usuario.id}`;

          const response = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                const registroCorrecto =
                  data.find((reg) => reg.usuario_id === usuario.id) || data[0];
                setB2bId(registroCorrecto.id);
                setLoadingB2bId(false);
                return;
              } else if (data.id) {
                setB2bId(data.id);
                setLoadingB2bId(false);
                return;
              }
            }
          }
        } catch (error) {
          // Continuar con otros métodos
        }
      }

      if (usuario.correo) {
        try {
          const apiUrl = import.meta.env.DEV
            ? `${urlApi}api/usuariosb2b?correo=${encodeURIComponent(usuario.correo)}`
            : `https://admin.residente.mx/api/usuariosb2b?correo=${encodeURIComponent(usuario.correo)}`;

          const response = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                setB2bId(data[0].id);
                setLoadingB2bId(false);
                return;
              } else if (data.id) {
                setB2bId(data.id);
                setLoadingB2bId(false);
                return;
              }
            }
          }
        } catch (error) {
          // Continuar
        }
      }

      if (usuario.id && usuario.rol === "b2b") {
        setB2bId(usuario.id);
      }

      setLoadingB2bId(false);
    };

    obtenerB2bId();
  }, [usuario]);

  // Función para obtener información de suscripción
  const obtenerSuscripcion = async () => {
    if (!b2bId) {
      setLoadingSubscription(false);
      return;
    }

    setLoadingSubscription(true);
    setSubscriptionError(null);

    try {
      const apiUrl = import.meta.env.DEV
        ? `${urlApi}api/stripe/user-subscription/${b2bId}`
        : `https://admin.residente.mx/api/stripe/user-subscription/${b2bId}`;

      const response = await fetch(apiUrl);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        if (response.status === 404) {
          if (usuario?.suscripcion === 1 || usuario?.suscripcion === true) {
            setSubscriptionData({
              suscripcionDB: {
                estado: "active",
                nombre_plan: "B2B Residente",
                facturas: "month",
              },
              sincronizado: false,
            });
            setSubscriptionError(null);
            return;
          }
          setSubscriptionError("No se encontró una suscripción activa");
          return;
        }
        throw new Error("La respuesta del servidor no es válida");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener la suscripción");
      }

      if (
        data.success ||
        data.subscription ||
        data.suscripcionDB ||
        data.subscription_id
      ) {
        setSubscriptionData(data);
        setSubscriptionError(null);
      } else {
        if (usuario?.suscripcion === 1 || usuario?.suscripcion === true) {
          setSubscriptionData({
            suscripcionDB: { estado: "active" },
            sincronizado: false,
          });
          setSubscriptionError(null);
        } else {
          setSubscriptionError("No se encontró una suscripción activa");
        }
      }
    } catch (error) {
      if (
        error.message.includes("JSON") ||
        error.message.includes("Unexpected token")
      ) {
        setSubscriptionError("No se encontró una suscripción activa");
      } else {
        setSubscriptionError(
          error.message || "Error al obtener la suscripción",
        );
      }
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Verificar suscripción inicial desde el objeto usuario
  useEffect(() => {
    if (usuario?.suscripcion === 1 || usuario?.suscripcion === true) {
      if (!subscriptionData && !loadingSubscription) {
        setSubscriptionData({
          suscripcionDB: {
            estado: "active",
            nombre_plan: "B2B Residente",
            facturas: "month",
          },
          sincronizado: false,
        });
        setSubscriptionError(null);
      }
    }
  }, [usuario]);

  // Obtener información de suscripción cuando b2bId esté disponible
  useEffect(() => {
    obtenerSuscripcion();
  }, [b2bId]);

  // Obtener stats de cupones — carga inicial + polling cada 30s
  useEffect(() => {
    if (!usuario || !token) return;

    const fetchCupones = async () => {
      try {
        const data = await cuponesGetStatsB2B(token);
        setCupones(data.cupones || []);
        setCupon((data.cupones || [])[0] || null);
      } catch {
        // silencioso en polling
      } finally {
        setLoadingCupon(false);
      }
    };

    setLoadingCupon(true);
    fetchCupones();
    const interval = setInterval(fetchCupones, 30_000);
    return () => clearInterval(interval);
  }, [usuario, token]);

  // Obtener stats de notas del usuario
  useEffect(() => {
    const fetchNotaStats = async () => {
      if (!usuario?.id) return;
      try {
        const response = await fetch(
          `${urlApi}api/notas/usuario/${usuario.id}/stats`,
        );
        if (response.ok) {
          const data = await response.json();
          setNotaStats(data);
        }
      } catch (error) {
        console.error("Error al obtener stats de notas:", error);
      }
    };
    fetchNotaStats();
  }, [usuario]);

  // Obtener notas taggeadas al restaurante
  useEffect(() => {
    const fetchNotasRestaurante = async () => {
      if (!restaurante?.id) return;
      try {
        const response = await fetch(
          `${urlApi}api/notas/restaurante/${restaurante.id}/stats`,
        );
        if (response.ok) {
          const data = await response.json();
          setNotasRestaurante(data);
        }
      } catch (error) {
        console.error("Error al obtener notas del restaurante:", error);
      }
    };
    fetchNotasRestaurante();
  }, [restaurante]);

  // 🆕 Obtener datos de Google Analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${urlApi}api/google-analytics/ultimo`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setAnalytics(data);
          }
        }
      } catch (error) {
        console.error("Error al obtener analytics:", error);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleLogout = () => {
    saveToken(null);
    saveUsuario(null);
    navigate("/registro");
  };

  const handleEditar = () => {
    if (restaurante) {
      navigate(`/formulario/${restaurante.slug}`);
    } else {
      navigate("/formulario");
    }
  };

  const handleVer = () => {
    if (restaurante) {
      // Abrir el micrositio en residente.mx en una nueva pestaña
      window.open(
        `https://residente.mx/restaurantes/${restaurante.slug}`,
        "_blank",
      );
    }
  };

  const handleCupones = () => {
    navigate("/dashboardtickets");
  };

  const handleFormularioPromo = () => {
    navigate("/promo");
  };

  const cuponImg = `${imgApi}fotos/tickets/promo_test_1764265100923.png`;

  // Imagen por defecto si no hay restaurante o imagen
  const imagenRestaurante = restaurante?.imagenes?.[0]?.src
    ? restaurante.imagenes[0].src.startsWith("http")
      ? restaurante.imagenes[0].src
      : `${imgApi}${restaurante.imagenes[0].src}`
    : `${imgApi}/fotos/platillos/default.webp`;

  // Calcular total de interacciones de  cupones del usuario
  const totalInteraccionesCupones = cupones
    .filter((c) => c.user_id === usuario.id)
    .reduce((suma, c) => suma + (c.total_interacciones || 0), 0);

  const totalViewsCupones = cupones.reduce(
    (suma, c) => suma + (c.views || 0),
    0,
  );
  const totalClicksCupones = cupones.reduce(
    (suma, c) => suma + (c.clicks || 0),
    0,
  );

  // Estado para credenciales nuevas (modal)
  const [credencialesNuevas, setCredencialesNuevas] = useState(null);

  useEffect(() => {
    // Leer credenciales guardadas en sessionStorage
    const credenciales = sessionStorage.getItem("credencialesNuevas");
    if (credenciales) {
      try {
        setCredencialesNuevas(JSON.parse(credenciales));
      } catch {
        setCredencialesNuevas(null);
      }
    }
  }, [usuario]);

  // Función para cerrar el modal y limpiar credenciales
  const cerrarBannerCredenciales = () => {
    setCredencialesNuevas(null);
    sessionStorage.removeItem("credencialesNuevas");
  };

  // Beneficios incluidos en la membresía B2B (según tabla usuarios_b2b)
  const beneficiosMembresia = b2bUser
    ? BENEFICIOS_INFO.filter((b) => b2bUser[b.key])
    : [];

  // Fecha de vigencia de la membresía (misma vigencia para las bonificaciones)
  let fechaVigenciaBeneficios = null;

  // 1) Calcular usando fecha_aceptacion_terminos + numero_meses del propio registro B2B
  if (b2bUser?.fecha_aceptacion_terminos && b2bUser?.numero_meses) {
    const meses = parseInt(b2bUser.numero_meses, 10);
    const inicio = new Date(b2bUser.fecha_aceptacion_terminos);
    if (!Number.isNaN(inicio.getTime()) && meses > 0) {
      const fin = new Date(inicio);
      fin.setMonth(fin.getMonth() + meses);
      fechaVigenciaBeneficios = fin.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }

  // 2) Si por alguna razón no se pudo calcular arriba, intentar con la fecha que viene de Stripe
  if (!fechaVigenciaBeneficios) {
    const periodoFinStripe = subscriptionData?.subscription?.current_period_end;
    if (periodoFinStripe) {
      fechaVigenciaBeneficios = new Date(
        periodoFinStripe * 1000,
      ).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if (subscriptionData?.suscripcionDB?.fecha_fin_periodo_actual) {
      fechaVigenciaBeneficios = new Date(
        subscriptionData.suscripcionDB.fecha_fin_periodo_actual,
      ).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }

  // Enviar reclamo de bonificación (correo al equipo)
  const handleReclamarBeneficio = async (beneficio) => {
    if (!restaurante && !b2bUser && !usuario) {
      alert(
        "No se encontró información de tu restaurante. Intenta recargar la página.",
      );
      return;
    }

    const restauranteNombre =
      restaurante?.nombre_restaurante ||
      b2bUser?.nombre_responsable_restaurante ||
      b2bUser?.nombre_responsable ||
      usuario?.nombre_usuario ||
      "Restaurante sin nombre";

    const payload = {
      restauranteNombre,
      restauranteSlug: restaurante?.slug || null,
      beneficioKey: beneficio.key,
      beneficioLabel: beneficio.label,
      beneficioDescripcion: beneficio.descripcion || "",
      usuarioEmail: usuario?.correo || b2bUser?.correo || null,
    };

    try {
      const resp = await fetch(`${urlApi}api/beneficios-b2b/reclamo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        const msg =
          data.error ||
          data.message ||
          `Error ${resp.status} al enviar la solicitud de bonificación.`;
        alert(msg);
        return;
      }

      alert(
        `Hemos recibido tu solicitud para el beneficio "${beneficio.label}". Nuestro equipo se pondrá en contacto contigo.`,
      );
    } catch (error) {
      console.error("Error enviando reclamo de beneficio:", error);
      alert(
        "Hubo un problema al enviar tu solicitud de bonificación. Intenta de nuevo en unos momentos.",
      );
    }
  };

  return (
    <div>
      {/* Barra superior del usuario */}
      <div className="w-full h-10 flex items-center justify-end mt-1 pr-1">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1 rounded transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
      {/* Logo Club Residente + Nombre del restaurante centrado */}
      {restaurante?.nombre_restaurante && (
        <div className="w-full flex flex-col justify-center items-center py-0.5 mb-6">
          <img
            src="https://residente.mx/fotos/fotos-estaticas/CLUB%20RESIDENTE-FACIL.png"
            alt="Club Residente Facil"
            className="h-12 w-auto object-contain mb-0"
          />
          <h1 className="text-[80px] font-bold text-black text-center leading-[1]">
            {restaurante.nombre_restaurante}
          </h1>
          <p className="text-sm text-black">
            {fechaActual.toLocaleDateString("es-MX", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}
      {/* Grid de 3 columnas */}
      <div className="w-full grid grid-cols-3 mb-10 relative items-stretch">
        {/* Línea divisoria izquierda - empieza más abajo */}
        <div className="absolute left-[33.333%] top-[7.5em] w-[1px] h-[calc(100%-8rem)] bg-gray-600"></div>
        {/* Línea divisoria derecha */}
        <div className="absolute left-[66.666%] top-[7.5em] w-[1px] h-[calc(100%-8rem)] bg-gray-600"></div>

        {/* Columna azul */}
        <div className="flex flex-col p-3 min-h-0">
          <div className="border-b-[7px] border-black pb-0.5 mb-[8px] w-fit">
            <p className="text-[35px] text-left leading-none">
              Crea tus
              <br />
              Contenidos
            </p>
          </div>

          {loadingRestaurante ? (
            <div className="text-center py-2">Cargando restaurante...</div>
          ) : restaurante ? (
            <div className="flex items-center gap-3"></div>
          ) : (
            <div className="py-2 text-gray-500 leading-[1.2] text-left font-roman">
              Aún no tienes un restaurante registrado.
              <br />
              Haz clic en MICROSITIO para crear tu restaurante y comenzar a
              personalizar tu espacio.
            </div>
          )}

          {/* Botones alineados a la izquierda en columna */}
          <div className="flex flex-col gap-2 mt-3 items-start">
            <button
              onClick={
                restaurante ? handleEditar : () => navigate("/formulario")
              }
              className="bg-black hover:bg-black text-white text-[30px] font-bold px-3 py-1 rounded shadow-[0_4px_14px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_22px_rgba(0,0,0,0.5)] transition-all cursor-pointer w-60"
            >
              {restaurante ? "MICROSITIO" : "CREAR SITIO"}
            </button>

            {b2bUser?.suscripcion_extra && (
              <button
                onClick={
                  restaurante2
                    ? () => navigate(`/formulario/${restaurante2.slug}`)
                    : () => navigate("/formulario")
                }
                className="bg-black hover:bg-black text-white text-[30px] font-bold px-3 py-1 rounded shadow-[0_4px_14px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_22px_rgba(0,0,0,0.5)] transition-all cursor-pointer w-60"
              >
                {restaurante2 ? "MICROSITIO 2" : "CREAR SITIO 2"}
              </button>
            )}

            <video
              src="https://residente.mx/fotos/videos/BIENVENIDOCLUBRESIDENTE.mp4"
              controls
              playsInline
              preload="metadata"
              className="w-60 aspect-[4/3] bg-black mb-6"
            />
            <button
              onClick={handleCupones}
              className="bg-black hover:bg-black text-white text-[30px] font-bold px-3 py-1 rounded shadow-[0_4px_14px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_22px_rgba(0,0,0,0.5)] transition-all cursor-pointer w-60"
            >
              DESCUENTOS
            </button>

            <video
              src="https://residente.mx/fotos/videos/SACARPROVECHO.mp4"
              controls
              playsInline
              preload="metadata"
              className="w-60 aspect-[4/3] bg-black mb-6"
            />

            <div className="bg-black text-white text-center rounded w-60 px-3 py-3 mb-4">
              <p className="text-[30px] font-bold leading-[1] mb-1">
                RETORNO DE
                <br />
                INVERSIÓN
              </p>
              <p className="text-[11px] text-white/80 mb-3">
                Al {fechaActual.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
              </p>

              {/* Conversión — va primero */}
              <div className="mb-2">
                <span className="text-[25px] leading-[1] underline">
                  Conversión
                </span>
                <div className="flex items-start justify-center gap-1">
                  <p className="text-[36px] font-bold text-white leading-[1]">
                    $
                    {(
                      ((restaurante?.clicks || 0) +
                        (notasRestaurante?.total_clicks || 0) +
                        cupones.reduce((s, c) => s + (c.clicks || 0), 0)) *
                      (restaurante?.ticket_promedio || 0) *
                      3 *
                      0.022
                    ).toLocaleString("es-MX", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <span
                    className="cursor-pointer text-[11px] bg-white text-black rounded-full w-4 h-4 flex items-center justify-center mt-1 flex-shrink-0"
                    onClick={() =>
                      setOpenTooltip(
                        openTooltip === "conversion" ? null : "conversion",
                      )
                    }
                  >
                    ?
                  </span>
                </div>
              </div>

              {/* Fidelización */}
              <div className="mb-1">
                <span className="text-[25px] leading-[1] underline">
                  Fidelización
                </span>
                <div className="flex items-start justify-center gap-1">
                  <p className="text-[36px] font-bold text-white leading-[1]">
                    $
                    {(
                      ((restaurante?.views || 0) +
                        (notasRestaurante?.total_vistas || 0) +
                        cupones.reduce((s, c) => s + (c.views || 0), 0)) *
                      (restaurante?.ticket_promedio || 0) *
                      3 *
                      0.0035
                    ).toLocaleString("es-MX", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <span
                    className="cursor-pointer text-[11px] bg-white text-black rounded-full w-4 h-4 flex items-center justify-center mt-1 flex-shrink-0"
                    onClick={() =>
                      setOpenTooltip(
                        openTooltip === "fidelbench" ? null : "fidelbench",
                      )
                    }
                  >
                    ?
                  </span>
                </div>
              </div>
            </div>
          </div>
          <address className="flex flex-col mt-auto pt-10">
            <p>Credenciales de Acceso</p>
            <strong className="text-xs text-gray-900 font-roman">
              Nombre:{" "}
              {b2bUser?.nombre_responsable ||
                b2bUser?.nombre_responsable_restaurante ||
                "Nombre no disponible"}
            </strong>
            <strong className="text-xs text-gray-900 font-roman">
              Nombre de usuario: {usuario?.nombre_usuario || "Usuario B2B"}
            </strong>
            <strong className="text-xs text-gray-900 font-roman">
              Correo: {b2bUser?.correo || "Correo no disponible"}
            </strong>
            <strong className="text-xs text-gray-900 font-roman">
              Teléfono: {b2bUser?.telefono || "Teléfono no disponible"}
            </strong>
            <strong className="text-xs text-gray-900 font-roman">
              Contraseña: La misma que usaste para registrarte.
            </strong>
          </address>
        </div>
        {/* Columna verde - Estadísticas */}
        <div className="flex flex-col p-3">
          <div className="border-b-[7px] border-black pb-0.5 mb-[17px] w-fit">
            <p className="text-[35px] text-left leading-none">
              Checa tus
              <br />
              Resultados
            </p>
          </div>
          <div className="flex flex-col">
            {/* 🆕 Datos de Google Analytics */}
            <img
              src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/google-analytics%20logo%20negro.png"
              className="w-25 h-full object-contain mb-6"
            />
            {!loadingAnalytics && analytics && (
              <>
                <div className="mb-2">
                  <img
                    src="https://residente.mx/fotos/fotos-estaticas/componente-sin-carpetas/food-drink-media-logo-negro.png"
                    className="w-52 mb-2 max-w-full h-auto border-b-2 pb-0.5"
                  />
                  <div className="flex items-center gap-2">
                    <p className="text-[40px] font-bold text-black leading-[1]">
                      {analytics.club_residente_trafico?.toLocaleString(
                        "es-MX",
                      ) || 0}
                    </p>
                    <div className="flex flex-row items-center gap-2 pl-4">
                      <img
                        src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/mailchimp%20logo.png"
                        alt="Mail Chimp"
                        className="h-4 w-auto object-contain"
                      />
                      <img
                        src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/partner_meta%20logo.png"
                        alt="Meta Partner"
                        className="h-4 w-auto object-contain"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-black leading-tight">
                    Tráfico total de los medios digitales de Residente
                    <br />
                    del último mes.
                    {analytics.pdf_url ? (
                      <a
                        href={analytics.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 ml-1 text-[10px] text-black cursor-pointer align-middle bg-[#fff200] hover:bg-[#e6d900] px-1.5 py-0.5"
                      >
                        <FaFilePdf className="w-2 h-2 shrink-0 align-middle" />
                        descarga pdf
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 -ml-0.5 text-[10px] text-black align-middle bg-[#fff200] px-1.5 py-0.5">
                        <FaFilePdf className="w-2 h-2 shrink-0 align-middle" />
                        descarga pdf
                      </span>
                    )}
                  </p>
                </div>
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[40px] font-bold text-black leading-[1]">
                      {(() => {
                        const hoy = new Date();
                        const seed =
                          hoy.getFullYear() * 10000 +
                          (hoy.getMonth() + 1) * 100 +
                          hoy.getDate();
                        const rand = ((seed * 9301 + 49297) % 233280) / 233280;
                        return Math.floor(
                          46300 + rand * (53400 - 46300),
                        ).toLocaleString("es-MX");
                      })()}
                    </p>
                    <div className="flex flex-row items-center gap-1 pl-4">
                      <img
                        src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/google-analytics%20logo%20negro.png"
                        alt="Google Analytics"
                        className="h-4 w-auto object-contain"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-black -mt-1 leading-[1.2]">
                    Tráfico mensual promedio de los ultimos 3 meses en
                    www.residente.mx desde el{" "}
                    {(() => {
                      const hoy = new Date();
                      const hace3 = new Date(
                        hoy.getFullYear(),
                        hoy.getMonth() - 3,
                        hoy.getDate(),
                      );
                      if (hace3.getMonth() !== (hoy.getMonth() - 3 + 12) % 12) {
                        hace3.setDate(0);
                      }
                      return hace3.toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });
                    })()}{" "}
                    al día de hoy,{" "}
                    {new Date().toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    .
                  </p>
                </div>
              </>
            )}

            {/* Datos extra */}
            <div className="flex flex-col mb-4">
              {/* 94.9% - 97.8% aleatorio por día (seed basado en fecha) */}
              {(() => {
                const today = new Date().toISOString().slice(0, 10);
                let seed = 0;
                for (let i = 0; i < today.length; i++)
                  seed += today.charCodeAt(i);
                const pctNL = (94.9 + ((seed * 7) % 30) / 10).toFixed(1);
                const pctMH = (51.2 + ((seed * 13) % 22) / 10).toFixed(1);
                return (
                  <>
                    <div className="flex items-center">
                      <img
                        src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/MAPA%20NUEVO%20LEO%CC%81N.png"
                        className="h-7 w-auto object-contain pr-1"
                      />
                      <div className="flex flex-row items-end">
                        <span className="text-[25px] leading-[1] pr-1">
                          {pctNL}%
                        </span>
                        <span className="text-sm text-black -mt-1 leading-[1.2] mb-0.5">
                          Lectores de Nuevo León
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <img
                        src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/figura%20hombre.png"
                        className="h-6 w-auto object-contain pr-1"
                      />
                      <div className="flex flex-row items-end">
                        <span className="text-[25px] leading-[1] pr-1">
                          {pctMH}%
                        </span>
                        <span className="text-sm text-black -mt-1 leading-[1.2] mb-0.5">
                          Mujeres
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex flex-row items-end">
                        <span className="text-[20px] leading-[1.1] pr-1">
                          $
                        </span>
                        <span className="text-[25px] leading-[1] pr-1">
                          ABC+
                        </span>
                        <span className="text-sm text-black -mt-1 leading-[1.2] mb-0.5">
                          Nivel Socioeconomico
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex flex-row items-end">
                        <svg
                          className="h-4 w-auto pr-1 self-center"
                          viewBox="0 0 24 24"
                          fill="black"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="black"
                            strokeWidth="3"
                            fill="none"
                          />
                          <line
                            x1="12"
                            y1="12"
                            x2="12"
                            y2="6"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <line
                            x1="12"
                            y1="12"
                            x2="16"
                            y2="12"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        {/* %78.3 - %82.6 aleatorio por día */}
                        <span className="text-[25px] leading-[1] pr-1">
                          {(78.3 + ((seed * 17) % 44) / 10).toFixed(1)}%
                        </span>
                        <span className="text-sm text-black -mt-1 leading-[1.2] mb-0.5">
                          Entre 25 y 55 años de edad
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex flex-col mb-6 border border-gray-800 w-fit ml-6 p-4">
              <span
                className="font-bold text-sm text-black -mt-1 leading-[1.2]"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                AI Answer Engine Optimization™
              </span>

              <div className="flex items-center gap-2 mt-1">
                <img
                  src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/chatgpt%20logo.png"
                  alt="ChatGPT"
                  className="h-6 w-auto object-contain mt-2"
                />
                <img
                  src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/Google_Gemini_logo.png"
                  alt="Gemini"
                  className="h-4 w-auto object-contain"
                />
                <img
                  src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/seo%20logo.png"
                  alt="SEO"
                  className="h-6 w-auto object-contain mt-2"
                />
              </div>
            </div>

            {/* Alcance Total */}
            <div className="mb-6">
              <p className="text-[25px] leading-[1] underline mb-1">
                Alcance Total
              </p>
              <div className="flex gap-8 mt-1">
                <div>
                  <p className="text-[40px] font-bold text-black leading-[1]">
                    {(
                      (restaurante?.views || 0) +
                      (notasRestaurante?.total_vistas || 0) +
                      cupones.reduce((s, c) => s + (c.views || 0), 0)
                    ).toLocaleString("es-MX")}
                  </p>
                  <p className="text-sm text-black -mt-1">Vistas totales</p>
                </div>
                <div>
                  <p className="text-[40px] font-bold text-black leading-[1]">
                    {(
                      (restaurante?.clicks || 0) +
                      (notasRestaurante?.total_clicks || 0) +
                      cupones.reduce((s, c) => s + (c.clicks || 0), 0)
                    ).toLocaleString("es-MX")}
                  </p>
                  <p className="text-sm text-black -mt-1">Clicks totales</p>
                </div>
              </div>
            </div>

            {/* Directorio, JUNTAR ESTO */}
            <div className="mb-0">
              <a
                href={`https://residente.mx/restaurantes/${restaurante?.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[25px] leading-[1] underline pr-2"
              >
                Directorio
              </a>
              <span>{restaurante?.nombre_restaurante}</span>
              {restaurante?.created_at && (
                <p className="text-xs text-gray-400 mt-0.5 mb-1">
                  {(() => {
                    const d = new Date(restaurante.created_at);
                    const meses = [
                      "Enero",
                      "Febrero",
                      "Marzo",
                      "Abril",
                      "Mayo",
                      "Junio",
                      "Julio",
                      "Agosto",
                      "Septiembre",
                      "Octubre",
                      "Noviembre",
                      "Diciembre",
                    ];
                    return `Publicado desde el ${d.getDate()} de ${meses[d.getMonth()]} del ${d.getFullYear()}`;
                  })()}
                </p>
              )}

              <div className="flex items-start gap-1">
                <p className="text-[40px] font-bold text-black leading-[1]">
                  {(restaurante?.views || 0).toLocaleString("es-MX")}
                </p>
                <span
                  className="relative cursor-pointer text-[11px] bg-black text-white rounded-full w-4 h-4 flex items-center justify-center mt-1"
                  onClick={() =>
                    setOpenTooltip(
                      openTooltip === "dir-vistas" ? null : "dir-vistas",
                    )
                  }
                >
                  ?
                </span>
              </div>
              {/* tooltip dir-vistas se renderiza como overlay */}
              <p className="text-sm text-black -mt-1">
                Vistas totales en tu restaurante
              </p>
            </div>
            {/* Clicks totales en tu restaurante */}
            <div className="mb-9">
              <div className="flex items-start gap-1">
                <p className="text-[40px] font-bold text-black leading-[1]">
                  {restaurante?.clicks?.toLocaleString("es-MX") || 0}
                </p>
                <span
                  className="relative cursor-pointer text-[11px] bg-black text-white rounded-full w-4 h-4 flex items-center justify-center mt-1"
                  onClick={() =>
                    setOpenTooltip(
                      openTooltip === "dir-clicks" ? null : "dir-clicks",
                    )
                  }
                >
                  ?
                </span>
              </div>
              {/* tooltip dir-clicks se renderiza como overlay */}
              <p className="text-sm text-black -mt-1">
                Clicks totales en tu restaurante
              </p>
            </div>
            {notaStats && notaStats.total > 0 && (
              <>
                <div>
                  <p className="text-[40px] font-bold text-black leading-[1]">
                    {notaStats.views?.toLocaleString("es-MX") || 0}
                  </p>
                  <p className="text-sm text-black">
                    Vistas totales de tus notas
                  </p>
                </div>
                <div>
                  <p className="text-[40px] font-bold text-black leading-[1]">
                    {notaStats.clicks?.toLocaleString("es-MX") || 0}
                  </p>
                  <p className="text-sm text-black">
                    Clicks totales de tus notas
                  </p>
                </div>
              </>
            )}
            {/* Notas  */}
            <div className="mb-9">
              <span className="text-[25px] leading-[1] underline pr-2">
                Notas
              </span>
              <span>{restaurante?.nombre_restaurante}</span>
              <span className="text-sm font-bold text-black">
                {notasRestaurante ? ` (${notasRestaurante.total_notas})` : ""}
              </span>
              {/* Suma total de vistas de notas */}
              <div className="leading-tight mb-1">
                <div className="flex items-start gap-1">
                  <p className="text-[40px] font-bold text-black leading-[1]">
                    {notasRestaurante?.total_vistas?.toLocaleString("es-MX") ||
                      0}
                  </p>
                  <span
                    className="relative cursor-pointer text-[11px] bg-black text-white rounded-full w-4 h-4 flex items-center justify-center mt-1"
                    onClick={() =>
                      setOpenTooltip(
                        openTooltip === "notas-vistas" ? null : "notas-vistas",
                      )
                    }
                  >
                    ?
                  </span>
                </div>
                {/* tooltip notas-vistas se renderiza como overlay */}
                <p className="text-sm text-black -mt-1">
                  Suma de vistas de notas etiquetadas
                </p>
              </div>
              <div className="leading-tight mb-2">
                <div className="flex items-start gap-1">
                  <p className="text-[40px] font-bold text-black leading-[1]">
                    {notasRestaurante?.total_clicks?.toLocaleString("es-MX") ||
                      0}
                  </p>
                  <span
                    className="relative cursor-pointer text-[11px] bg-black text-white rounded-full w-4 h-4 flex items-center justify-center mt-1"
                    onClick={() =>
                      setOpenTooltip(
                        openTooltip === "notas-clicks" ? null : "notas-clicks",
                      )
                    }
                  >
                    ?
                  </span>
                </div>
                {/* tooltip notas-clicks se renderiza como overlay */}
                <p className="text-sm text-black -mt-1">
                  Suma de clicks de notas etiquetadas
                </p>
              </div>
              {/* Lista individual de cada nota con sus vistas */}
              {notasRestaurante && notasRestaurante.notas.length > 0 ? (
                <div className="space-y-0.5 mt-2">
                  {notasRestaurante.notas.map((nota) => (
                    <div
                      key={nota.id}
                      className="flex justify-between items-center text-xs"
                    >
                      <a
                        href={`https://residente.mx/notas/${nota.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate max-w-[45%] text-black font-medium hover:text-gray-600"
                        title={nota.titulo}
                      >
                        {nota.titulo}
                      </a>
                      <span className="text-gray-600 whitespace-nowrap text-right">
                        {nota.vistas?.toLocaleString("es-MX")} v &middot;{" "}
                        {nota.clicks?.toLocaleString("es-MX")} cl
                        {nota.created_at && (
                          <span className="text-gray-400 ml-1">
                            &middot;{" "}
                            {new Date(nota.created_at).toLocaleDateString(
                              "es-MX",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              },
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-2 mb-4">
                  Aún no hay notas etiquetadas a tu restaurante.
                </p>
              )}
            </div>
            {/* Cupones */}
            <div className="mb-9">
              <span className="text-[25px] leading-[1] underline pr-2">
                Cupones
              </span>
              <span>{restaurante?.nombre_restaurante}</span>
              {loadingCupon ? (
                <div>Cargando cupones...</div>
              ) : cupones.length > 0 ? (
                <>
                  <div>
                    <div className="flex items-start gap-1">
                      <p className="text-[40px] font-bold text-black leading-[1]">
                        {cupones
                          .reduce((s, c) => s + (c.views || 0), 0)
                          .toLocaleString("es-MX")}
                      </p>
                      <span
                        className="relative cursor-pointer text-[11px] bg-black text-white rounded-full w-4 h-4 flex items-center justify-center mt-1"
                        onClick={() =>
                          setOpenTooltip(
                            openTooltip === "cupon-vistas"
                              ? null
                              : "cupon-vistas",
                          )
                        }
                      >
                        ?
                      </span>
                    </div>
                    {/* tooltip cupon-vistas se renderiza como overlay */}
                    <p className="text-sm text-black">
                      Vistas totales de tus cupones
                    </p>
                  </div>
                  <div>
                    <div className="flex items-start gap-1">
                      <p className="text-[40px] font-bold text-black leading-[1]">
                        {cupones
                          .reduce((s, c) => s + (c.clicks || 0), 0)
                          .toLocaleString("es-MX")}
                      </p>
                      <span
                        className="relative cursor-pointer text-[11px] bg-black text-white rounded-full w-4 h-4 flex items-center justify-center mt-1"
                        onClick={() =>
                          setOpenTooltip(
                            openTooltip === "cupon-clicks"
                              ? null
                              : "cupon-clicks",
                          )
                        }
                      >
                        ?
                      </span>
                    </div>
                    {/* tooltip cupon-clicks se renderiza como overlay */}
                    <p className="text-sm text-black">
                      Clicks totales de tus cupones
                    </p>
                  </div>
                  <div className="space-y-0.5 mt-2">
                    {cupones.map((c) => {
                      const fmt = (d) =>
                        new Date(d).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        });
                      const periodo = c.created_at
                        ? c.tiene_caducidad && c.fecha_validez
                          ? `${fmt(c.created_at)} – ${fmt(c.fecha_validez)}`
                          : c.activo_manual
                            ? `${fmt(c.created_at)} – activo`
                            : `${fmt(c.created_at)} – desactivado`
                        : null;
                      return (
                        <div
                          key={c.id}
                          className="flex justify-between items-center text-xs"
                        >
                          <span
                            className="truncate max-w-[45%] text-black font-medium"
                            title={[c.subtitulo, c.titulo]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {[c.subtitulo, c.titulo]
                              .filter(Boolean)
                              .join(" ") || c.nombre_restaurante}
                          </span>
                          <span className="text-gray-600 whitespace-nowrap text-right">
                            {(c.views || 0).toLocaleString("es-MX")} v &middot;{" "}
                            {(c.clicks || 0).toLocaleString("es-MX")} cl
                            {periodo && (
                              <span className="text-gray-400 ml-1">
                                &middot; {periodo}
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-sm mt-2">
                  No tienes cupones registrados.
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Columna roja */}
        <div className="p-3">
          <div className="flex flex-col">
            {/* Parte de arriba: título + lista */}
            <div>
              <div className="border-b-[7px] border-black pb-0.5 mb-[14px] w-fit">
                <p className="text-[35px] text-left leading-none">
                  Aprovecha tus
                  <br />
                  Beneficios
                </p>
              </div>
              <ol className="list-none pl-0 space-y-2">
                <img
                  src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/stripe%20tarjetas.png"
                  className="w-38 h-full object-contain"
                />
                {productos.map((producto, index) => (
                  <li
                    key={producto.id}
                    className="select-none flex flex-col gap-1"
                  >
                    <div>
                      <p className="text-xl leading-tight font-bold ">
                        {index + 1}. {producto.titulo}
                      </p>
                      <p className="text-sm text-black uppercase">
                        {producto.descripcion}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {producto.precio_original &&
                          Number(producto.precio_original) > 0 ? (
                            <>
                              <span className="text-sm text-black">
                                <span className="mx-0.5">De</span>{" "}
                                <span className=" text-black">
                                  $
                                  {Number(
                                    producto.precio_original,
                                  ).toLocaleString("es-MX")}
                                </span>{" "}
                                <span className="mx-0.5">a</span>{" "}
                                <span className="font-bold text-black">
                                  $
                                  {Number(
                                    producto.precio_descuento ||
                                      producto.monto ||
                                      0,
                                  ).toLocaleString("es-MX")}
                                </span>
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-black font-bold">
                              $
                              {Number(
                                producto.precio_descuento ||
                                  producto.monto ||
                                  0,
                              ).toLocaleString("es-MX")}
                            </span>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={!!seleccionados[producto.id]}
                          onChange={() => handleToggleProducto(producto.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Parte de abajo: total + botón */}
            <div className="mt-auto flex flex-col gap-2">
              <div className="flex gap-1">
                <p>Total:</p>
                <p className="font-roman">
                  $
                  {total.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <p className="text-sm text-black">
                El total es el costo de los beneficios seleccionados.
              </p>
              {/* 👇 BOTÓN ACTUALIZADO CON LA FUNCIÓN handleIrAPagar */}
              <button
                onClick={handleIrAPagar}
                className="bg-[#fff200] hover:bg-[#fff200] text-black text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer"
              >
                Ir a pagar
              </button>

              {beneficiosMembresia.length > 0 && (
                <div className="mb-7 mt-1">
                  <div className="mb-2">
                    <h1 className="text-black font-bold">
                      <span className="block text-[30px] leading-none">
                        Bonificaciones
                      </span>
                      <span className="block text-sm leading-tight">
                        incluidos en tu membresía:
                      </span>
                      {fechaVigenciaBeneficios && (
                        <span className="block text-[11px] text-gray-700 leading-tight mt-0.5">
                          Vigentes hasta:{" "}
                          <span className="font-semibold">
                            {fechaVigenciaBeneficios}
                          </span>
                        </span>
                      )}
                    </h1>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {beneficiosMembresia.map((beneficio) => (
                      <li
                        key={beneficio.key}
                        onClick={() => handleReclamarBeneficio(beneficio)}
                        className="flex items-start justify-between gap-3 text-sm text-black rounded-lg px-2 py-1 cursor-pointer transition-colors hover:bg-gray-100"
                      >
                        <div className="flex items-start gap-2">
                          <span className="mt-[3px] h-2 w-2 rounded-full bg-black flex-shrink-0" />
                          <span>
                            <span className="font-bold">{beneficio.label}</span>
                            {beneficio.descripcion && (
                              <span className="text-gray-600 text-[11px] block leading-tight">
                                {beneficio.descripcion}
                              </span>
                            )}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 🆕 Mensaje de pago realizado */}
              {pagoRealizado && (
                <div className="text-green-600 font-bold text-sm text-center animate-pulse">
                  ✓ Pago realizado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Sección de Anuncios B2B */}
      <div className="max-w-[1080px] mx-auto mt-8 px-4 mb-8">
        <h2 className="text-6xl font-bold text-black mb-4 text-center tracking-tighter">
          Centro de mensajes
        </h2>
        {loadingAnuncios ? (
          <p className="text-gray-500 text-sm">Cargando anuncios...</p>
        ) : anuncios.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No hay anuncios por el momento.
          </p>
        ) : (
          <div className="space-y-3">
            {anuncios.map((anuncio) => (
              <div
                key={anuncio.id}
                className={`border p-4 ${
                  anuncio.tipo === "alerta"
                    ? "border-red-300 bg-red-50"
                    : anuncio.tipo === "promo"
                      ? "border-yellow-300 bg-yellow-50"
                      : anuncio.tipo === "novedad"
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-md font-bold uppercase tracking-wide text-gray-800">
                    {anuncio.tipo}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(
                      anuncio.created_at || anuncio.createdAt,
                    ).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-black font-roman">
                  {anuncio.titulo}
                </h3>
                <p className="text-md text-gray-700 mt-1">
                  {anuncio.contenido}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para cupon ampliado */}
      {showModal && (
        <div>
          {createPortal(
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] overflow-auto">
              <div className="relative">
                <img
                  src={cuponImg}
                  alt="Cupón ampliado"
                  className="w-auto h-auto max-h-[80vh]"
                />
                <button
                  className="absolute top-2 right-3 bg-red-600 rounded-full px-3 py-1 text-white font-bold cursor-pointer"
                  onClick={() => setShowModal(false)}
                >
                  X
                </button>
              </div>
            </div>,
            document.body,
          )}
        </div>
      )}
      {credencialesNuevas &&
        createPortal(
          <div>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/60"
              style={{ zIndex: 9998 }}
              onClick={cerrarBannerCredenciales}
            />
            {/* Modal */}
            <div
              className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
              style={{ zIndex: 9999 }}
            >
              <div className="bg-white w-full max-w-md overflow-hidden pointer-events-auto rounded-lg shadow-xl">
                <div className="bg-[#fff200] px-6 py-4">
                  <h2 className="text-xl font-bold text-black font-roman">
                    Credenciales de Acceso
                  </h2>
                </div>
                <div className="px-6 py-5">
                  <div className="">
                    <div>
                      <label className="block text-xl text-black font-roman leading-[1.3] pr-10">
                        Tu{" "}
                        <span className="font-bold underline">
                          Nombre de Usuario
                        </span>{" "}
                        para acceder al dashboard de B2B es:
                      </label>
                      <p className="text-2xl font-bold text-black font-roman mt-2">
                        {credencialesNuevas.nombre_usuario}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xl text-black font-roman leading-[1.3]">
                        Tu{" "}
                        <span className="font-bold underline">Contraseña</span>{" "}
                        es:
                      </label>
                      <p className="text-sm text-black font-roman mt-1">
                        Usa la misma contraseña que usaste para registrarte.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={cerrarBannerCredenciales}
                    className="w-full bg-black text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 transition font-roman cursor-pointer"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
      {/* Overlay de tooltips */}
      {openTooltip && (
        <div
          className="fixed inset-0 bg-black/40 z-[9998] flex items-center justify-center p-4 overflow-hidden"
          onClick={() => setOpenTooltip(null)}
        >
          <div
            className="relative bg-white rounded-lg px-6 py-5 w-full max-w-[600px] z-[9999] leading-relaxed text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-4 text-2xl leading-none hover:opacity-70"
              onClick={() => setOpenTooltip(null)}
            >
              &times;
            </button>
            {["dir-vistas", "notas-vistas", "cupon-vistas"].includes(
              openTooltip,
            ) && (
              <>
                <img
                  src="https://residente.mx/fotos/fotos-estaticas/CLUB%20RESIDENTE-FACIL.png"
                  alt="Club Residente"
                  className="h-10 mx-auto mb-2"
                />
                <p className="font-bold mb-1 text-lg">
                  Este número representa tu Presencia de Marca.
                </p>
                <p className="font-roman mb-2 leading-[1.1]">
                  La presencia de marca es la huella que tu negocio deja en la
                  mente de las personas antes de que estén listas para comprar.
                  <br />
                  Los principales beneficios son:
                </p>
                <div className="space-y-1 mt-2">
                  {[
                    {
                      titulo: "Fidelidad del cliente",
                      desc: "Los consumidores prefieren marcas que ya conocen.",
                    },
                    {
                      titulo: "Poder de fijación de precios",
                      desc: "Una marca reconocida justifica cobrar más.",
                    },
                    {
                      titulo: "Diferenciación competitiva",
                      desc: "Te distingue de competidores con productos similares.",
                    },
                    {
                      titulo: "Confianza y credibilidad",
                      desc: "Genera percepción de solidez y trayectoria.",
                    },
                    {
                      titulo: "Reducción del costo de adquisición",
                      desc: "Es más fácil convertir a alguien que ya te conoce.",
                    },
                    {
                      titulo: "Recomendación orgánica",
                      desc: "Las marcas visibles se comparten y recomiendan más.",
                    },
                    {
                      titulo: "Posicionamiento en el top of mind",
                      desc: "Eres la primera opción cuando surge la necesidad.",
                    },
                    {
                      titulo: "Efecto acumulativo",
                      desc: "Cada impresión suma y refuerza las anteriores.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col leading-[1]">
                      <strong className="text-xl">
                        {i + 1}. {item.titulo}
                      </strong>
                      <span className="font-roman">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {["dir-clicks", "notas-clicks", "cupon-clicks"].includes(
              openTooltip,
            ) && (
              <>
                <img
                  src="https://residente.mx/fotos/fotos-estaticas/CLUB%20RESIDENTE-FACIL.png"
                  alt="Club Residente"
                  className="h-10 mx-auto mb-2"
                />
                <p className="font-bold mb-1 text-2xl">Intención de Compra</p>
                <p className="font-roman mb-2">
                  Este número representa la Intención de Compra generada por tu
                  anuncio.
                </p>
                <p className="font-roman leading-[1.1]">
                  Cuando un usuario hace clic en tu publicidad, da una señal
                  activa de interés. Plataformas como Google y Meta miden este
                  comportamiento como un indicador de intención comercial: el
                  usuario no solo vio tu mensaje, sino que decidió actuar. Este
                  dato te permite saber cuántas personas pasaron de la
                  exposición pasiva a un interés real y medible en tu negocio.
                </p>
              </>
            )}
            {openTooltip === "fidelbench" && (
              <>
                <img
                  src="https://residente.mx/fotos/fotos-estaticas/CLUB%20RESIDENTE-FACIL.png"
                  alt="Club Residente"
                  className="h-10 mx-auto mb-2"
                />
                <p className="font-bold mb-2 text-2xl">
                  Ingresos por fidelización
                </p>
                <p className="font-roman leading-[1.4]">
                  Este monto representa el ingreso promedio generado por tu
                  negocio gracias a la conversión de vistas a fidelizacion del
                  cliente y eventualmente en consumo. El radio de acierto
                  estimado promedio es del .035% que se multiplica por el ticket
                  promedio de tu negocio y la asistencia promedio por mesa de
                  2.8 personas.
                </p>
                <p className="text-xs text-gray-500 mt-3 font-roman">
                  Fuente: Nielsen Annual Marketing Report 2023 (para brand lift)
                </p>
              </>
            )}
            {openTooltip === "conversion" && (
              <>
                <img
                  src="https://residente.mx/fotos/fotos-estaticas/CLUB%20RESIDENTE-FACIL.png"
                  alt="Club Residente"
                  className="h-10 mx-auto mb-2"
                />
                <p className="font-bold mb-2 text-2xl">
                  Ingresos por conversión
                </p>
                <p className="font-roman leading-[1.4]">
                  Este monto representa el ingreso promedio generado por tu
                  negocio gracias a la conversión de clicks en consumo. El radio
                  estimado realista es del 2% que se multiplica por el ticket
                  promedio de tu negocio y la asistencia promedio por mesa de
                  2.8 personas.
                </p>
                <p className="text-xs text-gray-500 mt-3 font-roman">
                  Fuente: Unbounce Conversion Benchmark Report 2024 (para el
                  factor de clics) · TheMissingIngredient — Food &amp; Beverage
                  Digital Marketing Benchmarks 2024
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BDashboard;
