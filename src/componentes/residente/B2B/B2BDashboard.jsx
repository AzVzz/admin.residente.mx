import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { imgApi, urlApi } from "../../api/url";
import { useAuth } from "../../Context";

const B2BDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const { saveToken, saveUsuario, usuario, token } = useAuth();
  const navigate = useNavigate();
  const [restaurante, setRestaurante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [b2bUser, setB2bUser] = useState(null);

  // 🆕 Estado para productos y selección
  const [productos, setProductos] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [total, setTotal] = useState(0);

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

  // 🆕 Manejar selección de productos y total
  const handleToggleProducto = (id) => {
    setSeleccionados((prev) => {
      const nuevoSeleccionados = {
        ...prev,
        [id]: !prev[id],
      };

      // Recalcular total con base en los seleccionados
      const nuevoTotal = productos.reduce((suma, producto) => {
        if (nuevoSeleccionados[producto.id]) {
          return suma + Number(producto.monto);
        }
        return suma;
      }, 0);

      setTotal(nuevoTotal);
      return nuevoSeleccionados;
    });
  };
  useEffect(() => {
    const fetchRestaurante = async () => {
      try {
        // 1. Obtener lista de restaurantes del usuario
        const response = await fetch(`${urlApi}api/restaurante/basicos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // 2. Tomar el primero (asumiendo que B2B tiene uno principal)
            const primerRestaurante = data[0];

            // 3. Obtener detalles completos para la imagen
            const detailResponse = await fetch(
              `${urlApi}api/restaurante/${primerRestaurante.slug}`
            );
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              setRestaurante(detailData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching restaurante:", error);
      } finally {
        setLoading(false);
      }
    };

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
        console.error("Error fetching B2B user:", error);
      }
    };

    if (token) {
      fetchRestaurante();
      fetchB2BUser();
    }
  }, [token, usuario]);

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
    navigate("/tickets/dashboard");
  };

  const cuponImg = `${imgApi}fotos/tickets/promo_test_1764265100923.png`;

  // Imagen por defecto si no hay restaurante o imagen
  const imagenRestaurante = restaurante?.imagenes?.[0]?.src
    ? restaurante.imagenes[0].src.startsWith("http")
      ? restaurante.imagenes[0].src
      : `${imgApi}${restaurante.imagenes[0].src}`
    : `${imgApi}/fotos/platillos/default.webp`; // Fallback

  return (
    <div>
      {/* Barra superior del usuario */}
      <div className="w-full h-10 bg-[#fff200] flex items-center justify-between mt-4 px-2">
        <div>Logo del restaurante</div>
        <div>
          <span className="font-bold text-[14px] mr-3">
            {usuario?.nombre_usuario || "Usuario B2B"}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1 rounded transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Grid de 3 columnas */}
      <div className="w-full grid grid-cols-3 my-5">
        {/* Columna azul */}
        <div className="flex flex-col p-5">
          <p className="text-[40px] text-center">Mis Productos</p>

          {loading ? (
            <div className="text-center py-4">Cargando restaurante...</div>
          ) : restaurante ? (
            <div className="flex flex-col">
              <div className="">
                <div className="font-bold text-base">
                  {restaurante.nombre_restaurante}
                </div>
                <div className="text-gray-700 text-sm">
                  {restaurante.categoria || "Restaurante"}
                </div>
              </div>
              <img
                src={imagenRestaurante}
                alt={restaurante.nombre_restaurante}
                className="w-full max-w-[360px] h-[140px] object-cover object-center"
              />
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No tienes restaurantes registrados
            </div>
          )}

          <div className="flex flex-row gap-5 mt-4">
            <button
              onClick={handleEditar}
              disabled={!restaurante}
              className={`text-white text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer ${
                restaurante
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Editar restaurante
            </button>
            <button
              onClick={handleVer}
              disabled={!restaurante}
              className={`text-white text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer ${
                restaurante
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
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
        {/* Columna verde */}
        <div className="flex flex-col items-center justify-center text-right p-5 border-x-2 border-black/40">
          <p className="text-[40px] text-center mb-auto">Analiticas</p>
          <span className="">
            <p className="text-5xl">3,462</p>
            <span className="text-sm">Alcance total del club Residente</span>

            <p className="text-5xl">6,145</p>
            <span className="text-sm">
              Page-views de TU MARCA en Guia NL Residente
            </span>

            <p className="text-5xl">12,128</p>
            <span className="text-sm">
              Page views de tu marca FUERA DE Guia NL Residente
            </span>

            <p className="text-5xl">6,532</p>
            <span className="text-sm">
              Clicks a tu marca (restaurantes y cupones)
            </span>
          </span>
        </div>
        {/* Columna roja */}
        <div className="p-5">
          <div className="flex flex-col h-full">
            {/* Parte de arriba: título + lista */}
            <div>
              <p className="text-[40px] text-center">Beneficios</p>
              <ol>
                {productos.map((producto) => (
                  <li
                    key={producto.id}
                    className="select-none flex flex-col gap-3"
                  >
                    <p className="text-xl leading-tight">{producto.titulo}</p>
                    <div className="flex flex-row justify-between">
                      <span className="text-lg leading-tight font-roman">
                        $
                        {" " +
                          Number(producto.monto).toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </span>
                      <label className="cursor-pointer inline-flex items-center gap-1">
                        <span>Agregar</span>
                        <input
                          type="checkbox"
                          checked={!!seleccionados[producto.id]}
                          onChange={() => handleToggleProducto(producto.id)}
                        />
                      </label>
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
              <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer">
                Ir a pagar
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal para cupon ampliado */}
    </div>
  );
};

export default B2BDashboard;
