import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { imgApi } from "../../api/url";
import { useAuth } from "../../Context";

const B2BDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const { saveToken, saveUsuario, usuario } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    saveToken(null);
    saveUsuario(null);
    navigate("/login");
  };

  const cuponImg = `${imgApi}fotos/tickets/promo_test_1764265100923.png`;

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
          <div className="flex items-center gap-3">
            <img
              src={`${imgApi}/_image?href=https%3A%2F%2Fresidente.mx%2F%2Ffotos%2Fplatillos%2Fsan-carlos%2Fsan-carlos1.webp&w=300&h=300&f=webp`}
              alt="San Carlos"
              className="w-[110px] h-[68px] object-cover rounded"
            />
            <div>
              <div className="font-bold text-base">San Carlos</div>
              <div className="text-gray-700 text-sm">Comida regional</div>
            </div>
          </div>
          <div className="flex flex-row gap-5">
            <button className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer">
              Editar restaurante
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer">
              Ver restaurante
            </button>
          </div>
          {/* Imagen de cupón y estado versión más pequeña */}
          <div className="mt-8 flex items-start gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-3 py-1 rounded transition-colors cursor-pointer">
              Ver mis Cupones
            </button>
          </div>
          <address className="flex flex-col mt-auto">
            <strong className="text-xs text-gray-900 font-roman">
              Diego Azael (nombre del responsable)
            </strong>
            <strong className="text-xs text-gray-900 font-roman">
              diegoazaelvazquez2016@gmail.com
            </strong>
            <strong className="text-xs text-gray-900 font-roman">
              8110000000
            </strong>
          </address>
        </div>
        {/* Columna verde */}
        <div className="flex flex-col items-center justify-center text-right bg-green-500/20 p-5">
          <p className="text-[40px] text-center">Analiticas</p>
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
        <div className="bg-red-500/20 p-5">
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
