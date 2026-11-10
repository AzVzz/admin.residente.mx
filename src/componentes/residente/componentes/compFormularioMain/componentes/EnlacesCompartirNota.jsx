import { useState } from "react";
import { FaInstagram, FaFacebook, FaEnvelope } from "react-icons/fa";

const canales = [
  { nombre: "Instagram", key: "instagram", source: "instagram", medium: "social", icono: FaInstagram },
  { nombre: "Facebook", key: "facebook", source: "facebook", medium: "social", icono: FaFacebook },
  { nombre: "Correo", key: "correo", source: "newsletter", medium: "email", icono: FaEnvelope },
];

export default function EnlacesCompartirNota({ notaId, slug, fuentes, medios }) {
  const [mensaje, setMensaje] = useState("");
  if (!notaId || !slug?.trim()) return null;

  const destino = new URL(`https://residente.mx/notas/${encodeURIComponent(slug.trim())}`);
  function valores(valor) {
    if (valor && typeof valor === "object") return valor;
    if (typeof valor === "string") {
      try { return JSON.parse(valor); } catch { return {}; }
    }
    return {};
  }
  const fuentesGuardadas = valores(fuentes);
  const mediosGuardados = valores(medios);

  async function copiar(enlace, nombre) {
    try {
      await navigator.clipboard.writeText(enlace);
      setMensaje(`Enlace de ${nombre} copiado.`);
    } catch {
      setMensaje("No se pudo copiar. Selecciona el enlace y cópialo manualmente.");
    }
  }

  return (
    <section className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h2 className="font-bold text-gray-900">Compartir y medir</h2>
      <p className="mt-1 text-sm text-gray-600">Copia el enlace del canal donde compartirás esta nota. Los enlaces de redes son para publicaciones orgánicas.</p>
      <div className="mt-3 space-y-3">
        {canales.map((canal) => {
          const Icono = canal.icono;
          const url = new URL(destino);
          url.searchParams.set("utm_source", fuentesGuardadas[canal.key] || canal.source);
          url.searchParams.set("utm_medium", mediosGuardados[canal.key] || canal.medium);
          return (
            <div key={canal.source}>
              <label className="flex items-center gap-2 text-sm font-semibold" htmlFor={`enlace-${canal.source}`}><Icono aria-hidden="true" />{canal.nombre}</label>
              <div className="mt-1 flex gap-2">
                <input id={`enlace-${canal.source}`} value={url.toString()} readOnly onFocus={(e) => e.target.select()} className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-2 text-sm" />
                <button type="button" onClick={() => copiar(url.toString(), canal.nombre)} className="rounded bg-black px-3 py-2 text-sm font-semibold text-white">Copiar</button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-gray-600" role="status">{mensaje}</p>
    </section>
  );
}
