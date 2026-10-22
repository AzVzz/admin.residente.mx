import React, { useCallback, useEffect, useRef, useState } from "react";
import { fislInvitadoEnviar, fislInvitadosTotal } from "../../api/fislPost";

/**
 * Formulario FISL — registro de invitados (sin login).
 * Cada registro se guarda y se envía por correo.
 */

const ESTADO_INICIAL = {
  nombre: "",
  email: "",
  restaurante: "",
  acompanantes: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIAS = {
  "2026-10-27": {
    etiqueta: "martes 27 de octubre",
    boton: "Registrarme para el martes 27",
  },
  "2026-10-28": {
    etiqueta: "miércoles 28 de octubre",
    boton: "Registrarme para el miércoles 28",
  },
};

const FormularioFislInvitados = ({ fechaEvento = "2026-10-28" }) => {
  const dia = DIAS[fechaEvento] || DIAS["2026-10-28"];
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [loading, setLoading] = useState(false);
  const enviando = useRef(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState("");
  const [enviados, setEnviados] = useState(null);

  const cargarEnviados = useCallback(async () => {
    try {
      const data = await fislInvitadosTotal(fechaEvento);
      setEnviados(Number(data.total) || 0);
    } catch {
      setEnviados(null);
    }
  }, [fechaEvento]);

  useEffect(() => {
    cargarEnviados();
  }, [cargarEnviados]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const acompanantes = Number(form.acompanantes);
    const email = form.email.trim();
    if (!form.nombre.trim() || !email || !form.restaurante.trim() || form.acompanantes === "") {
      setError("Completa todos los campos.");
      return;
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      setError("Escribe un correo válido.");
      return;
    }
    if (!Number.isInteger(acompanantes) || acompanantes < 0 || acompanantes > 50) {
      setError("Los acompañantes deben ser un número entero entre 0 y 50.");
      return;
    }

    if (enviando.current) return;
    enviando.current = true;
    setLoading(true);
    try {
      await fislInvitadoEnviar({
        nombre: form.nombre.trim(),
        email,
        restaurante: form.restaurante.trim(),
        acompanantes,
        fechaEvento,
      });
      setEmailEnviado(email);
      setEnviados((n) => (n == null ? 1 : n + 1));
      setExito(true);
      cargarEnviados();
      setForm(ESTADO_INICIAL);
    } catch (err) {
      setError(err.message || "Ocurrió un error al enviar el registro.");
    } finally {
      enviando.current = false;
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-black/15 px-4 py-3.5 text-xl focus:border-black focus:outline-none focus:ring-2 focus:ring-[#FFF200]";

  if (exito) {
    return (
      <div className="max-w-[680px] mx-auto py-16 px-4 text-center">
        <div>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF200]">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">¡Registro enviado!</h1>
          <p className="mb-3 font-semibold">Registro para el {dia.etiqueta}.</p>
          <p className="text-black/70 mb-8">
            Te enviamos el boleto a {emailEnviado}.
          </p>
          <button
            type="button"
            onClick={() => setExito(false)}
            className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-white font-semibold hover:bg-black/80 transition-colors cursor-pointer"
          >
            Enviar otro registro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[680px] mx-auto py-10 px-4">
      <header className="@container mb-10 w-full">
        <h1
          className="text-[clamp(1.85rem,9cqi,3.6rem)] leading-[0.82] tracking-[-0.045em] text-black uppercase"
          style={{ fontFamily: '"NeueHaasGroteskDisplayPro75Bold", sans-serif' }}
        >
          La crisis
          <br />
          restaurantera:
          <br />
          ¿Cómo
          <br />
          resolverla?
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="nombre" className="block text-xl font-semibold mb-2">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            maxLength={150}
            placeholder="Nombre completo"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xl font-semibold mb-2">
            Correo donde se enviará la invitación
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            maxLength={254}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="restaurante" className="block text-xl font-semibold mb-2">
            Restaurante
          </label>
          <input
            id="restaurante"
            name="restaurante"
            type="text"
            value={form.restaurante}
            onChange={handleChange}
            maxLength={200}
            placeholder="Nombre del restaurante"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="acompanantes" className="block text-xl font-semibold mb-2">
            ¿Cuántos acompañantes?
          </label>
          <input
            id="acompanantes"
            name="acompanantes"
            type="number"
            min={0}
            max={50}
            step={1}
            inputMode="numeric"
            value={form.acompanantes}
            onChange={handleChange}
            placeholder="Ej. 2"
            className={inputCls}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-lg bg-[#FFF200] px-6 py-3.5 text-center text-xl font-bold text-black shadow-sm transition hover:brightness-95 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Enviando…" : dia.boton}
        </button>

        <img
          src={`${import.meta.env.BASE_URL}crisis-restaurantera-28-octubre.png`}
          alt="Crisis Restaurantera"
          className="mt-2 w-full h-auto"
        />
        {enviados != null && (
          <div className="mt-1 flex w-full justify-end" aria-label="Registros">
            <div className="flex min-w-12 flex-col items-center leading-none">
              <span className="text-sm font-bold">{String(enviados).padStart(4, "0")}</span>
              <span className="mt-1 text-xs text-black/60">{fechaEvento.slice(-2)}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default FormularioFislInvitados;
