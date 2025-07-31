import React from "react";
import SinFoto from '../../../../../imagenes/ResidenteColumna1/SinFoto.png';

const TarjetaVerticalPost = () => (
    <div className="group relative bg-[#FFF200] transition-all duration-300 overflow-hidden cursor-pointer max-w-sm">
        <div className="flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 leading-[1] mb-2 group-hover:text-gray-700 transition-colors duration-200">
                Las Aliadas
            </h3>
            <div className="relative overflow-hidden">
                <div className="relative">
                    <img
                        src="https://estrellasdenuevoleon.com.mx/fotos/uploads/2025/07/las-aliadas.jpg"
                        alt="Restaurante"
                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
            </div>
            <div className="flex flex-col py-2">
                <div className="text-xl font-bold text-gray-900 leading-[1.2] mb-2 group-hover:text-gray-700 transition-colors duration-200">
                    29/7 día de la alita. Las Aliadas ya tienen su "Platillo Icónico de Nuevo León". ¿Ya las probaste?
                </div>
            </div>
        </div>
    </div>
);

const CincoNotasRRR = () => (
    <div className="grid grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((_, idx) => (
            <TarjetaVerticalPost key={idx} />
        ))}
    </div>
);

export default CincoNotasRRR;