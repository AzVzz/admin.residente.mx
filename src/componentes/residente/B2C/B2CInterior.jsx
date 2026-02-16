import React, { useState, useEffect } from "react";
import { urlApi } from "../../api/url";

const VIDEO_URL =
  "https://drive.google.com/file/d/1GiKqDB2y7uKlPMVaN90ZMWm7bvwlPlXl/preview";
const API_PRODUCTOS = `${urlApi}api/productos-b2c`;
const API_CHECKOUT = `${urlApi}api/tienda-b2c`;

const B2CInterior = () => {
  const [vista, setVista] = useState("video");
  const [compras, setCompras] = useState([]);
  const [loadingCompras, setLoadingCompras] = useState(false);
  const [formData, setFormData] = useState({
    nombre_persona: "",
    nombre_restaurante: "",
    correo: "",
    codigo_promocion: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const success = params.get("payment_success") === "true";

    if (success && sessionId) {
      setVista("exito");
      setLoadingCompras(true);
      fetch(`${API_CHECKOUT}/compras?session_id=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.compras) setCompras(data.compras);
        })
        .catch(() => setCompras([]))
        .finally(() => setLoadingCompras(false));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handlePagar = async (e) => {
    e.preventDefault();
    if (!formData.correo?.trim() || !formData.nombre_persona?.trim()) {
      setMessage({ type: "error", text: "Completa nombre y correo." });
      return;
    }
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      const resProductos = await fetch(API_PRODUCTOS);
      const contentType = resProductos.headers.get("content-type");
      if (!resProductos.ok) {
        throw new Error(
          `Backend no responde correctamente (${resProductos.status}). ¿Reiniciaste Docker? Ejecuta: docker compose up -d --build backend`
        );
      }
      if (!contentType?.includes("application/json")) {
        throw new Error(
          "El servidor devolvió HTML en lugar de JSON. Reinicia el backend en Docker: docker compose up -d --build backend"
        );
      }
      const productos = await resProductos.json();
      const lista = Array.isArray(productos) ? productos : [];
      const productoVideo = lista[0];
      if (!productoVideo || !productoVideo.id) {
        setMessage({ type: "error", text: "No hay producto de video configurado." });
        setIsSubmitting(false);
        return;
      }
      const base = window.location.origin;
      const res = await fetch(`${API_CHECKOUT}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: productoVideo.id, quantity: 1 }],
          customerEmail: formData.correo.trim(),
          customerName: formData.nombre_persona.trim(),
          successUrl: `${base}/admin/B2C?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${base}/admin/B2C?payment_canceled=true`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear pago");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No se recibió URL de pago");
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Error al procesar el pago." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Vista: después del pago — video + ver/descargar
  if (vista === "exito") {
    return (
      <div className="px-4 py-8 max-w-[1080px] mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-center">¡Gracias por tu compra!</h1>
        <p className="text-gray-600 text-center mb-6">
          Ya puedes ver el video.
        </p>

        <div className="mb-8">
          <p className="text-sm font-bold mb-2">Video</p>
          <div className="relative w-full" style={{ paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "12px" }}>
            <iframe
              src={VIDEO_URL}
              title="Video"
              className="absolute top-0 left-0 w-full h-full border-0"
              allow="autoplay"
            />
          </div>
        </div>

        {loadingCompras ? (
          <p className="text-gray-500">Cargando tu contenido...</p>
        ) : compras.length > 0 ? (
          <div className="space-y-4">
            {compras.map((c, i) => (
              <div key={i} className="border rounded-lg p-4 bg-gray-50">
                <p className="font-bold">{c.titulo}</p>
                {c.tipo === "video" && c.archivo_url && (
                  <a
                    href={c.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 py-2 px-4 bg-black text-white rounded-lg font-bold hover:bg-gray-800"
                  >
                    Ver / descargar video
                  </a>
                )}
                {c.tipo === "pdf" && c.archivo_url && (
                  <a
                    href={c.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-block mt-2 py-2 px-4 bg-black text-white rounded-lg font-bold hover:bg-gray-800"
                  >
                    Descargar PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  // Vista: formulario para pagar el video
  if (vista === "formulario") {
    return (
      <div className="px-4 max-w-[640px] mx-auto py-8">
        <button type="button" onClick={() => setVista("video")} className="text-sm text-gray-500 hover:text-black mb-4">
          ← Volver al video
        </button>
        <h1 className="text-2xl font-bold mb-2">Pagar para ver el video</h1>
        <p className="text-gray-600 mb-6">Completa tus datos y paga para acceder al video.</p>
        <form onSubmit={handlePagar} className="space-y-4">
          <div>
            <label className="block font-bold text-sm mb-1">Nombre *</label>
            <input type="text" name="nombre_persona" value={formData.nombre_persona} onChange={handleInputChange} placeholder="Tu nombre" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" required />
          </div>
          <div>
            <label className="block font-bold text-sm mb-1">Restaurante</label>
            <input type="text" name="nombre_restaurante" value={formData.nombre_restaurante} onChange={handleInputChange} placeholder="Restaurante" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block font-bold text-sm mb-1">Correo *</label>
            <input type="email" name="correo" value={formData.correo} onChange={handleInputChange} placeholder="correo@ejemplo.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" required />
          </div>
          <div>
            <label className="block font-bold text-sm mb-1">Código promoción</label>
            <input type="text" name="codigo_promocion" value={formData.codigo_promocion} onChange={handleInputChange} placeholder="Código" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          {message.text && <p className={message.type === "error" ? "text-red-600 text-sm" : "text-sm"}>{message.text}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50">
            {isSubmitting ? "Redirigiendo a pagar…" : "Pagar y ver video"}
          </button>
        </form>
      </div>
    );
  }

  // Vista: video principal (clic para ir al formulario de pago)
  return (
    <div className="px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-center text-gray-600 mb-4 text-sm">Toca el video para pagar y verlo completo</p>
      <button
        type="button"
        onClick={() => setVista("formulario")}
        className="w-full max-w-3xl focus:outline-none rounded-xl overflow-hidden shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-black"
      >
        <div className="relative w-full" style={{ paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "12px" }}>
          <iframe src={VIDEO_URL} title="Video B2C" className="absolute top-0 left-0 w-full h-full border-0 pointer-events-none" allow="autoplay" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
            <span className="bg-white/90 text-black px-6 py-3 rounded-full font-semibold text-lg shadow">Pagar y ver video →</span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default B2CInterior;
