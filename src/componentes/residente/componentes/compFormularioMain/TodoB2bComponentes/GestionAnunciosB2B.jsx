import React, { useState, useEffect } from "react";
import { urlApi } from "../../../../api/url";

const TIPOS = [
  { value: "info", label: "Info", color: "bg-gray-100 text-gray-700" },
  { value: "promo", label: "Promo", color: "bg-yellow-100 text-yellow-700" },
  { value: "alerta", label: "Alerta", color: "bg-red-100 text-red-700" },
  { value: "novedad", label: "Novedad", color: "bg-blue-100 text-blue-700" },
];

const GestionAnunciosB2B = ({ usuarios = [] }) => {
  const [anuncios, setAnuncios] = useState([]);
  const [loadingAnuncios, setLoadingAnuncios] = useState(true);

  // Form state
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [tipo, setTipo] = useState("info");
  const [destinatarioMode, setDestinatarioMode] = useState("todos"); // "todos" | "especificos"
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAnuncios();
  }, []);

  const fetchAnuncios = async () => {
    try {
      setLoadingAnuncios(true);
      const res = await fetch(`${urlApi}api/anuncios-b2b/todos`);
      if (!res.ok) throw new Error("Error al obtener anuncios");
      const data = await res.json();
      setAnuncios(data);
    } catch (error) {
      console.error("Error cargando anuncios:", error);
    } finally {
      setLoadingAnuncios(false);
    }
  };

  const resetForm = () => {
    setTitulo("");
    setContenido("");
    setTipo("info");
    setDestinatarioMode("todos");
    setSelectedUsers([]);
    setEditingId(null);
  };

  const handleEdit = (anuncio) => {
    setTitulo(anuncio.titulo);
    setContenido(anuncio.contenido);
    setTipo(anuncio.tipo);
    if (anuncio.destinatarios && Array.isArray(anuncio.destinatarios)) {
      setDestinatarioMode("especificos");
      setSelectedUsers(anuncio.destinatarios);
    } else {
      setDestinatarioMode("todos");
      setSelectedUsers([]);
    }
    setEditingId(anuncio.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) return;

    setSaving(true);
    try {
      const body = {
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        tipo,
        destinatarios:
          destinatarioMode === "especificos" && selectedUsers.length > 0
            ? selectedUsers
            : null,
      };

      const url = editingId
        ? `${urlApi}api/anuncios-b2b/${editingId}`
        : `${urlApi}api/anuncios-b2b`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al guardar anuncio");

      resetForm();
      await fetchAnuncios();
    } catch (error) {
      console.error("Error guardando anuncio:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este anuncio?")) return;
    try {
      const res = await fetch(`${urlApi}api/anuncios-b2b/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      await fetchAnuncios();
    } catch (error) {
      console.error("Error eliminando anuncio:", error);
    }
  };

  const toggleActive = async (anuncio) => {
    try {
      const res = await fetch(`${urlApi}api/anuncios-b2b/${anuncio.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !anuncio.activo }),
      });
      if (!res.ok) throw new Error("Error al cambiar estado");
      await fetchAnuncios();
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  const toggleUserSelection = (b2bId) => {
    setSelectedUsers((prev) =>
      prev.includes(b2bId)
        ? prev.filter((id) => id !== b2bId)
        : [...prev, b2bId],
    );
  };

  const getTipoStyle = (t) => TIPOS.find((x) => x.value === t)?.color || "";

  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        Anuncios B2B
      </h3>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-2 mb-4">
        <input
          type="text"
          placeholder="Titulo del anuncio"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          required
        />
        <textarea
          placeholder="Contenido del anuncio"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 resize-none"
          required
        />
        <div className="flex gap-2 items-center">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={destinatarioMode}
            onChange={(e) => {
              setDestinatarioMode(e.target.value);
              if (e.target.value === "todos") setSelectedUsers([]);
            }}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="todos">Todos los B2B</option>
            <option value="especificos">Usuarios especificos</option>
          </select>
        </div>

        {/* Selector de usuarios específicos */}
        {destinatarioMode === "especificos" && (
          <div className="border border-gray-200 rounded p-2 max-h-[120px] overflow-y-auto">
            {usuarios.length === 0 ? (
              <p className="text-xs text-gray-400">No hay usuarios B2B</p>
            ) : (
              usuarios.map((user) => (
                <label
                  key={user.b2b?.id || user.id}
                  className="flex items-center gap-2 py-0.5 text-xs cursor-pointer hover:bg-gray-50 px-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.b2b?.id)}
                    onChange={() => user.b2b?.id && toggleUserSelection(user.b2b.id)}
                    disabled={!user.b2b?.id}
                    className="rounded"
                  />
                  <span className="truncate">
                    {user.b2b?.nombre_responsable_restaurante ||
                      user.nombre_usuario ||
                      user.correo}
                  </span>
                  {user.b2b?.id && (
                    <span className="text-gray-400 ml-auto flex-shrink-0">
                      #{user.b2b.id}
                    </span>
                  )}
                </label>
              ))
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || !titulo.trim() || !contenido.trim()}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
          >
            {saving
              ? "Guardando..."
              : editingId
                ? "Actualizar"
                : "Crear anuncio"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-300 cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de anuncios */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loadingAnuncios ? (
          <p className="text-sm text-gray-400">Cargando...</p>
        ) : anuncios.length === 0 ? (
          <p className="text-sm text-gray-400">No hay anuncios</p>
        ) : (
          anuncios.map((anuncio) => (
            <div
              key={anuncio.id}
              className={`border rounded p-2.5 ${!anuncio.activo ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getTipoStyle(anuncio.tipo)}`}
                    >
                      {anuncio.tipo}
                    </span>
                    {anuncio.destinatarios ? (
                      <span className="text-[10px] text-orange-600 font-medium">
                        {anuncio.destinatarios.length} usuario
                        {anuncio.destinatarios.length !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-[10px] text-green-600 font-medium">
                        Todos
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {anuncio.titulo}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {anuncio.contenido}
                  </p>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(anuncio)}
                    className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${
                      anuncio.activo
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {anuncio.activo ? "On" : "Off"}
                  </button>
                  <button
                    onClick={() => handleEdit(anuncio)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(anuncio.id)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 cursor-pointer"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GestionAnunciosB2B;
