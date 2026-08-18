import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  listarBorradores,
  eliminarBorrador,
  tiempoRelativo,
} from "../../../../utils/borradores";

// Apartado de Recuperación: lista todos los borradores sin publicar (notas y
// restaurantes) guardados en este navegador, para continuarlos o eliminarlos.
const ListaBorradores = () => {
  const navigate = useNavigate();
  const [borradores, setBorradores] = useState(() => listarBorradores());

  const continuar = (b) => {
    if (b.tipo === "nota") {
      navigate(`/dashboard/nota/nueva?borrador=${encodeURIComponent(b.id)}`);
    } else {
      navigate(`/formulario?borrador=${encodeURIComponent(b.id)}`);
    }
  };

  const eliminar = (id) => {
    if (!window.confirm("¿Eliminar este borrador? No se puede deshacer.")) return;
    eliminarBorrador(id);
    setBorradores(listarBorradores());
  };

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display-bold">Recuperación de borradores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Aquí se guardan solas las notas y restaurantes que estás llenando,
            por si se cierra la pestaña o se va el internet.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
        >
          ← Volver al dashboard
        </Link>
      </div>

      {borradores.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500">No tienes borradores guardados.</p>
          <p className="text-sm text-gray-400 mt-1">
            Cuando escribas una nota o un restaurante, se guardará
            automáticamente y aparecerá aquí.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {borradores.map((b) => (
            <li
              key={b.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      b.tipo === "nota"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {b.tipo === "nota" ? "Nota" : "Restaurante"}
                  </span>
                  <span className="text-xs text-gray-400">
                    Guardado {tiempoRelativo(b.actualizado)}
                  </span>
                </div>
                <p className="font-medium text-gray-900 truncate">{b.titulo}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => continuar(b)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Continuar
                </button>
                <button
                  type="button"
                  onClick={() => eliminar(b.id)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListaBorradores;
