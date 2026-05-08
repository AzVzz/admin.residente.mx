import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context";
import { urlApi } from "../api/url";

// Guard para rutas que solo pueden ver usuarios con rol=residente y es_superadmin=true.
// El JWT actual no incluye es_superadmin, así que se consulta a /api/usuarios/:id.
const SuperadminRoute = ({ children }) => {
  const { usuario, token } = useAuth();
  const [estado, setEstado] = useState({ loading: true, esSuperadmin: false });

  useEffect(() => {
    const verificar = async () => {
      if (!token || !usuario || usuario.rol?.toLowerCase() !== "residente") {
        setEstado({ loading: false, esSuperadmin: false });
        return;
      }
      try {
        const res = await fetch(`${urlApi}api/usuarios/${usuario.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setEstado({ loading: false, esSuperadmin: false });
          return;
        }
        const data = await res.json();
        setEstado({
          loading: false,
          esSuperadmin: data?.es_superadmin === true,
        });
      } catch {
        setEstado({ loading: false, esSuperadmin: false });
      }
    };
    verificar();
  }, [token, usuario]);

  if (!token || !usuario) {
    return <Navigate to="/registro" replace />;
  }
  if (estado.loading) {
    return (
      <div className="max-w-[1080px] mx-auto py-10 text-gray-500">
        Verificando permisos…
      </div>
    );
  }
  if (!estado.esSuperadmin) {
    return (
      <div className="max-w-[1080px] mx-auto py-10">
        <p className="text-red-600 font-semibold mb-4">
          Esta sección está reservada a superadmins.
        </p>
      </div>
    );
  }
  return children;
};

export default SuperadminRoute;
