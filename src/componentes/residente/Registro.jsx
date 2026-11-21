import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "../Login";
import LoginForm from "../LoginForm";
import BotonesAnunciateSuscribirme from "./componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "./componentes/componentesColumna1/Infografia";

const Registro = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLoginSuccess = (respuesta) => {
    const rol = respuesta.usuario?.rol?.toLowerCase();

    // Si venía de una página protegida (p. ej. Legado), regresa ahí
    const desde = location.state?.desde;
    if (typeof desde === "string" && desde.startsWith("/")) {
      navigate(desde, { replace: true });
      return;
    }

    if (rol === "colaborador_eventos") {
      navigate("/dashboard-vivir-convivir/notas");
    } else if (rol === "cliente_media") {
      navigate("/dashboard-cliente");
    } else if (rol === "b2b") {
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
      <div className="grid grid-cols-1 gap-y-9">
        <div className="mx-auto flex w-full max-w-[900px] flex-col">
          <div className="mb-8">
            <div className="flex justify-center">
              <LoginForm onSuccess={handleLoginSuccess} />
            </div>
          </div>
          <div>
            <h2 className="text-[40px] text-center mb-8">
              Registro
            </h2>
            {/* Línea 1: registro de restaurantes (botones) */}
            <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
              <a href="/admin/registrob2b" className="block w-full">
                <button
                  type="button"
                  className="font-bold py-3 px-2 sm:px-6 rounded w-full cursor-pointer h-[68px] sm:h-[108px] bg-[#fff200] text-black flex items-center justify-center leading-tight"
                  aria-label="Registro de restaurante"
                >
                  <img
                    src="https://residente.mx/fotos/fotos-estaticas/dashboard/Club-Residente-negro-1795281969830.webp"
                    alt="Club Residente"
                    className="h-auto w-[84%] max-w-[240px] shrink-0 object-contain"
                    loading="lazy"
                    decoding="async"
                />
                </button>
              </a>
              <a href="/admin/registrob2b-texas" className="block w-full">
                <button
                  type="button"
                  className="font-bold py-3 px-2 sm:px-6 rounded w-full cursor-pointer h-[68px] sm:h-[108px] bg-[#fff200] text-black flex items-center justify-center leading-tight text-sm"
                  aria-label="Restaurantes Texas"
                >
                  <img
                    src="https://residente.mx/fotos/fotos-estaticas/dashboard/sur-de-texas-hd-1795281416339.webp"
                    alt="Sur de Texas"
                    className="h-full w-auto max-w-full shrink-0 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              </a>
              <a href="/admin/registrob2b-legado" className="block w-full">
                <button
                  type="button"
                  className="font-bold py-3 px-2 sm:px-6 rounded w-full cursor-pointer h-[68px] sm:h-[108px] bg-[#fff200] text-black flex items-center justify-center leading-tight"
                  aria-label="Legado"
                >
                  <img
                    src={`${import.meta.env.BASE_URL}legado/noreste-legado-boton.webp`}
                    alt="Legado Noreste"
                    width="520"
                    height="203"
                    className="h-6 sm:h-[52px] w-auto max-w-full shrink-0 object-contain"
                    decoding="async"
                  />
                </button>
              </a>
            </div>

            {/* Línea 2: invitado y colaborador, solo texto */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <a
                href="/admin/registroinvitados"
                className="px-2 py-1 font-bold text-black hover:underline"
              >
                INVITADO
              </a>
              <a
                href="/admin/registrocolaboradores"
                className="px-2 py-1 font-bold text-black hover:underline"
              >
                COLABORADOR
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;

