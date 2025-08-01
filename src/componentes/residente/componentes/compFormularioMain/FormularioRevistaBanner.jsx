import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { revistasPost } from "../../../api/revistasGet";

const FormularioRevistaBannerNueva = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    imagen_portada: null,
    imagen_banner: null,
    pdf: null,
  });
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState(null);
  const [postResponse, setPostResponse] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = e => setForm({ ...form, [e.target.name]: e.target.files[0] });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsPosting(true);
    setPostError(null);
    setPostResponse(null);
    try {
      await revistasPost(form);
      setPostResponse("Revista creada correctamente");
      setTimeout(() => navigate("/notas"), 1200);
    } catch (error) {
      setPostError("Error al crear la revista");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-[600px] mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200 px-8 py-8 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Nueva Revista
          </h1>
          <p className="text-gray-600 text-center mb-4">
            Llena los datos para crear una nueva revista/banner.
          </p>
          {postResponse && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-2 text-center">
              {postResponse}
            </div>
          )}
          {postError && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-2 text-center">
              {postError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              placeholder="Título"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF</label>
            <input
              type="file"
              name="pdf"
              onChange={handleFileChange}
              className="w-full"
              accept="application/pdf"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Portada</label>
            <input
              type="file"
              name="imagen_portada"
              onChange={handleFileChange}
              className="w-full"
              accept="image/*"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Banner</label>
            <input
              type="file"
              name="imagen_banner"
              onChange={handleFileChange}
              className="w-full"
              accept="image/*"
            />
          </div>
          <button
            type="submit"
            disabled={isPosting}
            className={`w-full py-2 px-4 font-bold rounded text-white bg-blue-600 hover:bg-blue-700 transition ${isPosting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isPosting ? "Guardando..." : "Crear Revista"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormularioRevistaBannerNueva;