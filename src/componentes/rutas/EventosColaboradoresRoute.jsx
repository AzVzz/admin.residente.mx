import { Navigate } from "react-router-dom";
import { useAuth } from "../Context";

const EventosColaboradoresRoute = ({ children }) => {
  const { usuario, token } = useAuth();

  if (!token || !usuario) {
    return <Navigate to="/registro" replace />;
  }

  if (usuario.rol?.toLowerCase() !== "colaborador_eventos") {
    return (
      <div className="max-w-[1080px] mx-auto py-10">
        <p className="text-red-600 font-semibold mb-4">
          No tienes permiso para acceder a esta sección.
        </p>
      </div>
    );
  }

  return children;
};

export default EventosColaboradoresRoute;
