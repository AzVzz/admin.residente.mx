import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const MenuColaboradores = ({ vistaActiva, setVistaActiva }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const opciones = [
    { key: "colaboracion", label: "Colaboración" },
    { key: "consejo", label: "Consejo" },
  ];

  const handleSeleccionar = (opcion) => {
    setVistaActiva(opcion.key);
    // Actualizar la URL con el parámetro tipo
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tipo", opcion.key);
    navigate(`/colaboradores?${newParams.toString()}`, { replace: true });
    setMenuAbierto(false);
  };

  return (
    <div className="relative mb-6">


      {/* Menú desplegable */}
      {menuAbierto && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuAbierto(false)}
          ></div>
          {/* Menú */}
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl z-50 min-w-[200px] border border-gray-200">
            {opciones.map((opcion) => (
              <button
                key={opcion.key}
                onClick={() => handleSeleccionar(opcion)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors font-roman font-bold text-sm uppercase tracking-wide ${
                  vistaActiva === opcion.key
                    ? "bg-[#fff200] text-black"
                    : "text-gray-700"
                } ${
                  opcion.key === opciones[0].key
                    ? "rounded-t-lg"
                    : opcion.key === opciones[opciones.length - 1].key
                    ? "rounded-b-lg"
                    : ""
                }`}
              >
                {opcion.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MenuColaboradores;
