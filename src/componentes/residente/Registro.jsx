import { useNavigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Login from "../Login";
import LoginForm from "../LoginForm";
import BotonesAnunciateSuscribirme from "./componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "./componentes/componentesColumna1/Infografia";

// =============================================================================
// LAZY LOADING - Componentes de barra lateral (no críticos para primera pintura)
// =============================================================================
const DirectorioVertical = lazy(() => import("./componentes/componentesColumna2/DirectorioVertical"));
const PortadaRevista = lazy(() => import("./componentes/componentesColumna2/PortadaRevista"));

// Skeleton placeholder mientras cargan los componentes laterales
const SidebarSkeleton = () => (
  <div className="flex flex-col gap-10 w-full">
    {/* Skeleton para DirectorioVertical */}
    <div className="animate-pulse">
      <div className="h-12 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="flex gap-2">
        <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
      </div>
    </div>
    {/* Skeleton para PortadaRevista */}
    <div className="animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/2 mb-3"></div>
      <div className="h-48 bg-gray-200 rounded w-full"></div>
    </div>
  </div>
);

const Registro = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLoginSuccess = (respuesta) => {
    const rol = respuesta.usuario?.rol?.toLowerCase();

    if (rol === "b2b") {
      navigate("/dashboardb2b");
    } else if (rol === "colaborador") {
      navigate("/dashboard");
    } else if (rol === "residente" || rol === "invitado") {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9">
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex justify-center">
              <LoginForm onSuccess={handleLoginSuccess} />
            </div>
          </div>
          <div>
            <h2 className="text-[40px] text-center mb-8">
              Ó registrate como...
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <a
                  href="/admin/registrob2b"
                  className="group w-full flex flex-col items-center"
                >
                  <button
                    type="submit"
                    className="font-bold py-2 px-4 rounded w-full cursor-pointer max-w-[200px] h-[60px] bg-[#fff200] text-black flex items-center justify-center leading-tight"
                  >
                    RESTAURANTE
                  </button>
                </a>
              </div>

              <div className="flex flex-col items-center">
                <a
                  href="/admin/registroinvitados"
                  className="group w-full flex flex-col items-center"
                >
                  <button
                    type="submit"
                    className="font-bold py-2 px-4 rounded w-full cursor-pointer max-w-[200px] h-[60px] bg-[#fff200] text-black flex items-center justify-center leading-tight"
                  >
                    INVITADO
                  </button>
                </a>
              </div>

              <div className="flex flex-col items-center">
                <a
                  href="/admin/registrocolaboradores"
                  className="group w-full flex flex-col items-center"
                >
                  <button
                    type="submit"
                    className="font-bold py-2 px-4 rounded w-full cursor-pointer max-w-[200px] h-[60px] bg-[#fff200] text-black flex items-center justify-center leading-tight"
                  >
                    COLABORADOR
                  </button>
                </a>
              </div>

              <div className="flex flex-col items-center">
                <a
                  href="/admin/cuestionarioB2C"
                  className="group w-full flex flex-col items-center"
                >
                  <button
                    type="submit"
                    className="font-bold py-2 px-4 rounded w-full cursor-pointer max-w-[200px] h-[60px] bg-[#fff200] text-black flex items-center justify-center leading-tight"
                  >
                    RECURSOS HUMANOS
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Barra lateral con lazy loading */}
        <div className="flex flex-col items-end justify-start gap-10">
          <Suspense fallback={<SidebarSkeleton />}>
            <DirectorioVertical />
            <PortadaRevista />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Registro;

