import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { imgApi, urlApi } from "../../api/url";
import { useAuth } from "../../Context";
import CancelSubscriptionButton from "./CancelSubscriptionButton";

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

  // Obtener restaurante
  useEffect(() => {
    const fetchRestaurante = async () => {
      try {
        if (!token) return;
        
        const response = await fetch(`${urlApi}api/restaurante/basicos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
        console.error("Error fetching restaurante:", error);
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
          const response = await fetch(`${urlApi}api/usuariosb2b/user/${usuario.id}`);
          if (response.ok) {
            const data = await response.json();
            setB2bUser(data);
          }
        }
      } catch (error) {
        console.error("Error fetching B2B user:", error);
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
        console.log("⚠️ No hay usuario disponible");
        setLoadingB2bId(false);
        return;
      }

      console.log("🔍 Obteniendo b2b_id para usuario:", usuario);

      // Primero verificar si el usuario ya tiene b2b_id directamente
      if (usuario.b2b_id) {
        console.log("✅ b2b_id encontrado en usuario:", usuario.b2b_id);
        setB2bId(usuario.b2b_id);
        setLoadingB2bId(false);
        return;
      }

      // Si el usuario tiene un id que podría ser el b2b_id
      if (usuario.id && usuario.rol === 'b2b') {
        console.log("🔍 Intentando usar usuario.id como b2b_id:", usuario.id);
        try {
          const apiUrl = import.meta.env.DEV
            ? `${urlApi}api/usuariosb2b/${usuario.id}`
            : `https://admin.residente.mx/api/usuariosb2b/${usuario.id}`;

          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const data = await response.json();
            console.log("✅ Datos obtenidos:", data);
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
        } catch (error) {
          console.log("⚠️ Error en primer intento:", error);
        }
      }

      // Intentar buscar por usuario_id si existe
      if (usuario.id) {
        try {
          const apiUrl = import.meta.env.DEV
            ? `${urlApi}api/usuariosb2b?usuario_id=${usuario.id}`
            : `https://admin.residente.mx/api/usuariosb2b?usuario_id=${usuario.id}`;

          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const data = await response.json();
            console.log("✅ Datos por usuario_id:", data);
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
        } catch (error) {
          console.log("⚠️ Error buscando por usuario_id:", error);
        }
      }

      // Intentar buscar por correo
      if (usuario.correo) {
        try {
          const apiUrl = import.meta.env.DEV
            ? `${urlApi}api/usuariosb2b?correo=${encodeURIComponent(usuario.correo)}`
            : `https://admin.residente.mx/api/usuariosb2b?correo=${encodeURIComponent(usuario.correo)}`;
          
          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            console.log("✅ Datos por correo:", data);
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
        } catch (error) {
          console.log("⚠️ Error buscando por correo:", error);
        }
      }

      // Si nada funciona, usar el id del usuario como último recurso (si es b2b)
      if (usuario.id && usuario.rol === 'b2b') {
        console.log("⚠️ Usando usuario.id como b2b_id (último recurso):", usuario.id);
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
        ? `/api/stripe-suscripciones/user-subscription/${b2bId}`
        : `https://admin.residente.mx/api/stripe-suscripciones/user-subscription/${b2bId}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener la suscripción');
      }

      if (data.success && (data.subscription || data.suscripcionDB)) {
        setSubscriptionData(data);
        console.log('✅ Información de suscripción obtenida:', data);
      } else {
        setSubscriptionError('No se encontró una suscripción activa');
      }
    } catch (error) {
      console.error('❌ Error obteniendo suscripción:', error);
      setSubscriptionError(error.message);
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Obtener información de suscripción cuando b2bId esté disponible
  useEffect(() => {
    obtenerSuscripcion();
  }, [b2bId]);

  const handleLogout = () => {
    saveToken(null);
    saveUsuario(null);
    navigate("/login");
  };

  const handleEditar = () => {
    if (restaurante) {
      navigate(`/formulario/${restaurante.slug}`);
    }
  };

  const handleVer = () => {
    if (restaurante) {
      navigate(`/restaurante/${restaurante.slug}`);
    }
  };

  const handleCupones = () => {
    navigate('/tickets/dashboard');
  };

  const cuponImg = `${imgApi}fotos/tickets/promo_test_1764265100923.png`;

  // Imagen por defecto si no hay restaurante o imagen
  const imagenRestaurante = restaurante?.imagenes?.[0]?.src
    ? (restaurante.imagenes[0].src.startsWith('http')
      ? restaurante.imagenes[0].src
      : `${imgApi}${restaurante.imagenes[0].src}`)
    : `${imgApi}/fotos/platillos/default.webp`;

  return (
    <div>
      {/* Barra superior del usuario */}
      <div className="w-full h-10 bg-[#fff200] flex items-center justify-end mt-4 pr-6">
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
      {/* Grid de 3 columnas */}
      <div className="w-full grid grid-cols-3">
        {/* Columna azul */}
        <div className="flex flex-col bg-blue-500/20 p-5">
          <p className="text-[40px] text-center">Mis Productos</p>

          {loadingRestaurante ? (
            <div className="text-center py-4">Cargando restaurante...</div>
          ) : restaurante ? (
            <div className="flex items-center gap-3">
              <img
                src={imagenRestaurante}
                alt={restaurante.nombre_restaurante}
                className="w-[110px] h-[68px] object-cover rounded"
              />
              <div>
                <div className="font-bold text-base">{restaurante.nombre_restaurante}</div>
                <div className="text-gray-700 text-sm">{restaurante.categoria || "Restaurante"}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No tienes restaurantes registrados</div>
          )}

          <div className="flex flex-row gap-5 mt-4">
            <button
              onClick={handleEditar}
              disabled={!restaurante}
              className={`text-white text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer ${restaurante ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Editar restaurante
            </button>
            <button
              onClick={handleVer}
              disabled={!restaurante}
              className={`text-white text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer ${restaurante ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Ver restaurante
            </button>
          </div>
          {/* Imagen de cupón y estado versión más pequeña */}
          <div className="mt-8 flex items-start gap-4">
            <button
              onClick={handleCupones}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer"
            >
              Ver mis Cupones
            </button>
          </div>
          <address className="flex flex-col mt-auto">
            <strong className="text-xs text-gray-900 font-roman">
              {b2bUser?.nombre_responsable || b2bUser?.nombre_responsable_restaurante || "Nombre no disponible"}
            </strong>
            <strong className="text-xs text-gray-900 font-roman">
              {b2bUser?.correo || "Correo no disponible"}
            </strong>
            <strong className="text-xs text-gray-900 font-roman">
              {b2bUser?.telefono || "Teléfono no disponible"}
            </strong>
          </address>
        </div>
        {/* Columna verde - Información de Suscripción */}
        <div className="bg-green-500/20 border-r border-gray-300 px-6 py-6">
          <h2 className="font-bold text-black text-center text-[30px] mb-4">Mi Suscripción</h2>
          <div className="space-y-4">
            {loadingSubscription ? (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-gray-500 text-sm text-center py-4">
                  Cargando información de suscripción...
                </div>
              </div>
            ) : subscriptionError ? (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-semibold">Estado:</span>
                  <span className="bg-red-500 text-white font-bold px-3 py-1 rounded text-sm">
                    Sin Suscripción
                  </span>
                </div>
                <div className="text-gray-600 text-sm mt-2">
                  <p className="text-red-600">{subscriptionError}</p>
                </div>
              </div>
            ) : subscriptionData ? (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-semibold">Estado:</span>
                  <span className={`${
                    subscriptionData.subscription?.status === 'active' || subscriptionData.suscripcionDB?.estado === 'active'
                      ? 'bg-green-500'
                      : subscriptionData.subscription?.status === 'canceled' || subscriptionData.suscripcionDB?.estado === 'canceled'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  } text-white font-bold px-3 py-1 rounded text-sm`}>
                    {subscriptionData.subscription?.status === 'active' || subscriptionData.suscripcionDB?.estado === 'active'
                      ? 'Activa'
                      : subscriptionData.subscription?.status === 'canceled' || subscriptionData.suscripcionDB?.estado === 'canceled'
                      ? 'Cancelada'
                      : subscriptionData.subscription?.status || subscriptionData.suscripcionDB?.estado || 'Desconocido'}
                  </span>
                </div>
                <div className="text-gray-600 text-sm space-y-1">
                  <p>
                    <span className="font-semibold">Plan:</span>{' '}
                    {subscriptionData.suscripcionDB?.nombre_plan || 
                     subscriptionData.subscription?.items?.data?.[0]?.price?.nickname || 
                     'B2B Residente'}
                  </p>
                  <p>
                    <span className="font-semibold">Pago:</span>{' '}
                    {subscriptionData.suscripcionDB?.facturas === 'month' 
                      ? 'Mensual' 
                      : subscriptionData.suscripcionDB?.facturas === 'year'
                      ? 'Anual'
                      : subscriptionData.subscription?.items?.data?.[0]?.price?.recurring?.interval === 'month'
                      ? 'Mensual'
                      : subscriptionData.subscription?.items?.data?.[0]?.price?.recurring?.interval === 'year'
                      ? 'Anual'
                      : subscriptionData.suscripcionDB?.facturas || 'Mensual'}
                  </p>
                  {subscriptionData.suscripcionDB?.monto && (
                    <p>
                      <span className="font-semibold">Monto:</span>{' '}
                      ${(subscriptionData.suscripcionDB.monto / 100).toFixed(2)}{' '}
                      {subscriptionData.suscripcionDB.moneda?.toUpperCase() || 'MXN'}
                    </p>
                  )}
                  {subscriptionData.suscripcionDB?.fecha_fin_periodo_actual && (
                    <p>
                      <span className="font-semibold">Próximo pago:</span>{' '}
                      {new Date(subscriptionData.suscripcionDB.fecha_fin_periodo_actual).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                  {subscriptionData.sincronizado && (
                    <p className="text-xs text-blue-600 mt-2">
                      ✅ Sincronizado automáticamente
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-gray-500 text-sm text-center py-4">
                  No hay información de suscripción disponible
                </div>
              </div>
            )}
            
            {/* Botón de cancelar suscripción */}
            {loadingB2bId ? (
              <div className="text-gray-500 text-sm text-center py-4">
                Cargando información de suscripción...
              </div>
            ) : (
              <div className="mt-2">
                {b2bId ? (
                  <CancelSubscriptionButton 
                    b2bId={b2bId}
                    onCancelSuccess={(data) => {
                      console.log("Suscripción cancelada:", data);
                      obtenerSuscripcion();
                    }}
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="text-red-500 text-sm text-center py-2">
                      ⚠️ No se pudo obtener el ID de suscripción
                    </div>
                    <div className="text-gray-500 text-xs text-center">
                      Usuario: {usuario?.id || 'N/A'} | Correo: {usuario?.correo || 'N/A'}
                    </div>
                    <div className="text-gray-500 text-xs text-center">
                      Por favor, contacta al soporte si necesitas cancelar tu suscripción.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Columna roja */}
        <div className="bg-red-500/20 p-5">
          <div className="flex flex-col h-full">
            {/* Parte de arriba: título + lista */}
            <div>
              <p className="text-[40px] text-center">Beneficios</p>
              <ol>
                <li className="select-none flex flex-col">
                  <p className="text-xl leading-tight">Producto 1</p>
                  <div className="flex flex-row justify-between">
                    <span className="text-lg leading-tight font-roman">
                      $ 1,200.00
                    </span>
                    <label className="cursor-pointer">
                      Agregar
                      <input type="checkbox" />
                    </label>
                  </div>
                </li>
              </ol>
            </div>

            {/* Parte de abajo: total + botón */}
            <div className="mt-auto flex flex-col gap-2">
              <div className="flex gap-1">
                <p>Total:</p>
                <p className="font-roman">$1,200</p>
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer">
                Ir a pagar
              </button>
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
