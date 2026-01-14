import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MenuColaboradoresDashboard = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  const opciones = [
    { key: "colaboracion", label: "Colaboración", ruta: "/colaboradores?tipo=colaboracion" },
    { key: "consejo", label: "Consejo", ruta: "/colaboradores?tipo=consejo" },
  ];

  const handleSeleccionar = (opcion) => {
    navigate(opcion.ruta);
    setMenuAbierto(false);
  };

  return (
    <div className="relative">
      {/* Botón del menú hamburguesa */}
      <button
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="inline-flex items-center gap-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg cursor-pointer"
      >
        {/* Icono hamburguesa */}
        <div className="flex flex-col gap-1">
          <div className="w-4 h-0.5 bg-white"></div>
          <div className="w-4 h-0.5 bg-white"></div>
          <div className="w-4 h-0.5 bg-white"></div>
        </div>
        {/* Texto del menú */}
        <span className="font-roman uppercase tracking-wide">
          Colaboración o Consejo
        </span>
      </button>

      {/* Menú desplegable */}
      {menuAbierto && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuAbierto(false)}
          ></div>
          {/* Menú */}
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl z-50 min-w-[220px] border border-gray-200">
            {opciones.map((opcion) => (
              <button
                key={opcion.key}
                onClick={() => handleSeleccionar(opcion)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors font-roman font-bold text-sm uppercase tracking-wide ${
                  opcion.key === opciones[0].key
                    ? "rounded-t-lg"
                    : opcion.key === opciones[opciones.length - 1].key
                    ? "rounded-b-lg"
                    : ""
                } text-gray-700`}
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

export default MenuColaboradoresDashboard;
