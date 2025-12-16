import { useNavigate } from "react-router-dom";
import Login from "../Login";
import LoginForm from "../LoginForm";
import BotonesAnunciateSuscribirme from "./componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "./componentes/componentesColumna1/Infografia";
import DirectorioVertical from "./componentes/componentesColumna2/DirectorioVertical";
import PortadaRevista from "./componentes/componentesColumna2/PortadaRevista";

const Registro = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (respuesta) => {
    const rol = respuesta.usuario?.rol?.toLowerCase();

    if (rol === "b2b") {
      navigate("/dashboardb2b");
    } else if (rol === "colaborador") {
      navigate("/registrocolaboradores");
    } else if (rol === "residente" || rol === "invitado") {
      navigate("/notas");
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
            <h2 className="text-[40px] text-center mb-8">Ó registrate como...</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <a href="/registrob2b" className="group w-full flex flex-col items-center">

                  <button
                    type="submit"
                    className="font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[200px] h-[60px] bg-[#fff200] text-black flex items-center justify-center leading-tight"
                  >
                    Registrar Restaurante
                  </button>
                </a>
              </div>

              <div className="flex flex-col items-center">
                <a href="/registroinvitados" className="group w-full flex flex-col items-center">

                  <button
                    type="submit"
                    className="font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[200px] h-[60px] bg-[#fff200] text-black flex items-center justify-center leading-tight"
                  >
                    Registrar como invitado
                  </button>
                </a>
              </div>

              <div className="flex flex-col items-center">
                <a href="/registrocolaboradores" className="group w-full flex flex-col items-center">

                  <button
                    type="submit"
                    className="font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[200px] h-[60px] bg-[#fff200] text-black flex items-center justify-center leading-tight"
                  >
                    Registrar como colaborador
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Barra lateral */}
        <div className="flex flex-col items-end justify-start gap-10">
          <DirectorioVertical />
          <PortadaRevista />
          <BotonesAnunciateSuscribirme />
          <Infografia />
        </div>
      </div>
    </div>
  );
};

export default Registro;
