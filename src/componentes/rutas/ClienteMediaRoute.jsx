import { Navigate } from "react-router-dom";
import { useAuth } from "../Context";

const ClienteMediaRoute = ({ children }) => {
  const { usuario, token } = useAuth();

  if (!token || !usuario) {
    return <Navigate to="/login?redirectTo=/dashboard-cliente" replace />;
  }

  if (usuario.rol?.toLowerCase() !== "cliente_media") {
    return (
      <div className="max-w-[1080px] mx-auto py-10 px-4">
        <p className="text-red-600 font-semibold mb-4">
          No tienes permiso para acceder al dashboard de cliente.
        </p>
      </div>
    );
  }

  return children;
};

export default ClienteMediaRoute;
