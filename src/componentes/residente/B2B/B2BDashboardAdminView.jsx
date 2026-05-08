import React from "react";
import { useParams } from "react-router-dom";
import B2BDashboard from "./B2BDashboard";

// Wrapper de la ruta admin: extrae el `userId` del cliente B2B desde la URL
// y lo pasa al dashboard como `viewAsUserId`. La protección de permisos vive
// en <SuperadminRoute> (ver App.jsx). El backend valida nuevamente que el
// solicitante sea residente con es_superadmin.
const B2BDashboardAdminView = () => {
  const { userId } = useParams();
  const idNum = Number(userId);
  if (!idNum) {
    return (
      <div className="max-w-[1080px] mx-auto py-10 text-red-600">
        ID de cliente inválido.
      </div>
    );
  }
  return <B2BDashboard viewAsUserId={idNum} />;
};

export default B2BDashboardAdminView;
