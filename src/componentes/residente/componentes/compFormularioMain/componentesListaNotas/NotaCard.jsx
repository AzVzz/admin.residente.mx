import { Link } from "react-router-dom";

const NotaCard = ({ nota, onEliminar, eliminando }) => (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="p-5 flex flex-col h-full">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1 leading-5">
                            {nota.titulo}
                        </h2>
                        <p className="text-sm text-gray-500 mb-2">
                            {nota.autor} • {nota.fecha}
                        </p>
                    </div>
                    <span
                        className={`px-2 py-1 text-xs rounded-full ${nota.estatus === "publicada"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                            }`}
                    >
                        {nota.estatus === "publicada" ? "Publicada" : "Borrador"}
                    </span>
                </div>

                <h3 className="text-md text-gray-700 font-medium mb-3">
                    {/*nota.subtitulo*/}
                </h3>

                <p className="text-gray-600 mb-4">
                    {/*nota.descripcion?.substring(0, 100)}
            {nota.descripcion?.length > 100 ? "..." : ""*/}
                </p>
            </div>

            <div className="mt-auto flex items-center pt-0">
                <div className="flex space-x-2">
                    <Link
                        to={`/notas/editar/${nota.id}`}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                        <svg
                            className="h-5 w-5 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Editar
                    </Link>
                    <button
                        onClick={() => onEliminar(nota.id)}
                        disabled={eliminando === nota.id}
                        className="text-red-600 hover:text-red-800 flex items-center disabled:opacity-50"
                    >
                        {eliminando === nota.id ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 mr-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Eliminando...
                            </>
                        ) : (
                            <div className="flex cursor-pointer">
                                <svg
                                    className="h-5 w-5 mr-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Eliminar
                            </div>
                        )}
                    </button>
                </div>

                {nota.programar_publicacion && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded ml-2">
                        Programada
                    </span>
                )}
            </div>
        </div>
    </div>
);

export default NotaCard;