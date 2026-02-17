import React, { useState, useEffect } from "react";
import { urlApi } from "../../api/url";

const VIDEO_URL =
  "https://residente.mx/fotos/videos/residente_-_etiqueta_restaurantera%20%281080p%29%20%281%29.mp4";
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
      const contentTypeProductos = resProductos.headers.get("content-type");
      if (!resProductos.ok) {
        const msg =
          resProductos.status === 404
            ? "No se pudo conectar con el servidor. Revisa que el proxy /api/ esté configurado en el servidor."
            : `El servidor respondió con error (${resProductos.status}). Intenta más tarde.`;
        throw new Error(msg);
      }
      if (!contentTypeProductos?.includes("application/json")) {
        throw new Error(
          "El servidor no respondió correctamente. Revisa la configuración del proxy /api/ en producción.",
        );
      }
      const productos = await resProductos.json();
      const lista = Array.isArray(productos) ? productos : [];
      const productoVideo = lista[0];
      if (!productoVideo || !productoVideo.id) {
        setMessage({
          type: "error",
          text: "No hay producto de video configurado en el sistema.",
        });
        setIsSubmitting(false);
        return;
      }
      const base = window.location.origin;
      const res = await fetch(`${API_CHECKOUT}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: String(productoVideo.id), quantity: 1 }],
          customerEmail: formData.correo.trim(),
          customerName: formData.nombre_persona.trim(),
          promoCode: formData.codigo_promocion?.trim() || "",
          successUrl: `${base}/admin/B2C?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${base}/admin/B2C?payment_canceled=true`,
        }),
      });
      const contentTypeCheckout = res.headers.get("content-type");
      let data = {};
      if (contentTypeCheckout?.includes("application/json")) {
        data = await res.json();
      }
      if (!res.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Error del servidor (${res.status}). Intenta más tarde.`,
        );
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No se recibió la URL de pago. Intenta de nuevo.");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Error al procesar el pago. Intenta más tarde.",
      });
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
        <h1 className="text-2xl font-bold mb-2 text-center">
          ¡Gracias por tu compra!
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Ya puedes ver el video.
        </p>

        <div className="mb-8">
          <p className="text-sm font-bold mb-2">Video</p>
          <div
            className="relative w-full"
            style={{
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: "12px",
            }}
          >
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
        <button
          type="button"
          onClick={() => setVista("video")}
          className="text-sm text-gray-500 hover:text-black mb-4"
        >
          ← Volver al video
        </button>
        <h1 className="text-2xl font-bold mb-2">Pagar para ver el video</h1>
        <p className="text-gray-600 mb-6">
          Completa tus datos y paga para acceder al video.
        </p>
        <form onSubmit={handlePagar} className="space-y-4">
          <div>
            <label className="block font-bold text-sm mb-1">Nombre *</label>
            <input
              type="text"
              name="nombre_persona"
              value={formData.nombre_persona}
              onChange={handleInputChange}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-sm mb-1">Restaurante</label>
            <input
              type="text"
              name="nombre_restaurante"
              value={formData.nombre_restaurante}
              onChange={handleInputChange}
              placeholder="Restaurante"
              className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block font-bold text-sm mb-1">Correo *</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-sm mb-1">
              Código promoción
            </label>
            <input
              type="text"
              name="codigo_promocion"
              value={formData.codigo_promocion}
              onChange={handleInputChange}
              placeholder="Código"
              className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          {message.text && (
            <p
              className={
                message.type === "error" ? "text-red-600 text-sm" : "text-sm"
              }
            >
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? "Redirigiendo a pagar…" : "Pagar y ver video"}
          </button>
        </form>
      </div>
    );
  }

  // Vista: video principal (clic para ir al formulario de pago)
  return (
    <div className="px-4 py-12 flex flex-col items-center justify-center min-h-[70vh] ">
      <div className="w-full max-w-3xl mb-10">
        <h1
          className="text-2xl md:text-3xl font-semibold text-center text-black leading-tight mb-4"
          style={{
            fontFamily:
              "NeueHaasGroteskDisplayW02Bold, NeueHaasGroteskDisplayPro55Roman, system-ui, Avenir, Helvetica, Arial, sans-serif",
          }}
        >
          La Etiqueta Restaurantera
        </h1>
        <p className="text-center text-black mb-8 max-w-2xl mx-auto text-global">
          Las reglas no escritas que determinan si tu cliente regresa… o no.
        </p>

        <div className="text-black space-y-2 text-justify leading-relaxed text-global">
          <p>
            El 80% de los restaurantes pierde clientes por detalles que nadie
            les enseñó a cuidar.
          </p>
          <p>
            Un restaurante no fracasa por su comida. Fracasa por la experiencia.
          </p>
          <p>
            La temperatura, el volumen de la música, el lenguaje del mesero, la
            claridad en la cuenta, el manejo de una queja, el baño.
          </p>
          <p>
            Hay reglas que no están escritas en ningún manual… pero que el
            cliente sí juzga.
          </p>
          <p>
            Este video es una guía clara, directa y profesional sobre La
            Etiqueta Restaurantera: los estándares invisibles que hacen que un
            comensal vuelva — o no regrese jamás.
          </p>
          <p>No es teoría. Es práctica real aplicada al servicio.</p>
        </div>

        <button
          type="button"
          onClick={() => setVista("formulario")}
          className="w-full mt-8 focus:outline-none rounded-xl overflow-hidden shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          <div
            className="relative w-full"
            style={{
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: "12px",
            }}
          >
            <img
              src="https://residente.mx/fotos/videos/miniaturas/minaturavideo.png"
              alt="Miniatura del video"
              className="absolute top-0 left-0 w-full h-full object-cover border-0"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
              <span className="bg-white/90 text-black px-6 py-3 rounded-full font-semibold text-lg shadow">
                Pagar y ver video →
              </span>
            </div>
          </div>
        </button>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-black uppercase mb-3">
              ¿Qué aprenderás?
            </h2>
            <ul className="space-y-2 text-gray-800 text-global">
              <li> Cómo evitar errores que garantizan que el cliente no vuelva</li>
              <li> Protocolos claros para servicio, cuenta y manejo de quejas</li>
              <li> Reglas de lenguaje y comportamiento profesional</li>
              <li> Estándares de fine dining aplicables a cualquier restaurante</li>
              <li>
                 Manejo correcto de adendas, propina, devoluciones y compensaciones
              </li>
              <li> Protocolos de seguridad y emergencias</li>
              <li> Criterios para servicio a domicilio sin fallas</li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-wide text-black uppercase mb-3">
              ¿Para quién es?
            </h2>
            <ul className="space-y-1 text-gray-800 text-global">
              <li>Dueños de restaurantes</li>
              <li>Gerentes operativos</li>
              <li>Capitanes y jefes de piso</li>
              <li>Equipos de servicio</li>
              <li>
                Restaurantes que quieren subir de nivel sin invertir en remodelación
              </li>
            </ul>
            <p className="mt-3 text-gray-800 text-global">
              Si quieres aumentar recompra sin gastar en marketing, empieza por el
              servicio.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-black uppercase mb-3">
              Formato
            </h2>
            <ul className="space-y-1 text-gray-800 text-global">
              <li>Video digital on-demand</li>
              <li>Duración: 1 hora</li>
              <li>Descarga inmediata</li>
              <li>Acceso ilimitado</li>
              <li>Ideal para capacitación interna</li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-wide text-black uppercase mb-3">
              Diferenciador
            </h2>
            <p className="text-gray-800 mb-2 text-global">
              Este no es un curso de “hospitalidad emocional”. Es un estándar profesional
              basado en prácticas internacionales adaptadas al contexto latinoamericano.
            </p>
            <p className="text-gray-800 text-global">
              La reputación no se construye con publicidad. Se construye con consistencia.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl p-4 ">
          <h2 className="text-sm font-semibold tracking-wide text-black uppercase mb-2">
            Garantía
          </h2>
          <p className="text-gray-800 text-global">
            Garantía de satisfacción 7 días. Si el contenido no cumple tus expectativas,
            puedes solicitar la devolución dentro de los primeros 7 días posteriores a la
            compra. Sin preguntas innecesarias.
          </p>
        </div>
      </div>
    </div>
  );
};

export default B2CInterior;
