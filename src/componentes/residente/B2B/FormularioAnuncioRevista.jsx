import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { revistasPost } from "../../api/revistasGet";

const FormularioAnuncioRevista = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    imagen_portada: null,
    imagen_banner: null,
    pdf: null,
  });
  const [imagenPortadaPreview, setImagenPortadaPreview] = useState(null);
  const [pdfNombre, setPdfNombre] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState(null);
  const [postResponse, setPostResponse] = useState(null);
  const [imagenBannerPreview, setImagenBannerPreview] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImagenPortadaChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, imagen_portada: file });
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagenPortadaPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagenPortadaPreview(null);
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, pdf: file });
    setPdfNombre(file ? file.name : "");
  };

  const handleImagenBannerChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, imagen_banner: file });
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagenBannerPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagenBannerPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    setPostError(null);
    setPostResponse(null);
    try {
      await revistasPost(form);
      setPostResponse("Anuncio creado correctamente");
      setTimeout(() => {
        navigate("/dashboardb2b");
      }, 1500);
    } catch (error) {
      setPostError("Error al crear el anuncio. Por favor, intenta nuevamente.");
      console.error("Error al crear anuncio:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Crear Anuncio en Revista</h2>
            <button
              onClick={() => navigate("/dashboardb2b")}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {postResponse && (
            <div className="bg-green-100 text-green-800 px-4 py-3 rounded text-center">
              {postResponse}
            </div>
          )}
          {postError && (
            <div className="bg-red-100 text-red-800 px-4 py-3 rounded text-center">
              {postError}
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título del Anuncio <span className="text-red-500">*</span>
            </label>
            <input
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              placeholder="Ej: Promoción Especial de Verano"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Describe tu anuncio..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          {/* PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo PDF del Anuncio
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                name="pdf"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="hidden"
                id="pdf-anuncio"
              />
              {pdfNombre ? (
                <div className="space-y-3">
                  <p className="text-base text-gray-700 font-medium">{pdfNombre}</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => document.getElementById("pdf-anuncio").click()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Cambiar PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfNombre("");
                        setForm({ ...form, pdf: null });
                        document.getElementById("pdf-anuncio").value = "";
                      }}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 48 48">
                    <rect width="48" height="48" rx="8" fill="#F3F4F6" />
                    <path
                      d="M16 32h16M16 24h16M16 16h16"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <button
                    type="button"
                    onClick={() => document.getElementById("pdf-anuncio").click()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Elegir PDF
                  </button>
                  <p className="text-sm text-gray-500">PDF hasta 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Imagen Portada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen Portada
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                name="imagen_portada"
                accept="image/*"
                onChange={handleImagenPortadaChange}
                className="hidden"
                id="imagen-portada-anuncio"
              />
              {imagenPortadaPreview ? (
                <div className="space-y-3">
                  <img
                    src={imagenPortadaPreview}
                    alt="Preview"
                    className="mx-auto h-32 w-auto object-cover rounded"
                  />
                  <p className="text-sm text-gray-600">Imagen seleccionada</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => document.getElementById("imagen-portada-anuncio").click()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Cambiar Imagen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImagenPortadaPreview(null);
                        setForm({ ...form, imagen_portada: null });
                        document.getElementById("imagen-portada-anuncio").value = "";
                      }}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="text-base text-gray-600 mb-2">
                      Haz clic para seleccionar una imagen
                    </p>
                    <button
                      type="button"
                      onClick={() => document.getElementById("imagen-portada-anuncio").click()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Elegir Imagen
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">JPG, PNG, WEBP hasta 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Imagen Banner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen Banner
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                name="imagen_banner"
                accept="image/*"
                onChange={handleImagenBannerChange}
                className="hidden"
                id="imagen-banner-anuncio"
              />
              {imagenBannerPreview ? (
                <div className="space-y-3">
                  <img
                    src={imagenBannerPreview}
                    alt="Preview"
                    className="mx-auto h-32 w-auto object-cover rounded"
                  />
                  <p className="text-sm text-gray-600">Imagen seleccionada</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => document.getElementById("imagen-banner-anuncio").click()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Cambiar Imagen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImagenBannerPreview(null);
                        setForm({ ...form, imagen_banner: null });
                        document.getElementById("imagen-banner-anuncio").value = "";
                      }}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="text-base text-gray-600 mb-2">
                      Haz clic para seleccionar una imagen
                    </p>
                    <button
                      type="button"
                      onClick={() => document.getElementById("imagen-banner-anuncio").click()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Elegir Imagen
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">JPG, PNG, WEBP hasta 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/dashboardb2b")}
              className="flex-1 py-2 px-4 font-bold rounded text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPosting}
              className={`flex-1 py-2 px-4 font-bold rounded text-white bg-black hover:bg-gray-800 transition ${
                isPosting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isPosting ? "Guardando..." : "Crear Anuncio"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioAnuncioRevista;
