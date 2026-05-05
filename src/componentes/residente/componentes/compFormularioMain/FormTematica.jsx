import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../Context";
import {
  tematicaCrear,
  tematicaEditar,
  tematicaGetById,
} from "../../../../componentes/api/tematicasApi.js";

const FormTematica = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    color: "#FFF200",
    icon: "",
    estatus: "borrador",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const [isLoading, setIsLoading] = useState(esEdicion);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!esEdicion) return;
    (async () => {
      try {
        const data = await tematicaGetById(id, token);
        setForm({
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          color: data.color || "#FFF200",
          icon: data.icon || "",
          estatus: data.estatus || "borrador",
          fecha_inicio: data.fecha_inicio ? data.fecha_inicio.slice(0, 16) : "",
          fecha_fin: data.fecha_fin ? data.fecha_fin.slice(0, 16) : "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, token, esEdicion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setError("El nombre es requerido");
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        color: form.color || "#FFF200",
        icon: form.icon.trim() || null,
        estatus: form.estatus,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
      };

      if (esEdicion) {
        await tematicaEditar(id, payload, token);
      } else {
        await tematicaCrear(payload, token);
      }
      navigate("/tematicas");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="py-10 text-center text-gray-500">Cargando…</div>;

  return (
    <div className="max-w-[600px] mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        {esEdicion ? "Editar Temática" : "Nueva Temática"}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Día de las Madres"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            placeholder="Descripción interna de la temática"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
          />
        </div>

        {/* Estatus */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
          <div className="flex gap-4">
            {["borrador", "publicada"].map((op) => (
              <label key={op} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="estatus"
                  value={op}
                  checked={form.estatus === op}
                  onChange={handleChange}
                  className="accent-yellow-400"
                />
                <span className="capitalize text-sm">{op}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Solo las temáticas <strong>publicadas</strong> aparecen en el carrusel del sitio.
          </p>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Inicio</label>
            <input
              type="datetime-local"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <p className="text-xs text-gray-400 mt-1">Vacío = activa de inmediato</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fin</label>
            <input
              type="datetime-local"
              name="fecha_fin"
              value={form.fecha_fin}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <p className="text-xs text-gray-400 mt-1">Vacío = sin expiración</p>
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Color del carrusel</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="color"
              value={form.color}
              onChange={handleChange}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
            />
            <input
              type="text"
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="#FFF200"
              className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>
        </div>

        {/* Ícono */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">URL del ícono (opcional)</label>
          <input
            type="text"
            name="icon"
            value={form.icon}
            onChange={handleChange}
            placeholder="https://residente.mx/fotos/…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#FFF200] text-black font-bold px-6 py-2.5 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear temática"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/tematicas")}
            className="bg-gray-100 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormTematica;
