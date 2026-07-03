import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../Context";
import { notasTodasGet } from "../../../api/notasCompletasGet";
import { notaDelete } from "../../../api/notaDelete";
import NotaCard from "./componentesListaNotas/NotaCard";

/**
 * Vista "Centro" del dashboard: lista SOLO las noticias que llegan del
 * formulario público "Centro de Noticias". Se identifican por la marca de
 * origen tipo_nota2="centro-noticias" (borrador y publicadas). Reusa el
 * endpoint /api/notas/todas con ese filtro y la tarjeta NotaCard.
 */
const MARCA_ORIGEN = "centro-noticias";
const POR_PAGINA = 15;

const CentroNoticiasDashboard = () => {
  const { token } = useAuth();
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [total, setTotal] = useState(0);

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    setError(null);
    try {
      const data = await notasTodasGet(token, pagina, POR_PAGINA, "", {
        tipo_nota2: MARCA_ORIGEN,
      });
      setNotas(Array.isArray(data?.notas) ? data.notas : []);
      setTotal(data?.total || 0);
      setTotalPaginas(
        data?.totalPages || Math.ceil((data?.total || 0) / POR_PAGINA),
      );
    } catch (err) {
      setError(err);
      setNotas([]);
    } finally {
      setCargando(false);
    }
  }, [token, pagina]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const eliminarNota = async (id) => {
    if (!window.confirm("¿Eliminar esta noticia? Esta acción no se puede deshacer.")) return;
    setEliminando(id);
    try {
      await notaDelete(id);
      await cargar();
    } catch {
      alert("Error al eliminar la noticia");
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="w-full">
      {/* Encabezado */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Centro de Noticias</h2>
        <p className="text-sm text-gray-500 mt-1">
          Noticias recibidas por el formulario público. Recuerda borrar el
          bloque “DATOS INTERNOS” del cuerpo antes de publicarlas.
        </p>
      </div>

      {/* Estados */}
      {cargando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden bg-white border border-gray-200 animate-pulse motion-reduce:animate-none"
              style={{ minHeight: "300px" }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">
            Ocurrió un error al cargar las noticias del formulario.
          </p>
          <button
            onClick={cargar}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : notas.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aún no hay noticias del formulario
          </h3>
          <p className="text-gray-500">
            Cuando alguien envíe el formulario público, aparecerá aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notas.map((nota) => (
              <NotaCard
                key={nota.id}
                nota={nota}
                onEliminar={eliminarNota}
                eliminando={eliminando}
              />
            ))}
          </div>

          {/* Paginación */}
          <div className="flex flex-col items-center mt-8 space-y-3">
            <div className="text-sm text-gray-600">
              {total} noticia{total === 1 ? "" : "s"} en total
            </div>
            {totalPaginas > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    pagina === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 cursor-pointer"
                  }`}
                >
                  ← Anterior
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  {pagina} / {totalPaginas}
                </span>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    pagina === totalPaginas
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 cursor-pointer"
                  }`}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CentroNoticiasDashboard;
