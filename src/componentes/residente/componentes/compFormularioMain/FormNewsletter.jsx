import { useState } from "react";
import { bannerNewsletterCrear } from "../../../api/bannerNewsletterGet";

export default function FormNewsletter() {
  const [texto, setTexto] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    setImagen(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagenPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagenPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");
    try {
      await bannerNewsletterCrear({ texto, imagen });
      setMensaje("¡Banner actualizado correctamente!");
      setTexto("");
      setImagen(null);
      setImagenPreview(null);
    } catch (err) {
      setMensaje("Error: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-[600px] mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg border border-gray-200 px-8 py-8 space-y-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Nuevo Banner Newsletter
          </h1>
          <p className="text-gray-600 text-center mb-4">
            Llena los datos para crear o actualizar el banner del newsletter.
          </p>
          {mensaje && (
            <div
              className={`px-4 py-2 rounded mb-2 text-center ${
                mensaje.startsWith("¡")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {mensaje}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texto del banner
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Texto del banner"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen (JPG, PNG, WEBP)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImagenChange}
                className="hidden"
                id="imagen-newsletter"
              />
              {imagenPreview ? (
                <div className="space-y-3">
                  <img
                    src={imagenPreview}
                    alt="Preview"
                    className="mx-auto h-32 w-auto object-cover"
                  />
                  <p className="text-sm text-gray-600 mb-3">Imagen seleccionada</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => document.getElementById('imagen-newsletter').click()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Cambiar Imagen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImagenPreview(null);
                        setImagen(null);
                        document.getElementById('imagen-newsletter').value = '';
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
                      onClick={() => document.getElementById('imagen-newsletter').click()}
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
          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-2 px-4 font-bold rounded text-white bg-blue-600 hover:bg-blue-700 transition ${
              cargando ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {cargando ? "Subiendo..." : "Actualizar banner"}
          </button>
        </form>
      </div>
    </div>
  );
}