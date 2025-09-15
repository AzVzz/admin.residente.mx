import React from "react";

const GiveawayDescuentos = ({ giveaway }) => {
  if (!giveaway) {
    return (
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#fff300] py-8 text-center text-gray-700 font-semibold">
        Sin Giveaway semanal disponible.
      </div>
    );
  }

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#fff300] mb-4 mt-8">
      <div className="max-w-[1080px] w-full mx-auto flex flex-row gap-10 items-center">
        <div className="grid grid-cols-[1.2fr_1.8fr] gap-10">
          {/* Columna Izquierda: Imagen grande */}
          <div className="flex flex-row h-[228px] w-full mt-4 mb-4">
            <div className="flex-shrink-0 w-[180px] h-full flex items-center justify-center">
              <img
                src={giveaway.imagen}
                alt={giveaway.titulo}
                className="w-full h-full object-cover shadow-[4px_3px_2px_rgba(0,0,0,0.3)]"
              />
            </div>
            <div className="flex flex-col flex-1 ml-6 justify-center">
              <h2 className="text-black text-[22px] leading-6.5 whitespace-pre-line">
                {giveaway.titulo}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiveawayDescuentos;