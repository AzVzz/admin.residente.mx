import React, { useCallback, useEffect, useState } from "react";
import { fislEnviar, fislInventarioGet } from "../../api/fislPost";

/**
 * Formulario FISL — solicitud de entrega de cajas (sin login).
 * Cada solicitud se resta de las cajas disponibles y se envía por correo.
 */

const ESTADO_INICIAL = {
  cantidadCajas: "",
  domicilio: "",
  nombreRecibe: "",
  fechaEntrega: "",
  horaDesde: "",
  horaHasta: "",
  observaciones: "",
};

const hoyLocal = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const FormularioFisl = () => {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [inventario, setInventario] = useState(null);
  const [errorInventario, setErrorInventario] = useState("");
  const [verEntregas, setVerEntregas] = useState(false);

  const cargarInventario = useCallback(async () => {
    try {
      setInventario(await fislInventarioGet());
      setErrorInventario("");
    } catch (err) {
      setErrorInventario(err.message || "No se pudo cargar el inventario.");
    }
  }, []);

  useEffect(() => {
    cargarInventario();
  }, [cargarInventario]);

  const disponibles = inventario?.disponibles;
  const agotado = disponibles === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cajas = Number(form.cantidadCajas);
    if (
      !form.cantidadCajas ||
      !form.domicilio.trim() ||
      !form.nombreRecibe.trim() ||
      !form.fechaEntrega ||
      !form.horaDesde ||
      !form.horaHasta
    ) {
      setError("Completa todos los campos (solo las observaciones son opcionales).");
      return;
    }
    if (!Number.isInteger(cajas) || cajas < 1) {
      setError("La cantidad de cajas debe ser un número entero mayor a 0.");
      return;
    }
    if (disponibles != null && cajas > disponibles) {
      setError(`Solo quedan ${disponibles} caja(s) disponibles.`);
      return;
    }
    if (form.fechaEntrega < hoyLocal()) {
      setError("La fecha de entrega no puede ser anterior a hoy.");
      return;
    }
    if (form.horaDesde >= form.horaHasta) {
      setError("La hora inicial del horario debe ser anterior a la hora final.");
      return;
    }

    setLoading(true);
    try {
      await fislEnviar({
        cantidadCajas: cajas,
        domicilio: form.domicilio.trim(),
        nombreRecibe: form.nombreRecibe.trim(),
        fechaEntrega: form.fechaEntrega,
        horaDesde: form.horaDesde,
        horaHasta: form.horaHasta,
        observaciones: form.observaciones.trim(),
      });
      setExito(true);
      setForm(ESTADO_INICIAL);
    } catch (err) {
      setError(err.message || "Ocurrió un error al enviar la solicitud.");
    } finally {
      setLoading(false);
      cargarInventario();
    }
  };

  const inputCls =
    "w-full rounded-lg border border-black/15 px-4 py-2.5 focus:border-black focus:outline-none focus:ring-2 focus:ring-[#FFF200]";

  // ── Pantalla de éxito ──
  if (exito) {
    return (
      <div className="max-w-[680px] mx-auto py-16 px-4 text-center">
        <div>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF200]">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">¡Solicitud enviada!</h1>
          <p className="text-black/70 mb-8">
            Recibimos los datos de tu entrega. Nuestro equipo se pondrá en
            contacto si necesita confirmar algún detalle.
          </p>
          <button
            type="button"
            onClick={() => setExito(false)}
            className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-white font-semibold hover:bg-black/80 transition-colors cursor-pointer"
          >
            Enviar otra solicitud
          </button>
        </div>
      </div>
    );
  }

  // ── Formulario ──
  return (
    <div className="max-w-[680px] mx-auto py-10 px-4">
      <header className="mb-6">
        <h1 className="flex justify-center">
          <img
            src="https://residente.mx/fotos/mtyibg/fisl-logo-140x55-1.png"
            alt="Festival Internacional Santa Lucía"
            width="140"
            height="55"
            className="h-16 w-auto"
          />
        </h1>
      </header>

      <div className="mb-5">
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setVerEntregas((v) => !v)}
            disabled={!inventario}
            aria-expanded={verEntregas}
            className="inline-flex items-center gap-2 text-2xl font-bold cursor-pointer disabled:cursor-default"
          >
            {inventario
              ? `${disponibles} ${disponibles === 1 ? "caja" : "cajas"}`
              : errorInventario
                ? "—"
                : "Cargando…"}
            {inventario && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`h-6 w-6 transition-transform ${verEntregas ? "rotate-180" : ""}`}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {verEntregas && inventario && (
            <div className="absolute left-0 z-30 mt-2 w-[min(90vw,420px)] rounded-xl border border-black/10 bg-white p-4 shadow-lg">
              <p className="mb-3 text-sm text-black/60">
                {inventario.usadas} de {inventario.total} cajas asignadas
              </p>
              {inventario.entregas.length === 0 ? (
                <p className="text-sm text-black/50">
                  Todavía no hay entregas registradas.
                </p>
              ) : (
                <ul className="max-h-72 divide-y divide-black/10 overflow-y-auto">
                  {inventario.entregas.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-start justify-between gap-4 py-2 text-sm"
                    >
                      <div>
                        <p className="font-semibold">{e.nombreRecibe}</p>
                        <p className="whitespace-pre-line text-black/60">
                          {e.domicilio}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold">
                        {e.cantidadCajas} {e.cantidadCajas === 1 ? "caja" : "cajas"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {errorInventario && (
          <p className="mt-2 text-sm text-red-600">{errorInventario}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Cantidad de cajas */}
        <div>
          <label
            htmlFor="cantidadCajas"
            className="block text-sm font-semibold mb-1.5"
          >
            Cantidad de cajas
          </label>
          <input
            id="cantidadCajas"
            name="cantidadCajas"
            type="number"
            min={1}
            max={disponibles || undefined}
            step={1}
            inputMode="numeric"
            value={form.cantidadCajas}
            onChange={handleChange}
            placeholder="Ej. 10"
            className={inputCls}
          />
        </div>

        {/* Domicilio de entrega */}
        <div>
          <label
            htmlFor="domicilio"
            className="block text-sm font-semibold mb-1.5"
          >
            Domicilio de entrega
          </label>
          <textarea
            id="domicilio"
            name="domicilio"
            value={form.domicilio}
            onChange={handleChange}
            rows={3}
            maxLength={500}
            placeholder="Calle, número, colonia, municipio y código postal"
            className={`${inputCls} resize-y`}
          />
        </div>

        {/* Nombre de quien recibe */}
        <div>
          <label
            htmlFor="nombreRecibe"
            className="block text-sm font-semibold mb-1.5"
          >
            Nombre de la persona que va a recibir
          </label>
          <input
            id="nombreRecibe"
            name="nombreRecibe"
            type="text"
            value={form.nombreRecibe}
            onChange={handleChange}
            maxLength={150}
            placeholder="Nombre completo"
            className={inputCls}
          />
        </div>

        {/* Fecha de entrega */}
        <div>
          <label
            htmlFor="fechaEntrega"
            className="block text-sm font-semibold mb-1.5"
          >
            Fecha de entrega
          </label>
          <input
            id="fechaEntrega"
            name="fechaEntrega"
            type="date"
            min={hoyLocal()}
            value={form.fechaEntrega}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        {/* Rango de horario */}
        <div>
          <p className="block text-sm font-semibold mb-1.5">
            Rango de horario de entrega
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="horaDesde" className="block text-xs text-black/50 mb-1">
                Desde
              </label>
              <input
                id="horaDesde"
                name="horaDesde"
                type="time"
                value={form.horaDesde}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="horaHasta" className="block text-xs text-black/50 mb-1">
                Hasta
              </label>
              <input
                id="horaHasta"
                name="horaHasta"
                type="time"
                value={form.horaHasta}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label
            htmlFor="observaciones"
            className="block text-sm font-semibold mb-1.5"
          >
            Observaciones{" "}
            <span className="text-black/40 font-normal">(opcional)</span>
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows={4}
            maxLength={2000}
            placeholder="Referencias del domicilio, indicaciones de acceso, etc."
            className={`${inputCls} resize-y`}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Enviar */}
        <button
          type="submit"
          disabled={loading || agotado}
          className="inline-flex items-center justify-center rounded-lg bg-[#FFF200] px-6 py-3 font-bold text-black hover:brightness-95 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {agotado
            ? "Ya no hay cajas disponibles"
            : loading
              ? "Enviando…"
              : "Enviar solicitud"}
        </button>
      </form>
    </div>
  );
};

export default FormularioFisl;
