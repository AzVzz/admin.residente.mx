import Login from "../Login";
import LoginForm from "../LoginForm";
import BotonesAnunciateSuscribirme from "./componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "./componentes/componentesColumna1/Infografia";
import DirectorioVertical from "./componentes/componentesColumna2/DirectorioVertical";
import PortadaRevista from "./componentes/componentesColumna2/PortadaRevista";

const Registro = () => {
  return (
    <div className="grid grid-cols-[minmax(680px,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9 max-w-[1080px] mx-auto">
      <div className="flex flex-col">
        <div className="mb-8">
          <h1 className="text-[40px] mb-8">Inicia sesión con tu cuenta</h1>
          <LoginForm />
        </div>
        <div>
          <h2 className="text-[40px]">Ó registrate como...</h2>
          <div className="grid grid-cols-3">
            <div className="flex flex-col">
              <span className="leading-tight text-2xl">Usuario B2B</span>
              <a href="/registrob2b">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[250px] h-[40px]  bg-[#fff200] text-black text-sm uppercase"
                >
                  Registrarte en B2B
                </button>
              </a>
            </div>

            <div className="flex flex-col">
              <span className="leading-tight text-2xl">Invitado</span>
              <a href="/registrob2b">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[250px] h-[40px]  bg-[#fff200] text-black text-sm uppercase"
                >
                  Registrarte como invitado
                </button>
              </a>
            </div>

            <div className="flex flex-col">
              <span className="leading-tight text-2xl">Colaborador</span>
              <a href="/oped">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[250px] h-[40px]  bg-[#fff200] text-black text-sm uppercase"
                >
                  Registrarte como invitado
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
      </div>
    </div>
  );
};

export default Registro;
