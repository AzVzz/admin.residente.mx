import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./Context";

// Menú de perfil del header de escritorio. Es el mismo que usa el sitio público
// (astro.residente.mx → components/auth/ProfileMenu.tsx):
//   sin sesión → solo "Login"
//   con sesión → nombre de usuario con menú (Dashboard, Registros, Cerrar sesión)
const PerfilMenuEscritorio = ({ oscuro = false }) => {
  const { usuario, logout } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, []);

  if (!usuario) {
    return (
      <Link to="/registro" className={`text-sm font-medium ${oscuro ? "text-white" : "text-black"}`} style={{ fontSize: "14px" }}>
        Login
      </Link>
    );
  }

  const rol = usuario.rol?.toLowerCase();
  const esB2B = rol === "b2b";
  const puedeVerRegistros = ["vendedor", "residente", "admin", "administrador"].includes(rol);
  const puedeRegistrarB2B =
    (usuario.rol === "residente" && usuario.permisos === "todos") ||
    (usuario.rol === "vendedor" && usuario.permisos === "vendedor");

  const cerrarSesion = () => {
    logout();
    window.location.href = "https://residente.mx";
  };

  const itemClase = "block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className={`flex items-center gap-1 text-sm font-medium ${oscuro ? "text-white hover:text-gray-300" : "text-black hover:text-gray-600"}`}
        style={{ fontSize: "14px" }}
        aria-label="Menú de perfil"
      >
        {usuario.nombre_usuario}
        <svg
          className={`h-3 w-3 transition-transform ${abierto ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {abierto && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded border border-gray-200 bg-white py-1 shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="truncate text-sm font-bold">{usuario.nombre_usuario}</p>
            <p className="text-xs capitalize text-gray-500">{usuario.rol}</p>
          </div>

          {esB2B ? (
            <Link to="/dashboardb2b" className={itemClase} onClick={() => setAbierto(false)}>
              Dashboard B2B
            </Link>
          ) : (
            <>
              <Link to="/dashboard" className={itemClase} onClick={() => setAbierto(false)}>
                Dashboard
              </Link>
              {puedeVerRegistros && (
                <Link to="/registro" className={itemClase} onClick={() => setAbierto(false)}>
                  Registros
                </Link>
              )}
              {puedeRegistrarB2B && (
                <Link to="/registrob2b" className={itemClase} onClick={() => setAbierto(false)}>
                  Registro B2B
                </Link>
              )}
            </>
          )}

          <button
            type="button"
            onClick={cerrarSesion}
            className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default PerfilMenuEscritorio;
