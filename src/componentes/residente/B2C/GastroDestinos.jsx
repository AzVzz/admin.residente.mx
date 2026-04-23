import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { urlApi } from "../../api/url";

const DESTINOS = [
  "Madrid",
  "París",
  "Londres",
  "Nueva York",
  "Barcelona",
  "Los Ángeles",
];

const DestinoSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (destino) => {
    onChange({ target: { name: "destino", value: destino } });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-left flex items-center justify-between"
      >
        <span className={value ? "text-black" : "text-gray-400"}>
          {value || "Selecciona tu destino"}
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {DESTINOS.map((d) => (
            <li
              key={d}
              onClick={() => handleSelect(d)}
              className={`px-4 py-2 cursor-pointer hover:bg-[#fff200] text-sm ${value === d ? "bg-[#fff200] font-bold" : ""}`}
            >
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const GastroDestinos = () => {
  const [searchParams] = useSearchParams();
  const pagoStatus = searchParams.get("pago");

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    destino: "",
    fecha_inicio: "",
    fecha_fin: "",
    dias: "",
    num_personas: "",
    edades: "",
    presupuesto: "",
    zona_estancia: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(pagoStatus === "exitoso");
  const [error, setError] = useState(pagoStatus === "cancelado" ? "El pago fue cancelado. Puedes intentarlo de nuevo." : "");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.nombre.trim() || !formData.correo.trim() || !formData.destino ||
        !formData.fecha_inicio || !formData.fecha_fin || !formData.dias ||
        !formData.num_personas || !formData.edades.trim() || !formData.presupuesto.trim() ||
        !formData.zona_estancia.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${urlApi}api/tienda/create-guia-destinos-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          successUrl: `${window.location.origin}/admin/guia-destinos?pago=exitoso`,
          cancelUrl: `${window.location.origin}/admin/guia-destinos?pago=cancelado`,
        }),
      });
      if (!res.ok) throw new Error("Error al iniciar el pago. Intenta de nuevo.");
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err.message || "Error al iniciar el pago. Intenta de nuevo.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-12 max-w-[640px] mx-auto">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-black leading-none mb-4">
          Guías de viaje<br />gastronómico
        </h1>
      </div>

      {enviado && (
        <div className="mb-6 flex items-center gap-3 bg-[#fff200] px-4 py-3 rounded-lg">
          <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-black font-bold text-sm">¡Solicitud enviada! En breve recibirás tu guía en tu correo.</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-bold text-black mb-1">
              Nombre            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-3 border bg-white border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-black mb-1">
              Correo electrónico            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="w-full px-4 py-3 border bg-white border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-bold text-black mb-1">
            Destino          </label>
          <DestinoSelect value={formData.destino} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-bold text-black mb-1">
              Inicio del viaje
            </label>
            <input
              type="date"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              onClick={(e) => e.target.showPicker?.()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-lg font-bold text-black mb-1">
              Fin del viaje
            </label>
            <input
              type="date"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
              onClick={(e) => e.target.showPicker?.()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-bold text-black mb-1">
              Días
            </label>
            <input
              type="number"
              name="dias"
              value={formData.dias}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 border bg-white border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-lg font-bold text-black mb-1">
              Número de personas
            </label>
            <input
              type="number"
              name="num_personas"
              value={formData.num_personas}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 border bg-white border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-bold text-black mb-1">
              Edades
            </label>
            <input
              type="text"
              name="edades"
              value={formData.edades}
              onChange={handleChange}
              className="w-full px-4 py-3 border bg-white border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-lg font-bold text-black mb-1">
              Presupuesto por día (Dolares)
            </label>
            <input
              type="text"
              name="presupuesto"
              value={formData.presupuesto}
              onChange={handleChange}
              className="w-full px-4 py-3 border bg-white border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-bold text-black mb-1">
            Zona de estancia
          </label>
          <input
            type="text"
            name="zona_estancia"
            value={formData.zona_estancia}
            onChange={handleChange}
            className="w-full px-4 py-3 border bg-white border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-black text-white font-bold text-lg rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Redirigiendo al pago…" : "Solicitar mi guía — $499/día"}
        </button>
      </form>
    </div>
  );
};

export default GastroDestinos;
