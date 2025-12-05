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

  // 🆕 Estado para productos y selección
  const [productos, setProductos] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [total, setTotal] = useState(0);
  
  // Estado para la fecha actual
  const [fechaActual, setFechaActual] = useState(new Date());

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
        console.error("Error al cargar productos B2B:", error);
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

      // Recalcular total con base en los seleccionados
      const nuevoTotal = productos.reduce((suma, producto, index) => {
        if (nuevoSeleccionados[producto.id]) {
          // El primer producto (index === 0) usa $24,000
          if (index === 0) {
            return suma + 24000;
          }
          // El segundo producto (index === 1) usa $4,000
          if (index === 1) {
            return suma + 4000;
          }
          // El tercer producto (index === 2) usa $5,000
          if (index === 2) {
            return suma + 5000;
          }
          return suma + Number(producto.monto);
        }
        return suma;
      }, 0);

      setTotal(nuevoTotal);
      return nuevoSeleccionados;
    });
  };

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
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
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
          } else if (response.status === 404) {
            // Si es 404, continuar con otros métodos de búsqueda
            console.log("⚠️ No se encontró usuario B2B con ese ID, intentando otros métodos");
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
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await response.json();
              console.log("✅ Datos por usuario_id:", data);
              if (Array.isArray(data) && data.length > 0) {
                // Si hay múltiples registros, buscar el que coincida con el usuario_id o usar el primero
                const registroCorrecto = data.find(reg => reg.usuario_id === usuario.id) || data[0];
                const idEncontrado = registroCorrecto.id;
                console.log("✅ b2b_id encontrado:", idEncontrado, "de", data.length, "registros");
                setB2bId(idEncontrado);
                setLoadingB2bId(false);
                return;
              } else if (data.id) {
                console.log("✅ b2b_id encontrado (objeto único):", data.id);
                setB2bId(data.id);
                setLoadingB2bId(false);
                return;
              }
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
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
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
      console.log("⚠️ No hay b2bId disponible para obtener suscripción");
      setLoadingSubscription(false);
      return;
    }

    console.log("🔍 Obteniendo suscripción para b2bId:", b2bId);
    setLoadingSubscription(true);
    setSubscriptionError(null);

    try {
      const apiUrl = import.meta.env.DEV
        ? `${urlApi}api/stripe-suscripciones/user-subscription/${b2bId}`
        : `https://admin.residente.mx/api/stripe-suscripciones/user-subscription/${b2bId}`;

      console.log("📡 Llamando a:", apiUrl);
      const response = await fetch(apiUrl);

      // Verificar el tipo de contenido antes de parsear
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Si no es JSON, probablemente es un error 404 o HTML
        if (response.status === 404) {
          // Antes de mostrar error, verificar si el usuario tiene suscripción activa
          if (usuario?.suscripcion === 1 || usuario?.suscripcion === true) {
            console.log('✅ Usuario tiene suscripción activa según objeto usuario (404 en API)');
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

      // Verificar si hay datos de suscripción (más flexible)
      if (data.success || data.subscription || data.suscripcionDB || data.subscription_id) {
        setSubscriptionData(data);
        console.log('✅ Información de suscripción obtenida:', data);
        // Limpiar error si se encontró información
        setSubscriptionError(null);
      } else {
        // También verificar si el usuario tiene suscripción en su objeto
        if (usuario?.suscripcion === 1 || usuario?.suscripcion === true) {
          console.log('✅ Usuario tiene suscripción activa según objeto usuario');
          setSubscriptionData({ suscripcionDB: { estado: 'active' }, sincronizado: false });
          setSubscriptionError(null);
        } else {
          setSubscriptionError('No se encontró una suscripción activa');
        }
      }
    } catch (error) {
      console.error('❌ Error obteniendo suscripción:', error);
      // Manejar errores de parsing de manera más amigable
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
      console.log('✅ Usuario tiene suscripción activa según objeto usuario:', usuario.suscripcion);
      // Si el usuario tiene suscripción activa pero no hay datos de API aún, mostrar estado activo
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
            <div className="flex items-center gap-3">
              
              
            </div>
          ) : (
            <div className="text-center py-2 text-gray-500">No tienes restaurantes registrados</div>
          )}

          {/* Botones alineados a la izquierda en columna */}
          <div className="flex flex-col gap-3 mt-4 items-start">
            <button
              onClick={handleEditar}
              disabled={!restaurante}
              className={`text-white text-[30px] font-bold px-3 py-1 mb-2 rounded transition-colors cursor-pointer ${restaurante ? 'bg-black hover:bg-black' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              MICROSITIO
            </button>
            <button
              onClick={handleVer}
              disabled={!restaurante}
              className={`text-white text-[30px] font-bold px-3 py-1 mb-2 rounded transition-colors cursor-pointer ${restaurante ? 'bg-black hover:bg-black' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              DESCUENTOS
            </button>
            <button
              onClick={handleCupones}
              className="bg-black hover:bg-black text-white text-[30px] font-bold px-3 py-1 mb-2 rounded transition-colors cursor-pointer"
            >
              CLASIFICADO
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
        {/* Columna verde - Estadísticas */}
        <div className="flex flex-col p-5">
          <p className="text-[35px] text-left mb-8 leading-none">Checa tus<br />Resultados</p>
          <div className="space-y-4">
            <div>
              <p className="text-[40px] font-bold text-black leading-tight">3,462</p>
              <p className="text-sm text-black">Alcance total del club Residente</p>
            </div>
            <div>
              <p className="text-[40px] font-bold text-black leading-tight">6,145</p>
              <p className="text-sm text-black">Page-views de TU MARCA en Gula NL Residente</p>
            </div>
            <div>
              <p className="text-[40px] font-bold text-black leading-tight">12,128</p>
              <p className="text-sm text-black">Page views de tumarca FUERA DE Gula NL Residente</p>
            </div>
            <div>
              <p className="text-[40px] font-bold text-black leading-tight">6,532</p>
              <p className="text-sm text-black">Clicks a tumarca (restaurantes y cupones)</p>
            </div>
          </div>
        </div>
        {/* Columna roja */}
        <div className="p-3">
          <div className="flex flex-col h-full">
            {/* Parte de arriba: título + lista */}
            <div>
              <p className="text-[35px] text-left mb-8 leading-none">Canjea tus<br />Beneficios</p>
              <ol>
                {productos.slice(0, 3).map((producto, index) => (
                  <li
                    key={producto.id}
                    className="select-none flex flex-col gap-3"
                  >
                    <div>
                      <p className="text-xl leading-tight font-bold">
                        {index === 0 
                          ? "Revista Residente" 
                          : index === 1 
                          ? "Pagina web Residente"
                          : index === 2
                          ? "Pagina web Residente"
                          : producto.titulo}
                      </p>
                      {index === 0 && (
                        <div>
                        <p className="text-sm text-black mb-1">
                          ANUNCIO EN REVISTA 1 PAGINA DE 
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-black">$24,000 A $9,900</p>
                          <input
                            type="checkbox"
                            checked={!!seleccionados[producto.id]}
                            onChange={() => handleToggleProducto(producto.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-left mb-3">
                        <button className="bg-black hover:bg-black text-white text-[15px] font-bold px-3 py-1 rounded transition-colors cursor-pointer">
                          Crea Tu Anuncio
                        </button>
                        </div>
                        </div>
                      )}
                        
                      {index === 1 && (
                        <div>
                        <p className="text-sm text-black mb-1">
                          BANNER SEMANAL WEB DE
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-black">$4,000 A $1,900</p>
                          <input
                            type="checkbox"
                            checked={!!seleccionados[producto.id]}
                            onChange={() => handleToggleProducto(producto.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-left mb-3">
                        <button className="bg-black hover:bg-black text-white text-[15px] font-bold px-3 py-1 rounded transition-colors cursor-pointer">
                          Crea Tu Banner
                        </button>
                        </div>
                        </div>
                        )}
                      {index === 2 && (
                        <div>
                        <p className="text-sm text-black mb-1">
                          NOTA PRINCIPAL PAGINA WEB DE
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-black">$5,000 A $1,000</p>
                          <input
                            type="checkbox"
                            checked={!!seleccionados[producto.id]}
                            onChange={() => handleToggleProducto(producto.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-left mb-3">
                        <button className="bg-black hover:bg-black text-white text-[15px] font-bold px-3 py-1 rounded transition-colors cursor-pointer">
                          Crea Tu Nota
                        </button>
                        </div>
                        </div>
                        )}
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
              <button className="bg-[#fff200] hover:bg-[#fff200] text-black text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer">
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
