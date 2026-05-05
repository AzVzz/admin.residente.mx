import React, { useState } from "react";
import { urlApi } from "../../../../api/url";
import { useAuth } from "../../../../Context";

const BENEFICIOS = [
  { key: "estudios_mercado", label: "Estudios de mercado" },
  { key: "revista_residente", label: "Revista Residente" },
  { key: "nota_publicitaria", label: "Nota publicitaria / 5 razones" },
  { key: "giveaway", label: "Giveaway" },
  { key: "suscripcion_extra", label: "2da membresía gratis" },
];

const INIT_FORM = {
  nombre_usuario: "",
  correo: "",
  password: "",
  nombre_responsable_restaurante: "",
  telefono: "",
  nombre_responsable: "",
  razon_social: "",
  numero_meses: "12",
  numero_sucursales: "1",
  estudios_mercado: false,
  revista_residente: false,
  nota_publicitaria: false,
  giveaway: false,
  suscripcion_extra: false,
};

const CrearUsuarioB2BModal = ({ onCreado, onCerrar }) => {
  const { token } = useAuth();
  const [form, setForm] = useState(INIT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${urlApi}api/usuariosb2b/crear-desde-admin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          numero_meses: parseInt(form.numero_meses, 10),
          numero_sucursales: parseInt(form.numero_sucursales, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear usuario");
      onCreado();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 rounded-t-xl">
          <h2 className="text-white font-bold text-lg">Crear usuario B2B desde admin</h2>
          <p className="text-indigo-100 text-sm mt-0.5">
            Se crea con suscripción activa y sus contenidos se marcarán como promovidos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Datos de acceso
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nombre de usuario *
                </label>
                <input
                  name="nombre_usuario"
                  value={form.nombre_usuario}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="restaurante_abc"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Correo *
                </label>
                <input
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Contraseña *
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Datos del restaurante / empresa
            </legend>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nombre del restaurante *
              </label>
              <input
                name="nombre_responsable_restaurante"
                value={form.nombre_responsable_restaurante}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Nombre del restaurante"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nombre del responsable
                </label>
                <input
                  name="nombre_responsable"
                  value={form.nombre_responsable}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Teléfono
                </label>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="81 0000 0000"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Razón social
              </label>
              <input
                name="razon_social"
                value={form.razon_social}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Razón social (opcional)"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Plan
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Duración del plan
                </label>
                <select
                  name="numero_meses"
                  value={form.numero_meses}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="6">6 meses</option>
                  <option value="9">9 meses</option>
                  <option value="12">12 meses</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Número de sucursales
                </label>
                <select
                  name="numero_sucursales"
                  value={form.numero_sucursales}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="1">1 sucursal</option>
                  <option value="2">2 sucursales</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Beneficios incluidos
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {BENEFICIOS.map((ben) => (
                <label key={ben.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name={ben.key}
                    checked={form[ben.key]}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-400"
                  />
                  {ben.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              disabled={loading}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear usuario B2B"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearUsuarioB2BModal;
