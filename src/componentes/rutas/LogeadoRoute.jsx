import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context";

const tokenVencido = (token) => {
  try {
    return jwtDecode(token).exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Deja pasar a cualquier usuario con sesión iniciada (cualquier rol).
// Si no hay sesión, o el token ya venció, lo manda a /registro y recuerda de
// dónde venía para regresarlo después de iniciar sesión.
const LogeadoRoute = ({ children }) => {
  const { usuario, token } = useAuth();
  const location = useLocation();

  if (!token || !usuario || tokenVencido(token)) {
    return <Navigate to="/registro" replace state={{ desde: location.pathname }} />;
  }

  return children;
};

export default LogeadoRoute;
