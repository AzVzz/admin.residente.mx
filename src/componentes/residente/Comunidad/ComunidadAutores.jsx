import React, { useState, useEffect } from "react";
import { useAuth } from "../../Context";
import {
  getComunidadAutores,
  crearComunidadAutor,
  editarComunidadAutor,
  eliminarComunidadAutor,
} from "../../api/comunidadAutoresApi";

// Pantalla de administración de la sección COMUNIDAD de la portada.
// Cada registro es un autor: nombre + foto (avatar). El avatar aparece en la
// portada junto a sus notas SIEMPRE que el "nombre" aquí coincida con el
// campo "autor" de sus notas (etiqueta "comunidad"). No liga por FK.
const ComunidadAutores = () => {
  const { token } = useAuth();

  const [autores, setAutores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  // Estado del formulario (sirve para crear y editar)
  const [editandoId, setEditandoId] = useState(null); // null = creando
  const [nombre, setNombre] = useState("");
  const [orden, setOrden] = useState(0);
  const [activo, setActivo] = useState(true);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const cargar = () => {
    setIsLoading(true);
    getComunidadAutores()
      .then((data) => setAutores(Array.isArray(data) ? data : []))
      .catch(() => setError("No se pudieron cargar los autores"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre("");
    setOrden(0);
    setActivo(true);
    setFoto(null);
    setFotoPreview(null);
    const input = document.getElementById("foto-comunidad");
    if (input) input.value = "";
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    setFoto(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setFotoPreview(null);
    }
  };

  const handleEditar = (autor) => {
    setEditandoId(autor.id);
    setNombre(autor.nombre || "");
    setOrden(autor.orden ?? 0);
    setActivo(autor.activo ?? true);
    setFoto(null);
    setFotoPreview(autor.foto || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    setError(null);
    setMensaje(null);
    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("orden", String(orden || 0));
      formData.append("activo", String(activo));
      if (foto) formData.append("foto", foto);

      if (editandoId) {
        await editarComunidadAutor(editandoId, formData, token);
        setMensaje("Autor actualizado correctamente");
      } else {
        await crearComunidadAutor(formData, token);
        setMensaje("Autor creado correctamente");
      }
      limpiarFormulario();
      cargar();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Error al guardar el autor. Revisa que hayas iniciado sesión como administrador.",
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este autor?")) return;
    setError(null);
    setMensaje(null);
    try {
      await eliminarComunidadAutor(id, token);
      setMensaje("Autor eliminado correctamente");
      if (editandoId === id) limpiarFormulario();
      cargar();
    } catch (err) {
      setError(err?.response?.data?.error || "Error al eliminar el autor");
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 text-left">
        {/* Columna formulario */}
        <div className="flex-[2]">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-lg border border-gray-200 px-8 py-8 space-y-6"
          >
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
              {editandoId ? "Editar autor de Comunidad" : "Nuevo autor de Comunidad"}
            </h1>

            {/* Tip: la liga con las notas es por NOMBRE */}
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm px-4 py-3 rounded">
              <strong>Importante:</strong> el <strong>nombre</strong> debe coincidir con
              el campo <strong>"autor"</strong> de las notas (etiqueta{" "}
              <em>comunidad</em>) para que el avatar se muestre junto a ellas. El match
              ignora mayúsculas y acentos.
            </div>

            {mensaje && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded text-center">
                {mensaje}
              </div>
            )}
            {error && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded text-center">
                {error}
              </div>
            )}

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del autor *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder='Ej: Carlos "Sosofróstico" Solares'
                className="w-full px-3 py-2 border rounded-md border-gray-300"
                required
              />
            </div>

            {/* Orden + Activo */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orden
                </label>
                <input
                  type="number"
                  value={orden}
                  onChange={(e) => setOrden(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 border rounded-md border-gray-300"
                />
                <span className="text-xs text-gray-500">Menor = aparece primero</span>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="activo-comunidad"
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="activo-comunidad" className="text-sm text-gray-700">
                  Activo
                </label>
              </div>
            </div>

            {/* Foto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto (avatar)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                  id="foto-comunidad"
                />
                {fotoPreview ? (
                  <div className="space-y-3">
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="mx-auto h-32 w-32 object-cover rounded-full"
                    />
                    <div className="flex gap-3 justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("foto-comunidad").click()
                        }
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Cambiar Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFoto(null);
                          setFotoPreview(null);
                          document.getElementById("foto-comunidad").value = "";
                        }}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-base text-gray-600">
                      Haz clic para seleccionar una imagen
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("foto-comunidad").click()
                      }
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Elegir Foto
                    </button>
                    <p className="text-sm text-gray-500">JPG, PNG, WEBP hasta 5MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPosting}
                className={`flex-1 py-2 px-4 font-bold rounded text-white bg-blue-600 hover:bg-blue-700 transition ${
                  isPosting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isPosting
                  ? "Guardando..."
                  : editandoId
                    ? "Guardar Cambios"
                    : "Crear Autor"}
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="flex-1 py-2 px-4 font-bold rounded text-white bg-gray-600 hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Columna lista */}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
            Autores de Comunidad
          </h2>
          {isLoading ? (
            <p className="text-center text-gray-500">Cargando...</p>
          ) : autores.length === 0 ? (
            <p className="text-center text-gray-500">Aún no hay autores.</p>
          ) : (
            <ul className="space-y-4" style={{ maxHeight: "600px", overflowY: "auto" }}>
              {autores.map((autor) => (
                <li
                  key={autor.id}
                  className="flex items-center gap-3 bg-white rounded-lg shadow-md p-4"
                >
                  <img
                    src={
                      autor.foto ||
                      "https://residente.mx/fotos/fotos-estaticas/residente-columna1/SinFoto.webp"
                    }
                    alt={autor.nombre}
                    className="w-16 h-16 object-cover rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {autor.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      Orden: {autor.orden ?? 0}
                      {" · "}
                      {autor.activo ? (
                        <span className="text-green-600">Activo</span>
                      ) : (
                        <span className="text-red-500">Inactivo</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditar(autor)}
                      className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(autor.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComunidadAutores;
