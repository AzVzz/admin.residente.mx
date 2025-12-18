import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { imgApi, urlApi } from "../../api/url";
import { useAuth } from "../../Context";
import CancelSubscriptionButton from "./CancelSubscriptionButton";
import { cuponesGetActivos } from "../../api/cuponesGet";
import axios from 'axios';
// import FormularioBanner from "./FormularioBanner";

import CheckoutCliente from "./FormularioNuevoClienteB2b/TiendaClientes/CheckoutCliente";

const B2BDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [b2bId, setB2bId] = useState(null);
  const [loadingB2bId, setLoadingB2bId] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const { saveToken, saveUsuario, usuario, token } = useAuth();
  const navigate = useNavigate();
  const [restaurante, setRestaurante] = useState(null);
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
  
  // 🆕 Estado para mostrar mensaje de pago exitoso
  const [pagoRealizado, setPagoRealizado] = useState(false);

  // 👇 AGREGADO: URL de la API de tienda
  // En desarrollo usa el proxy de Vite, en producción usa la URL directa
  const API_URL = import.meta.env.DEV
    ? '/api/tienda'  // Usa el proxy configurado en vite.config.js
    : `${urlApi}api/tienda`;  // URL directa en producción

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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        window.history.replaceState({}, document.title, window.location.pathname);
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
        const res = await fetch("https://admin.residente.mx/api/productosb2b");
        if (!res.ok) throw new Error("Error al obtener productos");
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        // Error al cargar productos
      }
    };

    fetchProductos();
  }, []);

  // Actualizar fecha automáticamente cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setFechaActual(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

  // 🆕 Manejar selección de productos y total
  const handleToggleProducto = (id) => {
    setSeleccionados((prev) => {
      const nuevoSeleccionados = {
        ...prev,
        [id]: !prev[id],
      };

      // Recalcular total con base en los seleccionados usando precio_descuento de la API
      const nuevoTotal = productos.reduce((suma, producto) => {
        if (nuevoSeleccionados[producto.id]) {
          // Usar precio_descuento si existe, si no usar monto
          const precio = Number(producto.precio_descuento || producto.monto || 0);
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
        customerName: usuario?.nombre_usuario || b2bUser?.nombre_responsable || null,
        successUrl: successUrl,
        cancelUrl: cancelUrl,
      };
      
      console.log('📦 Enviando datos de pago:', paymentData);
      
      const resp = await axios.post(`${API_URL}/create-checkout-session`, paymentData);

      if (resp.data.url) {
        window.location.href = resp.data.url;
      } else {
        alert("No se pudo obtener la URL de pago.");
      }
    } catch (err) {
      console.error('❌ Error en pago:', err.response?.data || err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Error desconocido';
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
            const primerRestaurante = data[0];

            const detailResponse = await fetch(`${urlApi}api/restaurante/${primerRestaurante.slug}`);
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              setRestaurante(detailData);
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
      try {
        if (usuario?.id) {
          const response = await fetch(
            `${urlApi}api/usuariosb2b/user/${usuario.id}`
          );
          if (response.ok) {
            const data = await response.json();
            setB2bUser(data);
          }
        }
      } catch (error) {
        // Error al obtener usuario B2B
      }
    };

    if (usuario?.id) {
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

      if (usuario.id && usuario.rol === 'b2b') {
        try {
          const apiUrl = import.meta.env.DEV
            ? `${urlApi}api/usuariosb2b/${usuario.id}`
            : `https://admin.residente.mx/api/usuariosb2b/${usuario.id}`;

          const response = await fetch(apiUrl);

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

          const response = await fetch(apiUrl);

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await response.json();
              if (Array.isArray(data) && data.length > 0) {
                const registroCorrecto = data.find(reg => reg.usuario_id === usuario.id) || data[0];
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

          const response = await fetch(apiUrl);
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

      if (usuario.id && usuario.rol === 'b2b') {
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
        ? `${urlApi}api/stripe-suscripciones/user-subscription/${b2bId}`
        : `https://admin.residente.mx/api/stripe-suscripciones/user-subscription/${b2bId}`;

      const response = await fetch(apiUrl);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        if (response.status === 404) {
          if (usuario?.suscripcion === 1 || usuario?.suscripcion === true) {
            setSubscriptionData({
              suscripcionDB: {
                estado: 'active',
                nombre_plan: 'B2B Residente',
                facturas: 'month'
              },
              sincronizado: false
            });
            setSubscriptionError(null);
            return;
          }
          setSubscriptionError('No se encontró una suscripción activa');
          return;
        }
        throw new Error('La respuesta del servidor no es válida');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener la suscripción');
      }

      if (data.success || data.subscription || data.suscripcionDB || data.subscription_id) {
        setSubscriptionData(data);
        setSubscriptionError(null);
      } else {
        if (usuario?.suscripcion === 1 || usuario?.suscripcion === true) {
          setSubscriptionData({ suscripcionDB: { estado: 'active' }, sincronizado: false });
          setSubscriptionError(null);
        } else {
          setSubscriptionError('No se encontró una suscripción activa');
        }
      }
    } catch (error) {
      if (error.message.includes('JSON') || error.message.includes('Unexpected token')) {
        setSubscriptionError('No se encontró una suscripción activa');
      } else {
        setSubscriptionError(error.message || 'Error al obtener la suscripción');
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
            estado: 'active',
            nombre_plan: 'B2B Residente',
            facturas: 'month'
          },
          sincronizado: false
        });
        setSubscriptionError(null);
      }
    }
  }, [usuario]);

  // Obtener información de suscripción cuando b2bId esté disponible
  useEffect(() => {
    obtenerSuscripcion();
  }, [b2bId]);

  // Obtener el cupón del usuario
  useEffect(() => {
    const fetchCupones = async () => {
      setLoadingCupon(true);
      try {
        const cuponesActivos = await cuponesGetActivos();
        const misCupones = cuponesActivos.filter(c => c.user_id === usuario.id);
        setCupones(misCupones);
        setCupon(misCupones[0] || null); // Si quieres seguir mostrando el primero
      } catch (err) {
        setCupones([]);
        setCupon(null);
      } finally {
        setLoadingCupon(false);
      }
    };
    if (usuario) fetchCupones();
  }, [usuario]);

  const handleLogout = () => {
    saveToken(null);
    saveUsuario(null);
    navigate("/registro");
  };

  const handleEditar = () => {
    if (restaurante) {
      navigate(`/formulario/${restaurante.slug}`);
    } else {
      navigate('/formulario');
    }
  };

  {/*const handleVer = () => {
    if (restaurante) {
      navigate(`/restaurante/${restaurante.slug}`);
    }
  };*/}

  const handleCupones = () => {
    navigate("/dashboardtickets");
  };

  const handleFormularioPromo = () => {
    navigate('/promo');
  };

  const handleClasificado = () => {
    navigate('');
  };

  const cuponImg = `${imgApi}fotos/tickets/promo_test_1764265100923.png`;

  // Imagen por defecto si no hay restaurante o imagen
  const imagenRestaurante = restaurante?.imagenes?.[0]?.src
    ? (restaurante.imagenes[0].src.startsWith('http')
      ? restaurante.imagenes[0].src
      : `${imgApi}${restaurante.imagenes[0].src}`)
    : `${imgApi}/fotos/platillos/default.webp`;

  // Calcular total de interacciones de los cupones del usuario
  const totalInteraccionesCupones = cupones
    .filter(c => c.user_id === usuario.id)
    .reduce((suma, c) => suma + (c.total_interacciones || 0), 0);

  const totalViewsCupones = cupones.reduce((suma, c) => suma + (c.views || 0), 0);
  const totalClicksCupones = cupones.reduce((suma, c) => suma + (c.clicks || 0), 0);

  return (
    <div>
      {/* Barra superior del usuario */}
      <div className="w-full h-10 bg-[#fff200] flex items-center justify-end mt-2 pr-6">
        <span className="font-bold text-[14px] mr-3">
          {usuario?.nombre_usuario || "Usuario B2B"}
        </span>
        <img
          src={`${imgApi}/fotos/fotos-estaticas/Usuario-Icono.webp`}
          alt="Foto usuario"
          className="w-8 h-8 rounded-full object-cover border border-gray-300 mr-4"
        />
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1 rounded transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
      {/* Nombre del restaurante centrado */}
      {restaurante?.nombre_restaurante && (
        <div className="w-full flex flex-col justify-center items-center py-2">
          <h1 className="text-[80px] font-bold text-black">
            {restaurante.nombre_restaurante}
          </h1>
          <p className="text-lg text-black mt-2">
            {fechaActual.toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}
      {/* Grid de 3 columnas */}
      <div className="w-full grid grid-cols-3 my-0 relative">
        {/* Línea divisoria izquierda */}
        <div className="absolute left-[33.333%] top-0 w-[1px] h-[calc(117%-100px)] bg-gray-600"></div>
        {/* Línea divisoria derecha */}
        <div className="absolute left-[66.666%] top-0 w-[1px] h-[calc(117%-100px)] bg-gray-600"></div>

        {/* Columna azul */}
        <div className="flex flex-col p-3">
          <p className="text-[35px] text-left mb-8 leading-none">Crea tus<br />Contenidos</p>

          {loadingRestaurante ? (
            <div className="text-center py-2">Cargando restaurante...</div>
          ) : restaurante ? (
            <div className="flex items-center gap-3"></div>
          ) : (
            <div className="text-center py-2 text-gray-500 leading-[1.2] text-left font-roman">
              Aún no tienes un restaurante registrado.<br />
              Haz clic en MICROSITIO para crear tu restaurante y comenzar a personalizar tu espacio.
            </div>
          )}

          {/* Botones alineados a la izquierda en columna */}
          <div className="flex flex-col gap-3 mt-4 items-start">
            <button
              onClick={restaurante ? handleVer : () => navigate('/formulario')}
              className="bg-black hover:bg-black text-white text-[30px] font-bold px-3 py-1 mb-2 rounded transition-colors cursor-pointer w-60"
            >
              {restaurante ? 'MICROSITIO' : 'CREAR SITIO'}
            </button>
            <button
              onClick={handleCupones}
              className="bg-black hover:bg-black text-white text-[30px] font-bold px-3 py-1 mb-2 rounded transition-colors cursor-pointer w-60"
            >
              DESCUENTOS
            </button>
            <button
              onClick={handleClasificado}
              className="bg-black hover:bg-black text-white text-[30px] font-bold px-3 py-1 mb-2 rounded transition-colors cursor-pointer w-60"
            >
              CLASIFICADO
            </button>
          </div>
          <address className="flex flex-col mt-auto">
            <strong className="text-xs text-gray-900 font-roman">
              {b2bUser?.nombre_responsable ||
                b2bUser?.nombre_responsable_restaurante ||
                "Nombre no disponible"}
            </strong>
            <strong className="text-xs text-gray-900 font-roman">
              {b2bUser?.correo || "Correo no disponible"}
            </strong>
            <strong className="text-xs text-gray-900 font-roman">
              {b2bUser?.telefono || "Teléfono no disponible"}
            </strong>
          </address>
        </div>
        {/* Columna verde - Estadísticas */}
        <div className="flex flex-col p-5">
          <p className="text-[35px] text-left mb-8 leading-none">Checa tus<br />Resultados</p>
          <div className="space-y-4">
            <div>
              <p className="text-[40px] font-bold text-black leading-tight">
                {restaurante?.views?.toLocaleString("es-MX") || 0}
              </p>
              <p className="text-sm text-black">Vistas totales en tu restaurante</p>
            </div>
            <div>
              <p className="text-[40px] font-bold text-black leading-tight">
                {restaurante?.clicks?.toLocaleString("es-MX") || 0}
              </p>
              <p className="text-sm text-black">Clicks totales en tu restaurante</p>
            </div>
            {restaurante && (
              <div>
                <p className="text-[40px] font-bold text-black leading-tight">
                  {restaurante.total_interacciones?.toLocaleString("es-MX") || 0}
                </p>
                <p className="text-sm text-black">Total de interacciones (vistas y clicks) en tu restaurante</p>
              </div>
            )}
            {/* Mostrar cupón del usuario */}
            {/* Mostrar views y clicks del cupón del usuario */}
            {loadingCupon ? (
              <div>Cargando cupón...</div>
            ) : cupon ? (
              <>
                <div>
                  <p className="text-[40px] font-bold text-black leading-tight">
                    {cupon.views?.toLocaleString("es-MX") || 0}
                  </p>
                  <p className="text-sm text-black">Vistas totales de tu cupón</p>
                </div>
                <div>
                  <p className="text-[40px] font-bold text-black leading-tight">
                    {cupon.clicks?.toLocaleString("es-MX") || 0}
                  </p>
                  <p className="text-sm text-black">Clicks totales de tu cupón</p>
                </div>
                <div>
                  <p className="text-[40px] font-bold text-black leading-tight">
                    {cupon.total_interacciones?.toLocaleString("es-MX") || 0}
                  </p>
                  <p className="text-sm text-black">Total de interacciones (vistas y clicks) de tu cupón</p>
                </div>
              </>
            ) : (
              <div>No tienes cupones activos.</div>
            )}
          </div>
        </div>
        {/* Columna roja */}
        <div className="p-3">
          <div className="flex flex-col h-full">
            {/* Parte de arriba: título + lista */}
            <div>
              <p className="text-[35px] text-left mb-8 leading-none">Canjea tus<br />Beneficios</p>
              <ol>
                {productos.map((producto) => (
                  <li
                    key={producto.id}
                    className="select-none flex flex-col gap-3"
                  >
                    <div>
                      <p className="text-xl leading-tight font-bold">
                        {producto.titulo}
                      </p>
                      <div>
                        <p className="text-sm text-black mb-1 uppercase">
                          {producto.descripcion}
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-black">
                            {producto.precio_original ? (
                              <>
                                <span className="line-through text-gray-500">${Number(producto.precio_original).toLocaleString("es-MX")}</span>
                                {" "}
                              </>
                            ) : null}
                            ${Number(producto.precio_descuento || producto.monto || 0).toLocaleString("es-MX")}
                          </p>
                          <input
                            type="checkbox"
                            checked={!!seleccionados[producto.id]}
                            onChange={() => handleToggleProducto(producto.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-left mb-3">
                          <button className="bg-black hover:bg-black text-white text-[15px] font-bold px-3 py-1 rounded transition-colors cursor-pointer">
                            {producto.boton_texto || `Crea Tu ${producto.titulo?.split(' ')[0] || 'Contenido'}`}
                          </button>
                        </div>
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
              {/* 👇 BOTÓN ACTUALIZADO CON LA FUNCIÓN handleIrAPagar */}
              <button
                onClick={handleIrAPagar}
                className="bg-[#fff200] hover:bg-[#fff200] text-black text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer"
              >
                Ir a pagar
              </button>
              
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
            document.body
          )}
        </div>
      )}
    </div>
  );
};

export default B2BDashboard;
