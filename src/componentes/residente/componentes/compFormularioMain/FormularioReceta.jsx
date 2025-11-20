import React, { useState } from "react";
import { urlApi } from "../../../api/url";

export default function FormularioReceta({ onCancelar, onEnviado }) {
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    descripcion: "",
    porciones: "",
    tiempo: "",
    ingredientes: "",
    preparacion: "",
    consejo: "",
    categoria: "",
    imagen: null,
    creditos: "",
    instagram: "",
  });

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Manejar cambios de input
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    });
  };

  // Enviar datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const data = new FormData(); 
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          data.append(key, value);
        }
      });

      const response = await fetch(`${urlApi}api/recetas`, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al enviar la receta");
      }

      setMensaje("Receta enviada correctamente.");
      setFormData({
        titulo: "",
        autor: "",
        descripcion: "",
        porciones: "",
        tiempo: "",
        ingredientes: "",
        preparacion: "",
        consejo: "",
        categoria: "",
        imagen: null,
        creditos: "",
        instagram: "",
      });
      
      // Ocultar el formulario después de enviar exitosamente
      if (onEnviado) {
        setTimeout(() => {
          onEnviado();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setMensaje("Hubo un error al enviar la receta: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="py-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white shadow-md rounded-2xl p-6 space-y-6 text-gray-800"
      >
        <h1 className="text-2xl font-bold text-center mb-4">
          Formulario de envío de receta
        </h1>
        <p className="text-sm text-gray-600 text-center">
          Llena todos los campos con precisión. Los textos deben ser breves, claros y sin emojis.
        </p>

        {mensaje && (
          <div
            className={`px-4 py-2 rounded mb-2 text-center ${
              mensaje.includes("correctamente")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {mensaje}
          </div>
        )}

        {/* Título */}
        <div>
          <label className="block font-semibold">Título de la receta</label>
          <input
            type="text"
            name="titulo"
            maxLength="100"
            required
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ej. Arroz caldoso con camarón seco y chile piquín"
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring"
          />
        </div>

        {/* Autor */}
        <div>
          <label className="block font-semibold">Autor / Creador</label>
          <input
            type="text"
            name="autor"
            maxLength="60"
            required
            value={formData.autor}
            onChange={handleChange}
            placeholder="Ej. Mamá de Roco"
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block font-semibold">Descripción corta</label>
          <textarea
            name="descripcion"
            maxLength="300"
            rows="3"
            required
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Breve contexto o idea del plato..."
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring"
          ></textarea>
        </div>

        {/* Porciones */}
        <div>
          <label className="block font-semibold">Porciones</label>
          <input
            type="text"
            name="porciones"
            maxLength="30"
            required
            value={formData.porciones}
            onChange={handleChange}
            placeholder="Ej. 4 porciones"
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring"
          />
        </div>

        {/* Tiempo */}
        <div>
          <label className="block font-semibold">Tiempo total</label>
          <input
            type="text"
            name="tiempo"
            maxLength="30"
            required
            value={formData.tiempo}
            onChange={handleChange}
            placeholder="Ej. 45 minutos"
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring"
          />
        </div>

        {/* Ingredientes */}
        <div>
          <label className="block font-semibold">Ingredientes</label>
          <textarea
            name="ingredientes"
            maxLength="500"
            rows="6"
            required
            value={formData.ingredientes}
            onChange={handleChange}
            placeholder="- 2 tazas de arroz\n- 1 litro de caldo de camarón\n- 1 chile piquín seco"
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring"
          ></textarea>
        </div>

        {/* Preparación */}
        <div>
          <label className="block font-semibold">Preparación / Método</label>
          <textarea
            name="preparacion"
            maxLength="1000"
            rows="8"
            required
            value={formData.preparacion}
            onChange={handleChange}
            placeholder="1. Sofríe el arroz...\n2. Agrega el caldo..."
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring"
          ></textarea>
        </div>

        {/* Consejo */}
        <div>
          <label className="block font-semibold">Consejo o toque personal (opcional)</label>
          <textarea
            name="consejo"
            maxLength="200"
            rows="2"
            value={formData.consejo}
            onChange={handleChange}
            placeholder="Ej. Puedes sustituir el camarón por setas..."
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring"
          ></textarea>
        </div>

        {/* Categoría */}
        <div>
          <label className="block font-semibold">Categoría</label>
          <select
            name="categoria"
            required
            value={formData.categoria}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring"
          >
            <option value="">Selecciona una opción</option>
            <option>Entrante</option>
            <option>Plato fuerte</option>
            <option>Postre</option>
            <option>Bebida</option>
            <option>Otro</option>
          </select>
        </div>

        {/* Imagen */}
        <div>
          <label className="block font-semibold">Imagen principal</label>
          <input
            type="file"
            name="imagen"
            accept=".jpg,.png"
            required
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring"
          />
          <p className="text-xs text-gray-400">Formato JPG o PNG, máx. 5MB</p>
        </div>

        {/* Créditos */}
        <div>
          <label className="block font-semibold">Créditos adicionales (opcional)</label>
          <input
            type="text"
            name="creditos"
            maxLength="100"
            value={formData.creditos}
            onChange={handleChange}
            placeholder="Fotografía: Dna Alanis"
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring"
          />
        </div>

        {/* Instagram */}
        <div>
          <label className="block font-semibold">Instagram o red del creador</label>
          <input
            type="text"
            name="instagram"
            maxLength="80"
            value={formData.instagram}
            onChange={handleChange}
            placeholder="@mamaderoco"
            className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring"
          />
        </div>


        {/* Botones */}
        <div className="flex gap-3">
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              disabled={cargando}
              className={`flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition ${
                cargando ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={cargando}
            className={`flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition ${
              cargando ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {cargando ? "Enviando..." : "Enviar receta"}
          </button>
        </div>
      </form>
    </div>
  );
}

