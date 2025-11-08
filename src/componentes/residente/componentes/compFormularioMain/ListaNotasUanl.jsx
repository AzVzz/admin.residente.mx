import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../Context";
import { useLocation, useNavigate } from "react-router-dom";
import NotaCard from "./componentesListaNotas/NotaCard";
import SinNotas from "./componentesListaNotas/SinNotas";
import ErrorNotas from "./componentesListaNotas/ErrorNotas";
import { notasTodasGet } from "../../../api/notasCompletasGet"; // importa la función correcta

const notasPorPagina = 15;

const ListaNotasUanl = () => {
  const { token, usuario, saveToken, saveUsuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const topRef = useRef(null);

  useEffect(() => {
    if (!token || !usuario) {
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }
    setCargando(true);
    // Cambia aquí: usa notasTodasGet con el filtro tipo_nota: "Uanl"
    notasTodasGet(token, 1, "all", "", { tipo_nota: "Uanl" })
      .then(res => setNotas(res.notas || res))
      .catch(setError)
      .finally(() => setCargando(false));
  }, [token, usuario, location, navigate]);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [paginaActual]);

  // Calcular paginación local
  const totalNotas = notas.length;
  const totalPaginas = Math.ceil(totalNotas / notasPorPagina);
  const inicioIndice = (paginaActual - 1) * notasPorPagina;
  const finIndice = Math.min(inicioIndice + notasPorPagina, totalNotas);
  const notasPaginaActual = notas.slice(inicioIndice, finIndice);

  // Funciones de navegación local
  const irAPaginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };
  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };
  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaActual(pagina);
  };

  if (cargando) return <div className="py-12 text-center">Cargando...</div>;
  if (error) return <ErrorNotas error={error} onRetry={() => window.location.reload()} />;
  if (!notas.length) return <SinNotas />;

  return (
    <div ref={topRef} className="space-y-6 py-5">
      <h1 className="text-3xl font-bold text-black rounded-2xl py-1">Notas UANL</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notasPaginaActual.map(nota => (
          <NotaCard key={nota.id} nota={nota} />
        ))}
      </div>
      {/* Información de resultados y paginación */}
      <div className="flex flex-col items-center mt-8 space-y-4">
        <div className="text-sm text-gray-600">
          Mostrando {inicioIndice + 1} - {finIndice} de {totalNotas} notas
        </div>
        {totalPaginas > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={irAPaginaAnterior}
              disabled={paginaActual === 1}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${paginaActual === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              ← Anterior
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
                const mostrarPagina =
                  numero === 1 ||
                  numero === totalPaginas ||
                  (numero >= paginaActual - 2 && numero <= paginaActual + 2);

                if (!mostrarPagina) {
                  if (numero === paginaActual - 3 || numero === paginaActual + 3) {
                    return <span key={numero} className="px-2 py-2 text-gray-400">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={numero}
                    onClick={() => irAPagina(numero)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${numero === paginaActual
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {numero}
                  </button>
                );
              })}
            </div>
            <button
              onClick={irAPaginaSiguiente}
              disabled={paginaActual === totalPaginas}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${paginaActual === totalPaginas
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaNotasUanl;