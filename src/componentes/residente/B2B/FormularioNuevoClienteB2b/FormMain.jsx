import React from "react";

const FormMain = () => {
  return (
    <div className="py-8">
      <img
        className="w-25 pb-5"
        src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/b2b%20logo%20completo.png"
      />

      <h1 className="leading-tight text-2xl">Suscripción B2B</h1>

      {/* Campo nombre del responsable */}
      <div>
        <label className="space-y-2 font-roman font-bold">
          Nombre del responsable*
        </label>
        <input
          type="text"
          placeholder="Nombre del responsable"
          className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
        />
      </div>

      <div>
        <label className="space-y-2 font-roman font-bold">
          Nombre comercial del restaurante*
        </label>
        <input
          type="text"
          placeholder="Nombre del responsable"
          className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
        />
      </div>

      <div>
        <label className="space-y-2 font-roman font-bold">Teléfono*</label>
        <input
          type="text"
          placeholder="Nombre del responsable"
          className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
        />
      </div>

      <div>
        <label className="space-y-2 font-roman font-bold">
          Correo Electrónico*
        </label>
        <input
          type="text"
          placeholder="Nombre del responsable"
          className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
        />
      </div>
    </div>
  );
};

export default FormMain;
