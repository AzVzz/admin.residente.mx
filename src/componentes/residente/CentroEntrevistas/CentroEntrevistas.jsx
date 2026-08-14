import React, { useState } from "react";
import { centroEntrevistasEnviar } from "../../api/centroEntrevistasPost";

/**
 * Centro de Entrevistas — formulario PÚBLICO (sin login).
 *
 * Título editorial: LA ENTREVISTA x RESIDENTE. Siete preguntas. La entrevista
 * entra como borrador y un editor la revisa en el dashboard (pestaña Entrevista).
 */

const PREGUNTAS = [
  {
    name: "dejarTodo",
    label: "¿Qué te hizo dejar todo por esto?",
  },
  {
    name: "dejasteAtras",
    label: "¿Qué dejaste atrás?",
  },
  {
    name: "casiNoLogras",
    label: "El momento en que casi no lo logras",
  },
  {
    name: "mentorSenal",
    label: "El mentor o la señal que te hizo seguir",
  },
  {
    name: "sabesHoy",
    label: "Qué sabes hoy que no sabías al inicio",
  },
  {
    name: "genteSienta",
    label: "¿Qué quieres que la gente sienta, o recuerde?",
  },
  {
    name: "favoritos",
    label: "Que no sea el tuyo: platillo favorito, restaurante favorito.",
  },
];

const ESTADO_INICIAL = {
  dejarTodo: "",
  dejasteAtras: "",
  casiNoLogras: "",
  mentorSenal: "",
  sabesHoy: "",
  genteSienta: "",
  favoritos: "",
};

const CentroEntrevistas = () => {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetear = () => {
    setForm(ESTADO_INICIAL);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const faltantes = PREGUNTAS.filter((p) => !form[p.name].trim());
    if (faltantes.length) {
      setError("Completa las siete preguntas (marcadas con *).");
      return;
    }

    setLoading(true);
    try {
      await centroEntrevistasEnviar({
        dejarTodo: form.dejarTodo.trim(),
        dejasteAtras: form.dejasteAtras.trim(),
        casiNoLogras: form.casiNoLogras.trim(),
        mentorSenal: form.mentorSenal.trim(),
        sabesHoy: form.sabesHoy.trim(),
        genteSienta: form.genteSienta.trim(),
        favoritos: form.favoritos.trim(),
      });
      setExito(true);
      resetear();
    } catch (err) {
      setError(err.message || "Ocurrió un error al enviar la entrevista.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-black/15 px-4 py-2.5 focus:border-black focus:outline-none focus:ring-2 focus:ring-[#FFF200]";

  if (exito) {
    return (
      <div className="max-w-[680px] mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-black/10 p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF200]">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">¡Entrevista enviada!</h1>
          <p className="text-black/70 mb-8">
            Gracias por tu historia. Tu entrevista quedó pendiente de revisión y
            será publicada una vez que nuestro equipo editorial la apruebe.
          </p>
          <button
            type="button"
            onClick={() => setExito(false)}
            className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-white font-semibold hover:bg-black/80 transition-colors cursor-pointer"
          >
            Enviar otra entrevista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[680px] mx-auto py-10 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-[40px] sm:text-[56px] lg:text-[70px] font-bold mb-2 leading-[1.05]">
          LA ENTREVISTA RESIDENTE
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-black/10 p-6 sm:p-8 flex flex-col gap-5"
      >
        {PREGUNTAS.map((p) => (
          <div key={p.name}>
            <label
              htmlFor={p.name}
              className="block text-sm font-semibold mb-1.5"
            >
              {p.label} <span className="text-red-500">*</span>
            </label>
            <textarea
              id={p.name}
              name={p.name}
              value={form[p.name]}
              onChange={handleChange}
              rows={4}
              className={`${inputCls} resize-y`}
            />
          </div>
        ))}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-[#FFF200] px-6 py-3 font-bold text-black hover:brightness-95 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Enviando…" : "Enviar entrevista"}
        </button>
      </form>
    </div>
  );
};

export default CentroEntrevistas;
