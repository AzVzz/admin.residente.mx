import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context";
import { urlApi } from "../../api/url";

const CampanasNewsletter = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [campanas, setCampanas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampanas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${urlApi}api/newsletter/campanas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCampanas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error cargando campañas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampanas();
  }, [token]);

  const eliminarCampana = async (id) => {
    if (!confirm("¿Eliminar esta campaña?")) return;
    try {
      await fetch(`${urlApi}api/newsletter/campanas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampanas((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Error eliminando campaña");
    }
  };

  const estadoColor = (estado) => {
    if (estado === "enviada") return "bg-green-100 text-green-700";
    if (estado === "programada") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="max-w-[1080px] mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Campañas de Newsletter</h1>
        <Link
          to="/correos/nueva"
          className="bg-[#FFF200] text-black font-bold px-4 py-2 rounded hover:opacity-80 transition-opacity text-sm"
        >
          + Nueva campaña
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400" />
        </div>
      )}

      {error && <p className="text-red-500 text-center py-8">{error}</p>}

      {!isLoading && campanas.length === 0 && (
        <p className="text-center text-gray-500 py-12">
          No hay campañas aún.{" "}
          <Link to="/correos/nueva" className="text-blue-600 underline">
            Crear la primera
          </Link>
        </p>
      )}

      <div className="space-y-3">
        {campanas.map((c) => (
          <div
            key={c.id}
            className="border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold truncate">{c.nombre}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColor(c.estado)}`}>
                  {c.estado}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate mt-0.5">{c.asunto}</p>
              {c.enviada_en && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Enviada: {new Date(c.enviada_en).toLocaleDateString("es-MX")}
                </p>
              )}
              {c.programada_para && c.estado === "programada" && (
                <p className="text-xs text-blue-500 mt-0.5">
                  Programada: {new Date(c.programada_para).toLocaleString("es-MX")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.open(`${urlApi}api/newsletter/campanas/${c.id}/preview`, "_blank")}
                className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors"
              >
                Preview
              </button>
              {c.estado !== "enviada" && (
                <button
                  onClick={() => navigate(`/correos/editar/${c.id}`)}
                  className="text-xs border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                >
                  Editar
                </button>
              )}
              {c.estado !== "enviada" && (
                <button
                  onClick={() => eliminarCampana(c.id)}
                  className="text-xs text-red-500 border border-red-100 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampanasNewsletter;
