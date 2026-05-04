import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../Context";
import {
  mediaincGetTodas,
  mediaincBorrar,
  mediaincEditar,
} from "../api/mediaincApi";
import { imgApi } from "../api/url";
import FormularioMediainc from "./FormularioMediainc";

const CATEGORIAS = {
  empresas_mediaticas: "Empresas Mediaticas",
  proyectos_editoriales: "Proyectos Editoriales",
  proyectos_digitales: "Proyectos Digitales",
  inteligencia_negocios: "Inteligencia de Negocios",
};

const ListaMediainc = () => {
  const { token } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mediaincGetTodas(token);
      setProyectos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleEliminar = async (id) => {
    if (!window.confirm("Seguro que deseas eliminar este proyecto?")) return;
    try {
      await mediaincBorrar(id, token);
      setProyectos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleToggleActivo = async (proyecto) => {
    try {
      const formData = new FormData();
      formData.append("activo", !proyecto.activo);
      await mediaincEditar(proyecto.id, formData, token);
      setProyectos((prev) =>
        prev.map((p) =>
          p.id === proyecto.id ? { ...p, activo: !p.activo } : p
        )
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleGuardado = () => {
    setMostrarFormulario(false);
    setEditando(null);
    cargar();
  };

  const handleEditar = (proyecto) => {
    setEditando(proyecto);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNuevo = () => {
    setEditando(null);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setEditando(null);
  };

  const proyectosFiltrados =
    filtroCategoria === "todas"
      ? proyectos
      : proyectos.filter((p) => p.categoria === filtroCategoria);

  return (
    <div className="max-w-[1080px] mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Mediainc Proyectos ({proyectos.length})
        </h1>
        {!mostrarFormulario && (
          <button
            onClick={handleNuevo}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            + Nuevo Proyecto
          </button>
        )}
      </div>

      {mostrarFormulario && (
        <div className="mb-8">
          <FormularioMediainc
            proyecto={editando}
            onGuardado={handleGuardado}
            onCancelar={handleCancelar}
          />
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFiltroCategoria("todas")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filtroCategoria === "todas"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Todas
        </button>
        {Object.entries(CATEGORIAS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFiltroCategoria(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtroCategoria === key
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : proyectosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay proyectos{" "}
          {filtroCategoria !== "todas" && "en esta categoria"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {proyectosFiltrados.map((proyecto) => (
            <div
              key={proyecto.id}
              className={`bg-white rounded-xl overflow-hidden shadow-sm border transition-all ${
                !proyecto.activo ? "opacity-50" : ""
              }`}
            >
              {proyecto.imagen && (
                <img
                  src={`${imgApi}${proyecto.imagen.replace(/^\//, "")}`}
                  alt={proyecto.titulo}
                  className="w-full h-40 object-cover"
                />
              )}
              {!proyecto.imagen && (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400">
                  Sin imagen
                </div>
              )}
              <div className="p-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {CATEGORIAS[proyecto.categoria]}
                </span>
                <h3 className="font-bold text-gray-900 mt-1">
                  {proyecto.titulo}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {proyecto.descripcion}
                </p>
                {proyecto.link && (
                  <a
                    href={proyecto.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 block truncate"
                  >
                    {proyecto.link}
                  </a>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEditar(proyecto)}
                    className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActivo(proyecto)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      proyecto.activo
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    {proyecto.activo ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => handleEliminar(proyecto.id)}
                    className="py-1.5 px-3 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    X
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaMediainc;
