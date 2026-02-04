import React, { useState } from "react";
import DirectorioVertical from "../../../residente/componentes/componentesColumna2/DirectorioVertical";
import PortadaRevista from "../../componentes/componentesColumna2/PortadaRevista";

const CuestionarioB2C = () => {
  const [formData, setFormData] = useState({
    nombre_empresa: "",
    empleados_total_nl: "",
    // Segmento bajo (OPERATIVO)
    empleados_segmento_bajo: "",
    zona_geografica_bajo: "",
    // Segmento medio (OFICINA)
    empleados_segmento_medio: "",
    zona_geografica_medio: "",
    // Segmento alto (DIRECTIVO/VENTAS)
    empleados_segmento_alto: "",
    zona_geografica_alto: "",
    // Frecuencia
    frecuencia_envio: "", // "quincenal" o "semanal"
    // Día preferido (solo uno)
    dia_preferido: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDiaChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      dia_preferido: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre_empresa || !formData.empleados_total_nl) {
      setMessage({
        type: "error",
        text: "Por favor completa los campos obligatorios.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // Llamar a la API del backend
      const response = await fetch("https://admin.residente.mx/api/cuestionarios-b2c", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el formulario");
      }

      setMessage({
        type: "success",
        text: "¡Cuestionario enviado exitosamente! Gracias por tu participación.",
      });

      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        setFormData({
          nombre_empresa: "",
          empleados_total_nl: "",
          empleados_segmento_bajo: "",
          zona_geografica_bajo: "",
          empleados_segmento_medio: "",
          zona_geografica_medio: "",
          empleados_segmento_alto: "",
          zona_geografica_alto: "",
          frecuencia_envio: "",
          dia_preferido: "",
        });
        setMessage({ type: "", text: "" }); // También limpiar el mensaje
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: "error",
        text: error.message || "Error al enviar el formulario. Por favor intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-0 sm:max-w-[1080px] mx-auto py-4 sm:py-8">
      <div className="sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:gap-x-15 sm:gap-y-9">
        {/* Columna principal: formulario */}
        <div>
          <h1 className="text-2xl sm:text-[24px] leading-[1.2] font-bold mb-3 sm:mb-4 sm:text-center">
            CUESTIONARIO B2C
          </h1>
          <p className="mb-4 sm:text-center text-black leading-[1.2] text-sm sm:px-5">
            Este cuestionario nos ayudará a personalizar mejor nuestros servicios
            para tu empresa y tus empleados.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-0">
            {/* Nombre de la empresa */}
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Nombre de la empresa*
              </label>
              <input
                type="text"
                name="nombre_empresa"
                value={formData.nombre_empresa}
                onChange={handleInputChange}
                placeholder="Ingresa el nombre de tu empresa"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
                required
              />
            </div>

            {/* Cantidad de empleados en Nuevo León */}
            <div>
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Cantidad de empleados en Nuevo León*
              </label>
              <input
                type="number"
                name="empleados_total_nl"
                value={formData.empleados_total_nl}
                onChange={handleInputChange}
                placeholder="Ej. 150"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
                min="0"
                required
              />
            </div>
            
            {/* Titulo Operativo */}
            <div>
              <h2 className="text-2xl sm:text-[24px] leading-[1.2] font-bold mb-3 sm:mb-4">
                Operativo
              </h2>
            </div>

            {/* Segmento BAJO (OPERATIVO) */}
            <div className="sm:mb-4">
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Cantidad de empleados de segmento bajo (OPERATIVO)
              </label>
              <input
                type="number"
                name="empleados_segmento_bajo"
                value={formData.empleados_segmento_bajo}
                onChange={handleInputChange}
                placeholder="Ej. 80"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-2"
                min="0"
              />
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Zona geográfica de incidencia dentro de Nuevo León
              </label>
              <input
                type="text"
                name="zona_geografica_bajo"
                value={formData.zona_geografica_bajo}
                onChange={handleInputChange}
                placeholder="Ej. Monterrey, San Pedro, Santa Catarina"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-2"
              />
            </div>

            {/* Titulo Oficina */}
            <div>
              <h2 className="text-2xl sm:text-[24px] leading-[1.2] font-bold mb-3 sm:mb-4">
                Oficina
              </h2>
            </div>

            {/* Segmento MEDIO (OFICINA) */}
            <div className="sm:mb-4">
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Cantidad de empleados de segmento MEDIO (OFICINA)
              </label>
              <input
                type="number"
                name="empleados_segmento_medio"
                value={formData.empleados_segmento_medio}
                onChange={handleInputChange}
                placeholder="Ej. 50"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-2"
                min="0"
              />
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Zona geográfica de incidencia dentro de Nuevo León
              </label>
              <input
                type="text"
                name="zona_geografica_medio"
                value={formData.zona_geografica_medio}
                onChange={handleInputChange}
                placeholder="Ej. Monterrey, San Pedro, Santa Catarina"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
              />
            </div>

            {/* Titulo Directivo */}
            <div>
              <h2 className="text-2xl sm:text-[24px] leading-[1.2] font-bold mb-3 sm:mb-4">
                Directivo
              </h2>
            </div>

            {/* Segmento ALTO (DIRECTIVO O VENTAS) */}
            <div className="sm:mb-4">
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Cantidad de empleados de segmento ALTO (DIRECTIVO O VENTAS)
              </label>
              <input
                type="number"
                name="empleados_segmento_alto"
                value={formData.empleados_segmento_alto}
                onChange={handleInputChange}
                placeholder="Ej. 20"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-2"
                min="0"
              />
              <label className="block mb-1 sm:mb-0 sm:space-y-2 font-roman font-bold text-base sm:text-sm">
                Zona geográfica de incidencia dentro de Nuevo León
              </label>
              <input
                type="text"
                name="zona_geografica_alto"
                value={formData.zona_geografica_alto}
                onChange={handleInputChange}
                placeholder="Ej. Monterrey, San Pedro, Santa Catarina"
                className="bg-white w-full px-4 sm:px-3 py-4 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman text-lg sm:text-sm sm:mb-4"
              />
            </div>

            {/* Frecuencia de envío */}
            <div className="sm:mb-4">
              <label className="block mb-2 sm:mb-3 font-roman font-bold text-base sm:text-sm">
                Frecuencia con que se prefiere enviar cada correo CON BENEFICIOS
                PARA SUS EMPLEADOS
              </label>
              <div className="space-y-2 sm:space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="frecuencia_envio"
                    value="quincenal"
                    checked={formData.frecuencia_envio === "quincenal"}
                    onChange={handleInputChange}
                    className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-lg sm:text-sm font-family-roman">
                    Cada quincena
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="frecuencia_envio"
                    value="semanal"
                    checked={formData.frecuencia_envio === "semanal"}
                    onChange={handleInputChange}
                    className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-lg sm:text-sm font-family-roman">
                    Cada semana
                  </span>
                </label>
              </div>
            </div>

            {/* Día preferido */}
            <div className="sm:mb-4">
              <label className="block mb-2 sm:mb-3 font-roman font-bold text-base sm:text-sm">
                Día en que se prefiere enviar cada correo
              </label>
              <div className="space-y-2 sm:space-y-3">
                {[
                  { key: "lunes", label: "Lunes" },
                  { key: "jueves", label: "Jueves" },
                  { key: "viernes", label: "Viernes" },
                  { key: "sabado", label: "Sábado" },
                ].map((dia) => (
                  <label
                    key={dia.key}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="dia_preferido"
                      value={dia.key}
                      checked={formData.dia_preferido === dia.key}
                      onChange={handleDiaChange}
                      className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-lg sm:text-sm font-family-roman">
                      {dia.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mensaje de confidencialidad */}
            <div className="bg-gray-100 border-l-4 border-blue-500 p-4 sm:p-3 my-4 sm:my-6">
              <p className="text-xs sm:text-[11px] text-gray-700 leading-relaxed">
                <strong>ESTA INFORMACIÓN ES CONFIDENCIAL.</strong> NO SE
                COMPARTIRÁ CON NADIE. ES PARA USO ESTRICTO DEL EQUIPO DE
                ANÁLISIS DE NEGOCIOS CON EL FIN DE MEJORAR EL PRODUCTO OFRECIDO.
              </p>
            </div>

            {/* Mensajes de éxito/error */}
            {message.text && (
              <div
                className={`text-center font-bold mt-4 p-4 sm:p-3 rounded-lg sm:rounded ${
                  message.type === "success"
                    ? "text-green-600 bg-green-50 border border-green-200"
                    : "text-red-600 bg-red-50 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-bold py-5 sm:py-2 px-4 rounded-xl sm:rounded w-full cursor-pointer text-xl sm:text-base mt-2 sm:mt-4 ${
                isSubmitting
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-[#fff200] hover:bg-[#e6d900] text-black"
              }`}
            >
              {isSubmitting ? "Enviando..." : "Enviar cuestionario"}
            </button>
          </form>
        </div>

        {/* Barra lateral - solo desktop */}
        <div className="hidden sm:flex flex-col items-end justify-start gap-10">
          <DirectorioVertical />
          <PortadaRevista />
        </div>
      </div>
    </div>
  );
};

export default CuestionarioB2C;
