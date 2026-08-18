import { tiempoRelativo } from "../../../../../utils/borradores";

// Aviso opt-in que aparece dentro del formulario cuando existe un borrador sin
// publicar. Nunca sobreescribe solo: el usuario decide recuperar o descartar.
const BannerRecuperacion = ({ borrador, onRecuperar, onDescartar }) => {
  if (!borrador) return null;

  return (
    <div className="max-w-[1080px] mx-auto mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-2">
          <svg
            className="h-5 w-5 flex-shrink-0 text-amber-500 mt-0.5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.492-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-amber-900">
            <p className="font-medium">
              Tienes un borrador sin publicar ({tiempoRelativo(borrador.actualizado)}).
            </p>
            <p className="text-amber-800">
              Puedes recuperar el texto que estabas escribiendo. Las imágenes se
              vuelven a adjuntar.
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onRecuperar}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md"
          >
            Recuperar
          </button>
          <button
            type="button"
            onClick={onDescartar}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 rounded-md"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerRecuperacion;
