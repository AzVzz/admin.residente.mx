import React from "react";
import PostPrincipal from "../../../componentes/residente/componentes/componentesColumna2/PostPrincipal";
import DirectorioVertical from "../../../componentes/residente/componentes/componentesColumna2/DirectorioVertical";
import PortadaRevista from "../../../componentes/residente/componentes/componentesColumna2/PortadaRevista";
import MainLateralPostTarjetas from "../../../componentes/residente/componentes/componentesColumna2/MainLateralPostTarjetas";
import BotonesAnunciateSuscribirme from "../../../componentes/residente/componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "../../../componentes/residente/componentes/componentesColumna1/Infografia";

const UanlListado = ({ notasUanl, onCardClick }) => (
  <div className="mt-8 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-10 gap-y-8">
    {/* Columna principal: todas las notas en grande */}
    <div className="flex flex-col gap-12">
      {notasUanl.map(nota => (
        <div id={`nota-${nota.id}`} key={nota.id}>
          <PostPrincipal post={nota} onClick={() => onCardClick(nota.id)} />
        </div>
      ))}
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

export default UanlListado;