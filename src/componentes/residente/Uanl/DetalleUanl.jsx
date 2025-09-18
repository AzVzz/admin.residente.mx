import { useEffect } from "react";
import DetallePost from "../../../componentes/residente/componentes/DetallePost";
import DirectorioVertical from "../../../componentes/residente/componentes/componentesColumna2/DirectorioVertical";
import PortadaRevista from "../../../componentes/residente/componentes/componentesColumna2/PortadaRevista";
import BotonesAnunciateSuscribirme from "../../../componentes/residente/componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "../../../componentes/residente/componentes/componentesColumna1/Infografia";

const DetalleUanl = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-10 gap-y-8 pt-8">
      {/* Columna principal */}
      <div>
        <DetallePost />
      </div>
      {/* Columna lateral */}
      <div className="flex flex-col items-end justify-start gap-10">
        <DirectorioVertical />
        <PortadaRevista />
        <div className="pt-3">
          <BotonesAnunciateSuscribirme />
        </div>
        <Infografia />
      </div>
    </div>
  );
};

export default DetalleUanl;