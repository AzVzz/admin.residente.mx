//src/componentes/rutas/B2BRoute.jsx

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context";

const B2BRoute = ({ children }) => {
  const { usuario, token } = useAuth();
  const location = useLocation();

  // Si no esta logeado mandar a /login
  if (!token || !usuario) {
    return (
      <Navigate
        to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  const rol = usuario.rol?.toLowerCase();

  // Está logueado pero no es B2B
  if (rol !== "b2b") {
    const destino = rol === "residente" ? "/notas" : "/";

    return (
      <div className="max-w-[1080px] mx-auto py-10">
        <p className="text-red-600 font-semibold mb-4">
          No tienes permiso para acceder a esta sección, no eres suscriptor B2B.
        </p>
      </div>
    );
  }

  // Permitir acceso sin verificar suscripción
  // Verificación de suscripción deshabilitada
  return children;
};
export default B2BRoute;
